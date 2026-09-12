from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.simulation import (
    WhatIfRequest,
    WhatIfResponse,
    ScenarioRequest,
    ScenarioResponse
)
from app.schemas.common import APIResponse
from app.services.simulation_service import SimulationService
from app.utils.facility_resolver import resolve_facility_id

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post("/what-if", response_model=APIResponse[WhatIfResponse])
def run_what_if_simulation(request: WhatIfRequest, db: Session = Depends(get_db)):
    """
    Run deterministic What-If simulation for a selected set of circular interventions.
    Computes emissions reduction, capital investment, annual savings, and payback period.
    """
    try:
        fac_id = resolve_facility_id(request.facility_id, db)
        result = SimulationService.simulate_what_if(
            db=db,
            facility_id=fac_id,
            intervention_ids=request.intervention_ids
        )
        return APIResponse(success=True, data=WhatIfResponse(**result))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.get("/scenarios", response_model=APIResponse[ScenarioResponse])
def get_scenarios(facility_id: str = Query(default="1"), db: Session = Depends(get_db)):
    """
    Get predefined decarbonization scenarios for the facility:
    'Cost Saver', 'Balanced', and 'Maximum Decarbonization'.
    """
    try:
        fac_id = resolve_facility_id(facility_id, db)
        result = SimulationService.compare_scenarios(db=db, facility_id=fac_id)
        return APIResponse(success=True, data=ScenarioResponse(**result))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))


@router.post("/scenarios", response_model=APIResponse[ScenarioResponse])
def compare_scenarios_post(request: ScenarioRequest, db: Session = Depends(get_db)):
    """
    Generate and compare three predefined decarbonization scenarios via POST.
    """
    try:
        fac_id = resolve_facility_id(request.facility_id, db)
        result = SimulationService.compare_scenarios(db=db, facility_id=fac_id)
        return APIResponse(success=True, data=ScenarioResponse(**result))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))

