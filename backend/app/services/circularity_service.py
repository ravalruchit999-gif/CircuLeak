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
        If no data exists, explicitly returns 0 with missing required inputs.
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        if summary.get("total_emissions", 0) == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "overall_score": 0.0,
                "score": 0.0,
                "rating": "Awaiting Telemetry Ingestion",
                "missing_inputs": [
                    "Energy carrier consumption records",
                    "Machinery runtime & electricity telemetry",
                    "Production output volume data"
                ],
                "dimensions": {
                    "material_reuse": 0.0,
                    "waste_recovery": 0.0,
                    "renewable_energy": 0.0,
                    "process_efficiency": 0.0,
                    "carbon_utilization": 0.0
                },
                "breakdown": [],
                "potential_uplift": 0.0,
                "projected_score": 0.0
            }

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

        dimensions = {
            "material_reuse": round(material_reuse, 1),
            "waste_recovery": round(waste_recovery, 1),
            "renewable_energy": round(renewable_score, 1),
            "process_efficiency": round(process_efficiency, 1),
            "carbon_utilization": round(carbon_utilization, 1)
        }

        breakdown = [
            {"dimension": "Waste Heat & Condensate Recovery", "score": round(waste_recovery, 1), "weight": 25, "benchmark": 78.0},
            {"dimension": "Process Electrical Efficiency", "score": round(process_efficiency, 1), "weight": 25, "benchmark": 82.0},
            {"dimension": "Renewable Power Substitution", "score": round(renewable_score, 1), "weight": 20, "benchmark": 45.0},
            {"dimension": "Secondary Scrap & Material Reuse", "score": round(material_reuse, 1), "weight": 20, "benchmark": 65.0},
            {"dimension": "Carbon Abatement & Utilization", "score": round(carbon_utilization, 1), "weight": 10, "benchmark": 55.0}
        ]

        potential_uplift = round(min(28.0, max(5.0, 92.0 - overall_score)), 1)
        projected_score = round(overall_score + potential_uplift, 1)

        rating = "Advanced Circular Operations" if overall_score >= 80 else (
            "Progressive Circularity" if overall_score >= 60 else "Linear Transition Risk"
        )
        grade = "A" if overall_score >= 80 else ("B" if overall_score >= 65 else ("C" if overall_score >= 50 else "D"))

        dimension_benchmarks = {
            "waste_recovery": 78.0,
            "process_efficiency": 82.0,
            "renewable_energy": 45.0,
            "material_reuse": 65.0,
            "carbon_utilization": 55.0
        }

        key_insights = [
            f"Overall facility circularity index is {overall_score}/100 (Grade {grade}).",
            f"Largest circularity gap identified in Waste Recovery ({round(waste_recovery, 1)}/100)." if waste_recovery < 75 else "Strong performance in process thermal efficiency.",
            f"Adopting planned interventions can elevate facility score by +{potential_uplift} pts to {projected_score}/100."
        ]

        return {
            "facility_id": facility_id,
            "has_data": True,
            "overall_score": overall_score,
            "score": overall_score,
            "grade": grade,
            "rating": rating,
            "missing_inputs": [],
            "dimensions": dimensions,
            "breakdown": breakdown,
            "potential_uplift": potential_uplift,
            "projected_score": projected_score,
            "projected_score_after_interventions": projected_score,
            "dimension_benchmarks": dimension_benchmarks,
            "key_insights": key_insights
        }
