from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, require_admin_user
from app.models.user import User
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.leak import Leak
from app.models.emission_factor import EmissionFactor
from app.models.benchmark import Benchmark
from app.models.data_upload import DataUpload
from app.models.audit_log import AuditLog
from app.schemas.common import APIResponse

router = APIRouter(prefix="/admin", tags=["Admin Governance"])


class EmissionFactorCreate(BaseModel):
    source_name: str
    factor_value: float
    unit: str
    reference: str
    is_active: bool = True


class BenchmarkCreate(BaseModel):
    sector: str
    average_emission_intensity: float
    median_emission_intensity: float
    best_in_class_intensity: float
    ccts_threshold: float
    unit: str = "kgCO2e/unit"
    sample_size: int = 50


@router.get("/stats", response_model=APIResponse[Dict[str, Any]])
def get_system_governance_stats(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve overall platform statistics across all facilities and users (admin only)."""
    total_facilities = db.query(func.count(Facility.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_telemetry_rows = db.query(func.count(ProcessData.id)).scalar() or 0
    total_leaks_flagged = db.query(func.count(Leak.id)).scalar() or 0
    total_uploads = db.query(func.count(DataUpload.id)).scalar() or 0

    return APIResponse(
        success=True,
        data={
            "total_facilities": total_facilities,
            "total_users": total_users,
            "total_telemetry_rows": total_telemetry_rows,
            "total_leaks_flagged": total_leaks_flagged,
            "total_uploads": total_uploads,
            "system_health": "Optimal",
            "active_database": "PostgreSQL 17",
            "ccts_standards_version": "BEE-India-2025.2"
        }
    )


@router.get("/facilities", response_model=APIResponse[List[Dict[str, Any]]])
def get_all_facilities_overview(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """List all registered manufacturing facilities with telemetry counts (admin only)."""
    facilities = db.query(Facility).all()
    results = []
    for f in facilities:
        row_count = db.query(func.count(ProcessData.id)).filter(ProcessData.facility_id == f.id).scalar() or 0
        leak_count = db.query(func.count(Leak.id)).filter(Leak.facility_id == f.id).scalar() or 0
        owner = db.query(User).filter(User.facility_id == f.id).first()
        latest_up = db.query(DataUpload).filter(DataUpload.facility_id == f.id).order_by(DataUpload.uploaded_at.desc()).first()

        results.append({
            "id": f.id,
            "business_name": f.business_name,
            "sector": f.sector,
            "location": f.location,
            "production_volume": f.production_volume,
            "employees": f.employees,
            "telemetry_rows": row_count,
            "leaks_detected": leak_count,
            "has_data": row_count > 0,
            "quality_score": latest_up.quality_score if latest_up else (85.0 if row_count > 0 else 0.0),
            "owner_name": owner.full_name if owner else "System Default",
            "owner_email": owner.email if owner else "support@circuleak.com",
            "created_at": f.created_at.strftime("%Y-%m-%d") if f.created_at else None
        })
    return APIResponse(success=True, data=results)


@router.get("/users", response_model=APIResponse[List[Dict[str, Any]]])
def get_all_users_list(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """List all registered platform users and assigned roles (admin only)."""
    users = db.query(User).all()
    results = []
    for u in users:
        facility = db.query(Facility).filter(Facility.id == u.facility_id).first() if u.facility_id else None
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "company_name": u.company_name or (facility.business_name if facility else "-"),
            "role": u.role,
            "facility_id": u.facility_id,
            "facility_name": facility.business_name if facility else "Unassigned",
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else None
        })
    return APIResponse(success=True, data=results)


@router.get("/uploads", response_model=APIResponse[List[Dict[str, Any]]])
def get_all_uploads_history(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve full history of uploaded telemetry batches and data confidence scores (admin only)."""
    uploads = db.query(DataUpload).order_by(DataUpload.uploaded_at.desc()).limit(100).all()
    results = []
    for u in uploads:
        facility = db.query(Facility).filter(Facility.id == u.facility_id).first()
        results.append({
            "id": u.id,
            "facility_id": u.facility_id,
            "facility_name": facility.business_name if facility else f"Facility #{u.facility_id}",
            "filename": u.filename,
            "row_count": u.row_count,
            "valid_row_count": u.valid_row_count,
            "invalid_row_count": u.invalid_row_count,
            "data_coverage": u.data_coverage,
            "quality_score": u.quality_score,
            "quality_level": u.quality_level,
            "analysis_status": u.analysis_status,
            "analysis_run_id": u.analysis_run_id,
            "uploaded_at": u.uploaded_at.strftime("%Y-%m-%d %H:%M") if u.uploaded_at else "-"
        })
    return APIResponse(success=True, data=results)


@router.get("/audit-logs", response_model=APIResponse[List[Dict[str, Any]]])
def get_platform_audit_logs(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve immutable platform audit logs (admin only)."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
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


@router.get("/emission-factors", response_model=APIResponse[List[Dict[str, Any]]])
def get_master_emission_factors(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve master regulatory GHG emission factors (admin only)."""
    factors = db.query(EmissionFactor).all()
    if not factors:
        defaults = [
            {"id": 1, "source_type": "grid_electricity", "factor_value": 0.82, "unit": "kgCO2e/kWh", "region": "India National Grid (CEA 2024)", "source_reference": "Central Electricity Authority"},
            {"id": 2, "source_type": "natural_gas", "factor_value": 2.02, "unit": "kgCO2e/SCM", "region": "Industrial PNG", "source_reference": "IPCC Tier 2 Guidelines"},
            {"id": 3, "source_type": "diesel", "factor_value": 2.68, "unit": "kgCO2e/L", "region": "HSD Generator Fuel", "source_reference": "MoEFCC India Baseline"},
            {"id": 4, "source_type": "coal", "factor_value": 2.42, "unit": "kgCO2e/kg", "region": "Indian Non-Coking Coal", "source_reference": "BEE Energy Audit Manual"},
            {"id": 5, "source_type": "lpg", "factor_value": 2.98, "unit": "kgCO2e/kg", "region": "Commercial LPG", "source_reference": "GHG Protocol Stationary"}
        ]
        return APIResponse(success=True, data=defaults)

    return APIResponse(
        success=True,
        data=[
            {
                "id": ef.id,
                "source_type": ef.source_name,
                "factor_value": ef.factor_value,
                "unit": ef.unit,
                "region": "India National Standard",
                "source_reference": ef.reference
            }
            for ef in factors
        ]
    )


@router.post("/emission-factors", response_model=APIResponse[Dict[str, Any]])
def create_emission_factor(
    payload: EmissionFactorCreate,
    admin_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Create or register a new regulatory GHG emission factor (admin only)."""
    existing = db.query(EmissionFactor).filter(EmissionFactor.source_name == payload.source_name).first()
    if existing:
        existing.factor_value = payload.factor_value
        existing.unit = payload.unit
        existing.reference = payload.reference
        existing.is_active = payload.is_active
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = EmissionFactor(
            source_name=payload.source_name,
            factor_value=payload.factor_value,
            unit=payload.unit,
            reference=payload.reference,
            is_active=payload.is_active
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    # Record audit log
    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="emission_factor_updated",
        resource="emission_factor",
        resource_id=str(target.id),
        details={"source": target.source_name, "value": target.factor_value}
    )
    db.add(audit)
    db.commit()

    return APIResponse(
        success=True,
        data={
            "id": target.id,
            "source_type": target.source_name,
            "factor_value": target.factor_value,
            "unit": target.unit,
            "source_reference": target.reference
        }
    )


@router.get("/benchmarks", response_model=APIResponse[List[Dict[str, Any]]])
def get_admin_benchmarks(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve regulatory industry sector benchmarks (admin only)."""
    benchmarks = db.query(Benchmark).all()
    results = [
        {
            "id": b.id,
            "sector": b.sector,
            "average_emission_intensity": b.average_emission_intensity,
            "median_emission_intensity": b.median_emission_intensity,
            "best_in_class_intensity": b.best_in_class_intensity,
            "ccts_threshold": b.ccts_threshold,
            "unit": b.unit,
            "sample_size": b.sample_size
        }
        for b in benchmarks
    ]
    return APIResponse(success=True, data=results)


@router.post("/benchmarks", response_model=APIResponse[Dict[str, Any]])
def create_or_update_benchmark(
    payload: BenchmarkCreate,
    admin_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Create or update regulatory sector benchmark (admin only)."""
    existing = db.query(Benchmark).filter(Benchmark.sector == payload.sector).first()
    if existing:
        existing.average_emission_intensity = payload.average_emission_intensity
        existing.median_emission_intensity = payload.median_emission_intensity
        existing.best_in_class_intensity = payload.best_in_class_intensity
        existing.ccts_threshold = payload.ccts_threshold
        existing.unit = payload.unit
        existing.sample_size = payload.sample_size
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = Benchmark(
            sector=payload.sector,
            average_emission_intensity=payload.average_emission_intensity,
            median_emission_intensity=payload.median_emission_intensity,
            best_in_class_intensity=payload.best_in_class_intensity,
            ccts_threshold=payload.ccts_threshold,
            unit=payload.unit,
            sample_size=payload.sample_size
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    # Record audit log
    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="benchmark_updated",
        resource="benchmark",
        resource_id=str(target.id),
        details={"sector": target.sector, "average": target.average_emission_intensity}
    )
    db.add(audit)
    db.commit()

    return APIResponse(
        success=True,
        data={
            "id": target.id,
            "sector": target.sector,
            "average_emission_intensity": target.average_emission_intensity,
            "median_emission_intensity": target.median_emission_intensity,
            "best_in_class_intensity": target.best_in_class_intensity,
            "ccts_threshold": target.ccts_threshold,
            "unit": target.unit
        }
    )
