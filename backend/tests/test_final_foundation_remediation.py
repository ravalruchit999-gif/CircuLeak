import pytest
import datetime
import pandas as pd
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.models.leak import Leak
from app.models.emission_factor import EmissionFactor
from app.models.process_data import ProcessData
from app.models.analysis_run import AnalysisRun
from app.models.audit_log import AuditLog
from app.core.security import hash_password, create_access_token
from app.core.config import Settings
from app.services.dataset_hash_service import compute_canonical_dataset_hash, get_code_version


def test_data_quality_cross_tenant_isolation(client: TestClient, db_session):
    """Verify data quality overview strictly isolates tenant data and never enumerates foreign facilities."""
    fac1 = Facility(
        business_name="Tenant Alpha Plant",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Fabrication",
        production_volume=5000.0,
        employees=25,
        operating_hours=16.0
    )
    fac2 = Facility(
        business_name="Tenant Beta Plant",
        sector="Chemicals",
        location="Maharashtra",
        production_type="Synthesis",
        production_volume=8000.0,
        employees=35,
        operating_hours=24.0
    )
    db_session.add_all([fac1, fac2])
    db_session.commit()
    db_session.refresh(fac1)
    db_session.refresh(fac2)

    user1 = User(
        email="user_alpha@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Alpha Manager",
        role="facility_manager",
        facility_id=fac1.id
    )
    db_session.add(user1)
    db_session.commit()
    db_session.refresh(user1)

    token = create_access_token({"sub": str(user1.id)})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/data-quality/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json().get("data", {})
    
    # Non-admin user must ONLY see their own facility in breakdown
    breakdown = data.get("facilities", data.get("facility_breakdown", []))
    assert len(breakdown) == 1
    assert breakdown[0]["facility_id"] == fac1.id
    assert breakdown[0]["facility_name"] == "Tenant Alpha Plant"

    # Must NOT contain fac2
    fac_ids = [f["facility_id"] for f in breakdown]
    assert fac2.id not in fac_ids


