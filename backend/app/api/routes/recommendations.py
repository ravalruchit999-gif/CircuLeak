from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.recommendation import RecommendationResponse, PriorityResponse
from app.schemas.common import APIResponse
from app.services.recommendation_service import RecommendationService
from app.services.priority_service import PriorityService

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations/{facility_id}", response_model=APIResponse[List[RecommendationResponse]])
def get_facility_recommendations(facility_id: int, db: Session = Depends(get_db)):
    """Retrieve semantically matched circular interventions tailored for this facility."""
    recs = RecommendationService.get_facility_recommendations(db, facility_id)
    return APIResponse(success=True, data=[RecommendationResponse(**r) for r in recs])


@router.get("/recommendations/leak/{leak_id}", response_model=APIResponse[List[RecommendationResponse]])
def get_recommendations_for_leak(leak_id: int, db: Session = Depends(get_db)):
    """Retrieve circular interventions specifically addressing a detected leak."""
    recs = RecommendationService.get_recommendations_for_leak(db, leak_id)
    return APIResponse(success=True, data=[RecommendationResponse(**r) for r in recs])


@router.get("/interventions/priority/{facility_id}", response_model=APIResponse[PriorityResponse])
def get_priority_ranking(facility_id: int, db: Session = Depends(get_db)):
    """Retrieve ranked interventions using multi-criteria priority scoring."""
    priority_data = PriorityService.rank_interventions(db, facility_id)
    return APIResponse(success=True, data=PriorityResponse(**priority_data))
