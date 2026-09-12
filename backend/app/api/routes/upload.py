import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    validate_dataset_extension,
    get_current_user,
    get_authorized_facility_id,
    sanitize_filename
)
from app.models.user import User
from app.schemas.upload import UploadSummaryResponse, InspectResponse
from app.schemas.common import APIResponse
from app.services.csv_service import CSVService

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/inspect", response_model=APIResponse[InspectResponse])
async def inspect_industrial_dataset(
    file: UploadFile = File(..., description="Industrial telemetry CSV or XLSX file"),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Inspect spreadsheet headers, detect column mapping matches, and return preview rows.
    Does not modify database records.
    """
    filename = sanitize_filename(file.filename or "telemetry.csv")
    if not validate_dataset_extension(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only .csv, .xlsx, and .xls spreadsheets are accepted."
        )

    try:
        content = await file.read()
        inspection = CSVService.inspect_file(content, filename)
        return APIResponse(success=True, data=InspectResponse(**inspection))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to parse dataset headers: {str(e)}"
        )


@router.post("/csv", response_model=APIResponse[UploadSummaryResponse])
@router.post("/process", response_model=APIResponse[UploadSummaryResponse])
async def upload_industrial_dataset(
    facility_id: Optional[int] = Form(None, description="Target facility ID"),
    mapping: Optional[str] = Form(None, description="JSON string with custom column mappings"),
    file: UploadFile = File(..., description="Industrial time-series CSV or XLSX file"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest, remap, validate, compute emissions, calculate dynamic data quality,
    and persist telemetry into PostgreSQL.
    """
    filename = sanitize_filename(file.filename or "telemetry.csv")
    if not validate_dataset_extension(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please provide a valid .csv or .xlsx telemetry dataset."
        )

    # Multi-tenancy resolution: user cannot inject another user's facility
    target_facility_id = get_authorized_facility_id(facility_id, current_user)

    custom_mapping = None
    if mapping:
        try:
            custom_mapping = json.loads(mapping)
        except Exception:
            pass

    try:
        content = await file.read()
        summary = CSVService.process_csv_upload(
            db=db,
            facility_id=target_facility_id,
            file_content=content,
            filename=filename,
            user_id=current_user.id if current_user else None,
            custom_mapping=custom_mapping
        )
        return APIResponse(success=True, data=UploadSummaryResponse(**summary))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Telemetry ingestion pipeline error: {str(e)}"
        )
