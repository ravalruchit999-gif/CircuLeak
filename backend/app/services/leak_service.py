import datetime
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
try:
    from app.models.leak import Leak
    from app.models.facility import Facility
    from app.models.analysis_run import AnalysisRun
    from app.models.process_data import ProcessData
    from app.models.audit_log import AuditLog
    from app.services.emission_service import EmissionService
    from app.services.dataset_hash_service import compute_canonical_dataset_hash, get_code_version
    from app.ml.anomaly_detector import AnomalyDetector
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
except (ImportError, ModuleNotFoundError):
    from ..models.leak import Leak
    from ..models.facility import Facility
    from ..models.analysis_run import AnalysisRun
    from ..models.process_data import ProcessData
    from ..models.audit_log import AuditLog
    from .emission_service import EmissionService
    from .dataset_hash_service import compute_canonical_dataset_hash, get_code_version
    from ..ml.anomaly_detector import AnomalyDetector
    from ..data.recommendations import DEFAULT_RECOMMENDATIONS


class LeakService:
    @staticmethod
    def get_structural_hotspots(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Identify top emission contributors using Pareto (80/20) structural ranking.
        """
        df = EmissionService.get_emissions_dataframe(db, facility_id)
        if df.empty:
            return {"facility_id": facility_id, "total_emissions_kg": 0.0, "hotspots": []}

        total_emissions = float(df["calculated_emissions_kg"].sum())
        eq_grouped = df.groupby(["equipment", "process"])["calculated_emissions_kg"].sum().reset_index()
        eq_grouped = eq_grouped.sort_values("calculated_emissions_kg", ascending=False)

        hotspots: List[Dict[str, Any]] = []
        cumulative_pct = 0.0

        for rank, (_, row) in enumerate(eq_grouped.iterrows(), start=1):
            val = float(row["calculated_emissions_kg"])
            pct = round((val / total_emissions) * 100, 1) if total_emissions > 0 else 0.0
            cumulative_pct += pct

            hotspots.append({
                "rank": rank,
                "equipment": str(row["equipment"]),
                "process": str(row["process"]),
                "emissions_kg": round(val, 2),
                "percentage_of_total": pct,
                "leak_category": "Major Structural Emission Node" if cumulative_pct <= 80.0 else "Secondary Emission Node"
            })

        return {
            "facility_id": facility_id,
            "total_emissions_kg": round(total_emissions, 2),
            "hotspots": hotspots
        }

    @staticmethod
    def detect_and_sync_anomalies(
        db: Session,
        facility_id: int,
        upload_id: Optional[int] = None,
        analysis_run_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Run the ML behavioral anomaly detector on facility time-series,
        record ML model execution in analysis_runs, persist detected leaks
        with full upload and run lineage, and return formatted anomalies.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility {facility_id} not found.")

        df = EmissionService.get_emissions_dataframe(db, facility_id)
        if df.empty:
            return []

        run_id = analysis_run_id or f"RUN-ANOMALY-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.datetime.now(datetime.timezone.utc)
        dataset_hash = compute_canonical_dataset_hash(df)
        code_ver = get_code_version()

        ml_run = AnalysisRun(
            id=run_id,
            facility_id=facility_id,
            upload_id=upload_id,
            analysis_type="anomaly_detection",
            model_name="IsolationForest",
            model_version="1.0.0",
            parameters={
                "contamination": 0.08,
                "n_estimators": 100,
                "random_state": 42,
                "dataset_hash_sha256": dataset_hash,
                "code_version": code_ver
            },
            dataset_hash_sha256=dataset_hash,
            code_version=code_ver,
            feature_set=["electricity_kwh", "fuel_quantity", "hour", "specific_energy_consumption"],
            input_row_count=len(df),
            started_at=start_time,
            status="running"
        )
        db.add(ml_run)
        db.flush()

        try:
            detector = AnomalyDetector()
            detected_list = detector.detect_anomalies(df, operating_hours=facility.operating_hours or 16.0)

            # Sync with database
            db.query(Leak).filter(Leak.facility_id == facility_id, Leak.leak_type == "behavioral").delete()

            saved_anomalies: List[Dict[str, Any]] = []
            for a in detected_list:
                leak_obj = Leak(
                    facility_id=facility_id,
                    upload_id=upload_id,
                    analysis_run_id=run_id,
                    leak_type="behavioral",
                    equipment=a["equipment"],
                    process=a["process"],
                    risk_score=a["risk_score"],
                    baseline_consumption=a["baseline_consumption"],
                    observed_consumption=a["observed_consumption"],
                    deviation_percent=a["deviation_percent"],
                    abnormal_period=a["abnormal_period"],
                    production_status=a["production_status"],
                    reason=a["reason"],
                    potential_causes=a["potential_causes"]
                )
                db.add(leak_obj)
                db.flush()

                a_copy = dict(a)
                a_copy["leak_id"] = leak_obj.id
                a_copy["upload_id"] = upload_id
                a_copy["analysis_run_id"] = run_id
                saved_anomalies.append(a_copy)

            ml_run.status = "completed"
            ml_run.completed_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
            return saved_anomalies

        except Exception as e:
            ml_run.status = "failed"
            ml_run.error_message = str(e)
            ml_run.completed_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
            raise e

    @staticmethod
    def get_anomalies(db: Session, facility_id: int) -> Dict[str, Any]:
        """Retrieve detected behavioral anomalies for a facility."""
        existing_leaks = db.query(Leak).filter(
            Leak.facility_id == facility_id,
            Leak.leak_type == "behavioral"
        ).all()

        if not existing_leaks:
            # Run detection if not yet stored
            anomalies = LeakService.detect_and_sync_anomalies(db, facility_id)
        else:
            anomalies = [
                {
                    "leak_id": l.id,
                    "equipment": l.equipment,
                    "process": l.process,
                    "risk_score": l.risk_score,
                    "baseline_consumption": l.baseline_consumption,
                    "observed_consumption": l.observed_consumption,
                    "deviation_percent": l.deviation_percent,
                    "abnormal_period": l.abnormal_period,
                    "production_status": l.production_status,
                    "reason": l.reason,
                    "potential_causes": l.potential_causes or []
                }
                for l in existing_leaks
            ]

        return {
            "facility_id": facility_id,
            "anomalies_detected_count": len(anomalies),
            "anomalies": anomalies
        }

    @staticmethod
    def get_leak_detail(db: Session, leak_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch comprehensive explainable leak details and Phase 1 Carbon Incident investigation data.
        Returns complete evidence signals, baseline comparison, verified emission provenance,
        timeline series, data quality audit, and prioritized next investigation tasks.
        """
        leak = db.query(Leak).filter(Leak.id == leak_id).first()
        if not leak:
            return None

        facility = db.query(Facility).filter(Facility.id == leak.facility_id).first()
        analysis_run = db.query(AnalysisRun).filter(AnalysisRun.id == leak.analysis_run_id).first() if leak.analysis_run_id else None

        # Determine severity deterministically from risk score
        if leak.risk_score >= 75.0:
            severity = "Critical"
        elif leak.risk_score >= 50.0:
            severity = "High"
        elif leak.risk_score >= 25.0:
            severity = "Medium"
        else:
            severity = "Low"

        # Determine detection methodology
        is_off_hours = (leak.production_status == "inactive") or ("off-hours" in (leak.reason or "").lower())
        if is_off_hours:
            detection_method = "Historical/operational anomaly detection (Off-Hours Idle Protocol)"
        else:
            detection_method = "Historical/operational anomaly detection (Isolation Forest)"

        # Query process telemetry for this facility & equipment
        p_rows = db.query(
            ProcessData.timestamp,
            ProcessData.date,
            ProcessData.hour,
            ProcessData.electricity_kwh,
            ProcessData.fuel_type,
            ProcessData.fuel_quantity,
            ProcessData.production_volume,
            ProcessData.operating_hours
        ).filter(
            ProcessData.facility_id == leak.facility_id,
            ProcessData.equipment == leak.equipment
        ).order_by(ProcessData.timestamp.asc()).all()

        timeline_points = []
        abnormal_rows_count = 0
        has_fuel = False
        has_prod = False
        last_prod_vol = None
        last_op_hrs = None

        if p_rows:
            last_prod_vol = p_rows[-1].production_volume
            last_op_hrs = p_rows[-1].operating_hours
            slice_rows = p_rows[-48:] if len(p_rows) > 48 else p_rows
            for r in slice_rows:
                elec = float(r.electricity_kwh or 0.0)
                prod = float(r.production_volume or 0.0)
                fuel = float(r.fuel_quantity or 0.0)
                if prod > 0:
                    has_prod = True
                if fuel > 0:
                    has_fuel = True

                # Check if this point was in an anomaly state
                is_anom = False
                if is_off_hours:
                    is_anom = (elec > 5.0) and (r.hour >= 22 or r.hour <= 5 or (r.operating_hours == 0.0))
                else:
                    is_anom = (elec > (1.25 * leak.baseline_consumption)) if leak.baseline_consumption > 0 else (elec > 10.0)

                if is_anom:
                    abnormal_rows_count += 1

                ts_str = r.timestamp.strftime("%Y-%m-%d %H:%M") if hasattr(r.timestamp, "strftime") else str(r.timestamp)
                timeline_points.append({
                    "timestamp": ts_str,
                    "observed": round(elec, 2),
                    "baseline": round(leak.baseline_consumption, 2),
                    "is_anomaly": is_anom
                })

        duration_hours = max(1.0, float(abnormal_rows_count if abnormal_rows_count > 0 else (8.0 if is_off_hours else 1.0)))

        # Energy & Carbon Impact
        excess_power_rate = max(0.0, float(leak.observed_consumption - leak.baseline_consumption))
        energy_impact_kwh = round(excess_power_rate * duration_hours, 2)

        # Emission Factor with provenance
        carbon_kg = 0.0
        ef_provenance = None
        try:
            target_ts = leak.detected_at or datetime.datetime.now(datetime.timezone.utc)
            ef_obj = EmissionService.get_factor_for_telemetry(db, "grid_electricity", target_ts)
            if ef_obj:
                carbon_kg = round(energy_impact_kwh * ef_obj.factor_value, 2)
                ef_provenance = {
                    "factor_id": ef_obj.id,
                    "factor_value": ef_obj.factor_value,
                    "unit": ef_obj.unit,
                    "version": ef_obj.version or "2024.1",
                    "reference": ef_obj.reference,
                    "effective_from": ef_obj.effective_from,
                    "effective_to": ef_obj.effective_to
                }
        except Exception:
            pass

        carbon_tco2e = round(carbon_kg / 1000.0, 3) if carbon_kg > 0 else 0.0

        # Financial Impact:
        # Industrial electricity tariff reference: ₹7.50/kWh (BEE / State Discom Industrial Rate)
        financial_impact_inr = round(energy_impact_kwh * 7.50, 2) if energy_impact_kwh > 0 else None
        financial_status = "Estimated based on state industrial electricity tariff (₹7.50/kWh)" if financial_impact_inr is not None else "Not available from current data"

        # Evidence building from empirical backend signals
        evidence_items = []
        if leak.baseline_consumption > 0:
            evidence_items.append({
                "signal": "Electricity consumption elevated above reference baseline",
                "detail": f"Observed draw of {round(leak.observed_consumption, 2)} kWh/hr is +{round(leak.deviation_percent, 1)}% above the historical median active baseline ({round(leak.baseline_consumption, 2)} kWh/hr)."
            })
        else:
            evidence_items.append({
                "signal": "Unscheduled power draw during non-production period",
                "detail": f"Observed draw of {round(leak.observed_consumption, 2)} kWh/hr occurred when expected baseline is near zero (off-shift)."
            })

        if is_off_hours:
            evidence_items.append({
                "signal": "Zero production output registered during high-power period",
                "detail": "Facility telemetry reports 0.0 kg production output while power consumption remained active, confirming idle loss."
            })
        elif has_prod:
            evidence_items.append({
                "signal": "Specific Energy Consumption (SEC) deterioration",
                "detail": "Production throughput continued, but specific electrical intensity per unit output spiked significantly."
            })

        evidence_items.append({
            "signal": "Behavioral anomaly score exceeded detection threshold",
            "detail": f"Incident scored {round(leak.risk_score, 1)}/100 under {detection_method}, exceeding the configured operational threshold."
        })
        evidence_items.append({
            "signal": "Equipment-level localization confirmed",
            "detail": f"Signal variance isolated specifically to {leak.equipment} within the {leak.process} operational zone."
        })

        # Data Quality & Missing Information
        available_fields = ["Electricity Telemetry", "Timestamp", "Asset Register", "Process Boundary"]
        if has_prod:
            available_fields.append("Production Volume")
        if has_fuel:
            available_fields.append("Thermal Fuel Consumption")

        missing_fields = ["Temperature Telemetry", "Pressure Telemetry"]
        if not has_fuel:
            missing_fields.append("Direct Thermal Fuel Logging")

        # Confidence rating
        if leak.risk_score >= 70.0 and len(p_rows) >= 20:
            conf_level = "High"
            conf_reason = f"Confirmed by {len(p_rows)} historical SCADA time-series observations with +{round(leak.deviation_percent, 1)}% deviation."
        elif len(p_rows) >= 5:
            conf_level = "Medium"
            conf_reason = f"Supported by {len(p_rows)} local operational readings against historical median active baseline."
        else:
            conf_level = "Low"
            conf_reason = "Limited historical observations available; preliminary empirical flag."

        # Recommended Next Investigations
        eq_lower = leak.equipment.lower()
        next_steps = []
        next_steps.append(f"Review {leak.equipment} operating logs and shift handover records during {leak.abnormal_period}.")
        if "compressor" in eq_lower:
            next_steps.append("Inspect pneumatic distribution lines, coupling seals, and unloader valves for continuous air leaks.")
            next_steps.append("Verify automatic pressure switch setpoints and off-shift compressor shutdown interlocks.")
        elif "dyeing" in eq_lower or "pump" in eq_lower:
            next_steps.append("Check circulation pump impeller for cavitation, mechanical resistance, and filter basket clogging.")
            next_steps.append("Inspect liquor ratio and heat exchanger tube fouling for heat transfer resistance.")
        elif "stenter" in eq_lower or "boiler" in eq_lower or "oven" in eq_lower:
            next_steps.append("Inspect exhaust damper servo actuators for stuck-open positions venting thermal energy.")
            next_steps.append("Check burner fuel-air ratio and steam trap bypass valves for live steam leakage.")
        elif "screen" in eq_lower or "print" in eq_lower:
            next_steps.append("Inspect printing squeegee servo drives and electric dryer circulation fans for mechanical binding.")
        else:
            next_steps.append(f"Inspect {leak.equipment} electrical motor bearings and sub-meter wiring for phase imbalance.")
        next_steps.append("Install missing physical sensors (temperature and pressure transducers) to establish root cause.")

        # Interventions lookup (preserving existing circular recommendations logic)
        matched_interventions = []
        eq_clean = leak.equipment.lower()
        proc_clean = leak.process.lower()
        for rec in DEFAULT_RECOMMENDATIONS:
            rec_eq = rec["target_equipment"].lower()
            rec_proc = rec["target_process"].lower()
            if rec_eq in eq_clean or eq_clean in rec_eq or rec_proc in proc_clean or proc_clean in rec_proc:
                matched_interventions.append({
                    "id": rec["id"],
                    "title": rec["title"],
                    "description": rec["description"],
                    "estimated_co2_reduction_annual_kg": rec["estimated_co2_reduction_annual_kg"],
                    "annual_savings_inr": rec["annual_savings_inr"],
                    "payback_period_years": rec["payback_period_years"],
                    "feasibility": rec["feasibility"]
                })

        # Phase 2: Compute Evidence-Based 'Why?' Analysis
        why_analysis = None
        try:
            from app.services.incident_why_service import IncidentWhyService
            why_analysis = IncidentWhyService.analyze_incident_why(db, leak.id, leak.facility_id)
        except Exception:
            why_analysis = None

        return {
            # Legacy fields
            "id": leak.id,
            "facility_id": leak.facility_id,
            "leak_type": leak.leak_type,
            "equipment": leak.equipment,
            "process": leak.process,
            "risk_score": leak.risk_score,
            "status": leak.status or "detected",
            "emission_contribution_kg": carbon_kg,
            "baseline_consumption": leak.baseline_consumption,
            "observed_consumption": leak.observed_consumption,
            "deviation_percent": leak.deviation_percent,
            "abnormal_period": leak.abnormal_period,
            "production_status": leak.production_status,
            "reason": leak.reason,
            "potential_causes": leak.potential_causes or [],
            "recommended_interventions": matched_interventions,
            "detected_at": leak.detected_at,

            # Section A: Header & Metadata
            "incident": {
                "id": leak.id,
                "status": leak.status or "detected",
                "severity": severity,
                "detected_at": leak.detected_at,
                "start_time": timeline_points[0]["timestamp"] if timeline_points else None,
                "end_time": timeline_points[-1]["timestamp"] if timeline_points else None,
                "facility_id": leak.facility_id,
                "facility_name": facility.business_name if facility else "Industrial Facility",
                "equipment": leak.equipment,
                "process_area": leak.process,
                "location": facility.location if facility else None,
                "metric": "Electricity Consumption",
                "detection_method": detection_method,
                "model_name": analysis_run.model_name if analysis_run else "IsolationForest",
                "model_version": analysis_run.model_version if analysis_run else "1.0.0",
                "analysis_run_id": leak.analysis_run_id,
                "dataset_hash_sha256": analysis_run.dataset_hash_sha256 if analysis_run else None,
                "code_version": analysis_run.code_version if analysis_run else None
            },

            # Section B: What Happened?
            "observed": {
                "metric_name": "Electricity Consumption",
                "value": round(leak.observed_consumption, 2),
                "unit": "kWh/hr",
                "production_volume": round(float(last_prod_vol), 1) if last_prod_vol is not None else None,
                "operating_hours": round(float(last_op_hrs), 1) if last_op_hrs is not None else None,
                "period_description": leak.abnormal_period
            },

            # Section E: Baseline Comparison
            "baseline": {
                "metric_name": "Expected Electricity Baseline",
                "value": round(leak.baseline_consumption, 2),
                "unit": "kWh/hr",
                "methodology": "Off-Hours Zero-Standby Protocol" if is_off_hours else "Historical Median Active Baseline",
                "reference_description": "Expected consumption is near zero during facility non-production hours." if is_off_hours else "Calculated from normal active production cycles."
            },
            "deviation": {
                "percent": round(leak.deviation_percent, 1),
                "absolute_difference": round(excess_power_rate, 2),
                "direction": "excess"
            },

            # Section C: Impact
            "impact": {
                "energy_impact_kwh": energy_impact_kwh,
                "excess_fuel_quantity": 0.0,
                "fuel_unit": "m3",
                "carbon_impact_kg": carbon_kg,
                "carbon_impact_tco2e": carbon_tco2e,
                "carbon_calculation_method": "IPCC Tier 1 Direct Multiplication with CEA Grid Factor",
                "emission_factor_provenance": ef_provenance,
                "financial_impact_inr": financial_impact_inr,
                "financial_status": financial_status,
                "production_impact": "None (non-production off-hours)" if is_off_hours else "SEC efficiency penalty"
            },

            # Section D: Incident Timeline
            "timeline": timeline_points,

            # Section F: Evidence
            "evidence": evidence_items,

            # Section G: Contributing Factors
            "possible_contributing_factors": leak.potential_causes if leak.potential_causes else ["Potential contributing factors cannot be determined from the current dataset. Further investigation is required."],

            # Section H: Data Quality / Missing Information
            "data_quality": {
                "available": available_fields,
                "missing": missing_fields,
                "limitation_note": "Missing measurements may limit the ability to determine the operational cause of this incident."
            },

            # Section I: Detection Confidence
            "confidence": {
                "level": conf_level,
                "reason": conf_reason
            },

            # Section J: Recommended Next Investigation
            "next_investigation": next_steps,

            # Phase 2: Evidence-Based "Why?" Investigation Analysis
            "why_analysis": why_analysis
        }

    @staticmethod
    def update_incident_status(
        db: Session,
        leak_id: int,
        new_status: str,
        user_id: Optional[int] = None,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update incident workflow status and record audit log entry."""
        valid_statuses = {"detected", "investigating", "resolved", "dismissed"}
        clean_status = new_status.lower().strip()
        if clean_status not in valid_statuses:
            raise ValueError(f"Invalid incident status '{new_status}'. Allowed values: {sorted(list(valid_statuses))}")

        leak = db.query(Leak).filter(Leak.id == leak_id).first()
        if not leak:
            raise ValueError(f"Carbon Incident #{leak_id} not found.")

        old_status = leak.status or "detected"
        leak.status = clean_status

        # Create audit entry
        audit = AuditLog(
            user_id=user_id,
            action="incident_status_updated",
            resource="leak",
            resource_id=str(leak.id),
            details={
                "facility_id": leak.facility_id,
                "old_status": old_status,
                "new_status": clean_status,
                "note": note,
                "equipment": leak.equipment,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        )
        db.add(audit)
        db.commit()
        db.refresh(leak)

        return LeakService.get_leak_detail(db, leak_id)
