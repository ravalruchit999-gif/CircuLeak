from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, require_admin_user
from app.models.user import User
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.leak import Leak
from app.models.emission_factor import EmissionFactor
from app.schemas.common import APIResponse

router = APIRouter(prefix="/admin", tags=["Admin Governance"])


@router.get("/stats", response_model=APIResponse[Dict[str, Any]])
def get_system_governance_stats(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve overall platform statistics across all facilities and users (admin only)."""
    total_facilities = db.query(func.count(Facility.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_telemetry_rows = db.query(func.count(ProcessData.id)).scalar() or 0
    total_leaks_flagged = db.query(func.count(Leak.id)).scalar() or 0

    return APIResponse(
        success=True,
        data={
            "total_facilities": total_facilities,
            "total_users": total_users,
            "total_telemetry_rows": total_telemetry_rows,
            "total_leaks_flagged": total_leaks_flagged,
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


@router.get("/emission-factors", response_model=APIResponse[List[Dict[str, Any]]])
def get_master_emission_factors(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    """Retrieve master regulatory GHG emission factors (admin only)."""
    factors = db.query(EmissionFactor).all()
    if not factors:
        # Default baseline standard factors if table not yet seeded
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
                "source_type": ef.source_type,
                "factor_value": ef.factor_value,
                "unit": ef.unit,
                "region": ef.region,
                "source_reference": ef.source_reference
            }
            for ef in factors
        ]
    )
