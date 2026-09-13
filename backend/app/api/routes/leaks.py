from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.leak import (
    HotspotsResponse,
    AnomaliesResponse,
    LeakDetailResponse,
    IncidentStatusUpdateRequest
)
from app.schemas.common import APIResponse
from app.services.leak_service import LeakService

router = APIRouter(prefix="/leaks", tags=["Leaks & Incidents"])


@router.get("/hotspots/{facility_id}", response_model=APIResponse[HotspotsResponse])
def get_structural_hotspots(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Pareto (80/20) structural emission hotspots across equipment and processes."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = LeakService.get_structural_hotspots(db, target_id)
    return APIResponse(success=True, data=HotspotsResponse(**data))


@router.get("/anomalies/{facility_id}", response_model=APIResponse[AnomaliesResponse])
def get_behavioral_anomalies(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve ML-detected behavioral anomalies, idle off-hours spikes, and risk scores."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    try:
        data = LeakService.get_anomalies(db, target_id)
        return APIResponse(success=True, data=AnomaliesResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/{leak_id}", response_model=APIResponse[LeakDetailResponse])
def get_leak_detail(
    leak_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive evidence-grounded Carbon Incident details for a specific leak."""
    detail = LeakService.get_leak_detail(db, leak_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Carbon Incident #{leak_id} not found.")

    # Multi-tenancy authorization check
    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to carbon incident telemetry belonging to another facility."
            )

    return APIResponse(success=True, data=LeakDetailResponse(**detail))


@router.patch("/{leak_id}/status", response_model=APIResponse[LeakDetailResponse])
@router.post("/{leak_id}/status", response_model=APIResponse[LeakDetailResponse])
def update_incident_status(
    leak_id: int,
    status_update: IncidentStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update incident investigation workflow status (investigating, resolved, dismissed, detected)."""
    detail = LeakService.get_leak_detail(db, leak_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Carbon Incident #{leak_id} not found.")

    # Multi-tenancy authorization check
    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: You cannot modify carbon incident records belonging to another facility."
            )

    try:
        updated = LeakService.update_incident_status(
            db=db,
            leak_id=leak_id,
            new_status=status_update.status,
            user_id=current_user.id,
            note=status_update.note
        )
        return APIResponse(success=True, data=LeakDetailResponse(**updated))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
