from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.circularity import CircularityScoreResponse
from app.schemas.common import APIResponse
from app.services.circularity_service import CircularityService

router = APIRouter(prefix="/circularity", tags=["Circularity"])


@router.get("/{facility_id}", response_model=APIResponse[CircularityScoreResponse])
def get_circularity_score(facility_id: str, db: Session = Depends(get_db)):
    """Calculate 5-dimension 0-100 Circularity Score and projected post-intervention rating."""
    data = CircularityService.calculate_circularity_score(db, facility_id)
    return APIResponse(success=True, data=CircularityScoreResponse(**data))
