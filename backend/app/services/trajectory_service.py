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
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        baseline_base = summary["total_emissions"]

        priority_res = PriorityService.rank_interventions(db, facility_id)
        top_interventions = priority_res.get("ranked_interventions", [])[:4]

        total_potential_co2_reduction = sum(i["co2_reduction"] for i in top_interventions)
        total_potential_savings = sum(i["annual_savings"] for i in top_interventions)

        # Baseline business-as-usual assumes modest 1.5% annual production demand growth
        growth_rate = 0.015

        # Phased implementation schedule:
        # Year 0 (2026): Initial setup & quick fixes (35% adoption)
        # Year 1 (2027): Core equipment retrofits (70% adoption)
        # Year 2 (2028): Full circular loops operating (100% adoption)
        # Year 3 (2029): Optimized process tuning (105% adoption)
        # Year 4 (2030): Deep decarbonization maturity (110% adoption)
        adoption_curve = [0.35, 0.70, 1.00, 1.05, 1.10]

        trajectory_years: List[Dict[str, Any]] = []
        cumulative_co2 = 0.0
        cumulative_savings = 0.0

        for idx, year in enumerate(range(start_year, end_year + 1)):
            year_idx = min(idx, len(adoption_curve) - 1)
            adoption_factor = adoption_curve[year_idx]

            # BAU Baseline with growth
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
                "cumulative_savings": round(cumulative_savings, 2)
            })

        return {
            "facility_id": facility_id,
            "start_year": start_year,
            "end_year": end_year,
            "trajectory": trajectory_years,
            "total_cumulative_co2_avoided_kg": round(cumulative_co2, 2),
            "total_cumulative_savings_inr": round(cumulative_savings, 2),
            "summary": {
                "top_interventions_count": len(top_interventions),
                "net_emissions_drop_percent": round(((trajectory_years[0]["baseline_emissions"] - trajectory_years[-1]["with_actions_emissions"]) / trajectory_years[0]["baseline_emissions"]) * 100, 1) if trajectory_years[0]["baseline_emissions"] > 0 else 0.0
            }
        }
