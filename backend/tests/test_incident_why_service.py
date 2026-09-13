import pytest
from datetime import datetime, timezone
from app.models.facility import Facility
from app.models.user import User
from app.models.leak import Leak
from app.models.analysis_run import AnalysisRun
from app.models.process_data import ProcessData
from app.core.security import hash_password, create_access_token
from app.services.incident_why_service import IncidentWhyService


@pytest.fixture
def setup_why_incident_data(db_session):
    """Sets up facilities, users, analysis runs, process data telemetry, and leaks for Phase 2 testing."""
    # Facility 1 (Textile)
    fac1 = Facility(
        business_name="Solaris Dyeing Mills",
        sector="Textile & Garment",
        location="Surat, Gujarat",
        production_type="Fabric Dyeing",
        production_volume=12000.0,
        operating_hours=16.0
    )
    db_session.add(fac1)
    db_session.flush()

    # User 1
    u1 = User(
        email="operator@solaris.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Operator Solaris",
        facility_id=fac1.id,
        role="facility_manager"
    )
    db_session.add(u1)

    # Facility 2 (Metals)
    fac2 = Facility(
        business_name="Apex Smelting Corp",
        sector="Metals & Mining",
        location="Jamshedpur, Jharkhand",
        production_type="Steel Re-rolling",
        production_volume=45000.0,
        operating_hours=24.0
    )
    db_session.add(fac2)
    db_session.flush()

    # User 2
    u2 = User(
        email="operator@apex.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Operator Apex",
        facility_id=fac2.id,
        role="facility_manager"
    )
    db_session.add(u2)
    db_session.flush()

    # Parent AnalysisRun
    parent_run = AnalysisRun(
        id="RUN-ANOMALY-SOLARIS-001",
        facility_id=fac1.id,
        analysis_type="anomaly_detection",
        model_name="IsolationForest",
        model_version="1.0.0",
        dataset_hash_sha256="4a6f25e3698b584f7b6057a1b023e1f0e4b85c1630c72d689b2184f938b8de32",
        status="completed",
        input_row_count=150,
        code_version="1.0.0"
    )
    db_session.add(parent_run)

    # Telemetry: 20 rows of normal active daytime hours (08:00-18:00) with production = 100 kg, power = 40 kWh
    for day in [10, 11]:
        for hr in range(8, 18):
            db_session.add(ProcessData(
                facility_id=fac1.id,
                timestamp=datetime(2026, 8, day, hr, 0, tzinfo=timezone.utc),
                date=f"2026-08-{day}",
                hour=hr,
                equipment="Jet Dyeing Vessel #01",
                process="Fabric Dyeing",
                electricity_kwh=40.0,
                production_volume=100.0,
                operating_hours=1.0
            ))

    # Telemetry: 10 rows of normal off-hours (22:00-03:00) with production = 0 kg, power = 0.5 kWh (normal standby)
    for hr in [22, 23, 0, 1, 2]:
        db_session.add(ProcessData(
            facility_id=fac1.id,
            timestamp=datetime(2026, 8, 12, hr, 0, tzinfo=timezone.utc),
            date="2026-08-12",
            hour=hr,
            equipment="Jet Dyeing Vessel #01",
            process="Fabric Dyeing",
            electricity_kwh=0.5,
            production_volume=0.0,
            operating_hours=0.0
        ))
        db_session.add(ProcessData(
            facility_id=fac1.id,
            timestamp=datetime(2026, 8, 13, hr, 0, tzinfo=timezone.utc),
            date="2026-08-13",
            hour=hr,
            equipment="Jet Dyeing Vessel #01",
            process="Fabric Dyeing",
            electricity_kwh=0.8,
            production_volume=0.0,
            operating_hours=0.0
        ))

    # Telemetry: 12 anomalous off-hours rows where production = 0 kg, but power = 25 kWh (IDLE LEAK)
    for day in [14, 15]:
        for hr in [22, 23, 0, 1, 2, 3]:
            db_session.add(ProcessData(
                facility_id=fac1.id,
                timestamp=datetime(2026, 8, day, hr, 0, tzinfo=timezone.utc),
                date=f"2026-08-{day}",
                hour=hr,
                equipment="Jet Dyeing Vessel #01",
                process="Fabric Dyeing",
                electricity_kwh=25.0,
                production_volume=0.0,
                operating_hours=0.0
            ))

    # Leak 1: Off-hours Standby Anomaly for Facility 1
    leak1 = Leak(
        facility_id=fac1.id,
        leak_type="behavioral",
        equipment="Jet Dyeing Vessel #01",
        process="Fabric Dyeing",
        risk_score=86.0,
        status="detected",
        baseline_consumption=0.65,
        observed_consumption=25.0,
        deviation_percent=3746.0,
        abnormal_period="22:00-06:00 (Off-Hours / Non-Production)",
        production_status="inactive",
        reason="Jet Dyeing Vessel #01 drew 25.0 kWh/hr during non-production hours when baseline is near zero.",
        potential_causes=["Contactor relay failure", "Circulation pump left running"],
        emission_contribution_kg=214.8,
        detected_at=datetime(2026, 8, 15, 6, 0, tzinfo=timezone.utc),
        analysis_run_id=parent_run.id
    )
    db_session.add(leak1)

    # Leak 2 for Facility 2
    leak2 = Leak(
        facility_id=fac2.id,
        leak_type="behavioral",
        equipment="Electric Arc Furnace",
        process="Smelting",
        risk_score=90.0,
        status="detected",
        baseline_consumption=800.0,
        observed_consumption=1400.0,
        deviation_percent=75.0,
        abnormal_period="08:00-16:00",
        production_status="Active Production",
        reason="Excess power draw during smelting cycle.",
        emission_contribution_kg=429.6,
        detected_at=datetime(2026, 8, 15, 16, 0, tzinfo=timezone.utc)
    )
    db_session.add(leak2)
    db_session.flush()

    return {
        "fac1": fac1, "fac2": fac2,
        "u1": u1, "u2": u2,
        "leak1": leak1, "leak2": leak2,
        "parent_run": parent_run
    }


