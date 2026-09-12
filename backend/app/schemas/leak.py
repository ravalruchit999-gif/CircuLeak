from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HotspotItem(BaseModel):
    rank: int
    equipment: str
    process: str
    emissions_kg: float
    percentage_of_total: float
    leak_category: str = "Structural Leak"


class HotspotsResponse(BaseModel):
    facility_id: int
    total_emissions_kg: float
    hotspots: List[HotspotItem]
    hotspots_flow: Optional[List[Dict[str, Any]]] = []


class AnomalyItem(BaseModel):
    leak_id: Optional[int] = None
    id: Optional[str] = None
    equipment: str
    process: str
    risk_score: float  # 0 - 100
    risk_level: Optional[str] = "High"
    location: Optional[str] = "Primary Process Bay"
    emission_contribution: Optional[float] = 0.0
    baseline_consumption: float
    observed_consumption: float
    consumption_unit: Optional[str] = "kWh/day"
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str] = []


class AnomaliesResponse(BaseModel):
    facility_id: int
    anomalies_detected_count: int
    total_leaks: Optional[int] = 0
    high_risk_count: Optional[int] = 0
    aggregate_excess_emissions: Optional[float] = 0.0
    anomalies: List[AnomalyItem]
    leaks: Optional[List[Dict[str, Any]]] = []


class LeakDetailResponse(BaseModel):
    id: int
    facility_id: int
    leak_type: str
    equipment: str
    process: str
    risk_score: float
    risk_level: Optional[str] = "High"
    location: Optional[str] = "Utility Bay B"
    emission_contribution_kg: float
    emission_contribution: Optional[float] = 0.0
    baseline_consumption: float
    observed_consumption: float
    consumption_unit: Optional[str] = "kWh/day"
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str]
    hourly_observed_data: Optional[List[Dict[str, Any]]] = []
    recommended_interventions: List[Any] = []
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)

