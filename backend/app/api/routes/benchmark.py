from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.benchmark import BenchmarkResponse, PeerClusterResponse
from app.schemas.common import APIResponse
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])


@router.get("/{facility_id}", response_model=APIResponse[BenchmarkResponse])
def get_benchmark_scorecard(facility_id: str, db: Session = Depends(get_db)):
    """Evaluate emission intensity against industry standards and India's CCTS thresholds."""
    data = BenchmarkService.get_benchmark(db, facility_id)
    return APIResponse(success=True, data=BenchmarkResponse(**data))


@router.get("/peer-cluster/{facility_id}", response_model=APIResponse[PeerClusterResponse])
def get_peer_cluster(facility_id: str, db: Session = Depends(get_db)):
    """Group facility into peer cohorts using K-Means clustering across intensity features."""
    data = BenchmarkService.get_peer_clustering(db, facility_id)
    return APIResponse(success=True, data=PeerClusterResponse(**data))
