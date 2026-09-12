import io
import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Query, Response
import pandas as pd
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


@router.get("/template")
async def download_telemetry_template(
    format: str = Query("csv", description="Template format: 'csv' or 'xlsx'")
):
    """
    Download a sample industrial telemetry dataset template with the exact
    canonical columns required by the ingestion pipeline.
    """
    sample_records = [
        {"date": "2026-03-01", "hour": 0, "equipment": "Primary Air Compressor", "process": "Compressed Air Utility", "electricity_kwh": 52.4, "fuel_type": "none", "fuel_quantity": 0.0, "production_volume": 18.5, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 1, "equipment": "Primary Air Compressor", "process": "Compressed Air Utility", "electricity_kwh": 51.8, "fuel_type": "none", "fuel_quantity": 0.0, "production_volume": 18.0, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 2, "equipment": "Primary Air Compressor", "process": "Compressed Air Utility", "electricity_kwh": 53.1, "fuel_type": "none", "fuel_quantity": 0.0, "production_volume": 17.8, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 3, "equipment": "Induction Melting Furnace", "process": "Melting & Casting", "electricity_kwh": 420.5, "fuel_type": "natural_gas", "fuel_quantity": 35.0, "production_volume": 24.0, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 4, "equipment": "Induction Melting Furnace", "process": "Melting & Casting", "electricity_kwh": 435.0, "fuel_type": "natural_gas", "fuel_quantity": 36.2, "production_volume": 25.0, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 5, "equipment": "Annealing Heat-Treat Oven", "process": "Thermal Processing", "electricity_kwh": 180.2, "fuel_type": "natural_gas", "fuel_quantity": 18.5, "production_volume": 15.0, "operating_hours": 1.0},
        {"date": "2026-03-01", "hour": 6, "equipment": "Auxiliary Cooling Pumps", "process": "Cooling Water Loop", "electricity_kwh": 38.4, "fuel_type": "none", "fuel_quantity": 0.0, "production_volume": 20.0, "operating_hours": 1.0},
    ]
    df = pd.DataFrame(sample_records)

    if format.lower() == "xlsx":
        buf = io.BytesIO()
        df.to_excel(buf, index=False, engine="openpyxl")
        return Response(
            content=buf.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="circuleak_telemetry_template.xlsx"'}
        )
    else:
        csv_str = df.to_csv(index=False)
        return Response(
            content=csv_str.encode("utf-8"),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="circuleak_telemetry_template.csv"'}
        )


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
