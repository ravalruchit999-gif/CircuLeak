import pytest
from datetime import datetime, timezone
from app.models.facility import Facility
from app.models.user import User
from app.models.leak import Leak
from app.models.analysis_run import AnalysisRun
from app.models.emission_factor import EmissionFactor
from app.models.process_data import ProcessData
from app.models.audit_log import AuditLog
from app.core.security import hash_password, create_access_token


@pytest.fixture
def setup_incident_data(db_session):
    """Sets up two facilities, users, analysis runs, emission factors, and leaks."""
    # Facility 1
    fac1 = Facility(
        business_name="Solaris Textiles",
        sector="Textile & Garment",
        location="Surat, Gujarat",
        production_type="Fabric Dyeing",
        production_volume=10000.0,
        operating_hours=16.0
    )
    db_session.add(fac1)
    db_session.flush()

    # User 1 (Facility 1 manager)
    u1 = User(
        email="manager@solaris.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Manager One",
        facility_id=fac1.id,
        role="facility_manager"
    )
    db_session.add(u1)

    # Facility 2
    fac2 = Facility(
        business_name="Apex Metals",
        sector="Metals & Mining",
        location="Jamshedpur, Jharkhand",
        production_type="Steel Smelting",
        production_volume=50000.0,
        operating_hours=24.0
    )
    db_session.add(fac2)
    db_session.flush()

    # User 2 (Facility 2 manager)
    u2 = User(
        email="manager@apex.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Manager Two",
        facility_id=fac2.id,
        role="facility_manager"
    )
    db_session.add(u2)

    # Admin User
    u_admin = User(
        email="admin@circuleak.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Platform Admin",
        facility_id=None,
        role="admin"
    )
    db_session.add(u_admin)
    db_session.flush()

    # AnalysisRun for Facility 1
    run1 = AnalysisRun(
        id="AR-TEST-FAC1-001",
        facility_id=fac1.id,
        analysis_type="anomaly_detection",
        model_name="IsolationForest",
        model_version="1.0.0",
        dataset_hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status="completed",
        input_row_count=120,
        code_version="1.0.0"
    )
    db_session.add(run1)

    # Telemetry data for Timeline
    for hr in range(8, 18):
        db_session.add(ProcessData(
            facility_id=fac1.id,
            timestamp=datetime(2026, 8, 14, hr, 0, tzinfo=timezone.utc),
            date="2026-08-14",
            hour=hr,
            equipment="Dyeing Machine 01",
            process="Dyeing",
            electricity_kwh=160.0 if hr in [13, 14, 15] else 75.0,
            production_volume=120.0,
            operating_hours=1.0
        ))

    # Leak 1 for Facility 1
    leak1 = Leak(
        facility_id=fac1.id,
        leak_type="behavioral",
        equipment="Dyeing Machine 01",
        process="Dyeing",
        risk_score=88.5,
        status="detected",
        baseline_consumption=75.0,
        observed_consumption=160.0,
        deviation_percent=113.33,
        abnormal_period="2026-08-14 13:00 to 15:00",
        production_status="Active Production with High Specific Energy Consumption",
        reason="Dyeing Machine 01 drew 160 kWh vs 75 kWh baseline (+113.33%) during peak cycle.",
        potential_causes=["Submerged heater scale buildup", "Sensor calibration drift"],
        emission_contribution_kg=60.86,
        detected_at=datetime(2026, 8, 14, 15, 30, tzinfo=timezone.utc),
        analysis_run_id=run1.id
    )
    db_session.add(leak1)

    # Leak 2 for Facility 2
    leak2 = Leak(
        facility_id=fac2.id,
        leak_type="behavioral",
        equipment="Blast Furnace 02",
        process="Smelting",
        risk_score=92.0,
        status="detected",
        baseline_consumption=500.0,
        observed_consumption=950.0,
        deviation_percent=90.0,
        abnormal_period="2026-08-14 02:00 to 06:00",
        production_status="Off-hours idling leakage",
        reason="Off-hours power draw exceeded baseline by 90%.",
        potential_causes=["Damaged refractory lining"],
        emission_contribution_kg=322.2,
        detected_at=datetime(2026, 8, 14, 6, 0, tzinfo=timezone.utc)
    )
    db_session.add(leak2)
    db_session.commit()

    return {
        "fac1": fac1, "fac2": fac2,
        "u1": u1, "u2": u2, "u_admin": u_admin,
        "leak1": leak1, "leak2": leak2,
        "run1": run1
    }


