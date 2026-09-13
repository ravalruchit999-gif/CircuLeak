from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditSummaryRequest, AuditSummaryResponse
from app.schemas.common import APIResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs", response_model=APIResponse[List[Dict[str, Any]]])
def get_facility_audit_logs(
    facility_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve platform audit logs scoped by facility.
    For non-admin users:
    - client-provided facility_id differing from current_user.facility_id is rejected with HTTP 403.
    - if facility_id is omitted, it is automatically scoped to current_user.facility_id.
    For admin users:
    - explicit facility filtering is permitted.
    """
    if current_user.role != "admin":
        if not current_user.facility_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "No facility assigned to authenticated user."}
            )
        if facility_id is not None and facility_id != current_user.facility_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Unauthorized: Cannot access audit logs of another facility."}
            )
        target_id = current_user.facility_id
    else:
        target_id = facility_id

    query = db.query(AuditLog)
    if target_id is not None:
        query = query.filter(
            (AuditLog.resource_id == str(target_id)) & (AuditLog.resource == "facility")
        )

    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    results = [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user_email,
            "action": l.action,
            "resource": l.resource,
            "resource_id": l.resource_id,
            "details": l.details,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S") if l.timestamp else "-"
        }
        for l in logs
    ]
    return APIResponse(success=True, data=results)


@router.post("/summary", response_model=APIResponse[AuditSummaryResponse])
def generate_audit_summary_post(
    request: AuditSummaryRequest,
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
