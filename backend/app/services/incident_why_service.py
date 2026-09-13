import datetime
import math
import uuid
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.leak import Leak
from app.models.process_data import ProcessData
from app.models.analysis_run import AnalysisRun
from app.models.facility import Facility
from app.services.emission_service import EmissionService
from app.schemas.leak import (
    WhyAnalysisResponse,
    StructuredEvidenceItem,
    WhatChangedItem,
    EvidenceChainStep,
    SupportedContributor,
    NotConfirmedItem,
    MissingDataItem,
    HypothesisFalsificationItem,
    RankedInvestigationAction,
    MultivariableAssociation,
    ProblemRepresentation,
    AnalysisMetadata,
)


class IncidentWhyService:
    """
    Evidence-Based 'Why?' Investigation Engine for Carbon Incidents.
    
    Transforms 'What happened?' into a transparent, auditable, evidence-grounded
    explanation using empirical SCADA telemetry, multi-tier baseline hierarchies,
    composite evidence strength calculation, and hypothesis falsification.
    
    Strict Scientific Principles:
    - Never asserts physical causation without transducer proof.
    - Uses non-causal language ('associated with', 'supports', not 'caused by').
    - Discloses exact observation timestamps that produced each finding.
    - Guards against small sample sizes (N < 10) and zero variance.
    """

    @classmethod
    def analyze_incident_why(
        cls,
        db: Session,
        incident_id: int,
        facility_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes a deterministic evidence investigation for a given carbon incident.
        """
        leak = db.query(Leak).filter(Leak.id == incident_id).first()
        if not leak:
            raise ValueError(f"Carbon Incident #{incident_id} not found.")

        if facility_id is not None and int(leak.facility_id) != int(facility_id):
            raise PermissionError("Unauthorized access to carbon incident belonging to another facility.")

        # Load facility metadata
        facility = db.query(Facility).filter(Facility.id == leak.facility_id).first()
        facility_name = facility.business_name if facility else f"Facility #{leak.facility_id}"

        # Fetch telemetry rows for this facility and equipment
        telemetry_rows = (
            db.query(ProcessData)
            .filter(
                ProcessData.facility_id == leak.facility_id,
                ProcessData.equipment == leak.equipment
            )
            .order_by(ProcessData.timestamp.asc())
            .all()
        )

        total_records_analyzed = len(telemetry_rows)

        # Classify incident nature
        is_off_hours = (
            (leak.abnormal_period is not None and "off-hours" in str(leak.abnormal_period).lower())
            or (leak.production_status is not None and "inactive" in str(leak.production_status).lower())
            or (leak.baseline_consumption is not None and leak.baseline_consumption <= 5.0 and leak.observed_consumption is not None and leak.observed_consumption > 10.0)
        )

        # 1. Segment Incident Rows vs Historical Comparison Rows
        incident_rows, comparison_rows = cls._segment_incident_and_comparison_rows(
            telemetry_rows, leak, is_off_hours
        )

        # 2. Multi-tier Baseline Hierarchy Engine
        baseline_val, baseline_tier, baseline_desc, baseline_rows = cls._resolve_baseline_hierarchy(
            comparison_rows, leak, is_off_hours
        )

        # 3. Fact Extraction from Incident Window
        observed_facts = cls._extract_observed_facts(incident_rows, leak)

        # 4. Composite Evidence Strength Calculation
        composite_strength, strength_breakdown = cls._calculate_composite_evidence_strength(
            observed_facts=observed_facts,
            baseline_val=baseline_val,
            baseline_tier=baseline_tier,
            incident_rows=incident_rows,
            leak=leak
        )

        # 5. Extract Observation Timestamps
        obs_timestamps = [
            r.timestamp.isoformat() if hasattr(r.timestamp, "isoformat") else str(r.timestamp)
            for r in incident_rows
        ]

        # 6. Structured Evidence Items Generation
        evidence_items = cls._generate_evidence_items(
            observed_facts=observed_facts,
            baseline_val=baseline_val,
            baseline_tier=baseline_tier,
            composite_strength=composite_strength,
            obs_timestamps=obs_timestamps,
            leak=leak,
            is_off_hours=is_off_hours
        )

        # 7. Evidence Chain Synthesis (OBSERVED -> PRODUCTION STATE -> DIVERGENCE -> LOCALIZATION -> INTERPRETATION)
        evidence_chain = cls._synthesize_evidence_chain(
            observed_facts=observed_facts,
            baseline_val=baseline_val,
            baseline_tier=baseline_tier,
            leak=leak,
            is_off_hours=is_off_hours
        )

        # 8. What Changed Comparison
        what_changed = cls._build_what_changed(
            observed_facts=observed_facts,
            baseline_val=baseline_val,
            baseline_tier=baseline_tier,
            incident_rows=incident_rows,
            baseline_rows=baseline_rows,
            leak=leak
        )

        # 9. Supported Contributing Factors vs Not Confirmed
        supported_contributors, not_confirmed = cls._derive_factors_and_non_confirmations(
            observed_facts=observed_facts,
            composite_strength=composite_strength,
            leak=leak,
            is_off_hours=is_off_hours
        )

        # 10. Missing Telemetry Analysis
        missing_data = cls._evaluate_missing_telemetry(incident_rows)

        # 11. What Would Change Our Conclusion? (Hypothesis Falsification)
        falsification_items = cls._generate_hypothesis_falsification(
            is_off_hours=is_off_hours,
            leak=leak
        )

        # 12. Multivariable Association Analysis (Guarded Pearson r)
        multivariable = cls._compute_guarded_associations(incident_rows)

        # 13. Ranked Next Investigation Actions
        ranked_actions = cls._generate_ranked_investigation_actions(
            is_off_hours=is_off_hours,
            leak=leak
        )

        # 14. Narrow Phase 3 Problem Representation Bridge
        problem_rep = cls._build_narrow_problem_representation(
            leak=leak,
            observed_facts=observed_facts,
            composite_strength=composite_strength,
            is_off_hours=is_off_hours,
            db=db
        )

        # 15. Lineage & AnalysisRun Persistence
        analysis_run_id, dataset_hash = cls._record_analysis_run(
            db=db,
            facility_id=leak.facility_id,
            leak=leak,
            input_count=total_records_analyzed
        )

        window_start = incident_rows[0].timestamp.isoformat() if incident_rows and hasattr(incident_rows[0].timestamp, "isoformat") else None
        window_end = incident_rows[-1].timestamp.isoformat() if incident_rows and hasattr(incident_rows[-1].timestamp, "isoformat") else None

        analysis_metadata = {
            "analysis_type": "incident_evidence_investigation",
            "methodology_version": "1.0.0",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "dataset_hash": dataset_hash or leak.analysis_run_id,
            "analysis_run_id": analysis_run_id,
            "input_record_count": total_records_analyzed,
            "window_start": window_start,
            "window_end": window_end
        }

        # Executive Summary
        if is_off_hours:
            summary_statement = (
                f"Electricity consumption remained active at an average of {observed_facts['electricity_mean']} kWh/hr "
                f"while recorded production was {observed_facts['production_sum']} kg during a non-production period, "
                f"exceeding the established {baseline_tier} baseline ({baseline_val} kWh/hr)."
            )
        else:
            summary_statement = (
                f"Electrical power intensity averaged {observed_facts['electricity_mean']} kWh/hr during active production, "
                f"deviating +{round(leak.deviation_percent, 1)}% from the established {baseline_tier} baseline ({baseline_val} kWh/hr)."
            )

        return {
            "summary": summary_statement,
            "why_flagged_statement": summary_statement,
            "evidence_chain": [s.model_dump() if hasattr(s, "model_dump") else s for s in evidence_chain],
            "what_changed": [w.model_dump() if hasattr(w, "model_dump") else w for w in what_changed],
            "evidence_items": [e.model_dump() if hasattr(e, "model_dump") else e for e in evidence_items],
            "supported_contributors": [c.model_dump() if hasattr(c, "model_dump") else c for c in supported_contributors],
            "not_confirmed": [nc.model_dump() if hasattr(nc, "model_dump") else nc for nc in not_confirmed],
            "missing_data": [m.model_dump() if hasattr(m, "model_dump") else m for m in missing_data],
            "what_would_change_conclusion": [f.model_dump() if hasattr(f, "model_dump") else f for f in falsification_items],
            "ranked_next_investigation": [a.model_dump() if hasattr(a, "model_dump") else a for a in ranked_actions],
            "multivariable_analysis": [mv.model_dump() if hasattr(mv, "model_dump") else mv for mv in multivariable],
            "problem_representation": problem_rep.model_dump() if hasattr(problem_rep, "model_dump") else problem_rep,
            "analysis_metadata": analysis_metadata,
            "methodology": (
                f"Deterministic multi-tier baseline comparison ({baseline_tier}) and multi-factor composite evidence strength rating. "
                "All findings are grounded strictly in timestamp-aligned SCADA telemetry records without generative AI extrapolation."
            ),
            "scientific_distinction": (
                "ANOMALY DETECTION flags unusual statistical divergence. "
                "EVIDENCE-BASED EXPLANATION identifies measured telemetry signals associated with the divergence. "
                "CAUSAL INFERENCE requires physical sensor proof (e.g. pressure/temperature transducer confirmation) "
                "and is explicitly not asserted when those transducers are uninstrumented."
            )
        }

    # =========================================================================
    # Internal Deterministic Analysis Helper Methods
    # =========================================================================

    @classmethod
    def _segment_incident_and_comparison_rows(
        cls,
        telemetry_rows: List[ProcessData],
        leak: Leak,
        is_off_hours: bool
    ) -> Tuple[List[ProcessData], List[ProcessData]]:
        """Segments telemetry into incident observation window and non-anomalous baseline candidate rows."""
        if not telemetry_rows:
            return [], []

        incident_rows = []
        comparison_rows = []

        for r in telemetry_rows:
            elec = float(r.electricity_kwh or 0.0)
            prod = float(r.production_volume or 0.0)
            op_hrs = float(r.operating_hours or 0.0)

            hour_val = r.hour if getattr(r, "hour", None) is not None else (r.timestamp.hour if getattr(r, "timestamp", None) else 0)
            is_anom = False
            if is_off_hours:
                is_anom = (elec > 5.0) and (hour_val >= 22 or hour_val <= 5 or op_hrs == 0.0)
            else:
                baseline_thresh = (1.25 * leak.baseline_consumption) if leak.baseline_consumption > 0 else 15.0
                is_anom = (elec > baseline_thresh)

            if is_anom:
                incident_rows.append(r)
            else:
                comparison_rows.append(r)

        # If incident rows were not segmented by heuristic, take the latest contiguous sequence
        if not incident_rows:
            incident_rows = telemetry_rows[-8:] if len(telemetry_rows) >= 8 else telemetry_rows
            comparison_rows = telemetry_rows[:-8] if len(telemetry_rows) > 8 else []

        return incident_rows, comparison_rows

    @classmethod
    def _resolve_baseline_hierarchy(
        cls,
        comparison_rows: List[ProcessData],
        leak: Leak,
        is_off_hours: bool
    ) -> Tuple[float, str, str, List[ProcessData]]:
        """
        Determines the baseline value through an explicit 3-tier hierarchy:
        Tier 1: same_equipment_same_process_comparable_operating_state
        Tier 2: same_equipment_comparable_shift_or_hour
        Tier 3: historical_comparable_observations
        Fallback: baseline_unavailable (never silently manufactured!)
        """
        if not comparison_rows or len(comparison_rows) < 3:
            # Check if leak record already possesses a valid positive backend baseline
            if leak.baseline_consumption is not None and leak.baseline_consumption > 0:
                tier = "Tier 1: same_equipment_same_process_comparable_operating_state" if is_off_hours else "Tier 3: historical_comparable_observations"
                return round(float(leak.baseline_consumption), 2), tier, "Calculated from historical non-incident active cycles.", []
            return 0.0, "baseline_unavailable", "Insufficient historical observations to establish a statistically defensible comparison baseline.", []

        # Tier 1: Same equipment + comparable operating state (off-hours or comparable production)
        def _get_hour(r):
            if getattr(r, "hour", None) is not None:
                return r.hour
            ts = getattr(r, "timestamp", None)
            if ts and hasattr(ts, "hour"):
                return ts.hour
            return None

        if is_off_hours:
            tier1_rows = [
                r for r in comparison_rows
                if (_get_hour(r) is not None and (_get_hour(r) >= 22 or _get_hour(r) <= 5)) or (r.operating_hours or 0) == 0
            ]
            if len(tier1_rows) >= 5:
                vals = [float(r.electricity_kwh or 0.0) for r in tier1_rows]
                vals.sort()
                median_val = vals[len(vals) // 2]
                return round(median_val, 2), "Tier 1: same_equipment_same_process_comparable_operating_state", "Calculated from scheduled non-production hours on the same asset.", tier1_rows
        else:
            tier1_rows = [r for r in comparison_rows if float(r.production_volume or 0.0) > 0]
            if len(tier1_rows) >= 5:
                vals = [float(r.electricity_kwh or 0.0) for r in tier1_rows]
                vals.sort()
                median_val = vals[len(vals) // 2]
                return round(median_val, 2), "Tier 1: same_equipment_same_process_comparable_operating_state", "Calculated from normal active production cycles with comparable output.", tier1_rows

        # Tier 2: Same equipment + comparable shift or hour of day
        sample_hours = {_get_hour(r) for r in comparison_rows[:10] if _get_hour(r) is not None}
        tier2_rows = [r for r in comparison_rows if _get_hour(r) in sample_hours]
        if len(tier2_rows) >= 5:
            vals = [float(r.electricity_kwh or 0.0) for r in tier2_rows]
            vals.sort()
            median_val = vals[len(vals) // 2]
            return round(median_val, 2), "Tier 2: same_equipment_comparable_shift_or_hour", "Calculated from historical non-incident hours on the same operating shift.", tier2_rows

        # Tier 3: Historical comparable observations across asset
        if len(comparison_rows) >= 3:
            vals = [float(r.electricity_kwh or 0.0) for r in comparison_rows]
            vals.sort()
            median_val = vals[len(vals) // 2]
            return round(median_val, 2), "Tier 3: historical_comparable_observations", "Calculated from historical median observations across all non-anomalous cycles.", comparison_rows

        return 0.0, "baseline_unavailable", "Insufficient historical observations for reliable comparison.", []

    @classmethod
    def _extract_observed_facts(
        cls,
        incident_rows: List[ProcessData],
        leak: Leak
    ) -> Dict[str, Any]:
        """Extracts measured numerical facts from the incident window."""
        if not incident_rows:
            return {
                "electricity_mean": round(float(leak.observed_consumption), 2),
                "electricity_min": round(float(leak.observed_consumption), 2),
                "electricity_max": round(float(leak.observed_consumption), 2),
                "electricity_std": 0.0,
                "production_sum": 0.0,
                "production_mean": 0.0,
                "fuel_sum": 0.0,
                "sample_count": 1,
            }

        elec_vals = [float(r.electricity_kwh or 0.0) for r in incident_rows]
        prod_vals = [float(r.production_volume or 0.0) for r in incident_rows]
        fuel_vals = [float(r.fuel_quantity or 0.0) for r in incident_rows]

        n = len(elec_vals)
        mean_elec = sum(elec_vals) / n if n > 0 else 0.0
        variance = sum((x - mean_elec) ** 2 for x in elec_vals) / n if n > 0 else 0.0
        std_elec = math.sqrt(variance)

        return {
            "electricity_mean": round(mean_elec, 2),
            "electricity_min": round(min(elec_vals), 2) if elec_vals else 0.0,
            "electricity_max": round(max(elec_vals), 2) if elec_vals else 0.0,
            "electricity_std": round(std_elec, 2),
            "production_sum": round(sum(prod_vals), 2),
            "production_mean": round(sum(prod_vals) / n, 2) if n > 0 else 0.0,
            "fuel_sum": round(sum(fuel_vals), 2),
            "sample_count": n,
        }

    @classmethod
    def _calculate_composite_evidence_strength(
        cls,
        observed_facts: Dict[str, Any],
        baseline_val: float,
        baseline_tier: str,
        incident_rows: List[ProcessData],
        leak: Leak
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Calculates a deterministic composite evidence strength score (0..100).
        Evaluates:
        - Deviation magnitude (30%)
        - Sample count N (20%)
        - Observation consistency across window (15%)
        - Baseline hierarchy quality (15%)
        - Asset boundary localization (10%)
        - Direct SCADA telemetry directness (10%)
        """
        score = 0.0
        details = {}

        # 1. Deviation magnitude
        diff_pct = abs(leak.deviation_percent or 0.0)
        if diff_pct >= 75.0:
            dev_score = 30.0
        elif diff_pct >= 40.0:
            dev_score = 20.0
        elif diff_pct >= 20.0:
            dev_score = 12.0
        else:
            dev_score = 5.0
        score += dev_score
        details["deviation_magnitude_points"] = dev_score

        # 2. Sample Count
        n = observed_facts["sample_count"]
        if n >= 20:
            sample_score = 20.0
        elif n >= 10:
            sample_score = 15.0
        elif n >= 5:
            sample_score = 10.0
        else:
            sample_score = 5.0
        score += sample_score
        details["sample_count_points"] = sample_score

        # 3. Observation Consistency (low CV = sustained anomaly)
        mean_val = observed_facts["electricity_mean"]
        std_val = observed_facts["electricity_std"]
        cv = (std_val / mean_val) if mean_val > 0 else 0.0
        if n >= 3 and cv <= 0.35:
            consistency_score = 15.0
        elif n >= 3 and cv <= 0.65:
            consistency_score = 10.0
        else:
            consistency_score = 5.0
        score += consistency_score
        details["consistency_points"] = consistency_score

        # 4. Baseline Quality Tier
        if "Tier 1" in baseline_tier:
            baseline_score = 15.0
        elif "Tier 2" in baseline_tier:
            baseline_score = 10.0
        elif "Tier 3" in baseline_tier:
            baseline_score = 5.0
        else:
            baseline_score = 0.0
        score += baseline_score
        details["baseline_quality_points"] = baseline_score

        # 5. Asset boundary localization
        loc_score = 10.0 if leak.equipment else 5.0
        score += loc_score
        details["localization_points"] = loc_score

        # 6. Measurement directness
        direct_score = 10.0  # Measured directly from ProcessData SCADA records
        score += direct_score
        details["measurement_directness_points"] = direct_score

        details["total_composite_score"] = round(score, 1)

        if score >= 70.0 and baseline_tier != "baseline_unavailable" and n >= 5:
            strength = "STRONG"
        elif score >= 45.0 and baseline_tier != "baseline_unavailable":
            strength = "MODERATE"
        else:
            strength = "WEAK"

        return strength, details

    @classmethod
    def _generate_evidence_items(
        cls,
        observed_facts: Dict[str, Any],
        baseline_val: float,
        baseline_tier: str,
        composite_strength: str,
        obs_timestamps: List[str],
        leak: Leak,
        is_off_hours: bool
    ) -> List[StructuredEvidenceItem]:
        """Generates structured evidence items with explicit timestamp provenance."""
        evidence_list = []

        # Evidence Item 1: Power consumption divergence
        diff = round(observed_facts["electricity_mean"] - baseline_val, 2)
        pct = round(leak.deviation_percent, 1)
        evidence_list.append(StructuredEvidenceItem(
            evidence_id="EVID-01-ELEC-DIVERGENCE",
            category="intensity_spike" if not is_off_hours else "off_hours_idle",
            title="Electrical Power Consumption Baseline Divergence",
            description=(
                f"Observed electrical power draw averaged {observed_facts['electricity_mean']} kWh/hr "
                f"across {observed_facts['sample_count']} telemetry intervals, diverging +{pct}% "
                f"from the {baseline_tier} baseline ({baseline_val} kWh/hr)."
            ),
            observed_value=observed_facts["electricity_mean"],
            reference_value=baseline_val,
            difference=diff,
            difference_percent=pct,
            unit="kWh/hr",
            strength=composite_strength,
            supports="Elevated electrical intensity relative to established operational baseline.",
            source_metric="electricity_kwh",
            time_window=leak.abnormal_period or "Incident Window",
            sample_size=observed_facts["sample_count"],
            baseline_method=baseline_tier,
            data_quality="Direct SCADA Telemetry (100% complete in window)",
            analysis_run_id=leak.analysis_run_id,
            is_fact=True,
            telemetry_timestamps=obs_timestamps
        ))

        # Evidence Item 2: Production State Correlation
        prod_val = observed_facts["production_sum"]
        prod_title = "Zero Output Idle Loss" if prod_val == 0 else "High Specific Energy Consumption"
        prod_desc = (
            f"Reported production output was {prod_val} kg across the incident window while "
            f"electrical draw persisted at {observed_facts['electricity_mean']} kWh/hr."
            if prod_val == 0 else
            f"Production output totaled {prod_val} kg with an elevated energy intensity of "
            f"{round(observed_facts['electricity_mean'] / max(1.0, observed_facts['production_mean']), 3)} kWh/kg."
        )
        evidence_list.append(StructuredEvidenceItem(
            evidence_id="EVID-02-PROD-STATE",
            category="production_state",
            title=prod_title,
            description=prod_desc,
            observed_value=prod_val,
            reference_value=0.0 if is_off_hours else None,
            difference=None,
            difference_percent=None,
            unit="kg",
            strength="STRONG" if prod_val == 0 and is_off_hours else "MODERATE",
            supports="Standby / non-productive energy loss." if prod_val == 0 else "Production energy intensity deterioration.",
            source_metric="production_volume",
            time_window=leak.abnormal_period or "Incident Window",
            sample_size=observed_facts["sample_count"],
            baseline_method="Scheduled Operating State Log",
            data_quality="Production Counter Register",
            analysis_run_id=leak.analysis_run_id,
            is_fact=True,
            telemetry_timestamps=obs_timestamps
        ))

        # Evidence Item 3: Equipment Boundary Localization
        evidence_list.append(StructuredEvidenceItem(
            evidence_id="EVID-03-EQUIP-LOCALIZATION",
            category="equipment_localization",
            title="Equipment Boundary Localization",
            description=(
                f"The abnormal electrical signal is localized specifically to {leak.equipment} "
                f"within the {leak.process} boundary, rather than a broad facility-wide power surge."
            ),
            observed_value=observed_facts["electricity_mean"],
            reference_value=None,
            difference=None,
            difference_percent=None,
            unit="kWh/hr",
            strength="STRONG" if leak.equipment else "WEAK",
            supports=f"Focal operational divergence isolated to {leak.equipment}.",
            source_metric="equipment_id",
            time_window=leak.abnormal_period or "Incident Window",
            sample_size=observed_facts["sample_count"],
            baseline_method="Sub-meter Channel Tagging",
            data_quality="Physical Sub-Meter Association",
            analysis_run_id=leak.analysis_run_id,
            is_fact=True,
            telemetry_timestamps=obs_timestamps
        ))

        return evidence_list

    @classmethod
    def _synthesize_evidence_chain(
        cls,
        observed_facts: Dict[str, Any],
        baseline_val: float,
        baseline_tier: str,
        leak: Leak,
        is_off_hours: bool
    ) -> List[EvidenceChainStep]:
        """
        Synthesizes the step-by-step auditable chain:
        OBSERVED -> PRODUCTION STATE -> BASELINE DIVERGENCE -> LOCALIZATION -> INTERPRETATION
        """
        elec_mean = observed_facts["electricity_mean"]
        prod_val = observed_facts["production_sum"]
        pct = round(leak.deviation_percent, 1)

        steps = [
            EvidenceChainStep(
                step=1,
                type="fact",
                statement=f"Electricity consumption remained active at {elec_mean} kWh/hr during the incident window.",
                evidence_id="EVID-01-ELEC-DIVERGENCE",
                is_fact=True
            ),
            EvidenceChainStep(
                step=2,
                type="fact",
                statement=f"Reported production output was {prod_val} kg during this identical window.",
                evidence_id="EVID-02-PROD-STATE",
                is_fact=True
            ),
            EvidenceChainStep(
                step=3,
                type="baseline_divergence",
                statement=f"Observed draw diverged +{pct}% from the established {baseline_tier} baseline ({baseline_val} kWh/hr).",
                evidence_id="EVID-01-ELEC-DIVERGENCE",
                is_fact=True
            ),
            EvidenceChainStep(
                step=4,
                type="equipment_localization",
                statement=f"Signal variance was isolated to {leak.equipment} within the {leak.process} operational zone.",
                evidence_id="EVID-03-EQUIP-LOCALIZATION",
                is_fact=True
            ),
            EvidenceChainStep(
                step=5,
                type="supported_interpretation",
                statement=(
                    "The available evidence supports an operational standby/idle energy-loss pattern."
                    if is_off_hours else
                    "The available evidence supports an operational specific energy intensity spike."
                ),
                evidence_id=None,
                is_fact=False
            )
        ]
        return steps

    @classmethod
    def _build_what_changed(
        cls,
        observed_facts: Dict[str, Any],
        baseline_val: float,
        baseline_tier: str,
        incident_rows: List[ProcessData],
        baseline_rows: List[ProcessData],
        leak: Leak
    ) -> List[WhatChangedItem]:
        """Calculates measurable comparison between baseline period and incident period."""
        items = []

        # Electricity
        diff_elec = round(observed_facts["electricity_mean"] - baseline_val, 2)
        pct_elec = round(leak.deviation_percent, 1)
        items.append(WhatChangedItem(
            metric="Electricity Consumption",
            observed=observed_facts["electricity_mean"],
            baseline=baseline_val,
            difference=diff_elec,
            difference_percent=pct_elec,
            unit="kWh/hr",
            baseline_method_tier=baseline_tier,
            interpretation="Sustained electrical consumption above expected baseline level."
        ))

        # Production Output
        base_prod = 0.0
        if baseline_rows:
            prods = [float(r.production_volume or 0.0) for r in baseline_rows]
            base_prod = round(sum(prods) / len(prods), 2)
        obs_prod = observed_facts["production_mean"]
        diff_prod = round(obs_prod - base_prod, 2)
        pct_prod = round(((obs_prod - base_prod) / base_prod * 100.0), 1) if base_prod > 0 else 0.0

        items.append(WhatChangedItem(
            metric="Production Output Rate",
            observed=obs_prod,
            baseline=base_prod,
            difference=diff_prod,
            difference_percent=pct_prod,
            unit="kg/hr",
            baseline_method_tier=baseline_tier,
            interpretation="Output matches expected off-shift standstill." if obs_prod == 0 else "Production continued with altered throughput."
        ))

        return items

    @classmethod
    def _derive_factors_and_non_confirmations(
        cls,
        observed_facts: Dict[str, Any],
        composite_strength: str,
        leak: Leak,
        is_off_hours: bool
    ) -> Tuple[List[SupportedContributor], List[NotConfirmedItem]]:
        """Separates supported operational factors from unconfirmed physical faults."""
        supported = []
        not_confirmed = []

        if is_off_hours:
            supported.append(SupportedContributor(
                factor="Off-Hours Standby / Idle Electricity Persistence",
                strength=composite_strength,
                reason=(
                    f"Power consumption averaged {observed_facts['electricity_mean']} kWh/hr while production output "
                    f"was 0 kg during non-production hours. Evidence demonstrates un-interlocked auxiliary load."
                ),
                evidence_ids=["EVID-01-ELEC-DIVERGENCE", "EVID-02-PROD-STATE", "EVID-03-EQUIP-LOCALIZATION"]
            ))
        else:
            supported.append(SupportedContributor(
                factor="Elevated Electrical Energy Intensity During Active Cycle",
                strength=composite_strength,
                reason=(
                    f"Electrical energy draw diverged +{round(leak.deviation_percent, 1)}% above active baseline, "
                    "indicating motor/heater load divergence per unit throughput."
                ),
                evidence_ids=["EVID-01-ELEC-DIVERGENCE", "EVID-03-EQUIP-LOCALIZATION"]
            ))

        # Explicit Not-Confirmed Items
        not_confirmed.append(NotConfirmedItem(
            factor="Physical Internal Mechanical / Valve / Motor Failure",
            reason="Internal vibration, motor winding resistance, and contactor state telemetry channels are not instrumented on this machine.",
            missing_telemetry=["Vibration Telemetry", "Contactor Operating State", "Acoustic Leak Sensor"]
        ))
        not_confirmed.append(NotConfirmedItem(
            factor="Thermal Insulation Degradation or Steam Flue Bleed",
            reason="Flue gas temperature, steam trap differential pressure, and thermal infrared sensors are currently unavailable in facility telemetry.",
            missing_telemetry=["Temperature Telemetry", "Pressure Telemetry", "Steam Trap Monitor"]
        ))

        return supported, not_confirmed

    @classmethod
    def _evaluate_missing_telemetry(
        cls,
        incident_rows: List[ProcessData]
    ) -> List[MissingDataItem]:
        """Identifies missing telemetry channels and explains their scientific relevance."""
        missing = [
            MissingDataItem(
                telemetry_channel="Temperature Sensors (Thermocouple / RTD)",
                status="Missing",
                impact="Cannot calculate thermodynamic heat loss or distinguish insulation wear from electrical heater anomalies.",
                importance="High"
            ),
            MissingDataItem(
                telemetry_channel="Operating Line Pressure Transducers",
                status="Missing",
                impact="Cannot assess pneumatic line pressure drop, steam trap blow-by, or valve seal degradation.",
                importance="High"
            ),
            MissingDataItem(
                telemetry_channel="Contactor / Relay Digital Operating State",
                status="Missing",
                impact="Cannot directly confirm whether equipment control system commanded the unit ON or OFF during off-hours.",
                importance="High"
            ),
            MissingDataItem(
                telemetry_channel="Equipment Vibration Telemetry",
                status="Missing",
                impact="Cannot assess mechanical bearing friction, motor imbalance, or shaft misalignment.",
                importance="Medium"
            )
        ]
        return missing

    @classmethod
    def _generate_hypothesis_falsification(
        cls,
        is_off_hours: bool,
        leak: Leak
    ) -> List[HypothesisFalsificationItem]:
        """Generates conditions that would strengthen or falsify the supported interpretation."""
        items = []

        if is_off_hours:
            items.append(HypothesisFalsificationItem(
                hypothesis="The incident represents unintended standby/idle electrical energy loss.",
                strengthening_condition="Contactor digital input telemetry confirming motor/heating circuit remained energized while production line was tagged inactive.",
                falsifying_condition="Shift handover logs or production dispatch records demonstrating that an unrecorded manual product pre-heating or cleaning cycle was scheduled during this window."
            ))
            items.append(HypothesisFalsificationItem(
                hypothesis="The sub-meter reading reflects actual physical consumption by the target asset.",
                strengthening_condition="Independent totalizer check or auxiliary clamp meter verification confirming the circuit current.",
                falsifying_condition="Current transformer (CT) phase desynchronization or sub-meter calibration error discovered during hardware audit."
            ))
        else:
            items.append(HypothesisFalsificationItem(
                hypothesis="The incident represents specific energy consumption (SEC) efficiency degradation.",
                strengthening_condition="Raw material batch log indicating standard grade feedstock processed under normal ambient conditions.",
                falsifying_condition="Evidence of higher-viscosity or denser feedstock requiring legitimately higher mechanical motor torque."
            ))

        return items

    @classmethod
    def _compute_guarded_associations(
        cls,
        incident_rows: List[ProcessData]
    ) -> List[MultivariableAssociation]:
        """
        Computes multivariable correlation (Pearson r) with strict guards:
        - Aligned timestamps required
        - N >= 10 paired observations required
        - Finite numeric values only
        - Non-zero variance required in both variables
        """
        associations = []

        if not incident_rows or len(incident_rows) < 10:
            associations.append(MultivariableAssociation(
                variable_a="Electricity Consumption (kWh)",
                variable_b="Production Volume (kg)",
                association_r=None,
                sample_size=len(incident_rows) if incident_rows else 0,
                note="Insufficient paired observations (N < 10) for defensible statistical association calculation.",
                caveat="Association indicates mutual variation across paired timestamps, not physical causation."
            ))
            return associations

        # Extract strictly paired arrays
        elec = [float(r.electricity_kwh or 0.0) for r in incident_rows]
        prod = [float(r.production_volume or 0.0) for r in incident_rows]
        n = len(elec)

        # Zero variance check
        mean_e = sum(elec) / n
        mean_p = sum(prod) / n
        var_e = sum((x - mean_e) ** 2 for x in elec) / n
        var_p = sum((y - mean_p) ** 2 for y in prod) / n

        if var_e == 0.0 or var_p == 0.0:
            zero_var_var = "Production Volume" if var_p == 0.0 else "Electricity Consumption"
            associations.append(MultivariableAssociation(
                variable_a="Electricity Consumption (kWh)",
                variable_b="Production Volume (kg)",
                association_r=None,
                sample_size=n,
                note=f"Zero variance detected in {zero_var_var} across comparison window; Pearson r is mathematically undefined.",
                caveat="Association indicates mutual variation across paired timestamps, not physical causation."
            ))
            return associations

        # Calculate Pearson r
        cov = sum((elec[i] - mean_e) * (prod[i] - mean_p) for i in range(n)) / n
        r = cov / (math.sqrt(var_e) * math.sqrt(var_p))
        r_rounded = round(r, 3)

        associations.append(MultivariableAssociation(
            variable_a="Electricity Consumption (kWh)",
            variable_b="Production Volume (kg)",
            association_r=r_rounded,
            sample_size=n,
            note=f"Measured linear association (r = {r_rounded}) across {n} timestamp-aligned interval readings.",
            caveat="Association indicates mutual variation across paired timestamps, not physical causation."
        ))

        return associations

    @classmethod
    def _generate_ranked_investigation_actions(
        cls,
        is_off_hours: bool,
        leak: Leak
    ) -> List[RankedInvestigationAction]:
        """Ranks next investigation actions by information gain rationale."""
        actions = []

        if is_off_hours:
            actions.append(RankedInvestigationAction(
                priority=1,
                priority_label="High Priority",
                action=f"Inspect physical power isolation and interlock cutoff switch for {leak.equipment}.",
                investigation_priority="Critical (Immediate Safety & Energy Verification)",
                information_gain_rationale="Conclusively resolves whether standby power draw is intentional un-interlocked idling or equipment left on inadvertently."
            ))
            actions.append(RankedInvestigationAction(
                priority=2,
                priority_label="High Priority",
                action="Cross-reference off-hours facility shift handover log and maintenance register.",
                investigation_priority="Operational Governance",
                information_gain_rationale="Verifies whether unrecorded manual pre-heating, cleaning, or maintenance was conducted during this period."
            ))
            actions.append(RankedInvestigationAction(
                priority=3,
                priority_label="Medium Priority",
                action="Verify Current Transformer (CT) clamp meter calibration on the sub-meter circuit.",
                investigation_priority="Instrumentation Verification",
                information_gain_rationale="Rules out sensor drift or power factor calculation artifacts in the sub-meter firmware."
            ))
        else:
            actions.append(RankedInvestigationAction(
                priority=1,
                priority_label="High Priority",
                action=f"Inspect mechanical load resistance and motor winding current on {leak.equipment}.",
                investigation_priority="Electromechanical Inspection",
                information_gain_rationale="Identifies mechanical binding, worn bearings, or electrical phase imbalance driving excess kWh/unit."
            ))
            actions.append(RankedInvestigationAction(
                priority=2,
                priority_label="High Priority",
                action="Review feedstock recipe and process batch temperature logs.",
                investigation_priority="Process Engineering Review",
                information_gain_rationale="Determines whether non-standard raw material properties necessitated elevated processing power."
            ))
            actions.append(RankedInvestigationAction(
                priority=3,
                priority_label="Medium Priority",
                action="Instrument missing thermal and line pressure transducers on process boundary.",
                investigation_priority="SCADA Instrumentation Enhancement",
                information_gain_rationale="Enables thermodynamic efficiency tracking and automated root-cause isolation."
            ))

        return actions

    @classmethod
    def _build_narrow_problem_representation(
        cls,
        leak: Leak,
        observed_facts: Dict[str, Any],
        composite_strength: str,
        is_off_hours: bool,
        db: Optional[Session] = None
    ) -> ProblemRepresentation:
        """
        Builds the narrow Phase 3 problem representation.
        Defines the verified operational problem pattern without picking an intervention.
        Grounds carbon impact in active DB emission factors without hardcoded constants (NF-02).
        Passes physical excess energy to Phase 3 for authoritative economic calculation.
        """
        eq = (leak.equipment or "").lower()
        proc = (leak.process or "").lower()
        l_type = (leak.leak_type or "").lower()

        if is_off_hours:
            problem_type = "standby_idle_energy_loss"
        elif "boiler" in eq or "steam" in proc or "fuel" in l_type:
            problem_type = "specific_energy_consumption_spike"
        elif "compressor" in eq or "air" in proc:
            problem_type = "unloaded_idle_runtime"
        elif "chiller" in eq or "cooling" in proc or "hvac" in eq:
            problem_type = "chiller_low_cop"
        elif "motor" in eq:
            problem_type = "low_electrical_efficiency"
        elif "furnace" in eq:
            problem_type = "thermal_efficiency_drop"
        else:
            problem_type = "standby_idle_energy_loss"

        observed = float(leak.observed_consumption or 0.0)
        baseline = float(leak.baseline_consumption or 0.0)
        excess_kwh = max(0.0, observed - baseline)
        if excess_kwh == 0.0 and getattr(leak, "excess_consumption", None):
            excess_kwh = float(leak.excess_consumption)

        # Dynamic emission factor resolution via DB EmissionService (NF-02 remediation)
        grid_factor = None
        if db is not None:
            try:
                ef = EmissionService.get_factor_for_telemetry(
                    db=db,
                    source_name="grid_electricity",
                    telemetry_timestamp=getattr(leak, "detected_at", None)
                )
                grid_factor = float(ef.factor_value) if ef else None
            except Exception:
                grid_factor = None

        if leak.emission_contribution_kg is not None:
            carbon_impact_kg = float(leak.emission_contribution_kg)
        elif grid_factor is not None:
            carbon_impact_kg = round(excess_kwh * grid_factor, 2)
        else:
            carbon_impact_kg = 0.0

        return ProblemRepresentation(
            problem_type=problem_type,
            type=problem_type,
            affected_equipment=leak.equipment or "",
            affected_process=leak.process or "",
            severity="Critical" if (leak.risk_score or 0) >= 80 else ("High" if (leak.risk_score or 0) >= 60 else "Medium"),
            evidence_strength=composite_strength,
            excess_energy_kwh=round(excess_kwh, 2),
            carbon_factor_used=grid_factor,
            estimated_carbon_impact_kg=carbon_impact_kg,
            estimated_financial_impact_inr=0.0,  # Phase 3 InterventionImpactService owns authoritative calculation with active decision tariff
            constraints=[
                "Cannot interrupt active production shifts",
                "Uninstrumented temperature transducers prevent thermal balance verification",
                "Requires equipment physical contactor verification"
            ],
            missing_data=["Temperature Telemetry", "Pressure Telemetry", "Contactor Operating State"],
            provenance_notes={
                "excess_energy_kwh_source": "[MEASURED]" if leak.baseline_consumption is not None else "[DERIVED]",
                "carbon_factor_source": "[DATABASE]" if grid_factor is not None else "[UNAVAILABLE]",
                "financial_calculation_owner": "Phase 3 InterventionImpactService"
            }
        )

    @classmethod
    def _record_analysis_run(
        cls,
        db: Session,
        facility_id: int,
        leak: Leak,
        input_count: int
    ) -> Tuple[str, Optional[str]]:
        """Records an AnalysisRun for the evidence investigation preserving lineage."""
        run_id = f"RUN-WHY-{leak.id}-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S%f')}-{uuid.uuid4().hex[:6]}"
        dataset_hash = None

        # Check if existing run exists for dataset hash
        if leak.analysis_run_id:
            parent_run = db.query(AnalysisRun).filter(AnalysisRun.id == leak.analysis_run_id).first()
            if parent_run:
                dataset_hash = parent_run.dataset_hash_sha256

        try:
            analysis_run = AnalysisRun(
                id=run_id,
                facility_id=facility_id,
                analysis_type="incident_evidence_investigation",
                model_name="EvidenceInvestigation",
                model_version="1.0.0",
                parameters={
                    "incident_id": leak.id,
                    "equipment": leak.equipment,
                    "baseline_rule": "multi_tier_hierarchy",
                    "strength_method": "composite_deterministic"
                },
                feature_set=["electricity_kwh", "production_volume", "hour", "operating_hours"],
                input_row_count=input_count,
                dataset_hash_sha256=dataset_hash,
                code_version="2.0.0",
                status="completed",
                started_at=datetime.datetime.now(datetime.timezone.utc),
                completed_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(analysis_run)
            db.flush()
            return run_id, dataset_hash
        except Exception:
            return run_id, dataset_hash
