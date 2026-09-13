from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.leak import (
    LeakDetailResponse,
    IncidentStatusUpdateRequest,
    WhyAnalysisResponse
)
from app.schemas.common import APIResponse
from app.services.leak_service import LeakService

router = APIRouter(prefix="/incidents", tags=["Carbon Incidents"])


@router.get("/{incident_id}", response_model=APIResponse[LeakDetailResponse])
def get_incident_detail(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive evidence-grounded Carbon Incident details for a specific incident."""
    detail = LeakService.get_leak_detail(db, incident_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carbon Incident #{incident_id} not found."
        )

    # Multi-tenancy authorization check
    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to carbon incident telemetry belonging to another facility."
            )

    return APIResponse(success=True, data=LeakDetailResponse(**detail))


@router.patch("/{incident_id}/status", response_model=APIResponse[LeakDetailResponse])
@router.post("/{incident_id}/status", response_model=APIResponse[LeakDetailResponse])
def update_incident_status(
    incident_id: int,
    status_update: IncidentStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update incident investigation workflow status (investigating, resolved, dismissed, detected)."""
    detail = LeakService.get_leak_detail(db, incident_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carbon Incident #{incident_id} not found."
        )

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
            leak_id=incident_id,
            new_status=status_update.status,
            user_id=current_user.id,
            note=status_update.note
        )
        return APIResponse(success=True, data=LeakDetailResponse(**updated))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.get("/{incident_id}/why", response_model=APIResponse[WhyAnalysisResponse])
def get_incident_why_analysis(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve deterministic evidence-grounded 'Why?' investigation for a carbon incident.
    Includes multi-tier baseline hierarchy, composite evidence strength, hypothesis falsification,
    and exact observation timestamps.
    """
    from app.services.incident_why_service import IncidentWhyService

    detail = LeakService.get_leak_detail(db, incident_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carbon Incident #{incident_id} not found."
        )

    # Multi-tenancy authorization check
    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to carbon incident telemetry belonging to another facility."
            )

    try:
        why_data = IncidentWhyService.analyze_incident_why(
            db=db,
            incident_id=incident_id,
            facility_id=current_user.facility_id if current_user.role != "admin" else None
        )
        return APIResponse(success=True, data=WhyAnalysisResponse(**why_data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))


# =========================================================================
# PHASE 3: Evidence-Backed Intervention Recommendations
# =========================================================================

from typing import Optional
from app.schemas.intervention import (
    IncidentRecommendationResponse,
    UserDecisionContext,
    RecommendationComparisonRequest,
    RecommendationComparisonResponse
)
from app.services.intervention_recommendation_service import InterventionRecommendationService


@router.post("/{incident_id}/recommendations", response_model=APIResponse[IncidentRecommendationResponse])
def generate_incident_recommendations(
    incident_id: int,
    context: Optional[UserDecisionContext] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate evidence-backed intervention recommendations for a verified carbon incident.
    Synthesizes Phase 2 problem representation, external benchmark parameters,
    telemetry prerequisites, and user-specified decision context.
    """
    detail = LeakService.get_leak_detail(db, incident_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carbon Incident #{incident_id} not found."
        )

    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to carbon incident telemetry belonging to another facility."
            )

    try:
        resp = InterventionRecommendationService.generate_recommendations_for_incident(
            db=db,
            incident_id=incident_id,
            context=context
        )
        db.commit()
        return APIResponse(success=True, data=resp)
    except ValueError as ve:
        db.rollback()
        err_str = str(ve)
        status_c = status.HTTP_404_NOT_FOUND if "not found" in err_str.lower() else status.HTTP_422_UNPROCESSABLE_ENTITY
        raise HTTPException(status_code=status_c, detail=err_str)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{incident_id}/recommendations", response_model=APIResponse[IncidentRecommendationResponse])
def get_incident_recommendations(
    incident_id: int,
    primary_objective: Optional[str] = "payback",
    max_capex_inr: Optional[float] = None,
    max_payback_years: Optional[float] = None,
    acceptable_disruption: Optional[str] = "High",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve recommendations using query parameter decision context."""
    ctx = UserDecisionContext(
        primary_objective=primary_objective or "payback",
        max_capex_inr=max_capex_inr,
        max_payback_years=max_payback_years,
        acceptable_disruption=acceptable_disruption or "High"
    )
    return generate_incident_recommendations(
        incident_id=incident_id,
        context=ctx,
        current_user=current_user,
        db=db
    )


@router.post("/{incident_id}/recommendations/compare", response_model=APIResponse[RecommendationComparisonResponse])
def compare_incident_recommendations(
    incident_id: int,
    request: RecommendationComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Side-by-side comparative tradeoff analysis for selected candidate interventions."""
    detail = LeakService.get_leak_detail(db, incident_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Carbon Incident #{incident_id} not found."
        )

    if current_user.role != "admin":
        leak_fac = detail.get("facility_id")
        if leak_fac and current_user.facility_id and int(leak_fac) != int(current_user.facility_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to carbon incident telemetry belonging to another facility."
            )

    try:
        resp = InterventionRecommendationService.compare_interventions(
            db=db,
            intervention_ids=request.intervention_ids,
            incident_id=incident_id,
            context=request.decision_context
        )
        db.commit()
        return APIResponse(success=True, data=resp)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


