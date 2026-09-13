from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class CircularityScoreResponse(BaseModel):
    facility_id: int
    has_data: bool = True
    overall_score: float = 0.0  # 0 - 100
    score: Optional[float] = 0.0
    tier: Optional[str] = "Pending"
    grade: Optional[str] = "N/A"  # A, B, C, D
    rating: Optional[str] = "Moderate"
    telemetry_coverage_percent: Optional[float] = 0.0
    confidence_level: Optional[str] = None
    dimensions: Dict[str, Optional[float]] = {}
    measured_dimensions: Optional[Dict[str, Optional[float]]] = {}
    unmeasured_dimensions: Optional[List[Dict[str, Any]]] = []
    projected_score_after_interventions: Optional[float] = 0.0
    projected_score: Optional[float] = 0.0
    potential_uplift: Optional[float] = 0.0
    score_delta: Optional[float] = 0.0
    dimension_benchmarks: Optional[Dict[str, float]] = {}
    breakdown: Optional[List[Dict[str, Any]]] = []
    pillars: Optional[List[Dict[str, Any]]] = []
    key_insights: Optional[List[str]] = []
    missing_inputs: Optional[List[str]] = []
    symbiosis_summary: Optional[Dict[str, Any]] = None
