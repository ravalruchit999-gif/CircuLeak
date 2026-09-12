from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.emissions import (
    EmissionsSummaryResponse,
    EmissionsBreakdownResponse,
    EmissionsTimelineResponse,
    SankeyGraphResponse
)
from app.schemas.common import APIResponse
from app.services.emission_service import EmissionService

router = APIRouter(prefix="/emissions", tags=["Emissions"])


@router.get("/summary/{facility_id}", response_model=APIResponse[EmissionsSummaryResponse])
def get_emissions_summary(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve top-level emissions summary, intensity, and breakdowns for a facility (multi-tenant scoped)."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    try:
        data = EmissionService.calculate_summary(db, target_id)
        return APIResponse(success=True, data=EmissionsSummaryResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/breakdown/{facility_id}", response_model=APIResponse[EmissionsBreakdownResponse])
def get_emissions_breakdown(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed categorical breakdowns (by energy source, process, and equipment)."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    try:
        data = EmissionService.calculate_breakdown(db, target_id)
        return APIResponse(success=True, data=EmissionsBreakdownResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/timeline/{facility_id}", response_model=APIResponse[EmissionsTimelineResponse])
def get_emissions_timeline(
    facility_id: int,
    interval: str = Query("daily", description="Time interval ('daily' or 'monthly')"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve time-series emissions data for trend tracking."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = EmissionService.calculate_timeline(db, target_id, timeline_type=interval)
    return APIResponse(success=True, data=EmissionsTimelineResponse(**data))


@router.get("/sankey/{facility_id}", response_model=APIResponse[SankeyGraphResponse])
def get_sankey_flow(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve Sankey flow nodes and links (Energy Source -> Process -> Equipment -> Emissions)."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = EmissionService.generate_sankey_graph(db, target_id)
    return APIResponse(success=True, data=SankeyGraphResponse(**data))
