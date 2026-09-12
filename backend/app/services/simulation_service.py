from typing import List, Dict, Any
from sqlalchemy.orm import Session
try:
    from app.models.simulation import Simulation
    from app.services.emission_service import EmissionService
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
    from app.utils.calculations import calculate_payback
except (ImportError, ModuleNotFoundError):
    from ..models.simulation import Simulation
    from .emission_service import EmissionService
    from ..data.recommendations import DEFAULT_RECOMMENDATIONS
    from ..utils.calculations import calculate_payback


class SimulationService:
    @staticmethod
    def simulate_what_if(db: Session, facility_id: int, intervention_ids: List[str]) -> Dict[str, Any]:
        """
        Execute deterministic What-If simulation for selected circular interventions.
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        baseline_emissions = summary["total_emissions"]

        rec_lookup = {r["id"]: r for r in DEFAULT_RECOMMENDATIONS}

        valid_interventions = []
        total_co2_reduction_raw = 0.0
        total_investment = 0.0
        total_annual_savings = 0.0

        for int_id in intervention_ids:
            rec = rec_lookup.get(int_id)
            if rec:
                valid_interventions.append({
                    "id": rec["id"],
                    "title": rec["title"],
                    "co2_reduction_kg": rec["estimated_co2_reduction_annual_kg"],
                    "investment_inr": rec["estimated_cost_inr"],
                    "annual_savings_inr": rec["annual_savings_inr"],
                    "payback_years": rec["payback_period_years"]
                })
                total_co2_reduction_raw += rec["estimated_co2_reduction_annual_kg"]
                total_investment += rec["estimated_cost_inr"]
                total_annual_savings += rec["annual_savings_inr"]

        # Apply interaction damping factor if multiple interventions overlap (realistic industrial thermodynamics)
        count = len(valid_interventions)
        interaction_factor = 1.0 if count <= 1 else max(0.85, 1.0 - (count * 0.03))
        effective_reduction = round(min(baseline_emissions * 0.85, total_co2_reduction_raw * interaction_factor), 2)

        projected_emissions = max(0.0, round(baseline_emissions - effective_reduction, 2))
        reduction_pct = round((effective_reduction / baseline_emissions) * 100, 1) if baseline_emissions > 0 else 0.0
        payback_years = calculate_payback(total_investment, total_annual_savings)
        five_year_savings = round((5 * total_annual_savings) - total_investment, 2)

        # Save simulation record
        sim = Simulation(
            facility_id=facility_id,
            scenario_name="custom",
            selected_interventions=intervention_ids,
            baseline_emissions_kg=baseline_emissions,
            projected_emissions_kg=projected_emissions,
            total_reduction_kg=effective_reduction,
            reduction_percent=reduction_pct,
            investment_inr=total_investment,
            annual_savings_inr=total_annual_savings,
            payback_years=payback_years,
            five_year_savings_inr=five_year_savings
        )
        db.add(sim)
        db.commit()

        return {
            "facility_id": facility_id,
            "baseline_emissions": baseline_emissions,
            "projected_emissions": projected_emissions,
            "total_reduction": effective_reduction,
            "reduction_percent": reduction_pct,
            "investment": round(total_investment, 2),
            "annual_savings": round(total_annual_savings, 2),
            "payback_years": payback_years,
            "five_year_savings": five_year_savings,
            "selected_interventions": valid_interventions
        }

    @staticmethod
    def compare_scenarios(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Generate 3 predefined automated scenarios:
        1. Cost Saver (low capex, fast payback)
        2. Balanced (optimal mix)
        3. Maximum Decarbonization (maximum CO2 reduction)
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        baseline = summary["total_emissions"]

        scenarios_definitions = [
            {
                "name": "Cost Saver",
                "focus": "Low initial capex, rapid payback (< 1.5 yrs) through leak fixes and controls",
                "ids": ["air_leak_audit_repair", "auto_idle_shutdown", "furnace_ceramic_insulation"]
            },
            {
                "name": "Balanced",
                "focus": "Optimal balance of strong CO2 reduction, solid financial ROI, and proven feasibility",
                "ids": ["whr_boiler_flue", "vfd_compressor_retrofit", "condensate_steam_recovery", "air_leak_audit_repair"]
            },
            {
                "name": "Maximum Decarbonization",
                "focus": "Aggressive decarbonization using rooftop solar PV, fuel switching, and heat recovery",
                "ids": ["rooftop_solar_pv", "fuel_switch_biomass_briquettes", "whr_boiler_flue", "vfd_compressor_retrofit"]
            }
        ]

        results = []
        for s in scenarios_definitions:
            sim_res = SimulationService.simulate_what_if(db, facility_id, s["ids"])
            results.append({
                "scenario_name": s["name"],
                "focus_strategy": s["focus"],
                "emission_reduction": sim_res["total_reduction"],
                "reduction_percent": sim_res["reduction_percent"],
                "investment": sim_res["investment"],
                "annual_savings": sim_res["annual_savings"],
                "payback_years": sim_res["payback_years"],
                "selected_interventions": s["ids"]
            })

        return {
            "facility_id": facility_id,
            "baseline_emissions_kg": baseline,
            "scenarios": results
        }
