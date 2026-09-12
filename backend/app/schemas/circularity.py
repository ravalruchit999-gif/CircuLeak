from typing import List, Dict, Any
from pydantic import BaseModel


class CircularityScoreResponse(BaseModel):
    facility_id: int
    overall_score: float  # 0 - 100
    grade: str  # A, B, C, D
    dimensions: Dict[str, float]  # material_reuse, waste_recovery, renewable_energy, process_efficiency, carbon_utilization
    projected_score_after_interventions: float
    dimension_benchmarks: Dict[str, float]
    key_insights: List[str]
