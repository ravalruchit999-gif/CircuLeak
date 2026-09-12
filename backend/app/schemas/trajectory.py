from typing import List, Dict, Any
from pydantic import BaseModel


class TrajectoryYearItem(BaseModel):
    year: int
    baseline_emissions: float  # kgCO2e
    with_actions_emissions: float  # kgCO2e
    annual_co2_reduction: float  # kgCO2e
    annual_savings: float  # INR
    cumulative_co2_avoided: float  # kgCO2e
    cumulative_savings: float  # INR


class TrajectoryResponse(BaseModel):
    facility_id: int
    start_year: int
    end_year: int
    trajectory: List[TrajectoryYearItem]
    total_cumulative_co2_avoided_kg: float
    total_cumulative_savings_inr: float
    summary: Dict[str, Any]
