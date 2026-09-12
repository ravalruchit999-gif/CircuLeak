from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.audit import AuditSummaryRequest, AuditSummaryResponse
from app.schemas.common import APIResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.post("/summary", response_model=APIResponse[AuditSummaryResponse])
def generate_audit_summary(request: AuditSummaryRequest, db: Session = Depends(get_db)):
    """
    Generate an Executive Audit Summary (AI Audit Intelligence).
    The pipeline processes deterministic verified numbers and synthesizes an executive narrative.
    The LLM never calculates emissions or ROI; it strictly interprets verified results.
    """
    try:
        data = AuditService.generate_audit_summary(db=db, facility_id=request.facility_id)
        return APIResponse(success=True, data=AuditSummaryResponse(**data))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Audit generation failed: {str(e)}")
