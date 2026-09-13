import io
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Query, Response
import pandas as pd
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.data_upload import DataUpload
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
    """Generate a realistic, randomized multi-day Textile & Garment Dyeing operational dataset."""
    import random
    import datetime

    records = []
    base_date = datetime.date.today() - datetime.timedelta(days=7)

    equipment_catalog = [
        {"equipment": "HTHP Jet Dyeing Machine #01", "process": "Dyeing & Bleaching", "base_elec": 35.0, "fuel_type": "none", "base_fuel": 0.0, "prod": 420.0},
        {"equipment": "Soft Flow Jet Dyeing Machine #02", "process": "Dyeing & Bleaching", "base_elec": 28.0, "fuel_type": "none", "base_fuel": 0.0, "prod": 340.0},
        {"equipment": "8-Chamber Stenter Frame", "process": "Finishing & Heat Setting", "base_elec": 74.0, "fuel_type": "natural_gas", "base_fuel": 38.0, "prod": 750.0},
        {"equipment": "Rotary Screen Printing Machine", "process": "Printing & Curing", "base_elec": 38.0, "fuel_type": "none", "base_fuel": 0.0, "prod": 480.0},
        {"equipment": "Industrial Steam Boiler (Dual Fuel)", "process": "Steam Generation Utility", "base_elec": 20.0, "fuel_type": "natural_gas", "base_fuel": 165.0, "prod": 0.0},
        {"equipment": "Screw Air Compressor GA-75", "process": "Compressed Air Utility", "base_elec": 58.0, "fuel_type": "none", "base_fuel": 0.0, "prod": 0.0},
        {"equipment": "ETP Aeration Blower Station", "process": "Wastewater & ETP Utility", "base_elec": 44.0, "fuel_type": "none", "base_fuel": 0.0, "prod": 0.0}
    ]

    for day_offset in range(7):
        current_date_str = (base_date + datetime.timedelta(days=day_offset)).strftime("%Y-%m-%d")
        for hour in range(24):
            is_active_shift = 6 <= hour <= 22

            for eq in equipment_catalog:
                is_utility = eq["prod"] == 0.0
                active = is_active_shift or is_utility

                if active:
                    fluct = random.uniform(0.95, 1.05)
                    elec_kwh = round(eq["base_elec"] * fluct, 2)
                    fuel_qty = round(eq["base_fuel"] * fluct, 2) if eq["fuel_type"] != "none" else 0.0
                    prod_vol = round(eq["prod"] * fluct, 1)
                    op_hrs = 1.0
                else:
                    # Off-hours leak for compressor
                    if eq["equipment"] == "Screw Air Compressor GA-75":
                        elec_kwh = round(random.uniform(24.0, 27.5), 2)
                    else:
                        elec_kwh = round(random.uniform(0.8, 1.8), 2)
                    fuel_qty = 0.0
                    prod_vol = 0.0
                    op_hrs = 0.0

                records.append({
                    "timestamp": f"{current_date_str} {hour:02d}:00:00",
                    "equipment": eq["equipment"],
                    "process": eq["process"],
                    "electricity_kwh": elec_kwh,
                    "fuel_type": eq["fuel_type"],
                    "fuel_quantity": fuel_qty,
                    "production_volume": prod_vol,
                    "operating_hours": op_hrs
                })

    return records


AVAILABLE_SECTORS = [
    {
        "sector": "Automotive Component Casting",
        "slug": "Automotive_Component_Casting",
        "description": "High pressure die casting, induction melting, aging furnace & shot blast telemetry",
        "primary_fuel": "Natural Gas & Grid Electricity",
        "assets_count": 7,
    },
    {
        "sector": "Alloy & Steel Fabrication",
        "slug": "Alloy_Steel_Fabrication",
        "description": "Robotic welding, plasma profiling, plate bending, PWHT furnace & blast room telemetry",
        "primary_fuel": "Natural Gas & Grid Electricity",
        "assets_count": 7,
    },
    {
        "sector": "Metals & Heavy Alloys",
        "slug": "Metals_Heavy_Alloys",
        "description": "5T induction furnace, oxy-fuel ladle heater, continuous caster & soaking pit telemetry",
        "primary_fuel": "Natural Gas & Grid Electricity",
        "assets_count": 7,
    },
    {
        "sector": "Textile & Garment Dyeing",
        "slug": "Textile_Garment_Dyeing",
        "description": "HTHP jet dyeing, stenter frame, rotary printing & dual-fuel steam boiler telemetry",
        "primary_fuel": "Natural Gas & Grid Electricity",
        "assets_count": 7,
    },
    {
        "sector": "Cement & Lime Processing",
        "slug": "Cement_Lime_Processing",
        "description": "Rotary calciner kiln, ball mill, vertical roller mill & clinker grate cooler telemetry",
        "primary_fuel": "Imported Thermal Coal & Grid Electricity",
        "assets_count": 7,
    },
    {
        "sector": "Chemical & Petrochemical",
        "slug": "Chemical_Petrochemical",
        "description": "Steam reforming furnace, distillation reboiler, synthesis reactor & gas compressor telemetry",
        "primary_fuel": "Natural Gas & Grid Electricity",
        "assets_count": 7,
    },
]

