from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class CircularityScoreResponse(BaseModel):
    facility_id: int
    has_data: bool = True
    overall_score: float = 0.0  # 0 - 100
    score: Optional[float] = 0.0
    grade: Optional[str] = "N/A"  # A, B, C, D
    rating: Optional[str] = "Moderate"
    dimensions: Dict[str, float] = {}
    projected_score_after_interventions: Optional[float] = 0.0
    projected_score: Optional[float] = 0.0
    potential_uplift: Optional[float] = 0.0
    dimension_benchmarks: Optional[Dict[str, float]] = {}
    breakdown: Optional[List[Dict[str, Any]]] = []
    key_insights: Optional[List[str]] = []
    missing_inputs: Optional[List[str]] = []
