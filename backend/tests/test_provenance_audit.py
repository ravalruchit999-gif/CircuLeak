import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.emission_factor import EmissionFactor
from app.models.analysis_run import AnalysisRun
from app.models.leak import Leak
from app.core.security import hash_password, create_access_token


def test_auditor_grade_emission_factor_provenance(client: TestClient, db_session):
    """Verify that every ingested process row stores complete emission factor provenance."""
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
        business_name="Audit Provenance Plant",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Fabrication",
        production_volume=5000.0,
        employees=25,
        operating_hours=16.0
    )
    db_session.add_all([ef, fac])
    db_session.commit()

    user = User(
        email="auditor@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Lead GHG Auditor",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    csv_content = (
        "timestamp,equipment,process,electricity_kwh\n"
        "2026-09-10 12:00:00,Rolling Mill 1,Rolling,200.0\n"
    )
    files = {"file": ("audit_telemetry.csv", csv_content.encode("utf-8"), "text/csv")}
    resp = client.post("/api/upload/csv", files=files, headers=headers)
    assert resp.status_code == 200

    row = db_session.query(ProcessData).filter(
        ProcessData.facility_id == fac.id,
        ProcessData.equipment == "Rolling Mill 1"
    ).first()

    assert row is not None
    assert row.emission_factor_id == ef.id
    assert row.emission_factor_version == "v19-2024"
    assert row.emission_factor_source_reference == "India CEA CO2 Baseline Database v19 (2024)"
    assert row.calculation_method == "IPCC_Tier_1_Direct_Multiplication"
    assert row.calculated_at is not None
    assert row.upload_id is not None


def test_ml_model_run_lineage_and_auditability(client: TestClient, db_session):
    """Verify that AnalysisRun tracks execution metadata and links to Leaks and DataUpload."""
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
        business_name="ML Lineage Facility",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Fabrication",
        production_volume=5000.0,
        employees=25,
        operating_hours=16.0
    )
    db_session.add_all([ef, fac])
    db_session.commit()

    user = User(
        email="ml_auditor@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="ML Lineage Auditor",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    csv_content = (
        "timestamp,equipment,process,electricity_kwh\n"
        "2026-09-10 12:00:00,Rolling Mill 1,Rolling,200.0\n"
    )
    files = {"file": ("ml_telemetry.csv", csv_content.encode("utf-8"), "text/csv")}
    resp = client.post("/api/upload/csv", files=files, headers=headers)
    assert resp.status_code == 200

    runs = db_session.query(AnalysisRun).filter(AnalysisRun.facility_id == fac.id).all()
    assert len(runs) >= 1

    ingest_run = next((r for r in runs if r.analysis_type == "telemetry_ingestion"), None)
    assert ingest_run is not None
    assert ingest_run.model_name == "CanonicalIngestionPipeline"
    assert ingest_run.status == "completed"
    assert ingest_run.upload_id is not None
