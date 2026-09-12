from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel


class TrajectoryYearItem(BaseModel):
    year: Union[int, str]
    baseline_emissions: float  # kgCO2e
    with_actions_emissions: float  # kgCO2e
    annual_co2_reduction: float  # kgCO2e
    annual_savings: float  # INR
    cumulative_co2_avoided: float  # kgCO2e
    cumulative_savings: float  # INR
    bau_emissions: Optional[float] = None
    action_emissions: Optional[float] = None
    avoided_daily: Optional[float] = None
    milestone: Optional[str] = None


class TrajectoryResponse(BaseModel):
    facility_id: Union[int, str]
    start_year: int
    end_year: int
    baseline_year: Optional[int] = None
    target_year: Optional[int] = None
    trajectory: List[TrajectoryYearItem]
    yearly_projection: Optional[List[TrajectoryYearItem]] = None
    cumulative_co2_avoided_tonnes: Optional[float] = None
    cumulative_financial_savings: Optional[float] = None
    total_cumulative_co2_avoided_kg: float
    total_cumulative_savings_inr: float
    roadmap_milestones: Optional[List[Dict[str, Any]]] = None
    summary: Dict[str, Any]
