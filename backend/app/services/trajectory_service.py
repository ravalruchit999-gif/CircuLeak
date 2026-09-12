from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    from app.services.emission_service import EmissionService
    from app.services.priority_service import PriorityService
    from app.utils.facility_resolver import resolve_facility_id
except (ImportError, ModuleNotFoundError):
    from .emission_service import EmissionService
    from .priority_service import PriorityService
    from ..utils.facility_resolver import resolve_facility_id


class TrajectoryService:
    @staticmethod
    def calculate_5year_trajectory(
        db: Session,
        facility_id: Any,
        start_year: int = 2026,
        end_year: int = 2030
    ) -> Dict[str, Any]:
        """
        Generate 5-year decarbonization trajectory comparing business-as-usual baseline
        vs phased implementation of prioritized circular interventions.
        """
        fac_id = resolve_facility_id(facility_id, db)
        summary = EmissionService.calculate_summary(db, fac_id)
        baseline_base = summary["total_emissions"]

        priority_res = PriorityService.rank_interventions(db, fac_id)
        top_interventions = priority_res.get("ranked_interventions", [])[:4]

        total_potential_co2_reduction = sum(i["co2_reduction"] for i in top_interventions)
        total_potential_savings = sum(i["annual_savings"] for i in top_interventions)

        # Baseline business-as-usual assumes modest 1.5% annual production demand growth
        growth_rate = 0.015

        # Phased implementation schedule:
        adoption_curve = [0.35, 0.70, 1.00, 1.05, 1.10]
        milestone_names = [
            "Phase 1: Compressor sequencing & thermal leak sealing",
            "Phase 2: Waste heat recuperator & process tuning",
            "Phase 3: On-site renewable solar PV integration",
            "Phase 4: Circular scrap pre-heating & induction optimization",
            "Phase 5: Sub-60 intensity deep decarbonization benchmark achieved"
        ]

        trajectory_years: List[Dict[str, Any]] = []
        cumulative_co2 = 0.0
        cumulative_savings = 0.0

        for idx, year in enumerate(range(start_year, end_year + 1)):
            year_idx = min(idx, len(adoption_curve) - 1)
            adoption_factor = adoption_curve[year_idx]
            milestone_text = milestone_names[year_idx] if year_idx < len(milestone_names) else f"Phase {idx + 1}"

            # BAU Baseline with growth
            bau_emissions = round(baseline_base * ((1 + growth_rate) ** idx), 2)

            annual_reduction = round(min(bau_emissions * 0.65, total_potential_co2_reduction * adoption_factor), 2)
            with_actions = round(max(0.0, bau_emissions - annual_reduction), 2)

            annual_sav = round(total_potential_savings * adoption_factor, 2)
            cumulative_co2 += annual_reduction
            cumulative_savings += annual_sav

            item = {
                "year": str(year),
                "baseline_emissions": bau_emissions,
                "with_actions_emissions": with_actions,
                "annual_co2_reduction": annual_reduction,
                "annual_savings": annual_sav,
                "cumulative_co2_avoided": round(cumulative_co2, 2),
                "cumulative_savings": round(cumulative_savings, 2),
                "bau_emissions": bau_emissions,
                "action_emissions": with_actions,
                "avoided_daily": annual_reduction,
                "milestone": milestone_text
            }
            trajectory_years.append(item)

        roadmap_milestones = [
            {"year": str(start_year), "title": "Operational Anomaly Elimination", "description": "Compressor sequencing and automated off-hours load shedding."},
            {"year": str(start_year + 1), "title": "Waste Heat Recovery Integration", "description": "Metallic recuperator captures 420°C flue gas exhaust."},
            {"year": str(start_year + 2), "title": "On-Site Renewable Substitution", "description": "Rooftop solar PV array commissioned under OPEX model."},
            {"year": str(start_year + 3), "title": "Circular Scrap Pre-Heating", "description": "Pre-heating scrap metal using recovered thermal exhaust loops."},
            {"year": str(start_year + 4), "title": "Sub-60 Intensity Milestone", "description": "Achieve emissions intensity below 60 kgCO₂e / metric ton product."}
        ]

        return {
            "facility_id": facility_id,
            "start_year": start_year,
            "end_year": end_year,
            "baseline_year": start_year,
            "target_year": end_year,
            "trajectory": trajectory_years,
            "yearly_projection": trajectory_years,
            "cumulative_co2_avoided_tonnes": round(cumulative_co2 / 1000.0, 1),
            "cumulative_financial_savings": round(cumulative_savings, 2),
            "total_cumulative_co2_avoided_kg": round(cumulative_co2, 2),
            "total_cumulative_savings_inr": round(cumulative_savings, 2),
            "roadmap_milestones": roadmap_milestones,
            "summary": {
                "top_interventions_count": len(top_interventions),
                "net_emissions_drop_percent": round(((trajectory_years[0]["baseline_emissions"] - trajectory_years[-1]["with_actions_emissions"]) / trajectory_years[0]["baseline_emissions"]) * 100, 1) if trajectory_years[0]["baseline_emissions"] > 0 else 0.0
            }
        }
