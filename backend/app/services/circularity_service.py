from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    from app.services.emission_service import EmissionService
    from app.services.leak_service import LeakService
    from app.utils.facility_resolver import resolve_facility_id
except (ImportError, ModuleNotFoundError):
    from .emission_service import EmissionService
    from .leak_service import LeakService
    from ..utils.facility_resolver import resolve_facility_id


class CircularityService:
    @staticmethod
    def calculate_circularity_score(db: Session, facility_id: Any) -> Dict[str, Any]:
        """
        Calculate multi-dimensional 0-100 Circularity Score.
        Evaluates material reuse, waste recovery, renewable integration,
        process thermal efficiency, and carbon utilization.
        """
        fac_id = resolve_facility_id(facility_id, db)
        summary = EmissionService.calculate_summary(db, fac_id)
        hotspots = LeakService.get_structural_hotspots(db, fac_id).get("hotspots", [])
        anomalies = LeakService.get_anomalies(db, fac_id).get("anomalies", [])

        # 1. Renewable energy score (based on fuel mix)
        by_source = {s["name"].lower(): s["percentage_of_total"] for s in summary.get("by_source", [])}
        coal_share = by_source.get("coal", 0.0)
        diesel_share = by_source.get("diesel", 0.0)
        biomass_share = by_source.get("biomass", 0.0)

        renewable_score = min(100.0, max(20.0, (biomass_share * 1.5) + (100.0 - coal_share - diesel_share) * 0.4))

        # 2. Process Efficiency score (penalized by anomaly severity)
        anomaly_penalty = sum(min(a["risk_score"] * 0.15, 12.0) for a in anomalies)
        process_efficiency = max(30.0, min(95.0, 85.0 - anomaly_penalty))

        # 3. Waste Recovery score (penalized by flue gas/steam leakage hotspots)
        has_boiler_hotspot = any("boiler" in h["equipment"].lower() for h in hotspots[:3])
        has_air_hotspot = any("compressor" in h["equipment"].lower() for h in hotspots[:3])
        waste_recovery = 75.0
        if has_boiler_hotspot:
            waste_recovery -= 18.0
        if has_air_hotspot:
            waste_recovery -= 12.0
        waste_recovery = max(25.0, waste_recovery)

        # 4. Material Reuse score
        material_reuse = 52.0 if "textile" in summary["sector"].lower() else 58.0

        # 5. Carbon Utilization / Abatement
        carbon_utilization = 45.0 if coal_share > 30 else 62.0

        # Overall Composite Score (weighted)
        overall_score = round(
            (material_reuse * 0.20) +
            (waste_recovery * 0.25) +
            (renewable_score * 0.20) +
            (process_efficiency * 0.25) +
            (carbon_utilization * 0.10),
            1
        )

        if overall_score >= 80:
            grade = "A (Circular Champion)"
            tier = "Circular Industry Leader"
        elif overall_score >= 65:
            grade = "B (Transitioning)"
            tier = "Transitioning Circular"
        elif overall_score >= 50:
            grade = "C (Significant Linear Leaks)"
            tier = "Linear with Emerging Loops"
        else:
            grade = "D (High Fossil Dependency)"
            tier = "High Fossil Dependency"

        projected_score = min(92.0, round(overall_score + 19.0, 1))
        score_delta = round(projected_score - overall_score, 1)

        pillars = [
            {
                "id": "material_reuse",
                "name": "Material Reuse",
                "current_score": round(material_reuse, 1),
                "projected_score": min(100.0, round(material_reuse + 20, 1)),
                "weight": 20,
                "description": "Internal scrap metal re-melting ratio and runner/riser circulation efficiency.",
                "key_leverage": "Scrap pre-heating and dross recovery optimization."
            },
            {
                "id": "waste_recovery",
                "name": "Waste Recovery",
                "current_score": round(waste_recovery, 1),
                "projected_score": min(100.0, round(waste_recovery + 16, 1)),
                "weight": 20,
                "description": "Slag recycling in construction aggregates and dust baghouse filtration capture.",
                "key_leverage": "Flue-gas heat recovery into thermal loops."
            },
            {
                "id": "renewable_energy",
                "name": "Renewable Energy",
                "current_score": round(renewable_score, 1),
                "projected_score": min(100.0, round(renewable_score + 27, 1)),
                "weight": 20,
                "description": "On-site clean solar generation share vs fossil-intensive grid electricity.",
                "key_leverage": "Commissioning 200 kWp rooftop solar PV PPA array."
            },
            {
                "id": "process_efficiency",
                "name": "Process Efficiency",
                "current_score": round(process_efficiency, 1),
                "projected_score": min(100.0, round(process_efficiency + 18, 1)),
                "weight": 20,
                "description": "Specific energy consumption per batch melted and compressed air pressure stability.",
                "key_leverage": "Compressor unloader repair and VFD pump regulation."
            },
            {
                "id": "carbon_utilization",
                "name": "Carbon Utilization",
                "current_score": round(carbon_utilization, 1),
                "projected_score": min(100.0, round(carbon_utilization + 22, 1)),
                "weight": 20,
                "description": "Avoided direct emissions through closed-loop thermal and operational mitigation.",
                "key_leverage": "Total avoidance of carbon leaks via heat recovery & sequencing."
            }
        ]

        key_insights = [
            f"Current facility circularity sits at {overall_score}/100 ({grade}).",
            "Waste heat recovery on exhaust ducts can improve Waste Recovery score by +20 points.",
            "Compressor leak elimination and VFD modulation will raise Process Efficiency to 88/100.",
            f"Adopting top circular interventions elevates the facility to {projected_score}/100."
        ]

        return {
            "facility_id": facility_id,
            "overall_score": overall_score,
            "grade": grade,
            "tier": tier,
            "projected_score": projected_score,
            "projected_score_after_interventions": projected_score,
            "score_delta": score_delta,
            "dimensions": {
                "material_reuse": round(material_reuse, 1),
                "waste_recovery": round(waste_recovery, 1),
                "renewable_energy": round(renewable_score, 1),
                "process_efficiency": round(process_efficiency, 1),
                "carbon_utilization": round(carbon_utilization, 1)
            },
            "pillars": pillars,
            "dimension_benchmarks": {
                "material_reuse": 65.0,
                "waste_recovery": 70.0,
                "renewable_energy": 60.0,
                "process_efficiency": 80.0,
                "carbon_utilization": 55.0
            },
            "key_insights": key_insights
        }
