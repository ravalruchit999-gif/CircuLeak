from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.leak import HotspotsResponse, AnomaliesResponse, LeakDetailResponse
from app.schemas.common import APIResponse
from app.services.leak_service import LeakService

router = APIRouter(prefix="/leaks", tags=["Leaks"])


@router.get("/hotspots/{facility_id}", response_model=APIResponse[HotspotsResponse])
def get_structural_hotspots(facility_id: int, db: Session = Depends(get_db)):
    """Retrieve Pareto (80/20) structural emission hotspots across equipment and processes."""
    data = LeakService.get_structural_hotspots(db, facility_id)
    return APIResponse(success=True, data=HotspotsResponse(**data))


@router.get("/anomalies/{facility_id}", response_model=APIResponse[AnomaliesResponse])
def get_behavioral_anomalies(facility_id: int, db: Session = Depends(get_db)):
    """Retrieve ML-detected behavioral anomalies, idle off-hours spikes, and risk scores."""
    try:
        data = LeakService.get_anomalies(db, facility_id)
        return APIResponse(success=True, data=AnomaliesResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/{leak_id}", response_model=APIResponse[LeakDetailResponse])
def get_leak_detail(leak_id: int, db: Session = Depends(get_db)):
    """Retrieve explainable details and matched circular interventions for a specific leak."""
    detail = LeakService.get_leak_detail(db, leak_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leak with ID {leak_id} not found.")
    return APIResponse(success=True, data=LeakDetailResponse(**detail))
