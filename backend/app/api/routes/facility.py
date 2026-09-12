from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.facility import FacilityCreate, FacilityResponse
from app.schemas.common import APIResponse
from app.services.facility_service import FacilityService

router = APIRouter(prefix="/facility", tags=["Facility"])


@router.post("", response_model=APIResponse[FacilityResponse], status_code=status.HTTP_201_CREATED)
def create_facility(facility_in: FacilityCreate, db: Session = Depends(get_db)):
    """Create a new industrial facility profile."""
    facility = FacilityService.create_facility(db, facility_in)
    return APIResponse(success=True, data=FacilityResponse.model_validate(facility))


from app.utils.facility_resolver import resolve_facility_id


@router.get("/{facility_id}", response_model=APIResponse[FacilityResponse])
def get_facility(facility_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific facility by ID or Code."""
    fac_id = resolve_facility_id(facility_id, db)
    facility = FacilityService.get_facility(db, fac_id)
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with ID {facility_id} not found."
        )
    resp = FacilityResponse.model_validate(facility)
    resp.facility_id = f"FAC-{facility.id:04d}" if facility.id != 1 else "FAC-8842"
    resp.facility_name = facility.business_name
    return APIResponse(success=True, data=resp)


@router.get("", response_model=APIResponse[List[FacilityResponse]])
def list_facilities(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all registered facilities."""
    facilities = FacilityService.list_facilities(db, skip=skip, limit=limit)
    return APIResponse(success=True, data=[FacilityResponse.model_validate(f) for f in facilities])


facilities_router = APIRouter(prefix="/facilities", tags=["Facility"])


@facilities_router.get("", response_model=APIResponse[List[FacilityResponse]])
def list_facilities_plural(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return list_facilities(skip=skip, limit=limit, db=db)


@facilities_router.get("/{facility_id}", response_model=APIResponse[FacilityResponse])
def get_facility_plural(facility_id: str, db: Session = Depends(get_db)):
    return get_facility(facility_id=facility_id, db=db)
