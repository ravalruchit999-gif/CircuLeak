from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class EmissionsBreakdownItem(BaseModel):
    name: str
    emissions_kg: float
    percentage_of_total: float
    intensity_per_unit: Optional[float] = None


class EmissionsSummaryResponse(BaseModel):
    facility_id: int
    business_name: str
    sector: str
    total_emissions: float  # in kgCO2e
    total_emissions_tonnes: float  # in tCO2e
    total_emissions_annual: Optional[float] = None
    unit: str = "kgCO2e"
    emissions_intensity: float  # kgCO2e per unit of production
    emission_intensity: Optional[float] = None
    total_production_volume: float
    total_electricity_kwh: float
    leak_count: Optional[int] = 0
    high_risk_count: Optional[int] = 0
    potential_reduction: Optional[float] = 0.0
    potential_reduction_percent: Optional[float] = 0.0
    annual_savings: Optional[float] = 0.0
    investment_required: Optional[float] = 0.0
    payback_years: Optional[float] = 0.0
    by_source: List[EmissionsBreakdownItem] = []
    by_process: List[EmissionsBreakdownItem] = []
    by_equipment: List[EmissionsBreakdownItem] = []


class TimelinePoint(BaseModel):
    date: str
    emissions_kg: float
    electricity_kwh: float
    production_volume: float


class EmissionsBreakdownResponse(BaseModel):
    facility_id: int
    total_emissions_kg: float
    emission_intensity: Optional[float] = 0.0
    by_source: List[EmissionsBreakdownItem] = []
    by_process: List[EmissionsBreakdownItem] = []
    by_equipment: List[EmissionsBreakdownItem] = []
    timeline: Optional[List[TimelinePoint]] = []


class EmissionsTimelineResponse(BaseModel):
    facility_id: int
    timeline_type: str  # "daily" or "monthly"
    points: List[TimelinePoint]


class SankeyNode(BaseModel):
    name: str
    category: str  # "source", "process", "equipment", "output", "leak"


class SankeyLink(BaseModel):
    source: str
    target: str
    value: float  # flow in kgCO2e


class SankeyGraphResponse(BaseModel):
    facility_id: int
    nodes: List[SankeyNode]
    links: List[SankeyLink]
