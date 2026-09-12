from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel


class CircularityScoreResponse(BaseModel):
    facility_id: Union[int, str]
    overall_score: float  # 0 - 100
    grade: str  # A, B, C, D
    tier: Optional[str] = None
    projected_score: Optional[float] = None
    score_delta: Optional[float] = None
    dimensions: Dict[str, float]  # material_reuse, waste_recovery, renewable_energy, process_efficiency, carbon_utilization
    pillars: Optional[List[Dict[str, Any]]] = None
    projected_score_after_interventions: float
    dimension_benchmarks: Dict[str, float]
    key_insights: List[str]
