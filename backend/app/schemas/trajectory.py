from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class TrajectoryYearItem(BaseModel):
    year: int
    baseline_emissions: Optional[float] = 0.0
    with_actions_emissions: Optional[float] = 0.0
    annual_co2_reduction: Optional[float] = 0.0
    annual_savings: Optional[float] = 0.0
    cumulative_co2_avoided: Optional[float] = 0.0
    cumulative_savings: Optional[float] = 0.0
    bau_emissions_kg: Optional[float] = 0.0
    with_interventions_kg: Optional[float] = 0.0
    annual_reduction_kg: Optional[float] = 0.0
    reduction_percent: Optional[float] = 0.0


class TrajectoryResponse(BaseModel):
    facility_id: int
    has_data: bool = False
    start_year: int
    end_year: int
    trajectory: List[TrajectoryYearItem] = []
    yearly_projection: List[Dict[str, Any]] = []
    total_cumulative_co2_avoided_kg: float = 0.0
    total_cumulative_savings_inr: float = 0.0
    summary: Dict[str, Any] = {}
    roadmap_milestones: List[Dict[str, Any]] = []
