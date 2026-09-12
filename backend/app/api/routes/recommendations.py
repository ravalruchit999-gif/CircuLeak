from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationsStructuredResponse,
    PriorityResponse
)
from app.schemas.common import APIResponse
from app.services.recommendation_service import RecommendationService
from app.services.priority_service import PriorityService
from app.utils.facility_resolver import resolve_facility_id

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations/{facility_id}", response_model=APIResponse[RecommendationsStructuredResponse])
def get_facility_recommendations(facility_id: str, db: Session = Depends(get_db)):
    """Retrieve semantically matched circular interventions tailored for this facility."""
    fac_id = resolve_facility_id(facility_id, db)
    data = RecommendationService.get_structured_recommendations_response(db, fac_id)
    return APIResponse(success=True, data=RecommendationsStructuredResponse(**data))


@router.get("/recommendations/facility/{facility_id}", response_model=APIResponse[RecommendationsStructuredResponse])
def get_facility_recommendations_alias(facility_id: str, db: Session = Depends(get_db)):
    """Alias for /recommendations/{facility_id}."""
    return get_facility_recommendations(facility_id=facility_id, db=db)


@router.get("/recommendations/leak/{leak_id}", response_model=APIResponse[List[RecommendationResponse]])
def get_recommendations_for_leak(leak_id: str, db: Session = Depends(get_db)):
    """Retrieve circular interventions specifically addressing a detected leak."""
    clean_id = str(leak_id).strip().upper().replace("LEAK-", "").replace("LEAK_", "")
    l_id = int(clean_id) if clean_id.isdigit() else 1
    recs = RecommendationService.get_recommendations_for_leak(db, l_id)
    return APIResponse(success=True, data=[RecommendationResponse(**r) for r in recs])


@router.get("/interventions/priority/{facility_id}", response_model=APIResponse[PriorityResponse])
def get_priority_ranking(facility_id: str, db: Session = Depends(get_db)):
    """Retrieve ranked interventions using multi-criteria priority scoring."""
    fac_id = resolve_facility_id(facility_id, db)
    priority_data = PriorityService.rank_interventions(db, fac_id)
    return APIResponse(success=True, data=PriorityResponse(**priority_data))
