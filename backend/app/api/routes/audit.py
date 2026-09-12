from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.audit import AuditSummaryRequest, AuditSummaryResponse
from app.schemas.common import APIResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.post("/summary", response_model=APIResponse[AuditSummaryResponse])
def generate_audit_summary_post(
    request: AuditSummaryRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate Executive Audit Summary memorandum for requested facility."""
    target_id = get_authorized_facility_id(request.facility_id, current_user)
    try:
        data = AuditService.generate_audit_summary(db=db, facility_id=target_id)
        return APIResponse(success=True, data=AuditSummaryResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Audit generation failed: {str(e)}")


@router.get("/summary/{facility_id}", response_model=APIResponse[AuditSummaryResponse])
def generate_audit_summary_get(
    facility_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """GET endpoint for Executive Audit Summary memorandum."""
    target_id = get_authorized_facility_id(facility_id, current_user)
    try:
        data = AuditService.generate_audit_summary(db=db, facility_id=target_id)
        return APIResponse(success=True, data=AuditSummaryResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Audit generation failed: {str(e)}")
