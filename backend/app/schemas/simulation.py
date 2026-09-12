from typing import List, Optional, Union
from pydantic import BaseModel, Field


class WhatIfRequest(BaseModel):
    facility_id: Union[int, str] = Field(..., json_schema_extra={"example": 1})
    intervention_ids: List[str] = Field(..., min_length=1, json_schema_extra={"example": ["whr_boiler_flue", "vfd_compressor_retrofit"]})


class InterventionImpactDetail(BaseModel):
    id: str
    title: str
    co2_reduction_kg: float
    investment_inr: float
    annual_savings_inr: float
    payback_years: float


class WhatIfResponse(BaseModel):
    facility_id: Union[int, str]
    baseline_emissions: float  # kgCO2e
    projected_emissions: float  # kgCO2e
    total_reduction: float  # kgCO2e
    reduction: Optional[float] = None
    reduction_percent: float  # %
    investment: float  # INR
    annual_savings: float  # INR
    payback_years: float  # years
    five_year_savings: float  # INR
    selected_interventions: List[InterventionImpactDetail]


class ScenarioItem(BaseModel):
    id: Optional[str] = None
    scenario_name: str  # "Cost Saver", "Balanced", "Maximum Decarbonization"
    name: Optional[str] = None
    tag: Optional[str] = "Strategy"
    subtitle: Optional[str] = ""
    focus_strategy: str
    baseline_emissions: Optional[float] = None
    projected_emissions: Optional[float] = None
    emission_reduction: float  # kgCO2e
    reduction: Optional[float] = None
    reduction_percent: float
    investment: float  # INR
    annual_savings: float  # INR
    payback_years: float
    five_year_savings: Optional[float] = None
    selected_interventions: List[str]


class ScenarioRequest(BaseModel):
    facility_id: Union[int, str] = Field(..., json_schema_extra={"example": 1})


class ScenarioResponse(BaseModel):
    facility_id: Union[int, str]
    baseline_emissions_kg: float
    baseline_emissions: Optional[float] = None
    scenarios: List[ScenarioItem]
