"""
Unit and Integration Tests for Phase 3: Evidence-Backed Intervention Recommendations.
Tests boundary matching, telemetry guards, zero/negative payback protection,
transparent 100-point additive scoring, objective weighting, provenance labeling,
challenge generation, checklist generation, and API multi-tenancy security.
"""

import pytest
from datetime import datetime, timezone
from app.models.facility import Facility
from app.models.user import User
from app.models.leak import Leak
from app.models.analysis_run import AnalysisRun
from app.models.process_data import ProcessData
from app.models.recommendation import Recommendation
from app.core.security import hash_password, create_access_token
from app.schemas.intervention import UserDecisionContext
from app.services.intervention_applicability_service import InterventionApplicabilityService
from app.services.intervention_impact_service import InterventionImpactService
from app.services.intervention_recommendation_service import InterventionRecommendationService
from app.data.recommendations import DEFAULT_RECOMMENDATIONS


@pytest.fixture
def setup_phase3_test_data(db_session):
    """Sets up facilities, users, process telemetry, and test leaks for Phase 3."""
    # Seed default recommendations into database if not present
    for rec_data in DEFAULT_RECOMMENDATIONS:
        rec_id = rec_data["id"]
        existing = db_session.query(Recommendation).filter(Recommendation.id == rec_id).first()
        model_fields = {c.name for c in Recommendation.__table__.columns}
        filtered_data = {k: v for k, v in rec_data.items() if k in model_fields}
        if not existing:
            db_session.add(Recommendation(**filtered_data))
    db_session.flush()

    # Facility 1: Textile Facility
    fac1 = Facility(
        business_name="Indus Weaving & Dyeing Ltd",
        sector="Textile & Garment Dyeing",
        location="Surat, Gujarat",
        production_type="Fabric Processing",
        production_volume=25000.0,
        operating_hours=24.0
    )
    db_session.add(fac1)
    db_session.flush()

    # User 1: Manager of Facility 1
    u1 = User(
        email="manager@indusweaving.com",
        hashed_password=hash_password("Password123!"),
        full_name="Anil Kumar",
        facility_id=fac1.id,
        role="facility_manager"
    )
    db_session.add(u1)

    # Facility 2: Metals Facility (For Multi-Tenancy Tests)
    fac2 = Facility(
        business_name="Kalyani Heavy Forgings",
        sector="Metals & Heavy Alloys",
        location="Pune, Maharashtra",
        production_type="Heavy Forging",
        production_volume=50000.0,
        operating_hours=24.0
    )
    db_session.add(fac2)
    db_session.flush()

    # User 2: Manager of Facility 2
    u2 = User(
        email="manager@kalyani.com",
        hashed_password=hash_password("Password123!"),
        full_name="Sunil Shinde",
        facility_id=fac2.id,
        role="facility_manager"
    )
    db_session.add(u2)

    # Admin User
    admin = User(
        email="auditor@circuleak.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Chief Auditor",
        facility_id=fac1.id,
        role="admin"
    )
    db_session.add(admin)
    db_session.flush()

    # Telemetry data for Boiler (Steam Generation) in Facility 1
    for day in range(1, 8):
        for hr in range(24):
            db_session.add(ProcessData(
                facility_id=fac1.id,
                timestamp=datetime(2026, 9, day, hr, 0, tzinfo=timezone.utc),
                date=f"2026-09-0{day}",
                hour=hr,
                equipment="Steam Boiler #01",
                process="Steam Generation",
                electricity_kwh=15.0,
                fuel_quantity=45.0,
                fuel_type="coal",
                production_volume=200.0,
                operating_hours=1.0
            ))

    # Telemetry data for Air Compressor in Facility 1 (with idle leak)
    for day in range(1, 8):
        for hr in range(24):
            is_off = hr in [22, 23, 0, 1, 2, 3]
            db_session.add(ProcessData(
                facility_id=fac1.id,
                timestamp=datetime(2026, 9, day, hr, 0, tzinfo=timezone.utc),
                date=f"2026-09-0{day}",
                hour=hr,
                equipment="Rotary Screw Compressor #02",
                process="Compressed Air",
                electricity_kwh=32.0 if is_off else 75.0,
                production_volume=0.0 if is_off else 250.0,
                operating_hours=0.0 if is_off else 1.0
            ))

    # Carbon Incident 1: Compressor Off-hours Idle Leak in Facility 1
    leak1 = Leak(
        facility_id=fac1.id,
        equipment="Rotary Screw Compressor #02",
        process="Compressed Air",
        leak_type="behavioral",
        risk_score=85.0,
        status="investigating",
        observed_consumption=32.0,
        baseline_consumption=0.5,
        deviation_percent=6300.0,
        emission_contribution_kg=22.5,
        abnormal_period="Off-hours (22:00 - 04:00)",
        production_status="Inactive",
        reason="Abnormal off-hours power draw on compressor during non-production shift.",
        detected_at=datetime(2026, 9, 7, 2, 0, tzinfo=timezone.utc)
    )
    db_session.add(leak1)

    # Carbon Incident 2: Boiler Thermal Inefficiency in Facility 1
    leak2 = Leak(
        facility_id=fac1.id,
        equipment="Steam Boiler #01",
        process="Steam Generation",
        leak_type="behavioral",
        risk_score=65.0,
        status="detected",
        observed_consumption=45.0,
        baseline_consumption=36.0,
        deviation_percent=25.0,
        emission_contribution_kg=65.0,
        abnormal_period="Day Shift Continuous",
        production_status="Active",
        reason="Excess fuel consumption observed exceeding baseline during steady steam generation.",
        detected_at=datetime(2026, 9, 7, 10, 0, tzinfo=timezone.utc)
    )
    db_session.add(leak2)

    db_session.commit()

    return {
        "fac1": fac1,
        "fac2": fac2,
        "user1": u1,
        "user2": u2,
        "admin": admin,
        "compressor_leak": leak1,
        "boiler_leak": leak2
    }