def test_data_quality_unassigned_user_no_enumeration(client: TestClient, db_session):
    """Verify that a user without facility assignment receives 403 and cannot enumerate platform facilities."""
    unassigned_user = User(
        email="unassigned@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Unassigned User",
        role="facility_manager",
        facility_id=None
    )
    db_session.add(unassigned_user)
    db_session.commit()
    db_session.refresh(unassigned_user)

    token = create_access_token({"sub": str(unassigned_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/data-quality/overview", headers=headers)
    assert resp.status_code == 403
    err_body = str(resp.json())
    assert "No facility assigned" in err_body


def test_recommendation_cross_tenant_leak_denied(client: TestClient, db_session):
    """Verify BOLA/IDOR protection on /api/recommendations/leak/{leak_id}."""
    fac1 = Facility(
        business_name="Plant One",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Casting",
        production_volume=5000.0,
        employees=25,
        operating_hours=16.0
    )
    fac2 = Facility(
        business_name="Plant Two",
        sector="Textiles & Apparel",
        location="Tamil Nadu",
        production_type="Weaving",
        production_volume=6000.0,
        employees=30,
        operating_hours=16.0
    )
    db_session.add_all([fac1, fac2])
    db_session.commit()
    db_session.refresh(fac1)
    db_session.refresh(fac2)

    user1 = User(
        email="tenant1_leak@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Tenant One",
        role="facility_manager",
        facility_id=fac1.id
    )
    user2 = User(
        email="tenant2_leak@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Tenant Two",
        role="facility_manager",
        facility_id=fac2.id
    )
    db_session.add_all([user1, user2])
    db_session.commit()
    db_session.refresh(user1)
    db_session.refresh(user2)

    # Create a leak belonging to Facility 2
    leak2 = Leak(
        facility_id=fac2.id,
        equipment="Furnace B",
        process="Melting",
        leak_type="behavioral",
        risk_score=75.0,
        reason="Abnormal continuous off-hours consumption",
        detected_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db_session.add(leak2)
    db_session.commit()
    db_session.refresh(leak2)

    token1 = create_access_token({"sub": str(user1.id)})
    headers1 = {"Authorization": f"Bearer {token1}"}

    # User 1 attempts to access recommendations for User 2's leak -> MUST BE 403 FORBIDDEN
    resp = client.get(f"/api/recommendations/leak/{leak2.id}", headers=headers1)
    assert resp.status_code == 403
    err_body = str(resp.json())
    assert "Unauthorized access" in err_body

    # User 2 accesses their own leak -> 200 OK
    token2 = create_access_token({"sub": str(user2.id)})
    headers2 = {"Authorization": f"Bearer {token2}"}
    resp_own = client.get(f"/api/recommendations/leak/{leak2.id}", headers=headers2)
    assert resp_own.status_code == 200


def test_recommendation_unauthenticated_denied(client: TestClient):
    """Verify all recommendation endpoints reject unauthenticated requests."""
    assert client.get("/api/recommendations/1").status_code == 401
    assert client.get("/api/recommendations/leak/1").status_code == 401
    assert client.get("/api/interventions/priority/1").status_code == 401


def test_admin_emission_factors_no_mock_fallback(client: TestClient, db_session):
    """Verify that empty EmissionFactor table returns an honest empty list without fabricating mock factors."""
    db_session.query(EmissionFactor).delete()
    db_session.commit()

    admin_user = User(
        email="admin_audit@circuleak.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Platform Admin",
        role="admin"
    )
    db_session.add(admin_user)
    db_session.commit()

    token = create_access_token({"sub": str(admin_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/admin/emission-factors", headers=headers)
    assert resp.status_code == 200
    factors = resp.json().get("data", [])
    
    # Must be empty - NO fabricated factors
    assert len(factors) == 0
    assert db_session.query(EmissionFactor).count() == 0


def test_missing_production_secret_rejected():
    """Verify that production mode raises ValueError if SECRET_KEY is missing, default, or weak."""
    with pytest.raises(ValueError, match="Production configuration error"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="circuleak_production_secret_key_change_in_production"
        )

    with pytest.raises(ValueError, match="Production configuration error"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY=""
        )

    with pytest.raises(ValueError, match="Production configuration error"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="too_short"
        )


def test_audit_log_cross_tenant_filter_denied(client: TestClient, db_session):
    """Verify non-admin users cannot filter or access foreign facility audit logs."""
    fac1 = Facility(business_name="Audit Fac 1", sector="Chemicals", location="Gujarat", production_type="Resin", production_volume=1000.0, employees=10, operating_hours=16.0)
    fac2 = Facility(business_name="Audit Fac 2", sector="Chemicals", location="Gujarat", production_type="Resin", production_volume=1000.0, employees=10, operating_hours=16.0)
    db_session.add_all([fac1, fac2])
    db_session.commit()

    user1 = User(
        email="tenant1_audit@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Audit User 1",
        role="facility_manager",
        facility_id=fac1.id
    )
    db_session.add(user1)
    db_session.commit()

    # Create audit logs for fac1 and fac2
    log1 = AuditLog(user_id=user1.id, action="test_upload_1", resource="facility", resource_id=str(fac1.id), timestamp=datetime.datetime.now(datetime.timezone.utc))
    log2 = AuditLog(user_id=999, action="test_upload_2", resource="facility", resource_id=str(fac2.id), timestamp=datetime.datetime.now(datetime.timezone.utc))
    db_session.add_all([log1, log2])
    db_session.commit()

    token1 = create_access_token({"sub": str(user1.id)})
    headers1 = {"Authorization": f"Bearer {token1}"}

    # User 1 attempts to query facility 2 audit logs -> 403 Forbidden
    resp_cross = client.get(f"/api/audit/logs?facility_id={fac2.id}", headers=headers1)
    assert resp_cross.status_code == 403

    # User 1 queries without facility_id -> automatically scoped to fac1
    resp_auto = client.get("/api/audit/logs", headers=headers1)
    assert resp_auto.status_code == 200
    logs = resp_auto.json().get("data", [])
    assert len(logs) == 1
    assert logs[0]["resource_id"] == str(fac1.id)


def test_emission_factor_effective_date_windowing(client: TestClient, db_session):
    """Verify that telemetry rows select the correct emission factor based on validity window."""
    t0 = datetime.datetime(2024, 1, 1, 0, 0, 0)
    t1 = datetime.datetime(2025, 1, 1, 0, 0, 0)

    # Factor V1: 2024 (0.80 kgCO2e/kWh)
    ef_v1 = EmissionFactor(
        source_name="grid_electricity",
        factor_value=0.80,
        unit="kgCO2e/kWh",
        reference="CEA 2024 v1",
        version="v1-2024",
        scope="Scope 2",
        effective_from=t0,
        effective_to=t1,
        is_active=True
    )
    # Factor V2: 2025 onwards (0.70 kgCO2e/kWh)
    ef_v2 = EmissionFactor(
        source_name="grid_electricity",
        factor_value=0.70,
        unit="kgCO2e/kWh",
        reference="CEA 2025 v2",
        version="v2-2025",
        scope="Scope 2",
        effective_from=t1,
        effective_to=None,
        is_active=True
    )
    fac = Facility(business_name="Windowing Plant", sector="Metals", location="Gujarat", production_type="Rolling", production_volume=5000.0, employees=20, operating_hours=16.0)
    db_session.add_all([ef_v1, ef_v2, fac])
    db_session.commit()

    user = User(
        email="window_user@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Window User",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # Upload telemetry containing a 2024 row and a 2025 row
    csv_content = (
        "timestamp,equipment,process,electricity_kwh\n"
        "2024-06-15 10:00:00,Mill A,Rolling,100.0\n"
        "2025-06-15 10:00:00,Mill A,Rolling,100.0\n"
    )
    files = {"file": ("window_test.csv", csv_content.encode("utf-8"), "text/csv")}
    resp = client.post("/api/upload/csv", files=files, headers=headers)
    assert resp.status_code == 200

    # Verify 2024 row used V1 (100 * 0.80 = 80.0 kg)
    row_2024 = db_session.query(ProcessData).filter(
        ProcessData.facility_id == fac.id,
        ProcessData.timestamp == datetime.datetime(2024, 6, 15, 10, 0, 0)
    ).first()
    assert row_2024 is not None
    assert row_2024.emission_factor_id == ef_v1.id
    assert row_2024.emission_factor_version == "v1-2024"
    assert row_2024.calculated_emissions_kg == 80.0

    # Verify 2025 row used V2 (100 * 0.70 = 70.0 kg)
    row_2025 = db_session.query(ProcessData).filter(
        ProcessData.facility_id == fac.id,
        ProcessData.timestamp == datetime.datetime(2025, 6, 15, 10, 0, 0)
    ).first()
    assert row_2025 is not None
    assert row_2025.emission_factor_id == ef_v2.id
    assert row_2025.emission_factor_version == "v2-2025"
    assert row_2025.calculated_emissions_kg == 70.0


def test_canonical_dataset_hash_reproducibility():
    """Verify that canonical dataset SHA-256 hash is deterministic, permutation-invariant, and value-sensitive."""
    df1 = pd.DataFrame([
        {"timestamp": "2026-09-10 10:00:00", "equipment": "Motor 1", "process": "Pumping", "electricity_kwh": 50.0},
        {"timestamp": "2026-09-10 11:00:00", "equipment": "Motor 2", "process": "Pumping", "electricity_kwh": 75.0}
    ])
    # Permuted rows
    df2 = pd.DataFrame([
        {"timestamp": "2026-09-10 11:00:00", "equipment": "Motor 2", "process": "Pumping", "electricity_kwh": 75.0},
        {"timestamp": "2026-09-10 10:00:00", "equipment": "Motor 1", "process": "Pumping", "electricity_kwh": 50.0}
    ])
    # Modified value
    df3 = pd.DataFrame([
        {"timestamp": "2026-09-10 10:00:00", "equipment": "Motor 1", "process": "Pumping", "electricity_kwh": 50.1},
        {"timestamp": "2026-09-10 11:00:00", "equipment": "Motor 2", "process": "Pumping", "electricity_kwh": 75.0}
    ])

    hash1 = compute_canonical_dataset_hash(df1)
    hash2 = compute_canonical_dataset_hash(df2)
    hash3 = compute_canonical_dataset_hash(df3)

    assert len(hash1) == 64
    assert hash1 == hash2  # Invariant under row permutation
    assert hash1 != hash3  # Sensitive to value changes
