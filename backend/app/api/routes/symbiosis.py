from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.models.symbiosis_stream import SymbiosisStream
from app.schemas.common import APIResponse
from app.services.symbiosis_service import SymbiosisService

router = APIRouter(prefix="/symbiosis", tags=["Industrial Symbiosis"])


@router.get("/{facility_id}", response_model=APIResponse[Dict[str, Any]])
def get_facility_symbiosis(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get industrial symbiosis analysis, by-product streams, and regional
    circular economy off-taker matches for the facility.
    """
    target_id = get_authorized_facility_id(facility_id, current_user)
    data = SymbiosisService.get_facility_symbiosis(db, target_id)
    return APIResponse(success=True, data=data)


@router.post("/{facility_id}/stream", response_model=APIResponse[Dict[str, Any]])
def add_custom_byproduct_stream(
    facility_id: int,
    payload: Dict[str, Any],
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List a new industrial waste / by-product stream for sale or off-take.
    """
    target_id = get_authorized_facility_id(facility_id, current_user)
    new_stream = SymbiosisService.add_custom_stream(db, target_id, payload)
    return APIResponse(success=True, data=new_stream)


@router.delete("/{facility_id}/stream/{stream_id}", response_model=APIResponse[Dict[str, Any]])
def delete_custom_stream(
    facility_id: int,
    stream_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a user-registered custom by-product stream.
    """
    target_id = get_authorized_facility_id(facility_id, current_user)
    stream = db.query(SymbiosisStream).filter(
        SymbiosisStream.id == stream_id,
        SymbiosisStream.facility_id == target_id
    ).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Custom by-product stream not found.")
    db.delete(stream)
    db.commit()
    return APIResponse(success=True, data={"deleted_id": stream_id, "message": "Stream removed successfully."})

