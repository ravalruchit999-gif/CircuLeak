from typing import Dict, Any, Optional, Union
from pydantic import BaseModel


class BenchmarkResponse(BaseModel):
    facility_id: Union[int, str]
    sector: str
    facility_intensity: float
    benchmark_average: float
    difference_percent: float
    performance: str  # "Outperforming", "On Par", "High Intensity / Carbon Leak Risk", "Exceeds CCTS Threshold"
    ccts_threshold: float
    ccts_compliance_status: str  # "Compliant" or "Action Required (Above Target Cap)"
    best_in_class: float
    unit: str
    source: str
    synthetic: bool
    status_summary: Optional[str] = None
    top_performers_average: Optional[float] = None


class PeerClusterResponse(BaseModel):
    facility_id: Union[int, str]
    cluster_id: int
    cluster_name: str
    cluster_description: Optional[str] = None
    similar_facility_count: int
    facility_intensity: float
    cluster_average: float
    gap_percent: float
    peer_characteristics: Dict[str, Any]
