from typing import List, Dict, Any
from sqlalchemy.orm import Session
try:
    from app.models.simulation import Simulation
    from app.services.emission_service import EmissionService
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
    from app.utils.calculations import calculate_payback
    from app.utils.facility_resolver import resolve_facility_id
    from app.services.recommendation_service import RecommendationService
except (ImportError, ModuleNotFoundError):
    from ..models.simulation import Simulation
    from .emission_service import EmissionService
    from ..data.recommendations import DEFAULT_RECOMMENDATIONS
    from ..utils.calculations import calculate_payback
    from ..utils.facility_resolver import resolve_facility_id
    from .recommendation_service import RecommendationService


class SimulationService:
    @staticmethod
    def simulate_what_if(db: Session, facility_id: Any, intervention_ids: List[str]) -> Dict[str, Any]:
        """
        Execute deterministic What-If simulation for selected circular interventions.
        Handles both system intervention IDs (e.g. 'whr_boiler_flue') and frontend aliases ('REC-01').
        """
        fac_id = resolve_facility_id(facility_id, db)
        summary = EmissionService.calculate_summary(db, fac_id)
        baseline_emissions = summary["total_emissions"]

        # Build dynamic lookup mapping default IDs and facility recommendation alias codes
        rec_lookup = {r["id"]: r for r in DEFAULT_RECOMMENDATIONS}
        try:
            facility_recs = RecommendationService.get_facility_recommendations(db, fac_id)
            for idx, r in enumerate(facility_recs, start=1):
                rec_lookup[r["id"]] = r
                rec_lookup[f"REC-{idx:02d}"] = r
                rec_lookup[f"rec-{idx:02d}"] = r
                rec_lookup[f"REC-{idx}"] = r
                if r.get("alias_id"):
                    rec_lookup[r["alias_id"]] = r
        except Exception:
            for idx, r in enumerate(DEFAULT_RECOMMENDATIONS, start=1):
                rec_lookup[f"REC-{idx:02d}"] = r
                rec_lookup[f"REC-{idx}"] = r

        valid_interventions = []
        total_co2_reduction_raw = 0.0
        total_investment = 0.0
        total_annual_savings = 0.0

        for int_id in intervention_ids:
            rec = rec_lookup.get(int_id) or rec_lookup.get(str(int_id).upper())
            if rec:
                ann_kg = float(rec.get("estimated_co2_reduction_annual_kg", 10000.0))
                cost = float(rec.get("estimated_cost_inr", 150000.0))
                savings = float(rec.get("annual_savings_inr", 80000.0))
                payback = float(rec.get("payback_period_years", 1.5))
                valid_interventions.append({
                    "id": rec.get("id", int_id),
                    "title": rec.get("title", "Circular Intervention"),
                    "co2_reduction_kg": ann_kg,
                    "investment_inr": cost,
                    "annual_savings_inr": savings,
                    "payback_years": payback
                })
                total_co2_reduction_raw += ann_kg
                total_investment += cost
                total_annual_savings += savings

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
            facility_id=fac_id,
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
            "reduction": effective_reduction,
            "reduction_percent": reduction_pct,
            "investment": round(total_investment, 2),
            "annual_savings": round(total_annual_savings, 2),
            "payback_years": payback_years,
            "five_year_savings": five_year_savings,
            "selected_interventions": valid_interventions
        }

    @staticmethod
    def compare_scenarios(db: Session, facility_id: Any) -> Dict[str, Any]:
        """
        Generate 3 predefined automated scenarios:
        1. Cost Saver (low capex, fast payback)
        2. Balanced (optimal mix)
        3. Maximum Decarbonization (maximum CO2 reduction)
        """
        fac_id = resolve_facility_id(facility_id, db)
        summary = EmissionService.calculate_summary(db, fac_id)
        baseline = summary["total_emissions"]

        scenarios_definitions = [
            {
                "id": "cost_saver",
                "name": "Cost Saver",
                "subtitle": "Rapid ROI & Low Capital Interventions",
                "tag": "Fastest Payback",
                "focus": "Low initial capex, rapid payback (< 1.5 yrs) through leak fixes and controls",
                "ids": ["air_leak_audit_repair", "auto_idle_shutdown", "furnace_ceramic_insulation"]
            },
            {
                "id": "balanced",
                "name": "Balanced Strategy",
                "subtitle": "Optimal Balance of Abatement & Financial Return",
                "tag": "Recommended Plan",
                "focus": "Optimal balance of strong CO2 reduction, solid financial ROI, and proven feasibility",
                "ids": ["whr_boiler_flue", "vfd_compressor_retrofit", "condensate_steam_recovery", "air_leak_audit_repair"]
            },
            {
                "id": "max_decarbonization",
                "name": "Maximum Decarbonization",
                "subtitle": "Aggressive Net-Zero Acceleration",
                "tag": "Highest CO₂ Abatement",
                "focus": "Aggressive decarbonization using rooftop solar PV, fuel switching, and heat recovery",
                "ids": ["rooftop_solar_pv", "fuel_switch_biomass_briquettes", "whr_boiler_flue", "vfd_compressor_retrofit"]
            }
        ]

        results = []
        for s in scenarios_definitions:
            sim_res = SimulationService.simulate_what_if(db, fac_id, s["ids"])
            results.append({
                "id": s["id"],
                "name": s["name"],
                "scenario_name": s["name"],
                "subtitle": s["subtitle"],
                "tag": s["tag"],
                "focus_strategy": s["focus"],
                "baseline_emissions": baseline,
                "projected_emissions": sim_res["projected_emissions"],
                "emission_reduction": sim_res["total_reduction"],
                "reduction": sim_res["total_reduction"],
                "reduction_percent": sim_res["reduction_percent"],
                "investment": sim_res["investment"],
                "annual_savings": sim_res["annual_savings"],
                "payback_years": sim_res["payback_years"],
                "five_year_savings": sim_res["five_year_savings"],
                "selected_interventions": s["ids"]
            })

        return {
            "facility_id": facility_id,
            "baseline_emissions_kg": baseline,
            "baseline_emissions": baseline,
            "scenarios": results
        }
