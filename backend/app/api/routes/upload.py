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
from app.schemas.upload import UploadSummaryResponse, InspectResponse
from app.schemas.common import APIResponse
from app.schemas.telemetry_contract import TelemetryContractValidationError
from app.services.csv_service import CSVService

router = APIRouter(prefix="/upload", tags=["Upload"])


def generate_dynamic_telemetry_records() -> List[dict]:
    """Generate a realistic, randomized multi-day industrial operational dataset."""
    import random
    import datetime

    records = []
    base_date = datetime.date.today() - datetime.timedelta(days=3)

    # 4 distinct industrial machines across 3 days (72 hours)
    for day_offset in range(3):
        current_date_str = (base_date + datetime.timedelta(days=day_offset)).strftime("%Y-%m-%d")
        for hour in range(24):
            is_active_shift = 7 <= hour <= 21

            # 1. Primary Air Compressor (Has unloader leak: draws 32-38 kWh during off-shift)
            if is_active_shift:
                comp_kwh = round(random.uniform(49.0, 56.5), 2)
                comp_prod = round(random.uniform(18.0, 24.0), 1)
                comp_hrs = 1.0
            else:
                # Off-hours leak: non-zero power with zero production
                comp_kwh = round(random.uniform(33.0, 39.5), 2)
                comp_prod = 0.0
                comp_hrs = 0.0

            records.append({
                "date": current_date_str,
                "hour": hour,
                "equipment": "Primary Air Compressor",
                "process": "Compressed Air Utility",
                "electricity_kwh": comp_kwh,
                "fuel_type": "none",
                "fuel_quantity": 0.0,
                "production_volume": comp_prod,
                "operating_hours": comp_hrs
            })

            # 2. Induction Melting Furnace (Core heavy thermal/electrical asset)
            if is_active_shift:
                furn_kwh = round(random.uniform(390.0, 465.0), 2)
                furn_fuel = round(random.uniform(32.0, 42.0), 2)
                furn_prod = round(random.uniform(22.0, 28.5), 1)
                furn_hrs = 1.0
            else:
                furn_kwh = round(random.uniform(18.0, 26.0), 2)
                furn_fuel = round(random.uniform(5.0, 9.5), 2)
                furn_prod = 0.0
                furn_hrs = 0.0

            records.append({
                "date": current_date_str,
                "hour": hour,
                "equipment": "Induction Melting Furnace",
                "process": "Melting & Casting",
                "electricity_kwh": furn_kwh,
                "fuel_type": "natural_gas",
                "fuel_quantity": furn_fuel,
                "production_volume": furn_prod,
                "operating_hours": furn_hrs
            })

            # 3. Annealing Heat-Treat Oven (Thermal processing)
            if 8 <= hour <= 20:
                oven_kwh = round(random.uniform(165.0, 210.0), 2)
                oven_fuel = round(random.uniform(15.5, 22.0), 2)
                oven_prod = round(random.uniform(14.0, 19.5), 1)
                oven_hrs = 1.0
            else:
                oven_kwh = round(random.uniform(6.0, 12.0), 2)
                oven_fuel = round(random.uniform(1.0, 3.5), 2)
                oven_prod = 0.0
                oven_hrs = 0.0

            records.append({
                "date": current_date_str,
                "hour": hour,
                "equipment": "Annealing Heat-Treat Oven",
                "process": "Thermal Processing",
                "electricity_kwh": oven_kwh,
                "fuel_type": "natural_gas",
                "fuel_quantity": oven_fuel,
                "production_volume": oven_prod,
                "operating_hours": oven_hrs
            })

            # 4. Auxiliary Cooling Pumps (Continuous water loop)
            pump_kwh = round(random.uniform(34.0, 42.0), 2)
            pump_prod = round(random.uniform(18.0, 22.0), 1) if is_active_shift else 0.0
            records.append({
                "date": current_date_str,
                "hour": hour,
                "equipment": "Auxiliary Cooling Pumps",
                "process": "Cooling Water Loop",
                "electricity_kwh": pump_kwh,
                "fuel_type": "none",
                "fuel_quantity": 0.0,
                "production_volume": pump_prod,
                "operating_hours": 1.0 if is_active_shift else 0.5
            })

    return records


@router.get("/template")
async def download_telemetry_template(
    format: str = Query("csv", description="Template format: 'csv' or 'xlsx'"),
    seed: Optional[int] = Query(None, description="Optional seed for deterministic generation")
):
    """
    Download a rich, dynamic multi-day industrial telemetry dataset with 72+ hourly rows.
    Generates fresh randomized values on every request with realistic anomalies embedded.
    """
    sample_records = generate_dynamic_telemetry_records()
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
    current_user: User = Depends(get_current_user)
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
    current_user: User = Depends(get_current_user),
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
            user_id=current_user.id,
            custom_mapping=custom_mapping
        )
        return APIResponse(success=True, data=UploadSummaryResponse(**summary))
    except TelemetryContractValidationError as tve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": tve.message,
                "missing_fields": tve.missing_fields,
                "details": tve.details
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Telemetry ingestion pipeline error: {str(e)}"
        )
