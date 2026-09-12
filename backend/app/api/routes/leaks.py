from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.leak import HotspotsResponse, AnomaliesResponse, LeakDetailResponse
from app.schemas.common import APIResponse
from app.services.leak_service import LeakService

from app.utils.facility_resolver import resolve_facility_id

router = APIRouter(prefix="/leaks", tags=["Leaks"])


@router.get("/hotspots/{facility_id}", response_model=APIResponse[HotspotsResponse])
def get_structural_hotspots(facility_id: str, db: Session = Depends(get_db)):
    """Retrieve Pareto (80/20) structural emission hotspots across equipment and processes."""
    fac_id = resolve_facility_id(facility_id, db)
    data = LeakService.get_structural_hotspots(db, fac_id)
    return APIResponse(success=True, data=HotspotsResponse(**data))


@router.get("/anomalies/{facility_id}", response_model=APIResponse[AnomaliesResponse])
def get_behavioral_anomalies(facility_id: str, db: Session = Depends(get_db)):
    """Retrieve ML-detected behavioral anomalies, idle off-hours spikes, and risk scores."""
    fac_id = resolve_facility_id(facility_id, db)
    try:
        data = LeakService.get_anomalies(db, fac_id)
        return APIResponse(success=True, data=AnomaliesResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/{leak_id}", response_model=APIResponse[LeakDetailResponse])
def get_leak_detail(leak_id: str, db: Session = Depends(get_db)):
    """Retrieve explainable details and matched circular interventions for a specific leak."""
    clean_id = str(leak_id).strip().upper().replace("LEAK-", "").replace("LEAK_", "")
    l_id = int(clean_id) if clean_id.isdigit() else 1
    detail = LeakService.get_leak_detail(db, l_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leak with ID {leak_id} not found.")
    return APIResponse(success=True, data=LeakDetailResponse(**detail))


@router.get("/{facility_id}/{leak_id}", response_model=APIResponse[LeakDetailResponse])
def get_facility_leak_detail(facility_id: str, leak_id: str, db: Session = Depends(get_db)):
    """Retrieve leak details when facility_id and leak_id are both passed in path."""
    return get_leak_detail(leak_id=leak_id, db=db)