def test_authenticated_user_can_access_own_incident(client, setup_incident_data):
    """Test 1: Authenticated user can successfully retrieve own Carbon Incident detail."""
    u1 = setup_incident_data["u1"]
    leak1 = setup_incident_data["leak1"]
    token = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})

    # Test via /api/leaks/{id}
    resp = client.get(f"/api/leaks/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]

    # Check incident metadata
    assert data["incident"]["id"] == leak1.id
    assert data["incident"]["equipment"] == "Dyeing Machine 01"
    assert data["incident"]["status"] == "detected"
    assert data["incident"]["severity"] in ["Critical", "High", "Medium", "Low"]

    # Test via /api/incidents/{id}
    inc_resp = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert inc_resp.status_code == 200
    assert inc_resp.json()["data"]["incident"]["id"] == leak1.id


def test_unauthenticated_user_rejected(client, setup_incident_data):
    """Test 2: Unauthenticated request must receive 401 Unauthorized."""
    leak1 = setup_incident_data["leak1"]
    resp = client.get(f"/api/leaks/{leak1.id}")
    assert resp.status_code == 401

    inc_resp = client.get(f"/api/incidents/{leak1.id}")
    assert inc_resp.status_code == 401


def test_cross_tenant_incident_access_rejected(client, setup_incident_data):
    """Test 3: User from Facility 2 requesting Facility 1's incident must receive 403 Forbidden."""
    u2 = setup_incident_data["u2"]
    leak1 = setup_incident_data["leak1"]
    token = create_access_token({"sub": str(u2.id), "role": u2.role, "facility_id": u2.facility_id})

    resp = client.get(f"/api/leaks/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403

    inc_resp = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert inc_resp.status_code == 403


def test_admin_access_works_cross_tenant(client, setup_incident_data):
    """Test 4: Platform admin can access any tenant's incident detail."""
    u_admin = setup_incident_data["u_admin"]
    leak1 = setup_incident_data["leak1"]
    leak2 = setup_incident_data["leak2"]
    token = create_access_token({"sub": str(u_admin.id), "role": u_admin.role, "facility_id": None})

    resp1 = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp1.status_code == 200
    assert resp1.json()["data"]["incident"]["facility_id"] == setup_incident_data["fac1"].id

    resp2 = client.get(f"/api/incidents/{leak2.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp2.status_code == 200
    assert resp2.json()["data"]["incident"]["facility_id"] == setup_incident_data["fac2"].id


def test_missing_incident_returns_404(client, setup_incident_data):
    """Test 5: Non-existent incident returns 404."""
    u1 = setup_incident_data["u1"]
    token = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})

    resp = client.get("/api/incidents/999999", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 404


def test_impact_and_provenance_values_from_backend(client, setup_incident_data):
    """Test 6 & 7: Impact values come from backend, calculated with CEA emission factor provenance."""
    u1 = setup_incident_data["u1"]
    leak1 = setup_incident_data["leak1"]
    token = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})

    resp = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()["data"]

    # What Happened section
    assert data["observed"]["value"] == 160.0
    assert data["baseline"]["value"] == 75.0
    assert pytest.approx(113.3, rel=1e-1) == data["deviation"]["percent"]

    # Impact section (3 anomalous hours * 85 kWh/hr excess = 255 kWh)
    impact = data["impact"]
    assert impact["energy_impact_kwh"] == 255.0
    assert impact["carbon_impact_kg"] == pytest.approx(255.0 * 0.716, rel=1e-2)
    assert impact["financial_impact_inr"] == pytest.approx(255.0 * 7.50, rel=1e-2)
    assert "Estimated" in impact["financial_status"]
    assert "7.50" in impact["financial_status"]

    # Provenance
    prov = impact["emission_factor_provenance"]
    assert prov is not None
    assert prov["factor_value"] == 0.716
    assert "CEA" in prov["reference"] or "India" in prov["reference"]


