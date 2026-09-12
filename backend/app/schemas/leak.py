from typing import List, Optional, Any
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


class AnomalyItem(BaseModel):
    leak_id: Optional[int] = None
    equipment: str
    process: str
    risk_score: float  # 0 - 100
    baseline_consumption: float
    observed_consumption: float
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str] = []


class AnomaliesResponse(BaseModel):
    facility_id: int
    anomalies_detected_count: int
    anomalies: List[AnomalyItem]


class LeakDetailResponse(BaseModel):
    id: int
    facility_id: int
    leak_type: str
    equipment: str
    process: str
    risk_score: float
    emission_contribution_kg: float
    baseline_consumption: float
    observed_consumption: float
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str]
    recommended_interventions: List[Any] = []
    detected_at: datetime

    model_config = ConfigDict(from_attributes=True)
