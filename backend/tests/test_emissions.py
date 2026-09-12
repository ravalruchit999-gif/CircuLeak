import pytest
from app.utils.calculations import calculate_emissions_for_row
from app.data.emission_factors import EMISSION_FACTORS, get_emission_factor


def test_emission_factors_library():
    """Verify standard factors are citable and populated."""
    assert "grid_electricity" in EMISSION_FACTORS
    assert EMISSION_FACTORS["grid_electricity"]["factor"] == 0.716

    diesel = get_emission_factor("diesel")
    assert diesel is not None
    assert diesel["factor"] == 2.680

    biomass = get_emission_factor("biomass")
    assert biomass is not None
    assert biomass["factor"] == 0.035


def test_calculate_emissions_for_row():
    """Verify activity * factor deterministic math."""
    # Electricity only: 100 kWh * 0.716 kg/kWh = 71.6 kg
    emiss_elec = calculate_emissions_for_row(electricity_kwh=100.0, fuel_type=None, fuel_quantity=0.0)
    assert round(emiss_elec, 2) == 71.6

    # Diesel only: 50 L * 2.68 kg/L = 134.0 kg
    emiss_diesel = calculate_emissions_for_row(electricity_kwh=0.0, fuel_type="diesel", fuel_quantity=50.0)
    assert round(emiss_diesel, 2) == 134.0

    # Combined: 100 kWh elec (71.6) + 50 L diesel (134.0) = 205.6 kg
    emiss_comb = calculate_emissions_for_row(electricity_kwh=100.0, fuel_type="diesel", fuel_quantity=50.0)
    assert round(emiss_comb, 2) == 205.6
