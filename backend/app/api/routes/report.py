import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import sanitize_filename
from app.schemas.report import ReportGenerateRequest, ReportGenerateResponse
from app.schemas.common import APIResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/report", tags=["Report"])


@router.post("/generate", response_model=APIResponse[ReportGenerateResponse])
def generate_audit_report(request: ReportGenerateRequest, db: Session = Depends(get_db)):
    """Generate a downloadable executive PDF carbon audit report (12 formal sections)."""
    try:
        report_meta = ReportService.generate_pdf_report(db=db, facility_id=request.facility_id)
        return APIResponse(success=True, data=ReportGenerateResponse(**report_meta))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PDF report generation failed: {str(e)}")


@router.get("/download/{filename}")
def download_pdf_report(filename: str):
    """Download the generated PDF audit report."""
    clean_name = sanitize_filename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, clean_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found.")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=clean_name
    )