def test_analysis_run_lineage_preserved(client, setup_incident_data):
    """Test 8: Incident metadata preserves AnalysisRun ID and dataset SHA-256 hash."""
    u1 = setup_incident_data["u1"]
    leak1 = setup_incident_data["leak1"]
    run1 = setup_incident_data["run1"]
    token = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})

    resp = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    inc_meta = resp.json()["data"]["incident"]
    assert inc_meta["analysis_run_id"] == run1.id
    assert inc_meta["dataset_hash_sha256"] == run1.dataset_hash_sha256


def test_evidence_and_data_quality_truthful(client, setup_incident_data):
    """Test 9 & 10: Evidence signals and Data Quality available/missing fields are populated."""
    u1 = setup_incident_data["u1"]
    leak1 = setup_incident_data["leak1"]
    token = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})

    resp = client.get(f"/api/incidents/{leak1.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()["data"]

    # Evidence items
    evidence = data["evidence"]
    assert len(evidence) >= 2
    signals = [e["signal"] for e in evidence]
    assert any("Electricity" in s or "Consumption" in s for s in signals)

    # Data Quality
    dq = data["data_quality"]
    assert any("Electricity" in item for item in dq["available"])
    assert "Temperature Telemetry" in dq["missing"]
    assert "Pressure Telemetry" in dq["missing"]

    # Timeline has real points from ProcessData
    timeline = data["timeline"]
    assert len(timeline) > 0
    assert any(pt["is_anomaly"] is True for pt in timeline)


def test_incident_status_mutation_authorized(client, setup_incident_data, db_session):
    """Test 11 & 12: Incident status transitions work, log audit records, and cross-tenant is blocked."""
    u1 = setup_incident_data["u1"]
    u2 = setup_incident_data["u2"]
    leak1 = setup_incident_data["leak1"]
    token1 = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})
    token2 = create_access_token({"sub": str(u2.id), "role": u2.role, "facility_id": u2.facility_id})

    # Unauthorized tenant cannot update status
    resp_block = client.patch(
        f"/api/incidents/{leak1.id}/status",
        headers={"Authorization": f"Bearer {token2}"},
        json={"status": "investigating", "note": "Hacker note"}
    )
    assert resp_block.status_code == 403

    # Authorized owner updates status to "investigating"
    resp_ok = client.patch(
        f"/api/incidents/{leak1.id}/status",
        headers={"Authorization": f"Bearer {token1}"},
        json={"status": "investigating", "note": "Investigating heater elements"}
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["data"]["incident"]["status"] == "investigating"

    # Verify AuditLog created in database
    audit = db_session.query(AuditLog).filter(
        AuditLog.action == "incident_status_updated",
        AuditLog.resource_id == str(leak1.id)
    ).first()
    assert audit is not None
    assert audit.user_id == u1.id
    assert audit.details["old_status"] == "detected"
    assert audit.details["new_status"] == "investigating"

    # Transition to "resolved"
    resp_resolved = client.patch(
        f"/api/incidents/{leak1.id}/status",
        headers={"Authorization": f"Bearer {token1}"},
        json={"status": "resolved", "note": "Descale cycle completed"}
    )
    assert resp_resolved.status_code == 200
    assert resp_resolved.json()["data"]["incident"]["status"] == "resolved"
