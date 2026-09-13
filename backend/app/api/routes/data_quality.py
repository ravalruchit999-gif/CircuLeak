from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, get_authorized_facility_id
from app.models.user import User
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.data_upload import DataUpload
from app.services.data_quality_service import DataQualityService
from app.services.emission_service import EmissionService
from app.schemas.common import APIResponse

router = APIRouter(prefix="/data-quality", tags=["Data Quality Governance"])


@router.get("/overview", response_model=APIResponse[Dict[str, Any]])
def get_data_quality_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve platform-wide or facility-scoped data quality statistics.
    Admin sees all facilities; non-admin sees their own facility cohort.
    """
    if current_user.role == "admin":
        facilities = db.query(Facility).all()
    elif current_user.facility_id:
        facilities = db.query(Facility).filter(Facility.id == current_user.facility_id).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "No facility assigned to authenticated user."}
        )

    facilities_quality = []
    total_scores = []
    high_count = 0
    good_count = 0
    incomplete_count = 0
    needs_attn_count = 0

    for f in facilities:
        # Check latest upload record
        latest_upload = (
            db.query(DataUpload)
            .filter(DataUpload.facility_id == f.id)
            .order_by(DataUpload.uploaded_at.desc())
            .first()
        )

        if latest_upload and latest_upload.quality_score is not None:
            score = float(latest_upload.quality_score)
            level = latest_upload.quality_level or "incomplete"
            row_cnt = latest_upload.valid_row_count or latest_upload.row_count
            dims = latest_upload.dimensions or {}
            warns = latest_upload.warnings or []
            last_dt = latest_upload.uploaded_at.strftime("%Y-%m-%d %H:%M") if latest_upload.uploaded_at else "-"
        else:
            # Evaluate directly from process_data if exists
            df = EmissionService.get_emissions_dataframe(db, f.id)
            eval_res = DataQualityService.evaluate_dataframe_quality(df)
            score = eval_res["confidence_score"]
            level = eval_res["quality_level"]
            row_cnt = len(df)
            dims = eval_res["dimensions"]
            warns = eval_res["warnings"]
            last_dt = "-"

        total_scores.append(score)
        if level == "high":
            high_count += 1
        elif level == "good":
            good_count += 1
        elif level == "incomplete":
            incomplete_count += 1
        else:
            needs_attn_count += 1

        facilities_quality.append({
            "facility_id": f.id,
            "facility_name": f.business_name,
            "sector": f.sector,
            "confidence_score": score,
            "quality_level": level,
            "dimensions": dims,
            "warnings": warns,
            "row_count": row_cnt,
            "last_upload": last_dt
        })

    avg_confidence = round(sum(total_scores) / max(1, len(total_scores)), 1) if total_scores else 0.0

    return APIResponse(
        success=True,
        data={
            "total_facilities_assessed": len(facilities_quality),
            "average_confidence": avg_confidence,
            "high_quality_count": high_count,
            "good_quality_count": good_count,
            "incomplete_count": incomplete_count,
            "needs_attention_count": needs_attn_count,
            "facilities": facilities_quality
        }
    )


@router.get("/facility/{facility_id}", response_model=APIResponse[Dict[str, Any]])
def get_facility_data_quality(
    facility_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve fine-grained data quality evaluation for a specific industrial facility.
    Multi-tenancy enforced.
    """
    authorized_id = get_authorized_facility_id(facility_id, current_user)
    facility = db.query(Facility).filter(Facility.id == authorized_id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Facility {authorized_id} not found.")

    latest_upload = (
        db.query(DataUpload)
        .filter(DataUpload.facility_id == authorized_id)
        .order_by(DataUpload.uploaded_at.desc())
        .first()
    )

    df = EmissionService.get_emissions_dataframe(db, authorized_id)
    eval_res = DataQualityService.evaluate_dataframe_quality(df)

    # Use upload record stats if newer or available
    confidence_score = latest_upload.quality_score if (latest_upload and latest_upload.quality_score is not None) else eval_res["confidence_score"]
    quality_level = latest_upload.quality_level if (latest_upload and latest_upload.quality_level) else eval_res["quality_level"]
    dimensions = latest_upload.dimensions if (latest_upload and latest_upload.dimensions) else eval_res["dimensions"]
    warnings = latest_upload.warnings if (latest_upload and latest_upload.warnings) else eval_res["warnings"]

    return APIResponse(
        success=True,
        data={
            "facility_id": facility.id,
            "facility_name": facility.business_name,
            "sector": facility.sector,
            "confidence_score": confidence_score,
            "quality_level": quality_level,
            "dimensions": dimensions,
            "warnings": warnings,
            "row_count": len(df),
            "has_data": len(df) > 0,
            "last_upload": {
                "filename": latest_upload.filename if latest_upload else None,
                "uploaded_at": latest_upload.uploaded_at.strftime("%Y-%m-%d %H:%M") if (latest_upload and latest_upload.uploaded_at) else None,
                "valid_row_count": latest_upload.valid_row_count if latest_upload else len(df),
                "invalid_row_count": latest_upload.invalid_row_count if latest_upload else 0,
                "analysis_status": latest_upload.analysis_status if latest_upload else ("completed" if len(df) > 0 else "no_data")
            }
        }
    )