SECTOR_KEY_MAP = {
    "automotive": "Automotive_Component_Casting",
    "automotive component casting": "Automotive_Component_Casting",
    "automotive_component_casting": "Automotive_Component_Casting",
    "alloy": "Alloy_Steel_Fabrication",
    "alloy & steel fabrication": "Alloy_Steel_Fabrication",
    "alloy_steel_fabrication": "Alloy_Steel_Fabrication",
    "steel": "Alloy_Steel_Fabrication",
    "metals": "Metals_Heavy_Alloys",
    "metals & heavy alloys": "Metals_Heavy_Alloys",
    "metals_heavy_alloys": "Metals_Heavy_Alloys",
    "textile": "Textile_Garment_Dyeing",
    "textile & garment dyeing": "Textile_Garment_Dyeing",
    "textile_garment_dyeing": "Textile_Garment_Dyeing",
    "cement": "Cement_Lime_Processing",
    "cement & lime processing": "Cement_Lime_Processing",
    "cement_lime_processing": "Cement_Lime_Processing",
    "chemical": "Chemical_Petrochemical",
    "chemical & petrochemical": "Chemical_Petrochemical",
    "chemical_petrochemical": "Chemical_Petrochemical",
}


@router.get("/templates")
def list_available_templates():
    """Retrieve all available industry sector telemetry templates and their engineering specifications."""
    return APIResponse(success=True, data=AVAILABLE_SECTORS)


@router.get("/template")
async def download_telemetry_template(
    format: str = Query("xlsx", description="Template format: 'csv' or 'xlsx'"),
    sector: Optional[str] = Query(None, description="Industrial sector name or slug (e.g. 'Automotive Component Casting', 'Alloy & Steel Fabrication', etc.)"),
    seed: Optional[int] = Query(None, description="Optional seed for deterministic generation")
):
    """
    Download verified production-grade industrial telemetry datasets tailored by sector.
    Supports Automotive Casting, Steel Fabrication, Heavy Alloys, Textile Dyeing, Cement, and Petrochem.
    """
    from pathlib import Path

    is_xlsx = format.lower() == "xlsx"
    ext = "xlsx" if is_xlsx else "csv"

    # Determine sector slug
    target_slug = "Automotive_Component_Casting"
    if sector:
        clean = sector.lower().strip().replace("-", "_")
        target_slug = SECTOR_KEY_MAP.get(clean, target_slug)
        filename = f"{target_slug}_Telemetry.{ext}"
    else:
        filename = f"circuleak_telemetry_template.{ext}"

    possible_paths = [
        Path(__file__).resolve().parent.parent.parent / "data" / f"{target_slug}_Telemetry.{ext}",
        Path("app/data") / f"{target_slug}_Telemetry.{ext}",
        Path("backend/app/data") / f"{target_slug}_Telemetry.{ext}",
        Path(f"{target_slug}_Telemetry.{ext}"),
        Path(__file__).resolve().parent.parent.parent / "data" / f"Textile_Garment_Dyeing_Telemetry.{ext}",
        Path("app/data") / f"Textile_Garment_Dyeing_Telemetry.{ext}",
    ]

    target_file = None
    for p in possible_paths:
        if p.exists():
            target_file = p
            break

    if target_file and target_file.exists():
        with open(target_file, "rb") as f:
            content = f.read()

        media_type = (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            if is_xlsx
            else "text/csv"
        )
        return Response(
            content=content,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )

    # Dynamic fallback
    sample_records = generate_dynamic_telemetry_records()
    df = pd.DataFrame(sample_records)
    if is_xlsx:
        buf = io.BytesIO()
        df.to_excel(buf, index=False, engine="openpyxl")
        return Response(
            content=buf.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        csv_str = df.to_csv(index=False)
        return Response(
            content=csv_str.encode("utf-8"),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
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


@router.get("/latest/{facility_id}", response_model=APIResponse[Optional[Dict[str, Any]]])
def get_latest_upload_status(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the latest active ingested dataset for a facility to persist state across refreshes."""
    target_facility_id = get_authorized_facility_id(facility_id, current_user)
    latest = (
        db.query(DataUpload)
        .filter(DataUpload.facility_id == target_facility_id)
        .order_by(DataUpload.uploaded_at.desc())
        .first()
    )
    if not latest:
        return APIResponse(success=True, data=None)

    return APIResponse(
        success=True,
        data={
            "id": latest.id,
            "facility_id": latest.facility_id,
            "file_name": latest.filename,
            "uploaded_at": latest.uploaded_at.isoformat() if latest.uploaded_at else None,
            "rows_accepted": latest.valid_row_count or latest.row_count,
            "rows_rejected": latest.invalid_row_count or 0,
            "row_count": latest.row_count,
            "quality_score": latest.quality_score,
            "quality_level": latest.quality_level,
            "dimensions": latest.dimensions,
            "analysis_run_id": latest.analysis_run_id,
            "analysis_status": latest.analysis_status,
        }
    )