def test_off_hours_zero_production_standby_evidence(db_session, setup_why_incident_data):
    """Test 1: Verifies production = 0 + electricity > 0 evidence chain and standby loss interpretation."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    assert "why_flagged_statement" in why
    assert "standby" in why["summary"].lower() or "active" in why["summary"].lower()

    # Verify Evidence Chain steps
    chain = why["evidence_chain"]
    assert len(chain) == 5
    assert chain[0]["step"] == 1
    assert chain[0]["type"] == "fact"
    assert "25" in chain[0]["statement"]

    assert chain[1]["step"] == 2
    assert chain[1]["type"] == "fact"
    assert "0" in chain[1]["statement"]

    assert chain[2]["step"] == 3
    assert chain[2]["type"] == "baseline_divergence"

    assert chain[3]["step"] == 4
    assert chain[3]["type"] == "equipment_localization"
    assert "Jet Dyeing Vessel #01" in chain[3]["statement"]

    assert chain[4]["step"] == 5
    assert chain[4]["type"] == "supported_interpretation"
    assert chain[4]["is_fact"] is False
    assert "standby" in chain[4]["statement"].lower() or "idle" in chain[4]["statement"].lower()


def test_telemetry_timestamps_provenance_on_evidence(db_session, setup_why_incident_data):
    """Test 2: Verifies every evidence item contains exact observation timestamps that produced it."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    items = why["evidence_items"]
    assert len(items) >= 2

    for item in items:
        assert "evidence_id" in item
        assert "telemetry_timestamps" in item
        assert len(item["telemetry_timestamps"]) > 0
        assert any("2026-08" in ts for ts in item["telemetry_timestamps"])


