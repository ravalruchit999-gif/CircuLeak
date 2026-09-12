from typing import Dict, Any, Optional, List
from pydantic import BaseModel


class BenchmarkResponse(BaseModel):
    facility_id: int
    has_data: bool = True
    sector: str
    facility_intensity: float = 0.0
    benchmark_average: float = 0.0
    difference_percent: float = 0.0
    performance: str = "Insufficient Data"
    ccts_threshold: float = 0.0
    ccts_compliance_status: str = "Pending Telemetry"
    best_in_class: float = 0.0
    unit: str = "kgCO2e/unit"
    source: str = ""
    synthetic: bool = False


class PeerClusterResponse(BaseModel):
    facility_id: int
    has_peer_data: bool = False
    status: str = "insufficient_data"
    cluster_id: Optional[int] = 0
    cluster_label: Optional[str] = "Unassigned"
    cluster_name: str = "Insufficient Benchmark Peers"
    message: Optional[str] = ""
    peer_count: int = 0
    peer_cohort_size: int = 0
    similar_facility_count: int = 0
    facility_intensity: float = 0.0
    cohort_average_intensity: float = 0.0
    cluster_average: float = 0.0
    gap_percent: float = 0.0
    gap_to_cohort_avg_percent: float = 0.0
    criteria_status: Optional[Dict[str, Any]] = None
    peer_characteristics: Optional[Dict[str, Any]] = None
    peers: Optional[List[Dict[str, Any]]] = None
