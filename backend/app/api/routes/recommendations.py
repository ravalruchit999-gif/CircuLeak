from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.models.leak import Leak
from app.schemas.recommendation import RecommendationResponse, PriorityResponse
from app.schemas.common import APIResponse
from app.services.recommendation_service import RecommendationService
from app.services.priority_service import PriorityService

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations/{facility_id}", response_model=APIResponse[List[RecommendationResponse]])
def get_facility_recommendations(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve semantically matched circular interventions tailored for this facility."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    recs = RecommendationService.get_facility_recommendations(db, target_id)
    return APIResponse(success=True, data=[RecommendationResponse(**r) for r in recs])


@router.get("/recommendations/leak/{leak_id}", response_model=APIResponse[List[RecommendationResponse]])
def get_recommendations_for_leak(
    leak_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve circular interventions specifically addressing a detected leak."""
    leak = db.query(Leak).filter(Leak.id == leak_id).first()
    if not leak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": f"Leak {leak_id} not found."}
        )

    if current_user.role != "admin" and leak.facility_id != current_user.facility_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Unauthorized access to facility leak recommendations."}
        )

    recs = RecommendationService.get_recommendations_for_leak(db, leak_id)
    return APIResponse(success=True, data=[RecommendationResponse(**r) for r in recs])


@router.get("/interventions/priority/{facility_id}", response_model=APIResponse[PriorityResponse])
def get_priority_ranking(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve ranked interventions using multi-criteria priority scoring."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    priority_data = PriorityService.rank_interventions(db, target_id)
    return APIResponse(success=True, data=PriorityResponse(**priority_data))
