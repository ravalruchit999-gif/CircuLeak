from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.facility import FacilityCreate, FacilityResponse
from app.schemas.common import APIResponse
from app.services.facility_service import FacilityService

router = APIRouter(prefix="/facility", tags=["Facility"])


@router.post("", response_model=APIResponse[FacilityResponse], status_code=status.HTTP_201_CREATED)
def create_facility(
    facility_in: FacilityCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new industrial facility profile."""
    facility = FacilityService.create_facility(db, facility_in)
    if current_user and not current_user.facility_id:
        current_user.facility_id = facility.id
        db.commit()
    return APIResponse(success=True, data=FacilityResponse.model_validate(facility))


@router.get("/{facility_id}", response_model=APIResponse[FacilityResponse])
def get_facility(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details for a specific facility by ID (multi-tenant protected)."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    facility = FacilityService.get_facility(db, target_id)
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with ID {target_id} not found."
        )
    return APIResponse(success=True, data=FacilityResponse.model_validate(facility))


@router.get("", response_model=APIResponse[List[FacilityResponse]])
def list_facilities(
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List registered facilities (admin lists all, non-admin lists own facility)."""
    if current_user and current_user.role != "admin" and current_user.facility_id:
        facility = FacilityService.get_facility(db, current_user.facility_id)
        return APIResponse(success=True, data=[FacilityResponse.model_validate(facility)] if facility else [])
    facilities = FacilityService.list_facilities(db, skip=skip, limit=limit)
    return APIResponse(success=True, data=[FacilityResponse.model_validate(f) for f in facilities])
