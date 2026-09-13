from typing import List, Dict, Any
from sqlalchemy.orm import Session
try:
    from app.models.simulation import Simulation
    from app.services.emission_service import EmissionService
    from app.services.recommendation_service import RecommendationService
    from app.services.ccts_service import CCTSService
    from app.data.recommendations import DEFAULT_RECOMMENDATIONS
    from app.utils.calculations import calculate_payback
except (ImportError, ModuleNotFoundError):
    from ..models.simulation import Simulation
    from .emission_service import EmissionService
    from .recommendation_service import RecommendationService
    from .ccts_service import CCTSService
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

        if baseline_emissions == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "baseline_emissions": 0.0,
                "projected_emissions": 0.0,
                "total_reduction": 0.0,
                "reduction_percent": 0.0,
                "investment": 0.0,
                "annual_savings": 0.0,
                "payback_years": 0.0,
                "five_year_savings": 0.0,
                "selected_interventions": []
            }

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

        # CCTS Carbon Credit Monetization Impact
        ccts_status = CCTSService.get_facility_ccts_status(db, facility_id)
        prod_volume = ccts_status.get("production_volume_tonnes", 1000.0)
        actual_intensity = ccts_status.get("actual_intensity_tco2_per_tonne", 1.0)
        target_intensity = ccts_status.get("target_intensity_tco2_per_tonne", 0.82)
        abatement_tonnes = round(effective_reduction / 1000.0, 2)

        ccts_impact = CCTSService.calculate_monetization_impact(
            abatement_tonnes=abatement_tonnes,
            investment_inr=total_investment,
            annual_savings_inr=total_annual_savings,
            actual_intensity=actual_intensity,
            target_intensity=target_intensity,
            prod_volume=prod_volume,
            carbon_price_inr=1850.0
        )

        return {
            "facility_id": facility_id,
            "has_data": True,
            "baseline_emissions": baseline_emissions,
            "projected_emissions": projected_emissions,
            "total_reduction": effective_reduction,
            "reduction_percent": reduction_pct,
            "investment": round(total_investment, 2),
            "annual_savings": round(total_annual_savings, 2),
            "payback_years": payback_years,
            "accelerated_payback_years": ccts_impact["accelerated_payback_years"],
            "tradable_ccc_earned": ccts_impact["tradable_ccc_earned"],
            "carbon_revenue_inr": ccts_impact["annual_carbon_revenue_inr"],
            "ccts_monetization": ccts_impact,
            "five_year_savings": five_year_savings,
            "selected_interventions": valid_interventions
        }

    @staticmethod
    def compare_scenarios(db: Session, facility_id: int) -> Dict[str, Any]:
        """
        Generate 3 predefined automated scenarios.
        If facility has zero telemetry, returns empty scenarios list (no fake simulation).
        """
        summary = EmissionService.calculate_summary(db, facility_id)
        baseline = summary["total_emissions"]

        if baseline == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "baseline_emissions_kg": 0.0,
                "available_interventions": [],
                "scenarios": []
            }

        # Retrieve interventions matching this facility
        facility_recs = RecommendationService.get_facility_recommendations(db, facility_id)
        available_ids = [r["id"] for r in facility_recs] if facility_recs else [
            "air_leak_audit_repair", "auto_idle_shutdown", "furnace_ceramic_insulation", "whr_boiler_flue"
        ]

        # Dynamically build scenario intervention bundles from available_ids
        cost_saver_ids = [i for i in ["air_leak_audit_repair", "auto_idle_shutdown", "furnace_ceramic_insulation"] if i in available_ids]
        if not cost_saver_ids and available_ids:
            recs_by_payback = sorted(
                [r for r in facility_recs if r.get("id") in available_ids],
                key=lambda x: (x.get("payback_period_years") or 99.0, x.get("estimated_cost_inr") or 9999999)
            )
            cost_saver_ids = [recs_by_payback[0]["id"]] if recs_by_payback else [available_ids[0]]

        balanced_ids = [i for i in ["whr_boiler_flue", "vfd_compressor_retrofit", "condensate_steam_recovery", "air_leak_audit_repair"] if i in available_ids]
        if not balanced_ids and available_ids:
            balanced_ids = available_ids[:min(3, len(available_ids))]

        max_decarb_ids = [i for i in ["rooftop_solar_pv", "fuel_switch_biomass_briquettes", "whr_boiler_flue", "vfd_compressor_retrofit"] if i in available_ids]
        if not max_decarb_ids and available_ids:
            recs_by_reduction = sorted(
                [r for r in facility_recs if r.get("id") in available_ids],
                key=lambda x: x.get("estimated_co2_reduction_annual_kg") or 0.0,
                reverse=True
            )
            max_decarb_ids = [r["id"] for r in recs_by_reduction[:min(2, len(recs_by_reduction))]] if recs_by_reduction else [available_ids[0]]

        scenarios_definitions = [
            {
                "id": "scen_cost_saver",
                "name": "Cost Saver",
                "focus": "Low initial capex, rapid payback (< 1.5 yrs) through leak fixes and controls",
                "ids": cost_saver_ids
            },
            {
                "id": "scen_balanced",
                "name": "Balanced",
                "focus": "Optimal balance of strong CO2 reduction, solid financial ROI, and proven feasibility",
                "ids": balanced_ids
            },
            {
                "id": "scen_max_decarb",
                "name": "Maximum Decarbonization",
                "focus": "Aggressive decarbonization using renewable generation, fuel switching, and heat recovery",
                "ids": max_decarb_ids
            }
        ]

        results = []
        for s in scenarios_definitions:
            sim_res = SimulationService.simulate_what_if(db, facility_id, s["ids"])
            results.append({
                "id": s["id"],
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
            "has_data": True,
            "baseline_emissions_kg": baseline,
            "available_interventions": facility_recs,
            "scenarios": results
        }