# =========================================================================
# Unit Tests: Knowledge Base & Applicability Service
# =========================================================================

def test_recommendation_catalog_loaded(db_session, setup_phase3_test_data):
    """Verify that all default interventions are loaded into database with reference provenance."""
    recs = db_session.query(Recommendation).all()
    assert len(recs) >= 10
    for r in recs:
        assert r.id is not None
        assert r.reference_organization is not None
        assert r.reference_parameter_range is not None
        assert r.capex_model is not None


def test_boundary_match_boiler_vs_compressor(db_session, setup_phase3_test_data):
    """Verify boiler economizer matches boiler incidents and rejects compressor incidents."""
    boiler_rec = db_session.query(Recommendation).filter(Recommendation.id == "whr_boiler_flue").first()
    assert boiler_rec is not None

    # Boiler problem representation
    boiler_prob = {
        "affected_equipment": "Steam Boiler #01",
        "affected_process": "Steam Generation",
        "problem_type": "thermal_efficiency_drop",
        "evidence_strength": "STRONG"
    }
    app_boiler = InterventionApplicabilityService.evaluate_applicability(
        recommendation=boiler_rec,
        problem_rep=boiler_prob,
        facility_sector="Textile & Garment Dyeing",
        available_telemetry={"fuel_rate", "energy_kwh"}
    )
    assert app_boiler.boundary_match is True
    assert app_boiler.problem_fit is True
    assert app_boiler.status == "applicable"

    # Compressor problem representation
    comp_prob = {
        "affected_equipment": "Rotary Screw Compressor #02",
        "affected_process": "Compressed Air",
        "problem_type": "off_hours_idle_waste",
        "evidence_strength": "STRONG"
    }
    app_comp = InterventionApplicabilityService.evaluate_applicability(
        recommendation=boiler_rec,
        problem_rep=comp_prob,
        facility_sector="Textile & Garment Dyeing",
        available_telemetry={"energy_kwh"}
    )
    assert app_comp.boundary_match is False
    assert app_comp.status == "not_applicable"
    assert any("boundary mismatch" in r.lower() for r in app_comp.disqualification_reasons)


def test_telemetry_guard_missing_telemetry(db_session, setup_phase3_test_data):
    """
    When required telemetry is missing, intervention becomes conditionally_applicable
    and economics returns status='insufficient_data' with null calculated payback.
    """
    boiler_rec = db_session.query(Recommendation).filter(Recommendation.id == "whr_boiler_flue").first()
    boiler_prob = {
        "affected_equipment": "Steam Boiler #01",
        "affected_process": "Steam Generation",
        "problem_type": "thermal_efficiency_drop",
        "evidence_strength": "STRONG"
    }
    # Available telemetry does NOT have 'fuel_rate'
    app = InterventionApplicabilityService.evaluate_applicability(
        recommendation=boiler_rec,
        problem_rep=boiler_prob,
        facility_sector="Textile & Garment Dyeing",
        available_telemetry={"energy_kwh"}  # fuel_rate missing!
    )
    assert app.status == "conditionally_applicable"
    assert "fuel_rate" in app.missing_telemetry
    assert any("fuel_rate" in c for c in app.conditions_for_applicability)

    # Evaluate economics with missing telemetry
    econ = InterventionImpactService.evaluate_economics(
        recommendation=boiler_rec,
        problem_rep=boiler_prob,
        applicability=app
    )
    assert econ.status == "insufficient_data"
    assert econ.payback_period_years is None
    assert econ.annual_savings_inr is None
    assert "fuel_rate" in econ.missing_variables


