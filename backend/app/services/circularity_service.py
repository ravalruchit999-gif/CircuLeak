from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    from app.services.emission_service import EmissionService
    from app.services.leak_service import LeakService
except (ImportError, ModuleNotFoundError):
    from .emission_service import EmissionService
    from .leak_service import LeakService


class CircularityService:
    @staticmethod
    def calculate_circularity_score(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Calculate multi-dimensional 0-100 Circularity Score.
        Evaluates material reuse, waste recovery, renewable integration,
        process thermal efficiency, and carbon utilization.
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        hotspots = LeakService.get_structural_hotspots(db, facility_id).get("hotspots", [])
        anomalies = LeakService.get_anomalies(db, facility_id).get("anomalies", [])

        # 1. Renewable energy score (based on fuel mix)
        by_source = {s["name"].lower(): s["percentage_of_total"] for s in summary.get("by_source", [])}
        grid_share = by_source.get("grid electricity", 0.0)
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
        elif overall_score >= 65:
            grade = "B (Transitioning)"
        elif overall_score >= 50:
            grade = "C (Significant Linear Leaks)"
        else:
            grade = "D (High Fossil Dependency)"

        projected_score = min(92.0, round(overall_score + 22.5, 1))

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
            "dimensions": {
                "material_reuse": round(material_reuse, 1),
                "waste_recovery": round(waste_recovery, 1),
                "renewable_energy": round(renewable_score, 1),
                "process_efficiency": round(process_efficiency, 1),
                "carbon_utilization": round(carbon_utilization, 1)
            },
            "projected_score_after_interventions": projected_score,
            "dimension_benchmarks": {
                "material_reuse": 65.0,
                "waste_recovery": 70.0,
                "renewable_energy": 60.0,
                "process_efficiency": 80.0,
                "carbon_utilization": 55.0
            },
            "key_insights": key_insights
        }