def test_composite_evidence_strength_deterministic(db_session, setup_why_incident_data):
    """Test 3: Verifies multi-factor composite evidence strength scoring."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    # In leak1, deviation is large (3746%), sample count >= 12, CV is low, localized to asset
    item1 = why["evidence_items"][0]
    assert item1["strength"] == "STRONG"
    assert item1["sample_size"] >= 10


def test_baseline_hierarchy_tiers_and_unavailable_fallback(db_session, setup_why_incident_data):
    """Test 4: Verifies baseline hierarchy selection and truthful baseline_unavailable fallback."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    # With historical off-hours readings present, Tier 1 should be selected
    what_changed = why["what_changed"]
    assert len(what_changed) >= 1
    assert "Tier 1" in what_changed[0]["baseline_method_tier"]

    # Test baseline_unavailable fallback when zero comparison rows exist
    # Create isolated leak with zero process data
    isolated_leak = Leak(
        facility_id=setup_why_incident_data["fac1"].id,
        leak_type="behavioral",
        equipment="Ghost Equipment 99",
        process="None",
        risk_score=50.0,
        status="detected",
        baseline_consumption=None,
        observed_consumption=50.0,
        deviation_percent=100.0,
        reason="Isolated test anomaly with zero telemetry records.",
        detected_at=datetime(2026, 8, 15, 6, 0, tzinfo=timezone.utc)
    )
    db_session.add(isolated_leak)
    db_session.flush()

    isolated_why = IncidentWhyService.analyze_incident_why(db_session, isolated_leak.id, isolated_leak.facility_id)
    assert isolated_why["what_changed"][0]["baseline_method_tier"] == "baseline_unavailable"
    assert "unavailable" in isolated_why["what_changed"][0]["baseline_method_tier"].lower()


def test_multivariable_zero_variance_guard(db_session, setup_why_incident_data):
    """Test 5: Verifies that zero-variance variables prevent misleading correlation calculations."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    # In leak1 off-hours window, production is constant 0.0 (zero variance)
    associations = why["multivariable_analysis"]
    assert len(associations) >= 1

    assoc = associations[0]
    assert assoc["association_r"] is None
    assert "Zero variance" in assoc["note"]
    assert "Association indicates mutual variation" in assoc["caveat"]
    assert "not physical causation" in assoc["caveat"]


def test_multivariable_sample_size_guard(db_session, setup_why_incident_data):
    """Test 6: Verifies sample size guard (N < 10) prevents premature association calculation."""
    # Create incident with only 3 telemetry rows
    fac1 = setup_why_incident_data["fac1"]
    for i in range(3):
        db_session.add(ProcessData(
            facility_id=fac1.id,
            timestamp=datetime(2026, 8, 20, i + 1, 0, tzinfo=timezone.utc),
            date="2026-08-20",
            hour=i + 1,
            equipment="Small Sample Motor",
            process="Pumping",
            electricity_kwh=10.0 + i,
            production_volume=5.0 + i,
            operating_hours=1.0
        ))
    small_leak = Leak(
        facility_id=fac1.id,
        leak_type="behavioral",
        equipment="Small Sample Motor",
        process="Pumping",
        risk_score=60.0,
        status="detected",
        baseline_consumption=5.0,
        observed_consumption=12.0,
        deviation_percent=140.0,
        reason="Small sample test incident",
        detected_at=datetime(2026, 8, 20, 4, 0, tzinfo=timezone.utc)
    )
    db_session.add(small_leak)
    db_session.flush()

    small_why = IncidentWhyService.analyze_incident_why(db_session, small_leak.id, fac1.id)
    assoc = small_why["multivariable_analysis"][0]
    assert assoc["association_r"] is None
    assert "Insufficient paired observations" in assoc["note"]


def test_supported_factors_vs_not_confirmed(db_session, setup_why_incident_data):
    """Test 7: Verifies separation between supported factors and explicit not-confirmed physical failure bounds."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    supported = why["supported_contributors"]
    not_confirmed = why["not_confirmed"]

    assert len(supported) >= 1
    assert "Standby" in supported[0]["factor"] or "Idle" in supported[0]["factor"]

    assert len(not_confirmed) >= 1
    # Must explicitly state physical failure is not confirmed due to uninstrumented sensors
    nc_factors = [nc["factor"] for nc in not_confirmed]
    assert any("Mechanical" in f or "Valve" in f or "Motor" in f for f in nc_factors)
    assert any(len(nc["missing_telemetry"]) > 0 for nc in not_confirmed)