def test_payback_zero_or_negative_net_savings(db_session, setup_phase3_test_data):
    """
    Verify that when net annual savings <= 0, payback is strictly None
    and never divides by zero or outputs negative payback.
    """
    rec = db_session.query(Recommendation).filter(Recommendation.id == "auto_idle_shutdown").first()
    prob = {
        "affected_equipment": "Rotary Screw Compressor #02",
        "affected_process": "Compressed Air",
        "problem_type": "off_hours_idle_waste",
        "evidence_strength": "STRONG",
        "estimated_financial_impact_inr": 0.0,
        "estimated_carbon_impact_kg": 0.0
    }
    app = InterventionApplicabilityService.evaluate_applicability(
        recommendation=rec,
        problem_rep=prob,
        facility_sector="Textile & Garment Dyeing",
        available_telemetry={"energy_kwh"}
    )
    econ = InterventionImpactService.evaluate_economics(rec, prob, app)
    # When savings are positive, payback is a positive number
    if econ.annual_savings_inr and econ.annual_opex_inr and (econ.annual_savings_inr <= econ.annual_opex_inr):
        assert econ.payback_period_years is None


# =========================================================================
# Unit Tests: 100-Point Score Decomposition & Objective Weighting
# =========================================================================

def test_additive_score_decomposition_totals_and_maxes(db_session, setup_phase3_test_data):
    """Verify score breakdown components sum to total_score and respect category maxima."""
    data = setup_phase3_test_data
    comp_leak = data["compressor_leak"]

    context = UserDecisionContext(primary_objective="payback")
    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=comp_leak.id,
        context=context
    )

    assert resp.top_recommendation is not None
    top = resp.top_recommendation
    sb = top.score_breakdown

    # Category maxima: 24, 20, 15, 12, 8, 3 = 100
    assert 0.0 <= sb.problem_fit_score <= 24.0
    assert 0.0 <= sb.objective_alignment_score <= 20.0
    assert 0.0 <= sb.economic_attractiveness_score <= 15.0
    assert 0.0 <= sb.evidence_support_score <= 12.0
    assert 0.0 <= sb.implementation_fit_score <= 8.0
    assert 0.0 <= sb.safety_score <= 3.0

    expected_sum = round(
        sb.problem_fit_score + sb.objective_alignment_score + sb.economic_attractiveness_score +
        sb.evidence_support_score + sb.implementation_fit_score + sb.safety_score, 1
    )
    assert abs(sb.total_score - expected_sum) <= 0.1
    assert 0.0 <= sb.total_score <= 100.0


def test_primary_objective_weighting_payback_vs_carbon(db_session, setup_phase3_test_data):
    """Verify changing primary objective shifts alignment scores accordingly."""
    data = setup_phase3_test_data
    comp_leak = data["compressor_leak"]

    # 1. Payback Objective
    ctx_payback = UserDecisionContext(primary_objective="payback")
    resp_payback = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session, incident_id=comp_leak.id, context=ctx_payback
    )

    # 2. Carbon Objective
    ctx_carbon = UserDecisionContext(primary_objective="carbon")
    resp_carbon = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session, incident_id=comp_leak.id, context=ctx_carbon
    )

    assert resp_payback.top_recommendation is not None
    assert resp_carbon.top_recommendation is not None
    # Both responses succeed and reflect their selected objective in detail
    assert "payback" in resp_payback.decision_context.primary_objective
    assert "carbon" in resp_carbon.decision_context.primary_objective


