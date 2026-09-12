"""
Centralized Emission Factors Library for CircuLeak.
All factors are based on official citable standards:
- India Central Electricity Authority (CEA) CO2 Baseline Database v19
- IPCC 2006 Guidelines for National Greenhouse Gas Inventories
- Bureau of Energy Efficiency (BEE) India Energy Auditor Reference
"""

from typing import Dict, Any, Optional

EMISSION_FACTORS: Dict[str, Dict[str, Any]] = {
    "grid_electricity": {
        "factor": 0.716,
        "unit": "kgCO2e/kWh",
        "description": "Grid electricity emission factor (India National Grid Average)",
        "reference": "India CEA CO2 Baseline Database v19 (2024)",
        "fuel_unit": "kWh"
    },
    "coal": {
        "factor": 2.420,
        "unit": "kgCO2e/kg",
        "description": "Industrial sub-bituminous / thermal coal combustion",
        "reference": "IPCC 2006 / BEE India Industrial Reference",
        "fuel_unit": "kg"
    },
    "diesel": {
        "factor": 2.680,
        "unit": "kgCO2e/L",
        "description": "High-speed industrial diesel (HSD) generators and boilers",
        "reference": "IPCC 2006 Guidelines for GHG Inventories (Stationary Combustion)",
        "fuel_unit": "L"
    },
    "natural_gas": {
        "factor": 1.930,
        "unit": "kgCO2e/m3",
        "description": "Piped natural gas (PNG) for industrial heating and boilers",
        "reference": "IPCC 2006 / GAIL India Reference Data",
        "fuel_unit": "m3"
    },
    "lpg": {
        "factor": 2.980,
        "unit": "kgCO2e/kg",
        "description": "Liquified Petroleum Gas industrial burners",
        "reference": "IPCC 2006 Fuel Inventory Guidelines",
        "fuel_unit": "kg"
    },
    "biomass": {
        "factor": 0.035,
        "unit": "kgCO2e/kg",
        "description": "Agro-residue biomass briquettes / pellets (net non-biogenic lifecycle emissions)",
        "reference": "BEE / Ministry of New and Renewable Energy (MNRE) India",
        "fuel_unit": "kg"
    }
}


def get_emission_factor(fuel_type: str) -> Optional[Dict[str, Any]]:
    """Retrieve emission factor details for a given energy/fuel source."""
    clean_key = fuel_type.strip().lower().replace(" ", "_").replace("-", "_")
    return EMISSION_FACTORS.get(clean_key)
