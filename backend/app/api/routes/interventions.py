"""
Interventions Catalog API Route.
Provides endpoints for querying, filtering, and comparing the authoritative intervention knowledge base.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.intervention import (
    RecommendationCard,
    RecommendationComparisonRequest,
    RecommendationComparisonResponse,
    UserDecisionContext
)
from app.schemas.common import APIResponse
from app.services.intervention_recommendation_service import InterventionRecommendationService

router = APIRouter(prefix="/interventions", tags=["Interventions Catalog"])


@router.get("", response_model=APIResponse[List[dict]])
def list_interventions(
    sector: Optional[str] = Query(None, description="Filter by industrial sector"),
    equipment: Optional[str] = Query(None, description="Filter by target equipment"),
    intervention_type: Optional[str] = Query(None, description="Filter by intervention type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all active authoritative industrial decarbonization and circular economy interventions."""
    query = db.query(Recommendation).filter(Recommendation.is_active == True)

    if equipment:
        query = query.filter(Recommendation.target_equipment.ilike(f"%{equipment}%"))
    if intervention_type:
        query = query.filter(Recommendation.intervention_type.ilike(f"%{intervention_type}%"))

    recs = query.all()

    # Filter by sector if specified
    results = []
    for r in recs:
        if sector and r.supported_sectors:
            if not any(sector.lower() in s.lower() for s in r.supported_sectors):
                continue
        results.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "intervention_type": r.intervention_type,
            "intervention_category": r.intervention_category,
            "target_process": r.target_process,
            "target_equipment": r.target_equipment,
            "supported_sectors": r.supported_sectors,
            "reference_organization": r.reference_organization,
            "reference_parameter_range": r.reference_parameter_range,
            "estimated_cost_inr": r.estimated_cost_inr,
            "annual_savings_inr": r.annual_savings_inr,
            "estimated_co2_reduction_annual_kg": r.estimated_co2_reduction_annual_kg,
            "payback_period_years": r.payback_period_years,
            "feasibility": r.feasibility,
            "operational_disruption": r.operational_disruption
        })

    return APIResponse(success=True, data=results)


@router.get("/{intervention_id}", response_model=APIResponse[dict])
def get_intervention_detail(
    intervention_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full engineering model and reference provenance for a specific intervention."""
    rec = db.query(Recommendation).filter(Recommendation.id == intervention_id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intervention '{intervention_id}' not found."
        )

    return APIResponse(
        success=True,
        data={
            "id": rec.id,
            "title": rec.title,
            "description": rec.description,
            "target_process": rec.target_process,
            "target_equipment": rec.target_equipment,
            "intervention_type": rec.intervention_type,
            "intervention_category": rec.intervention_category,
            "supported_sectors": rec.supported_sectors,
            "supported_processes": rec.supported_processes,
            "supported_equipment": rec.supported_equipment,
            "applicable_problem_types": rec.applicable_problem_types,
            "required_telemetry": rec.required_telemetry,
            "optional_telemetry": rec.optional_telemetry,
            "contraindications": rec.contraindications,
            "implementation_constraints": rec.implementation_constraints,
            "capex_model": rec.capex_model,
            "opex_model": rec.opex_model,
            "savings_model": rec.savings_model,
            "carbon_reduction_model": rec.carbon_reduction_model,
            "reference_type": rec.reference_type,
            "reference_title": rec.reference_title,
            "reference_organization": rec.reference_organization,
            "reference_url_or_document": rec.reference_url_or_document,
            "reference_year": rec.reference_year,
            "reference_parameter": rec.reference_parameter,
            "reference_parameter_range": rec.reference_parameter_range,
            "reference_applicability_notes": rec.reference_applicability_notes,
            "implementation_complexity": rec.implementation_complexity,
            "operational_disruption": rec.operational_disruption,
            "risk_level": rec.risk_level,
            "feasibility": rec.feasibility
        }
    )


@router.post("/compare", response_model=APIResponse[RecommendationComparisonResponse])
def compare_interventions_catalog(
    request: RecommendationComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Side-by-side comparative analysis of multiple interventions."""
    try:
        resp = InterventionRecommendationService.compare_interventions(
            db=db,
            intervention_ids=request.intervention_ids,
            context=request.decision_context
        )
        return APIResponse(success=True, data=resp)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
