from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.circularity import CircularityScoreResponse
from app.schemas.common import APIResponse
from app.services.circularity_service import CircularityService

router = APIRouter(prefix="/circularity", tags=["Circularity"])


@router.get("/{facility_id}", response_model=APIResponse[CircularityScoreResponse])
def get_circularity_score(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate 5-dimension 0-100 Circularity Score and projected post-intervention rating."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = CircularityService.calculate_circularity_score(db, target_id)
    return APIResponse(success=True, data=CircularityScoreResponse(**data))
