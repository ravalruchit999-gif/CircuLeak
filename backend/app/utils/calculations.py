from typing import Optional
from app.data.emission_factors import get_emission_factor, EMISSION_FACTORS


def safe_div(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safely divide two numbers without ZeroDivisionError."""
    if denominator == 0 or denominator is None:
        return default
    return numerator / denominator


def calculate_emissions_for_row(electricity_kwh: float, fuel_type: Optional[str], fuel_quantity: float) -> float:
    """
    Compute total emissions (in kgCO2e) for a process row:
    Emissions = (electricity_kwh * grid_factor) + (fuel_quantity * fuel_factor)
    """
    total = 0.0

    # Grid Electricity
    if electricity_kwh and electricity_kwh > 0:
        grid_factor = EMISSION_FACTORS["grid_electricity"]["factor"]
        total += electricity_kwh * grid_factor

    # Fuel Combustion
    if fuel_type and fuel_quantity and fuel_quantity > 0:
        factor_info = get_emission_factor(fuel_type)
        if factor_info:
            total += fuel_quantity * factor_info["factor"]

    return round(total, 4)


def calculate_payback(investment: float, annual_savings: float) -> float:
    """Calculate simple payback period in years."""
    if annual_savings <= 0:
        return 999.0
    return round(investment / annual_savings, 2)
