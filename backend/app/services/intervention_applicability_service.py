"""
Intervention Applicability Service.
Evaluates technical feasibility, equipment boundaries, sector relevance, and telemetry prerequisites
for each intervention against the incident problem representation.
"""

from typing import Dict, Any, List, Set, Optional
from app.models.recommendation import Recommendation
from app.schemas.intervention import ApplicabilityEvaluation


class InterventionApplicabilityService:
    """
    Evaluates whether an intervention is:
    - 'applicable': Boundary matches, problem matches, and all required telemetry exists.
    - 'conditionally_applicable': Boundary and problem match, but required telemetry is missing or site prerequisites need audit.
    - 'not_applicable': Explicit boundary, sector, or problem mismatch.
    """

    @classmethod
    def evaluate_applicability(
        cls,
        recommendation: Recommendation,
        problem_rep: Dict[str, Any],
        facility_sector: Optional[str] = None,
        available_telemetry: Optional[Set[str]] = None,
        user_target_sector: Optional[str] = None
    ) -> ApplicabilityEvaluation:
        if available_telemetry is None:
            available_telemetry = set()

        disqualification_reasons: List[str] = []
        conditions_for_applicability: List[str] = []
        missing_telemetry: List[str] = []

        eff_sector = (user_target_sector or facility_sector or "").strip()

        # 1. Sector Boundary Check
        # Sector is an applicability filter, NOT the solution!
        sector_match = True
        supported_sectors = [str(s).strip() for s in (recommendation.supported_sectors or []) if str(s).strip()]
        if supported_sectors and eff_sector:
            matched = any(
                s.lower() in eff_sector.lower() or eff_sector.lower() in s.lower()
                for s in supported_sectors
            )
            if not matched:
                sector_match = False
                disqualification_reasons.append(
                    f"Sector boundary mismatch: Facility sector '{eff_sector}' is not in supported sectors ({', '.join(supported_sectors)})."
                )

        # 2. Equipment Boundary Check
        equipment_match = False
        aff_equip = (problem_rep.get("affected_equipment") or "").strip().lower()
        target_equip = (recommendation.target_equipment or "").strip().lower()
        supported_equip = [str(e).strip().lower() for e in (recommendation.supported_equipment or []) if str(e).strip()]

        if not aff_equip:
            equipment_match = False
            disqualification_reasons.append("Equipment boundary unknown: Affected equipment is missing from incident telemetry.")
        else:
            if target_equip and (target_equip in aff_equip or aff_equip in target_equip):
                equipment_match = True
            elif any(e in aff_equip or aff_equip in e for e in supported_equip):
                equipment_match = True
            else:
                disqualification_reasons.append(
                    f"Equipment boundary mismatch: Affected equipment '{problem_rep.get('affected_equipment')}' is outside target equipment boundary ({recommendation.target_equipment})."
                )

        # 3. Process Boundary Check
        process_match = False
        aff_proc = (problem_rep.get("affected_process") or "").strip().lower()
        target_proc = (recommendation.target_process or "").strip().lower()
        supported_proc = [str(p).strip().lower() for p in (recommendation.supported_processes or []) if str(p).strip()]

        if not aff_proc:
            # If process is unspecified in telemetry, check if equipment boundary is solid
            process_match = equipment_match
        else:
            if target_proc and (target_proc in aff_proc or aff_proc in target_proc):
                process_match = True
            elif any(p in aff_proc or aff_proc in p for p in supported_proc):
                process_match = True
            elif not supported_proc:
                process_match = True
            else:
                disqualification_reasons.append(
                    f"Process boundary mismatch: Affected process '{problem_rep.get('affected_process')}' is outside supported processes ({', '.join(recommendation.supported_processes or [])})."
                )

        boundary_match = sector_match and equipment_match and process_match

        # 4. Problem Fit Check (Strict non-empty matching; NO empty-string containment!)
        problem_fit = False
        raw_prob_type = problem_rep.get("problem_type") or problem_rep.get("type")
        if not raw_prob_type or not str(raw_prob_type).strip():
            problem_fit = False
            disqualification_reasons.append(
                "Problem type missing or undefined in incident problem representation."
            )
        else:
            prob_type = str(raw_prob_type).strip().lower()
            addressed_types = [str(t).strip().lower() for t in (recommendation.applicable_problem_types or []) if str(t).strip()]

            if not addressed_types:
                problem_fit = False
                disqualification_reasons.append("Intervention does not specify any applicable problem types.")
            elif prob_type in addressed_types:
                problem_fit = True
            elif prob_type == "standby_idle_energy_loss" and any(x in addressed_types for x in ["off_hours_idle_waste", "unloaded_idle_runtime", "system_leak"]):
                problem_fit = True
            elif prob_type == "off_hours_idle_waste" and any(x in addressed_types for x in ["standby_idle_energy_loss", "unloaded_idle_runtime", "system_leak"]):
                problem_fit = True
            elif prob_type in ["abnormal_intensity_deviation", "specific_energy_consumption_spike", "thermal_efficiency_drop"] and any(x in addressed_types for x in ["thermal_efficiency_drop", "excess_air_ratio", "combustion_inefficiency", "specific_energy_consumption_spike"]):
                problem_fit = True
            else:
                disqualification_reasons.append(
                    f"Problem type mismatch: Incident problem '{prob_type}' is not addressed by this intervention."
                )

        # 5. Required Telemetry Audit
        req_telemetry = recommendation.required_telemetry or []
        avail_lower = [str(t).strip().lower() for t in available_telemetry if str(t).strip()]
        for req in req_telemetry:
            if str(req).strip().lower() not in avail_lower:
                missing_telemetry.append(req)

        # 6. Check Contraindications
        contraindications = recommendation.contraindications or []
        for contra in contraindications:
            contra_lower = str(contra).lower()
            for c_text in problem_rep.get("constraints", []):
                ct_lower = str(c_text).lower()
                # Check for operational conflict keywords or direct mention
                if any(k in ct_lower for k in ["acid", "unstable", "dilapidated", "continuous full-load", "inverter"]) and any(k in contra_lower for k in ["acid", "unstable", "full-load", "insulation"]):
                    disqualification_reasons.append(f"Contraindication flagged: {contra}")

        # 7. Prerequisites and Site Verification Conditions
        prereqs = recommendation.prerequisites or {}
        if prereqs:
            for k, v in prereqs.items():
                clean_k = k.replace("_", " ").title()
                conditions_for_applicability.append(f"Verify physical site condition: {clean_k} = {v}")

        if recommendation.implementation_constraints:
            for iconst in recommendation.implementation_constraints:
                conditions_for_applicability.append(f"Operational constraint: {iconst}")

        # 8. Status Determination
        if not boundary_match:
            status = "not_applicable"
        elif not problem_fit:
            status = "not_applicable"
        else:
            # Boundary and problem match!
            if missing_telemetry:
                status = "conditionally_applicable"
                conditions_for_applicability.insert(
                    0, f"Requires telemetry sensor installation/monitoring for: {', '.join(missing_telemetry)}"
                )
            else:
                status = "applicable"

        return ApplicabilityEvaluation(
            status=status,
            boundary_match=boundary_match,
            problem_fit=problem_fit,
            missing_telemetry=missing_telemetry,
            disqualification_reasons=disqualification_reasons,
            conditions_for_applicability=conditions_for_applicability
        )
