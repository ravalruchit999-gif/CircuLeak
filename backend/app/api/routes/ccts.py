from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.common import APIResponse
from app.services.ccts_service import CCTSService

router = APIRouter(prefix="/ccts", tags=["BEE Carbon Credit Trading Scheme"])


class CCTSMonetizeRequest(BaseModel):
    facility_id: int = Field(..., json_schema_extra={"example": 1})
    abatement_tonnes: float = Field(..., json_schema_extra={"example": 150.0})
    investment_inr: float = Field(default=0.0)
    annual_savings_inr: float = Field(default=0.0)
    carbon_price_inr: float = Field(default=1850.0)


@router.get("/{facility_id}", response_model=APIResponse[Dict[str, Any]])
def get_facility_ccts_status(
    facility_id: int,
    carbon_price_inr: float = Query(1850.0, ge=500.0, le=5000.0, description="Indian Carbon Market benchmark price in INR per CCC"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve facility emission intensity against BEE CCTS Designated Consumer baseline,
    surplus/deficit compliance standing, and tradable CCC asset valuation.
    """
    target_id = get_authorized_facility_id(facility_id, current_user)
    status_data = CCTSService.get_facility_ccts_status(db, target_id, carbon_price_inr)
    return APIResponse(success=True, data=status_data)


@router.post("/monetize", response_model=APIResponse[Dict[str, Any]])
def monetize_abatement(
    payload: CCTSMonetizeRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate accelerated financial payback and tradable CCC revenue
    for a customized physical decarbonization abatement scenario.
    """
    target_id = get_authorized_facility_id(payload.facility_id, current_user)
    base_status = CCTSService.get_facility_ccts_status(db, target_id, payload.carbon_price_inr)

    impact = CCTSService.calculate_monetization_impact(
        abatement_tonnes=payload.abatement_tonnes,
        investment_inr=payload.investment_inr,
        annual_savings_inr=payload.annual_savings_inr,
        actual_intensity=base_status.get("actual_intensity_tco2_per_tonne", 1.0),
        target_intensity=base_status.get("target_intensity_tco2_per_tonne", 0.82),
        prod_volume=base_status.get("production_volume_tonnes", 1000.0),
        carbon_price_inr=payload.carbon_price_inr
    )
    return APIResponse(success=True, data={**base_status, "simulation_impact": impact})
