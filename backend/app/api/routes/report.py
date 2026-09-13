import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import sanitize_filename, get_current_user, get_authorized_facility_id
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportGenerateResponse
from app.schemas.common import APIResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/report", tags=["Report"])


@router.post("/generate", response_model=APIResponse[ReportGenerateResponse])
def generate_audit_report(
    request: ReportGenerateRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a downloadable executive PDF carbon audit report (multi-tenancy protected)."""
    target_id = get_authorized_facility_id(request.facility_id, current_user)
    try:
        report_meta = ReportService.generate_pdf_report(db=db, facility_id=target_id)
        return APIResponse(success=True, data=ReportGenerateResponse(**report_meta))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PDF report generation failed: {str(e)}")


@router.get("/preview/{filename}")
def preview_pdf_report(filename: str):
    """View the generated PDF audit report inline in browser/iframe without downloading."""
    clean_name = sanitize_filename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, clean_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found.")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        content_disposition_type="inline",
        filename=clean_name
    )


@router.get("/download/{filename}")
def download_pdf_report(filename: str, inline: bool = False):
    """Download the generated PDF audit report (or view inline if inline=True)."""
    clean_name = sanitize_filename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, clean_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found.")

    disp_type = "inline" if inline else "attachment"
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        content_disposition_type=disp_type,
        filename=clean_name
    )
