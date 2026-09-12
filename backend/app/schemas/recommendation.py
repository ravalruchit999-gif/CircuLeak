from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RecommendationResponse(BaseModel):
    id: str
    title: str
    description: str
    target_process: str
    target_equipment: str
    intervention_type: str
    requirements: str
    estimated_co2_reduction_annual_kg: float
    estimated_cost_inr: float
    annual_savings_inr: float
    payback_period_years: float
    feasibility: str
    is_standard: bool = True
    match_score: Optional[float] = None
    match_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PriorityItem(BaseModel):
    priority_rank: int
    recommendation_id: str
    recommendation: str
    intervention_type: str
    target_equipment: str
    co2_reduction: float  # kgCO2e
    investment: float  # INR
    annual_savings: float  # INR
    payback_years: float
    feasibility: str
    priority_score: float  # 0 - 100 composite score
    rationale: str


class PriorityResponse(BaseModel):
    facility_id: int
    ranked_interventions: List[PriorityItem]
