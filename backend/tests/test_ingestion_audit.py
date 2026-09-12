import pytest
import io
import pandas as pd
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.emission_factor import EmissionFactor
from app.core.security import hash_password, create_access_token


@pytest.fixture
def auth_setup(db_session):
    """Seed baseline facility, user, and emission factor for ingestion tests."""
    ef = EmissionFactor(
        source_name="grid_electricity",
        factor_value=0.716,
        unit="kgCO2e/kWh",
        reference="India CEA CO2 Baseline Database v19 (2024)",
        version="v19-2024",
        scope="Scope 2",
        is_active=True
    )
    fac = Facility(
        business_name="Ingestion Test Facility",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Fabrication",
        production_volume=10000.0,
        employees=30,
        operating_hours=16.0
    )
    db_session.add_all([ef, fac])
    db_session.commit()

    user = User(
        email="ingest_tester@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Ingestion Tester",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}
    return fac, user, headers


def test_production_data_contract_rejects_missing_required_columns(client: TestClient, auth_setup):
    """Verify that uploading a file missing equipment column returns HTTP 422 with checklist."""
    fac, user, headers = auth_setup

    # CSV missing 'equipment' column
    bad_csv = (
        "timestamp,electricity_kwh,process\n"
        "2026-09-10 08:00:00,120.5,Machining\n"
        "2026-09-10 09:00:00,135.0,Machining\n"
    )
    files = {"file": ("bad_telemetry.csv", bad_csv.encode("utf-8"), "text/csv")}
    resp = client.post("/api/upload/csv", files=files, headers=headers)

    assert resp.status_code == 422
    err_body = resp.json().get("error", {})
    assert "Production Data Contract Violation" in err_body.get("message", "") or "equipment" in str(err_body)


def test_non_destructive_ingestion_and_idempotent_upsert(client: TestClient, auth_setup, db_session):
    """
    Verify:
    1. Ingesting Day 1 (3 rows) and Day 2 (3 rows) preserves all 6 rows (no deletion).
    2. Re-uploading Day 1 does not duplicate rows (idempotent upsert).
    """
    fac, user, headers = auth_setup

    day1_csv = (
        "timestamp,equipment,process,electricity_kwh,production_volume\n"
        "2026-09-10 08:00:00,Induction Furnace,Melting,450.0,20.0\n"
        "2026-09-10 09:00:00,Induction Furnace,Melting,460.0,22.0\n"
        "2026-09-10 10:00:00,Induction Furnace,Melting,440.0,19.0\n"
    )
    files1 = {"file": ("day1.csv", day1_csv.encode("utf-8"), "text/csv")}
    resp1 = client.post("/api/upload/csv", files=files1, headers=headers)
    assert resp1.status_code == 200
    assert resp1.json()["data"]["rows_valid"] == 3

    count1 = db_session.query(ProcessData).filter(ProcessData.facility_id == fac.id).count()
    assert count1 == 3

    # Upload Day 2
    day2_csv = (
        "timestamp,equipment,process,electricity_kwh,production_volume\n"
        "2026-09-11 08:00:00,Induction Furnace,Melting,455.0,21.0\n"
        "2026-09-11 09:00:00,Induction Furnace,Melting,465.0,23.0\n"
        "2026-09-11 10:00:00,Induction Furnace,Melting,445.0,20.0\n"
    )
    files2 = {"file": ("day2.csv", day2_csv.encode("utf-8"), "text/csv")}
    resp2 = client.post("/api/upload/csv", files=files2, headers=headers)
    assert resp2.status_code == 200

    count2 = db_session.query(ProcessData).filter(ProcessData.facility_id == fac.id).count()
    # Prior telemetry MUST NOT be wiped! Count must be 6!
    assert count2 == 6

    # Re-upload Day 1 (should update, not duplicate)
    resp3 = client.post("/api/upload/csv", files=files1, headers=headers)
    assert resp3.status_code == 200

    count3 = db_session.query(ProcessData).filter(ProcessData.facility_id == fac.id).count()
    assert count3 == 6  # Remains 6!


def test_sub_hourly_timestamp_fidelity_preserved(client: TestClient, auth_setup, db_session):
    """Verify that 15-minute sub-metered telemetry does not collapse to date+hour."""
    fac, user, headers = auth_setup

    sub_hourly_csv = (
        "timestamp,equipment,process,electricity_kwh\n"
        "2026-09-10 08:00:00,Air Compressor 1,Compressed Air,12.5\n"
        "2026-09-10 08:15:00,Air Compressor 1,Compressed Air,13.0\n"
        "2026-09-10 08:30:00,Air Compressor 1,Compressed Air,12.8\n"
        "2026-09-10 08:45:00,Air Compressor 1,Compressed Air,13.2\n"
    )
    files = {"file": ("sub_hourly.csv", sub_hourly_csv.encode("utf-8"), "text/csv")}
    resp = client.post("/api/upload/csv", files=files, headers=headers)
    assert resp.status_code == 200

    records = db_session.query(ProcessData).filter(
        ProcessData.facility_id == fac.id,
        ProcessData.equipment == "Air Compressor 1"
    ).order_by(ProcessData.timestamp).all()

    # All 4 sub-hourly readings must be retained
    assert len(records) == 4
    minutes = [r.timestamp.minute for r in records]
    assert minutes == [0, 15, 30, 45]
