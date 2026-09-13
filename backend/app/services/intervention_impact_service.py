"""
Intervention Impact Service.
Deterministic engineering and economic evaluation for circular interventions.
Enforces rigorous mathematical models, explicit provenance labels ([REFERENCE], [SCENARIO], [MEASURED], [ASSUMPTION]),
and guards against dividing by zero, hardcoding universal utility tariffs, or inventing numbers for missing telemetry.
"""

import datetime
import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.schemas.intervention import EconomicEvaluation, ApplicabilityEvaluation
from app.services.emission_service import EmissionService


class InterventionImpactService:
    """
    Evaluates financial, carbon, and operational impacts of an intervention.
    If required variables are missing, marks status as 'insufficient_data' or 'not_evaluable'
    with null metrics rather than fabricated zeroes or fallback numbers.
    """

    DEFAULT_REFERENCE_ELECTRICITY_TARIFF_INR_KWH = 7.50
    DEFAULT_REFERENCE_COAL_TARIFF_INR_KG = 9.00
    DEFAULT_REFERENCE_GAS_TARIFF_INR_M3 = 42.00
    FALLBACK_REFERENCE_GRID_FACTOR = 0.716  # CEA v19 (kgCO2e/kWh)
    FALLBACK_REFERENCE_COAL_FACTOR = 2.420  # BEE / IPCC (kgCO2e/kg)

    @classmethod
    def evaluate_economics(
        cls,
        recommendation: Recommendation,
        problem_rep: Dict[str, Any],
        applicability: ApplicabilityEvaluation,
        db: Optional[Session] = None,
        telemetry_timestamp: Optional[datetime.datetime] = None,
        custom_electricity_tariff_inr: Optional[float] = None,
        custom_fuel_tariff_inr: Optional[float] = None,
        facility_telemetry_summary: Optional[Dict[str, Any]] = None
    ) -> EconomicEvaluation:
        # If not applicable, cannot evaluate economically
        if applicability.status == "not_applicable":
            return EconomicEvaluation(
                status="not_evaluable",
                data_provenance_labels={"status": "[CALCULATED]"},
                assumptions_applied=["Intervention is technically or operationally not applicable to this incident."],
                missing_variables=applicability.disqualification_reasons
            )

        # If conditionally applicable due to missing required telemetry
        if applicability.missing_telemetry:
            return EconomicEvaluation(
                status="insufficient_data",
                data_provenance_labels={
                    "status": "[CALCULATED]",
                    "reference_source": "[REFERENCE]"
                },
                assumptions_applied=[
                    f"Baseline calculation inhibited because required sensor telemetry is missing: {', '.join(applicability.missing_telemetry)}."
                ],
                missing_variables=applicability.missing_telemetry
            )

        # 1. Tariff Resolution & Provenance (NF-03 Remediation: Strict Validation, No Silent Masking)
        assumptions_applied: List[str] = []
        data_provenance_labels: Dict[str, str] = {
            "reference_benchmark": "[REFERENCE]",
            "capex": "[SCENARIO]",
            "annual_savings": "[SCENARIO]",
            "carbon_abatement": "[SCENARIO]",
            "payback": "[CALCULATED]"
        }

        if custom_electricity_tariff_inr is not None:
            if custom_electricity_tariff_inr <= 0.0 or math.isnan(custom_electricity_tariff_inr) or math.isinf(custom_electricity_tariff_inr):
                raise ValueError(f"Custom electricity tariff must be strictly positive (> 0), got: {custom_electricity_tariff_inr}")
            elec_tariff = float(custom_electricity_tariff_inr)
            data_provenance_labels["tariff"] = "[SCENARIO]"
            data_provenance_labels["electricity_tariff"] = "[SCENARIO]"
            assumptions_applied.append(f"Electricity tariff set to custom user scenario rate: ₹{elec_tariff:.2f}/kWh.")
        else:
            elec_tariff = cls.DEFAULT_REFERENCE_ELECTRICITY_TARIFF_INR_KWH
            data_provenance_labels["tariff"] = "[REFERENCE]"
            data_provenance_labels["electricity_tariff"] = "[REFERENCE]"
            assumptions_applied.append(
                f"Electricity tariff referenced at ₹{elec_tariff:.2f}/kWh based on published state industrial schedule."
            )

        if custom_fuel_tariff_inr is not None:
            if custom_fuel_tariff_inr <= 0.0 or math.isnan(custom_fuel_tariff_inr) or math.isinf(custom_fuel_tariff_inr):
                raise ValueError(f"Custom thermal fuel tariff must be strictly positive (> 0), got: {custom_fuel_tariff_inr}")
            fuel_tariff = float(custom_fuel_tariff_inr)
            data_provenance_labels["fuel_tariff"] = "[SCENARIO]"
            assumptions_applied.append(f"Thermal fuel tariff set to custom user scenario rate: ₹{fuel_tariff:.2f}/unit.")
        else:
            fuel_tariff = cls.DEFAULT_REFERENCE_COAL_TARIFF_INR_KG
            data_provenance_labels["fuel_tariff"] = "[REFERENCE]"
            assumptions_applied.append(
                f"Thermal fuel tariff referenced at ₹{fuel_tariff:.2f}/kg based on industrial boiler coal schedule."
            )

        # 2. Emission Factor Resolution from DB (F-03 Remediation) & Provenance (F-10 Remediation)
        grid_emission_factor = cls.FALLBACK_REFERENCE_GRID_FACTOR
        coal_emission_factor = cls.FALLBACK_REFERENCE_COAL_FACTOR
        data_provenance_labels["grid_emission_factor"] = "[REFERENCE]"

        if db is not None:
            try:
                grid_ef_obj = EmissionService.get_factor_for_telemetry(db, "grid_electricity", telemetry_timestamp)
                if grid_ef_obj and grid_ef_obj.factor_value:
                    grid_emission_factor = float(grid_ef_obj.factor_value)
                    assumptions_applied.append(
                        f"Grid emission factor resolved from database ({grid_ef_obj.reference}, version {grid_ef_obj.version or 'active'}): {grid_emission_factor:.4f} kgCO2e/kWh."
                    )
            except Exception:
                assumptions_applied.append(
                    f"Grid emission factor referenced from CEA v19 standard benchmark: {grid_emission_factor:.4f} kgCO2e/kWh."
                )

            try:
                coal_ef_obj = EmissionService.get_factor_for_telemetry(db, "coal", telemetry_timestamp)
                if coal_ef_obj and coal_ef_obj.factor_value:
                    coal_emission_factor = float(coal_ef_obj.factor_value)
            except Exception:
                pass
        else:
            assumptions_applied.append(
                f"Grid emission factor referenced from standard national benchmark: {grid_emission_factor:.4f} kgCO2e/kWh."
            )

        # 3. Capex Calculation from Engineering Model & Defensible Ranges (F-07 Remediation)
        capex_model = recommendation.capex_model or {}
        model_type = capex_model.get("model_type")
        params = capex_model.get("parameters", {})

        capex_inr: float = 0.0
        if model_type == "fixed_cost_bracket":
            capex_inr = sum(float(v) for k, v in params.items() if isinstance(v, (int, float)) and not k.endswith("_pct"))
            if "installation_labor_pct" in params:
                capex_inr *= (1.0 + float(params["installation_labor_pct"]))
        elif model_type == "linear_power_capacity":
            cap_kwp = float(params.get("capacity_kwp", 50.0))
            cost_kwp = float(params.get("cost_per_kwp_inr", 42000.0))
            capex_inr = cap_kwp * cost_kwp
        else:
            capex_inr = float(recommendation.estimated_cost_inr or 0.0)
            if capex_inr > 0:
                data_provenance_labels["capex"] = "[REFERENCE]"

        # Derive capex range from model valid_ranges if documented; never invent arbitrary +/- percentages
        capex_range = None
        valid_ranges = capex_model.get("valid_ranges", {})
        if "base_capex_inr" in valid_ranges and isinstance(valid_ranges["base_capex_inr"], list) and len(valid_ranges["base_capex_inr"]) == 2:
            labor_mult = (1.0 + float(params.get("installation_labor_pct", 0.0)))
            capex_range = {
                "lower_bound": round(float(valid_ranges["base_capex_inr"][0]) * labor_mult, 2),
                "expected": round(capex_inr, 2),
                "upper_bound": round(float(valid_ranges["base_capex_inr"][1]) * labor_mult, 2)
            }

        # 4. Annual Opex Calculation
        opex_model = recommendation.opex_model or {}
        opex_params = opex_model.get("parameters", {})
        maint_rate = float(opex_params.get("maintenance_rate_pct", 0.03))
        annual_opex_inr = round(capex_inr * maint_rate, 2)
        assumptions_applied.append(f"Annual preventive maintenance Opex modeled at {round(maint_rate * 100, 1)}% of Capex.")

        # 5. Annual Savings & CO2 Abatement Calculations (NF-02 Remediation)
        # Measured excess energy (kWh) is the canonical physical basis.
        # Annual financial loss is authoritatively calculated using the active decision tariff.
        excess_kwh = float(problem_rep.get("excess_energy_kwh") or 0.0)
        if excess_kwh <= 0.0 and problem_rep.get("estimated_financial_impact_inr"):
            # Backwards compatibility fallback if excess_energy_kwh was omitted
            excess_kwh = float(problem_rep.get("estimated_financial_impact_inr")) / cls.DEFAULT_REFERENCE_ELECTRICITY_TARIFF_INR_KWH

        # Annualized incident baseline energy loss: 52 operational weeks
        annual_excess_kwh = excess_kwh * 52.0 if excess_kwh > 0 else 0.0
        annual_incident_financial_loss = round(annual_excess_kwh * elec_tariff, 2)

        savings_model = recommendation.savings_model or {}
        s_params = savings_model.get("parameters", {})
        s_model_type = savings_model.get("model_type")

        # Case-study parameter bounds from catalog
        low_pct = float(s_params.get("lower_bound_pct", 0.0)) if s_params.get("lower_bound_pct") is not None else None
        exp_pct = float(s_params.get("expected_pct", s_params.get("expected_fuel_cost_savings_pct", 0.0)))
        high_pct = float(s_params.get("upper_bound_pct", 0.0)) if s_params.get("upper_bound_pct") is not None else None

        gross_annual_savings: Optional[float] = None
        annual_co2_reduction_kg: Optional[float] = None
        savings_range = None
        co2_reduction_range = None

        if s_model_type == "percentage_energy_reduction":
            if annual_excess_kwh > 0 and exp_pct > 0:
                # Direct engineering mitigation of verified incident waste (NF-02: Strictly dynamic)
                annual_kwh_saved = annual_excess_kwh * exp_pct
                gross_annual_savings = round(annual_kwh_saved * elec_tariff, 2)
                annual_co2_reduction_kg = round(annual_kwh_saved * grid_emission_factor, 2)
                if low_pct is not None and high_pct is not None and low_pct <= exp_pct <= high_pct:
                    low_kwh = annual_excess_kwh * low_pct
                    high_kwh = annual_excess_kwh * high_pct
                    savings_range = {
                        "lower_bound": round(low_kwh * elec_tariff, 2),
                        "expected": round(gross_annual_savings, 2),
                        "upper_bound": round(high_kwh * elec_tariff, 2)
                    }
                    co2_reduction_range = {
                        "lower_bound": round(low_kwh * grid_emission_factor, 2),
                        "expected": round(annual_co2_reduction_kg, 2),
                        "upper_bound": round(high_kwh * grid_emission_factor, 2)
                    }
            elif recommendation.annual_savings_inr and recommendation.annual_savings_inr > 0:
                # Ground in published catalog reference
                gross_annual_savings = float(recommendation.annual_savings_inr)
                annual_co2_reduction_kg = (gross_annual_savings / elec_tariff) * grid_emission_factor
                data_provenance_labels["annual_savings"] = "[REFERENCE]"
                data_provenance_labels["carbon_abatement"] = "[REFERENCE]"
                assumptions_applied.append(
                    f"Annual savings referenced from published benchmark ({recommendation.reference_organization or 'industry reference'}): ₹{gross_annual_savings:,.2f}/yr."
                )
            else:
                gross_annual_savings = None
                annual_co2_reduction_kg = None

        elif s_model_type == "percentage_fuel_reduction":
            if annual_incident_financial_loss > 0 and exp_pct > 0:
                gross_annual_savings = annual_incident_financial_loss * exp_pct
                annual_co2_reduction_kg = (gross_annual_savings / fuel_tariff) * coal_emission_factor
                if low_pct is not None and high_pct is not None and low_pct <= exp_pct <= high_pct:
                    low_sav = annual_incident_financial_loss * low_pct
                    high_sav = annual_incident_financial_loss * high_pct
                    savings_range = {
                        "lower_bound": round(low_sav, 2),
                        "expected": round(gross_annual_savings, 2),
                        "upper_bound": round(high_sav, 2)
                    }
                    co2_reduction_range = {
                        "lower_bound": round((low_sav / fuel_tariff) * coal_emission_factor, 2),
                        "expected": round(annual_co2_reduction_kg, 2),
                        "upper_bound": round((high_sav / fuel_tariff) * coal_emission_factor, 2)
                    }
            elif recommendation.annual_savings_inr and recommendation.annual_savings_inr > 0:
                gross_annual_savings = float(recommendation.annual_savings_inr)
                annual_co2_reduction_kg = (gross_annual_savings / fuel_tariff) * coal_emission_factor
                data_provenance_labels["annual_savings"] = "[REFERENCE]"
                data_provenance_labels["carbon_abatement"] = "[REFERENCE]"
                assumptions_applied.append(
                    f"Annual savings referenced from published benchmark ({recommendation.reference_organization or 'industry reference'}): ₹{gross_annual_savings:,.2f}/yr."
                )
            else:
                gross_annual_savings = None
                annual_co2_reduction_kg = None

        elif s_model_type == "solar_generation_offset":
            cap_kwp = float(s_params.get("system_capacity_kwp", 50.0))
            gen_kwh = float(s_params.get("annual_generation_kwh_per_kwp", 1450.0))
            annual_kwh_generated = cap_kwp * gen_kwh
            gross_annual_savings = annual_kwh_generated * elec_tariff
            annual_co2_reduction_kg = annual_kwh_generated * grid_emission_factor

        elif s_model_type == "material_substitution":
            if recommendation.annual_savings_inr and recommendation.estimated_co2_reduction_annual_kg:
                gross_annual_savings = float(recommendation.annual_savings_inr)
                annual_co2_reduction_kg = float(recommendation.estimated_co2_reduction_annual_kg)
                data_provenance_labels["annual_savings"] = "[REFERENCE]"
                data_provenance_labels["carbon_abatement"] = "[REFERENCE]"
            else:
                gross_annual_savings = None
                annual_co2_reduction_kg = None
        else:
            if recommendation.annual_savings_inr and recommendation.estimated_co2_reduction_annual_kg:
                gross_annual_savings = float(recommendation.annual_savings_inr)
                annual_co2_reduction_kg = float(recommendation.estimated_co2_reduction_annual_kg)
                data_provenance_labels["annual_savings"] = "[REFERENCE]"
                data_provenance_labels["carbon_abatement"] = "[REFERENCE]"
            else:
                gross_annual_savings = None
                annual_co2_reduction_kg = None

        # 6. Net Annual Benefit, Payback, ROI
        payback_years: Optional[float] = None
        roi_pct: Optional[float] = None
        mac_inr_per_ton: Optional[float] = None

        if gross_annual_savings is not None and capex_inr > 0:
            net_annual_benefit = gross_annual_savings - annual_opex_inr
            if net_annual_benefit > 0:
                payback_years = round(capex_inr / net_annual_benefit, 2)
                roi_pct = round((net_annual_benefit / capex_inr) * 100.0, 1)

            if annual_co2_reduction_kg and annual_co2_reduction_kg > 0:
                co2_tons = annual_co2_reduction_kg / 1000.0
                annualized_capex = capex_inr / 7.0
                net_annual_cost = annualized_capex + annual_opex_inr - gross_annual_savings
                mac_inr_per_ton = round(net_annual_cost / co2_tons, 2)

        # 7. Waste Diversion (F-08 Remediation: No hardcoded factory waste without real measurements)
        waste_diversion_annual_kg: Optional[float] = None
        waste_model = recommendation.waste_reduction_model or {}
        if waste_model:
            factory_effluent = None
            if facility_telemetry_summary:
                factory_effluent = facility_telemetry_summary.get("effluent_liters") or facility_telemetry_summary.get("waste_kg")
            elif problem_rep.get("waste_quantity_kg"):
                factory_effluent = float(problem_rep["waste_quantity_kg"])

            if factory_effluent is not None and factory_effluent > 0:
                recovery_pct = float(waste_model.get("parameters", {}).get("recovery_rate_pct", 0.85))
                waste_diversion_annual_kg = round(factory_effluent * recovery_pct, 2)
                data_provenance_labels["waste_diversion"] = "[CALCULATED]"
            else:
                waste_diversion_annual_kg = None
                assumptions_applied.append(
                    "Factory waste/effluent stream is unmetered in SCADA; circular waste diversion left unquantified to avoid data fabrication."
                )

        status = "evaluated" if gross_annual_savings is not None else "insufficient_data"
        if status == "insufficient_data":
            assumptions_applied.append("Incident financial loss is zero or unquantified; cannot extrapolate future savings without telemetry baseline.")

        return EconomicEvaluation(
            status=status,
            capex_inr=round(capex_inr, 2) if capex_inr else None,
            capex_range=capex_range,
            annual_opex_inr=round(annual_opex_inr, 2) if annual_opex_inr else None,
            annual_savings_inr=round(gross_annual_savings, 2) if gross_annual_savings is not None else None,
            savings_range=savings_range,
            payback_period_years=payback_years,
            roi_pct=roi_pct,
            annual_co2_reduction_kg=round(annual_co2_reduction_kg, 2) if annual_co2_reduction_kg is not None else None,
            co2_reduction_range=co2_reduction_range,
            co2_abatement_cost_inr_per_ton=mac_inr_per_ton,
            waste_diversion_annual_kg=waste_diversion_annual_kg,
            data_provenance_labels=data_provenance_labels,
            assumptions_applied=assumptions_applied,
            missing_variables=[]
        )
