from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.trajectory import TrajectoryResponse
from app.schemas.common import APIResponse
from app.services.trajectory_service import TrajectoryService

router = APIRouter(prefix="/trajectory", tags=["Trajectory"])


@router.get("/{facility_id}", response_model=APIResponse[TrajectoryResponse])
def get_5year_trajectory(
    facility_id: int,
    start_year: int = Query(2026, description="Trajectory start year"),
    end_year: int = Query(2030, description="Trajectory end year"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve 5-year decarbonization and financial savings trajectory."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = TrajectoryService.calculate_5year_trajectory(
        db=db,
        facility_id=target_id,
        start_year=start_year,
        end_year=end_year
    )
    return APIResponse(success=True, data=TrajectoryResponse(**data))