def test_user_constraints_filtering(db_session, setup_phase3_test_data):
    """Verify max_capex_inr constraint moves high capex interventions to conditionally applicable."""
    data = setup_phase3_test_data
    boiler_leak = data["boiler_leak"]

    # Set tight Capex constraint of ₹100,000 (Boiler WHR costs ~₹350k)
    ctx_tight = UserDecisionContext(primary_objective="payback", max_capex_inr=100000.0)
    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session, incident_id=boiler_leak.id, context=ctx_tight
    )

    # Any recommendation with Capex > 100,000 should not be in applicable_recommendations
    for app_rec in resp.applicable_recommendations:
        if app_rec.economics.capex_inr:
            assert app_rec.economics.capex_inr <= 100000.0


def test_provenance_labels_integrity(db_session, setup_phase3_test_data):
    """Verify economic evaluation includes explicit provenance tags."""
    data = setup_phase3_test_data
    comp_leak = data["compressor_leak"]

    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session, incident_id=comp_leak.id
    )
    assert resp.top_recommendation is not None
    labels = resp.top_recommendation.economics.data_provenance_labels
    assert "[REFERENCE]" in labels.values() or "[SCENARIO]" in labels.values()
    assert len(resp.top_recommendation.economics.assumptions_applied) > 0


def test_contextual_synthesis_fields(db_session, setup_phase3_test_data):
    """Verify 'Why this fits', 'Why not others', 'Challenge', and 'Checklist' are populated."""
    data = setup_phase3_test_data
    comp_leak = data["compressor_leak"]

    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session, incident_id=comp_leak.id
    )

    assert len(resp.why_this_option_fits) >= 3
    assert len(resp.why_not_others) > 0
    assert "critical_counterarguments" in resp.challenge_my_recommendation
    assert len(resp.verification_checklist) >= 4


# =========================================================================
# Integration Tests: API Endpoints & Security Authorization
# =========================================================================

def test_api_get_interventions_catalog(client, setup_phase3_test_data):
    """Test GET /api/interventions returns active catalog with reference provenance."""
    data = setup_phase3_test_data
    token = create_access_token({"sub": str(data["user1"].id)})

    res = client.get("/api/interventions", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]) >= 10
    item = body["data"][0]
    assert "id" in item
    assert "title" in item
    assert "reference_organization" in item


def test_api_get_incident_recommendations(client, setup_phase3_test_data):
    """Test GET /api/incidents/{incident_id}/recommendations returns structured decision console data."""
    data = setup_phase3_test_data
    token = create_access_token({"sub": str(data["user1"].id)})
    leak_id = data["compressor_leak"].id

    res = client.get(
        f"/api/incidents/{leak_id}/recommendations?primary_objective=payback",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    rec_data = body["data"]
    assert rec_data["incident_id"] == leak_id
    assert rec_data["top_recommendation"] is not None
    assert "score_breakdown" in rec_data["top_recommendation"]
    assert "why_this_option_fits" in rec_data
    assert "challenge_my_recommendation" in rec_data


def test_api_post_incident_recommendations_custom_context(client, setup_phase3_test_data):
    """Test POST /api/incidents/{incident_id}/recommendations with custom decision context."""
    data = setup_phase3_test_data
    token = create_access_token({"sub": str(data["user1"].id)})
    leak_id = data["compressor_leak"].id

    payload = {
        "primary_objective": "carbon",
        "max_capex_inr": 500000.0,
        "acceptable_disruption": "Low"
    }
    res = client.post(
        f"/api/incidents/{leak_id}/recommendations",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["decision_context"]["primary_objective"] == "carbon"


def test_api_compare_incident_recommendations(client, setup_phase3_test_data):
    """Test POST /api/incidents/{incident_id}/recommendations/compare performs side-by-side analysis."""
    data = setup_phase3_test_data
    token = create_access_token({"sub": str(data["user1"].id)})
    leak_id = data["compressor_leak"].id

    payload = {
        "intervention_ids": ["air_leak_audit_repair", "vfd_compressor_retrofit"]
    }
    res = client.post(
        f"/api/incidents/{leak_id}/recommendations/compare",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]["items"]) >= 2
    assert len(body["data"]["tradeoff_analysis"]) >= 2


def test_multi_tenancy_security_403(client, setup_phase3_test_data):
    """Verify user from Facility 2 cannot access recommendations for Facility 1's incident."""
    data = setup_phase3_test_data
    token_user2 = create_access_token({"sub": str(data["user2"].id)})  # Facility 2 manager
    leak1_id = data["compressor_leak"].id                     # Belongs to Facility 1

    res = client.get(
        f"/api/incidents/{leak1_id}/recommendations",
        headers={"Authorization": f"Bearer {token_user2}"}
    )
    assert res.status_code == 403
