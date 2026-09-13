from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
try:
    from app.models.facility import Facility
    from app.services.emission_service import EmissionService
except (ImportError, ModuleNotFoundError):
    from ..models.facility import Facility
    from .emission_service import EmissionService


# Bureau of Energy Efficiency (BEE) / Ministry of Power (MoP)
# Carbon Credit Trading Scheme (CCTS) 2023-2026 Designated Consumer Intensity Baselines
# Expressed in tCO2e per Metric Tonne of Production Output
BEE_CCTS_SECTOR_BASELINES = {
    "metals": {
        "sector_label": "Metals & Heavy Alloys (Induction Smelting / Forging)",
        "target_intensity_tco2_per_tonne": 0.82,
        "regulation_code": "BEE-CCTS-MET-2024",
        "icm_cluster": "Western India Secondary Metallurgy Cluster",
        "statutory_penalty_rate_inr": 3000.0,  # Section 26 shortfall penalty / tCO2e
    },
    "textile": {
        "sector_label": "Textile Composite & Wet Processing",
        "target_intensity_tco2_per_tonne": 0.65,
        "regulation_code": "BEE-CCTS-TEX-2024",
        "icm_cluster": "Gujarat & Maharashtra Textile Corridor",
        "statutory_penalty_rate_inr": 3000.0,
    },
    "chemical": {
        "sector_label": "Chemicals, Specialty Polymers & Resins",
        "target_intensity_tco2_per_tonne": 1.15,
        "regulation_code": "BEE-CCTS-CHM-2024",
        "icm_cluster": "Dahej-Ankleshwar Petroleum & Chemical Zone",
        "statutory_penalty_rate_inr": 3000.0,
    },
    "default": {
        "sector_label": "General Industrial Manufacturing",
        "target_intensity_tco2_per_tonne": 0.75,
        "regulation_code": "BEE-CCTS-GEN-2024",
        "icm_cluster": "National Industrial Energy Corridor",
        "statutory_penalty_rate_inr": 3000.0,
    }
}


