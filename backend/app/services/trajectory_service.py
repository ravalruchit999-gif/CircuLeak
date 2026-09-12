from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    from app.services.emission_service import EmissionService
    from app.services.priority_service import PriorityService
except (ImportError, ModuleNotFoundError):
    from .emission_service import EmissionService
    from .priority_service import PriorityService


class TrajectoryService:
    @staticmethod
    def calculate_5year_trajectory(
        db: Session,
        facility_id: int,
        start_year: int = 2026,
        end_year: int = 2030
    ) -> Dict[str, Any]:
        """
        Generate 5-year decarbonization trajectory comparing business-as-usual baseline
        vs phased implementation of prioritized circular interventions.
        If baseline is 0, returns empty projection (no fake trajectory).
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        baseline_base = summary["total_emissions"]

        if baseline_base == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "start_year": start_year,
                "end_year": end_year,
                "baseline_emissions": 0.0,
                "target_emissions": 0.0,
                "total_reduction_potential": 0.0,
                "reduction_percentage": 0.0,
                "cumulative_co2_avoided": 0.0,
                "cumulative_financial_savings": 0.0,
                "yearly_projection": [],
                "roadmap_milestones": []
            }

        priority_res = PriorityService.rank_interventions(db, facility_id)
        top_interventions = priority_res.get("ranked_interventions", [])[:4]

        total_potential_co2_reduction = sum(i["co2_reduction"] for i in top_interventions)
        total_potential_savings = sum(i["annual_savings"] for i in top_interventions)

        growth_rate = 0.015
        adoption_curve = [0.35, 0.70, 1.00, 1.05, 1.10]

        trajectory_years: List[Dict[str, Any]] = []
        cumulative_co2 = 0.0
        cumulative_savings = 0.0

        for idx, year in enumerate(range(start_year, end_year + 1)):
            year_idx = min(idx, len(adoption_curve) - 1)
            adoption_factor = adoption_curve[year_idx]

            bau_emissions = round(baseline_base * ((1 + growth_rate) ** idx), 2)
            annual_reduction = round(min(bau_emissions * 0.65, total_potential_co2_reduction * adoption_factor), 2)
            with_actions = round(max(0.0, bau_emissions - annual_reduction), 2)

            annual_sav = round(total_potential_savings * adoption_factor, 2)
            cumulative_co2 += annual_reduction
            cumulative_savings += annual_sav

            trajectory_years.append({
                "year": year,
                "baseline_emissions": bau_emissions,
                "with_actions_emissions": with_actions,
                "annual_co2_reduction": annual_reduction,
                "annual_savings": annual_sav,
                "cumulative_co2_avoided": round(cumulative_co2, 2),
                "cumulative_savings": round(cumulative_savings, 2),
                "bau_emissions_kg": bau_emissions,
                "with_interventions_kg": with_actions,
                "annual_reduction_kg": annual_reduction,
                "reduction_percent": round(((bau_emissions - with_actions) / max(1.0, bau_emissions)) * 100, 1),
                "cumulative_co2_avoided_tonnes": round(cumulative_co2 / 1000.0, 2),
                "cumulative_financial_savings": round(cumulative_savings, 2)
            })

        final_bau = trajectory_years[-1]["bau_emissions_kg"] if trajectory_years else baseline_base
        final_with = trajectory_years[-1]["with_interventions_kg"] if trajectory_years else baseline_base
        total_red_pct = round(((final_bau - final_with) / max(1.0, final_bau)) * 100, 1)

        milestones = [
            {"year": start_year, "phase": "Quick Wins", "target": "Remediate detected high-risk leaks"},
            {"year": start_year + 1, "phase": "Equipment Retrofits", "target": "Deploy VFDs and thermal insulation"},
            {"year": start_year + 2, "phase": "Loop Integration", "target": "Recover waste heat and condensate"},
            {"year": end_year, "phase": "Net-Zero Pathway", "target": "Optimize facility circularity index"}
        ]

        summary_dict = {
            "baseline_emissions": baseline_base,
            "target_emissions": final_with,
            "total_reduction_potential": round(final_bau - final_with, 2),
            "reduction_percentage": total_red_pct,
            "cumulative_co2_avoided": round(cumulative_co2, 2),
            "cumulative_financial_savings": round(cumulative_savings, 2)
        }

        return {
            "facility_id": facility_id,
            "has_data": True,
            "start_year": start_year,
            "end_year": end_year,
            "baseline_emissions": baseline_base,
            "target_emissions": final_with,
            "total_reduction_potential": round(final_bau - final_with, 2),
            "reduction_percentage": total_red_pct,
            "cumulative_co2_avoided": round(cumulative_co2, 2),
            "cumulative_financial_savings": round(cumulative_savings, 2),
            "trajectory": trajectory_years,
            "yearly_projection": trajectory_years,
            "total_cumulative_co2_avoided_kg": round(cumulative_co2, 2),
            "total_cumulative_savings_inr": round(cumulative_savings, 2),
            "summary": summary_dict,
            "roadmap_milestones": milestones
        }