def test_hypothesis_falsification_conditions(db_session, setup_why_incident_data):
    """Test 8: Verifies 'What would change our conclusion?' generation."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    falsifications = why["what_would_change_conclusion"]
    assert len(falsifications) >= 1
    assert "strengthening_condition" in falsifications[0]
    assert "falsifying_condition" in falsifications[0]
    assert len(falsifications[0]["falsifying_condition"]) > 15


def test_narrow_problem_representation_for_phase3(db_session, setup_why_incident_data):
    """Test 9: Verifies narrow Phase 3 problem representation bridge without premature interventions."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    prob = why["problem_representation"]
    assert prob is not None
    assert prob["type"] in ["standby_idle_energy_loss", "specific_energy_consumption_spike"]
    assert prob["affected_equipment"] == leak1.equipment
    assert prob["estimated_carbon_impact_kg"] > 0
    assert len(prob["constraints"]) >= 1
    # Must not contain hardcoded intervention selections
    assert "chosen_intervention" not in prob


def test_non_causal_language_compliance(db_session, setup_why_incident_data):
    """Test 10: Verifies system strictly avoids hallucinated causality or unproven failure assertions."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    full_text = str(why).lower()
    # Forbidden causal claims
    assert "machine failure caused" not in full_text
    assert "definitely caused" not in full_text
    assert "guaranteed root cause" not in full_text
    assert "ai discovered the cause" not in full_text


def test_why_endpoint_multi_tenant_authorization(client, setup_why_incident_data):
    """Test 11 & 12: Verifies own incident access works and cross-tenant / unauthorized access is rejected."""
    u1 = setup_why_incident_data["u1"]
    u2 = setup_why_incident_data["u2"]
    leak1 = setup_why_incident_data["leak1"]

    token1 = create_access_token({"sub": str(u1.id), "role": u1.role, "facility_id": u1.facility_id})
    token2 = create_access_token({"sub": str(u2.id), "role": u2.role, "facility_id": u2.facility_id})

    # 1. Unauthenticated request is rejected with 401
    resp_unauth = client.get(f"/api/incidents/{leak1.id}/why")
    assert resp_unauth.status_code == 401

    # 2. Cross-tenant request is rejected with 403
    resp_cross = client.get(
        f"/api/incidents/{leak1.id}/why",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert resp_cross.status_code == 403

    # 3. Authorized tenant request succeeds with 200
    resp_own = client.get(
        f"/api/incidents/{leak1.id}/why",
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert resp_own.status_code == 200
    data = resp_own.json()["data"]
    assert "why_flagged_statement" in data
    assert len(data["evidence_chain"]) == 5
    assert len(data["evidence_items"]) >= 2
    assert "analysis_metadata" in data
    assert data["analysis_metadata"]["dataset_hash"] is not None


def test_analysis_run_lineage_and_metadata(db_session, setup_why_incident_data):
    """Test 13: Verifies AnalysisRun created with incident_evidence_investigation and dataset hash."""
    leak1 = setup_why_incident_data["leak1"]
    why = IncidentWhyService.analyze_incident_why(db_session, leak1.id, leak1.facility_id)

    meta = why["analysis_metadata"]
    assert meta["analysis_type"] == "incident_evidence_investigation"
    assert meta["methodology_version"] == "1.0.0"
    assert meta["input_record_count"] >= 12

    # Check database record in analysis_runs table
    ar = db_session.query(AnalysisRun).filter(AnalysisRun.id == meta["analysis_run_id"]).first()
    assert ar is not None
    assert ar.analysis_type == "incident_evidence_investigation"
    assert ar.facility_id == leak1.facility_id