class CCTSService:
    @staticmethod
    def get_sector_config(sector: Optional[str]) -> Dict[str, Any]:
        sector_lower = (sector or "manufacturing").lower()
        if any(k in sector_lower for k in ["metal", "alloy", "steel", "cast", "forg", "smelt"]):
            return BEE_CCTS_SECTOR_BASELINES["metals"]
        elif any(k in sector_lower for k in ["textile", "cotton", "fabric", "weave", "yarn"]):
            return BEE_CCTS_SECTOR_BASELINES["textile"]
        elif any(k in sector_lower for k in ["chem", "polymer", "pharma", "plastic", "paint"]):
            return BEE_CCTS_SECTOR_BASELINES["chemical"]
        return BEE_CCTS_SECTOR_BASELINES["default"]

    @staticmethod
    def get_facility_ccts_status(
        db: Session,
        facility_id: int,
        carbon_price_inr: float = 1850.0
    ) -> Dict[str, Any]:
        """
        Evaluate facility emission intensity against BEE CCTS Designated Consumer baseline.
        Computes Carbon Credit Certificates (CCC) eligibility and financial monetization.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility #{facility_id} not found.")

        summary = EmissionService.calculate_summary(db, facility_id)
        if summary.get("total_emissions", 0) == 0:
            return {
                "facility_id": facility_id,
                "has_data": False,
                "message": "Telemetry records required to compute BEE CCTS Carbon Credit status."
            }

        total_emissions_kg = float(summary.get("total_emissions", 0.0))
        total_emissions_tonnes = round(total_emissions_kg / 1000.0, 2)
        prod_volume = max(100.0, float(summary.get("total_production_volume", 1000.0)))

        # Specific Emission Intensity: tCO2e / Tonne of product
        actual_intensity = round(total_emissions_tonnes / prod_volume, 3)

        sector_cfg = CCTSService.get_sector_config(facility.sector)
        target_intensity = sector_cfg["target_intensity_tco2_per_tonne"]
        baseline_target_emissions_tonnes = round(target_intensity * prod_volume, 2)

        # Baseline delta: Positive means exceeding baseline (deficit penalty risk)
        # Negative means below baseline (surplus carbon credits)
        intensity_delta = round(actual_intensity - target_intensity, 3)

        # Indian Carbon Market (ICM) pricing benchmark
        clamped_price = max(800.0, min(5000.0, float(carbon_price_inr)))

        if intensity_delta > 0:
            # Over baseline: Facing compliance penalty risk
            compliance_status = "DEFICIT_PENALTY_RISK"
            shortfall_tonnes = round(total_emissions_tonnes - baseline_target_emissions_tonnes, 1)
            penalty_liability_inr = round(shortfall_tonnes * sector_cfg["statutory_penalty_rate_inr"])
            current_ccc_earned = 0.0
            current_ccc_revenue = 0.0
            compliance_message = f"Operating {intensity_delta} tCO2e/t above BEE sector baseline ({target_intensity}). Shortfall penalty liability applies."
        else:
            # Under baseline: Earning tradable CCCs
            compliance_status = "CREDIT_SURPLUS"
            shortfall_tonnes = 0.0
            penalty_liability_inr = 0.0
            current_ccc_earned = round(baseline_target_emissions_tonnes - total_emissions_tonnes, 1)
            current_ccc_revenue = round(current_ccc_earned * clamped_price)
            compliance_message = f"Operating below BEE baseline target. Generating {current_ccc_earned} tradable Carbon Credit Certificates (CCCs)."

        return {
            "facility_id": facility_id,
            "has_data": True,
            "facility_name": facility.business_name,
            "sector": facility.sector,
            "location": facility.location,
            "production_volume_tonnes": prod_volume,
            "total_emissions_tonnes": total_emissions_tonnes,
            "actual_intensity_tco2_per_tonne": actual_intensity,
            "target_intensity_tco2_per_tonne": target_intensity,
            "intensity_delta": intensity_delta,
            "baseline_target_emissions_tonnes": baseline_target_emissions_tonnes,
            "compliance_status": compliance_status,
            "compliance_message": compliance_message,
            "regulation_code": sector_cfg["regulation_code"],
            "icm_cluster": sector_cfg["icm_cluster"],
            "carbon_price_inr": clamped_price,
            "current_ccc_earned": current_ccc_earned,
            "current_ccc_revenue_inr": current_ccc_revenue,
            "statutory_penalty_liability_inr": penalty_liability_inr,
            "statutory_penalty_rate_inr": sector_cfg["statutory_penalty_rate_inr"]
        }

    @staticmethod
    def calculate_monetization_impact(
        abatement_tonnes: float,
        investment_inr: float,
        annual_savings_inr: float,
        actual_intensity: float,
        target_intensity: float,
        prod_volume: float,
        carbon_price_inr: float = 1850.0
    ) -> Dict[str, Any]:
        """
        Quantify the accelerated financial payback when adding Carbon Credit Certificate (CCC)
        monetization on top of traditional energy/fuel OPEX savings.
        """
        clamped_price = max(800.0, min(5000.0, float(carbon_price_inr)))
        abatement_tonnes = max(0.0, float(abatement_tonnes))

        # Projected intensity post-abatement
        current_emissions_tonnes = actual_intensity * prod_volume
        projected_emissions_tonnes = max(0.0, current_emissions_tonnes - abatement_tonnes)
        projected_intensity = round(projected_emissions_tonnes / max(1.0, prod_volume), 3)

        baseline_target_tonnes = target_intensity * prod_volume

        # Tradable CCC certificates issued
        # Any reduction that brings emissions below baseline target qualifies for CCCs
        if projected_emissions_tonnes < baseline_target_tonnes:
            tradable_ccc = round(baseline_target_tonnes - projected_emissions_tonnes, 1)
        else:
            # If still above baseline, abatement reduces statutory penalty liability
            tradable_ccc = 0.0

        # Annual Carbon Credit Revenue
        annual_carbon_revenue_inr = round(tradable_ccc * clamped_price)

        # Statutory penalty avoided (if previous baseline had a penalty deficit)
        previous_deficit = max(0.0, current_emissions_tonnes - baseline_target_tonnes)
        new_deficit = max(0.0, projected_emissions_tonnes - baseline_target_tonnes)
        penalty_avoided_inr = round((previous_deficit - new_deficit) * 3000.0)

        # Total combined annual financial benefit: Energy Savings + Carbon Monetization + Penalty Avoidance
        combined_annual_cashflow_inr = annual_savings_inr + annual_carbon_revenue_inr + penalty_avoided_inr

        # Traditional simple payback (Energy only)
        standard_payback_years = round(investment_inr / max(1.0, annual_savings_inr), 2) if annual_savings_inr > 0 else 0.0

        # CCTS Accelerated Payback (Energy + Carbon Revenue)
        accelerated_payback_years = round(investment_inr / max(1.0, combined_annual_cashflow_inr), 2) if combined_annual_cashflow_inr > 0 else 0.0

        payback_speedup_percent = round(
            ((standard_payback_years - accelerated_payback_years) / max(0.01, standard_payback_years)) * 100.0, 1
        ) if standard_payback_years > 0 else 0.0

        return {
            "abatement_tonnes": abatement_tonnes,
            "carbon_price_inr": clamped_price,
            "projected_intensity": projected_intensity,
            "tradable_ccc_earned": tradable_ccc,
            "annual_carbon_revenue_inr": annual_carbon_revenue_inr,
            "penalty_avoided_inr": penalty_avoided_inr,
            "total_annual_benefit_inr": combined_annual_cashflow_inr,
            "standard_payback_years": standard_payback_years,
            "accelerated_payback_years": accelerated_payback_years,
            "payback_speedup_percent": max(0.0, payback_speedup_percent),
            "unit": "CCC (1 CCC = 1 tCO2e)"
        }
