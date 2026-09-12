from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.benchmark import BenchmarkResponse, PeerClusterResponse
from app.schemas.common import APIResponse
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])


@router.get("/{facility_id}", response_model=APIResponse[BenchmarkResponse])
def get_benchmark_scorecard(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate emission intensity against industry standards and India's CCTS thresholds."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = BenchmarkService.get_benchmark(db, target_id)
    return APIResponse(success=True, data=BenchmarkResponse(**data))


@router.get("/peer-cluster/{facility_id}", response_model=APIResponse[PeerClusterResponse])
def get_peer_cluster(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Group facility into peer cohorts using K-Means clustering across intensity features."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = BenchmarkService.get_peer_clustering(db, target_id)
    return APIResponse(success=True, data=PeerClusterResponse(**data))
