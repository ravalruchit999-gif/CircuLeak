import datetime
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
try:
    from app.models.leak import Leak
    from app.models.facility import Facility
    from app.models.analysis_run import AnalysisRun
    from app.services.emission_service import EmissionService
    from app.ml.anomaly_detector import AnomalyDetector
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
except (ImportError, ModuleNotFoundError):
    from ..models.leak import Leak
    from ..models.facility import Facility
    from ..models.analysis_run import AnalysisRun
    from .emission_service import EmissionService
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

        ml_run = AnalysisRun(
            id=run_id,
            facility_id=facility_id,
            upload_id=upload_id,
            analysis_type="anomaly_detection",
            model_name="IsolationForest",
            model_version="1.0.0",
            parameters={"contamination": 0.08, "n_estimators": 100, "random_state": 42},
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
        """Fetch comprehensive explainable leak details and matched circular interventions."""
        leak = db.query(Leak).filter(Leak.id == leak_id).first()
        if not leak:
            return None

        # Find matching interventions from knowledge base
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

        return {
            "id": leak.id,
            "facility_id": leak.facility_id,
            "leak_type": leak.leak_type,
            "equipment": leak.equipment,
            "process": leak.process,
            "risk_score": leak.risk_score,
            "emission_contribution_kg": leak.emission_contribution_kg,
            "baseline_consumption": leak.baseline_consumption,
            "observed_consumption": leak.observed_consumption,
            "deviation_percent": leak.deviation_percent,
            "abnormal_period": leak.abnormal_period,
            "production_status": leak.production_status,
            "reason": leak.reason,
            "potential_causes": leak.potential_causes or [],
            "recommended_interventions": matched_interventions,
            "detected_at": leak.detected_at
        }
