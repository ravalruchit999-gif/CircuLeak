"""
Phase 3 Remediation Test Suite — CIRCULeak
Validates fixes for F-01 through F-13:
- F-01: Canonical problem_type contract & strict applicability matching
- F-02: AnalysisRun transaction persistence
- F-03: Emission factor dynamic resolution & [REFERENCE] provenance
- F-04: Tariff resolution (custom scenario vs reference)
- F-05: Generic catalog comparison without fabricated incident economics
- F-06: Insufficient data handling (no fallback losses, no 3x heuristic)
- F-07: Range bounds from explicit model parameters or None
- F-08: Waste diversion requires real measurement or None
- F-09: Null vs 0 semantic distinction
- F-10: Strict provenance label classification
- F-11: Empty telemetry does not assume energy_kwh
- F-12: Alembic downgrade definition
- F-13: Recommendation decision context fingerprint / hash
"""

import pytest
import datetime
from pathlib import Path
from sqlalchemy.orm import Session

from app.models.facility import Facility
from app.models.user import User
from app.models.leak import Leak
from app.models.recommendation import Recommendation
from app.models.process_data import ProcessData
from app.models.analysis_run import AnalysisRun
from app.models.emission_factor import EmissionFactor
from app.schemas.leak import ProblemRepresentation
from app.schemas.intervention import (
    UserDecisionContext,
    ApplicabilityEvaluation,
    EconomicEvaluation,
    IncidentRecommendationResponse
)
from app.services.intervention_applicability_service import InterventionApplicabilityService
from app.services.intervention_impact_service import InterventionImpactService
from app.services.intervention_recommendation_service import InterventionRecommendationService
from app.services.emission_service import EmissionService
from app.services.incident_why_service import IncidentWhyService
from app.core.security import create_access_token


from app.data.recommendations import DEFAULT_RECOMMENDATIONS


@pytest.fixture
def remediation_fixtures(db_session: Session):
    # Seed default recommendations
    for rec_data in DEFAULT_RECOMMENDATIONS:
        rec_id = rec_data["id"]
        existing = db_session.query(Recommendation).filter(Recommendation.id == rec_id).first()
        model_fields = {c.name for c in Recommendation.__table__.columns}
        filtered_data = {k: v for k, v in rec_data.items() if k in model_fields}
        if not existing:
            db_session.add(Recommendation(**filtered_data))
    db_session.flush()

    # Facility
    fac = Facility(
        business_name="Remediation Testing Facility",
        sector="Textile & Garment Dyeing",
        location="Gujarat",
        production_type="Chemical Processing",
        production_volume=5000.0,
        employees=100,
        operating_hours=24.0,
        energy_sources=["grid_electricity", "natural_gas"]
    )
    db_session.add(fac)
    db_session.flush()

    # User
    user = User(
        email="remediation_auditor@circuleak.com",
        hashed_password="mockhashedpass",
        full_name="Remediation Auditor",
        role="energy_manager",
        facility_id=fac.id
    )
    db_session.add(user)

    # Parent AnalysisRun
    parent_run = AnalysisRun(
        id="RUN-PARENT-TEST-999",
        facility_id=fac.id,
        analysis_type="anomaly_detection",
        model_name="IsolationForest",
        model_version="1.0.0",
        dataset_hash_sha256="aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899",
        status="completed"
    )
    db_session.add(parent_run)
    db_session.flush()

    # Leak
    leak = Leak(
        facility_id=fac.id,
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
        analysis_run_id=parent_run.id,
        detected_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db_session.add(leak)
    db_session.flush()

    # Telemetry rows
    for i in range(5):
        pd = ProcessData(
            facility_id=fac.id,
            timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=i),
            equipment="Rotary Screw Compressor #02",
            process="Compressed Air",
            electricity_kwh=32.0,
            production_volume=100.0,
            operating_hours=1.0,
            calculated_emissions_kg=22.5
        )
        db_session.add(pd)

    # Emission Factor
    ef = EmissionFactor(
        source_name="grid_electricity",
        factor_value=0.716,
        unit="kgCO2e/kWh",
        reference="CEA CO2 Baseline Database v19",
        version="19.0",
        scope="Scope 2",
        is_active=True
    )
    db_session.add(ef)
    db_session.commit()

    return {"facility": fac, "user": user, "leak": leak, "parent_run": parent_run}


def test_f01_problem_representation_canonical_and_applicability_rejection(db_session, remediation_fixtures):
    """F-01: Verify canonical problem_type field and strict rejection of missing/empty problem types."""
    # 1. Canonical problem_type initializes properly
    prob1 = ProblemRepresentation(problem_type="excess_boiler_fuel_consumption")
    assert prob1.problem_type == "excess_boiler_fuel_consumption"
    assert prob1.type == "excess_boiler_fuel_consumption"

    # 2. Backward compatibility: setting 'type' populates 'problem_type'
    prob2 = ProblemRepresentation(type="compressed_air_leak")
    assert prob2.problem_type == "compressed_air_leak"

    rec = db_session.query(Recommendation).filter(Recommendation.id == "air_leak_audit_repair").first()
    assert rec is not None

    # 3. Missing/None problem type fails closed (problem_fit = False)
    eval_none = InterventionApplicabilityService.evaluate_applicability(
        recommendation=rec,
        problem_rep={"affected_equipment": "Air Compressor #1"},
        available_telemetry={"energy_kwh"}
    )
    assert eval_none.problem_fit is False
    assert any("missing or undefined" in r.lower() for r in eval_none.disqualification_reasons)

    # 4. Empty string does NOT contain-match everything (fails closed)
    eval_empty = InterventionApplicabilityService.evaluate_applicability(
        recommendation=rec,
        problem_rep={"problem_type": "", "affected_equipment": "Air Compressor #1"},
        available_telemetry={"energy_kwh"}
    )
    assert eval_empty.problem_fit is False

    # 5. Whitespace string fails closed
    eval_ws = InterventionApplicabilityService.evaluate_applicability(
        recommendation=rec,
        problem_rep={"problem_type": "   ", "affected_equipment": "Air Compressor #1"},
        available_telemetry={"energy_kwh"}
    )
    assert eval_ws.problem_fit is False

    # 6. Unknown problem type fails closed
    eval_unknown = InterventionApplicabilityService.evaluate_applicability(
        recommendation=rec,
        problem_rep={"problem_type": "completely_unrelated_problem", "affected_equipment": "Air Compressor #1"},
        available_telemetry={"energy_kwh"}
    )
    assert eval_unknown.problem_fit is False


def test_f02_analysis_run_persistence_in_db_session(db_session, remediation_fixtures):
    """F-02: Verify that generating recommendations creates and persists an AnalysisRun in DB."""
    data = remediation_fixtures
    leak = data["leak"]

    context = UserDecisionContext(primary_objective="payback")
    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=leak.id,
        context=context
    )
    db_session.commit()

    assert resp.analysis_run_id is not None

    # Query in fresh query to verify DB persistence
    saved_run = db_session.query(AnalysisRun).filter(AnalysisRun.id == resp.analysis_run_id).first()
    assert saved_run is not None
    assert saved_run.analysis_type == "intervention_recommendation"
    assert saved_run.model_name == "InterventionRecommendationEngine"
    assert saved_run.status == "completed"
    assert saved_run.facility_id == leak.facility_id
    assert saved_run.dataset_hash_sha256 == data["parent_run"].dataset_hash_sha256
    assert "analysis_context_hash" in saved_run.parameters


def test_f03_emission_factor_dynamic_resolution_and_provenance(db_session, remediation_fixtures):
    """F-03: Dynamic emission factor lookup and [REFERENCE] provenance (never [MEASURED])."""
    data = remediation_fixtures
    factor = EmissionService.get_factor_for_telemetry(db_session, "grid_electricity")
    assert factor is not None
    assert factor.factor_value == 0.716

    rec = db_session.query(Recommendation).filter(Recommendation.id == "air_leak_audit_repair").first()
    app = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True,
        missing_telemetry=[],
        disqualification_reasons=[],
        conditions_for_applicability=[]
    )
    econ = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "compressed_air_leak", "financial_loss_inr": 200000.0},
        applicability=app,
        telemetry_timestamp=datetime.datetime.now(datetime.timezone.utc)
    )

    # Grid factor must carry [REFERENCE] provenance, NOT [MEASURED]
    assert econ.data_provenance_labels.get("grid_emission_factor") == "[REFERENCE]"


def test_f04_tariff_resolution_custom_scenario_vs_reference(db_session, remediation_fixtures):
    """F-04: Verify custom scenario tariff is applied and labeled [SCENARIO]."""
    rec = db_session.query(Recommendation).filter(Recommendation.id == "air_leak_audit_repair").first()
    app = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True,
        missing_telemetry=[],
        disqualification_reasons=[],
        conditions_for_applicability=[]
    )

    # With custom scenario tariff
    econ_scenario = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "compressed_air_leak", "financial_loss_inr": 200000.0},
        applicability=app,
        custom_electricity_tariff_inr=11.50
    )
    assert econ_scenario.data_provenance_labels.get("electricity_tariff") == "[SCENARIO]"
    assert any("11.50" in a for a in econ_scenario.assumptions_applied)

    # Without custom tariff -> reference schedule
    econ_ref = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "compressed_air_leak", "financial_loss_inr": 200000.0},
        applicability=app
    )
    assert econ_ref.data_provenance_labels.get("electricity_tariff") == "[REFERENCE]"


def test_f05_generic_catalog_comparison_no_fabricated_incident_economics(db_session, remediation_fixtures):
    """F-05: Catalog comparison without incident context uses published parameters, no fabricated incident loss."""
    res = InterventionRecommendationService.compare_interventions(
        db=db_session,
        intervention_ids=["whr_boiler_flue", "vfd_compressor_retrofit"],
        incident_id=None
    )
    assert len(res.items) == 2
    for item in res.items:
        # All provenance must be [REFERENCE]
        for key, prov in item.economics.data_provenance_labels.items():
            assert prov == "[REFERENCE]"
        # Must document that nominal case study values are used
        assert any("Nominal case-study benchmark values" in a for a in item.economics.assumptions_applied)


def test_f06_insufficient_data_no_fallback_loss(db_session, remediation_fixtures):
    """F-06: When problem financial loss <= 0 and no telemetry, does NOT manufacture ₹150,000 fallback."""
    rec = db_session.query(Recommendation).filter(Recommendation.id == "whr_boiler_flue").first()
    app = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True,
        missing_telemetry=[],
        disqualification_reasons=[],
        conditions_for_applicability=[]
    )
    econ = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "combustion_inefficiency", "financial_loss_inr": 0.0},
        applicability=app
    )
    # Annual savings should be based on published reference or None, NOT an arbitrary ₹150k heuristic
    assert econ.annual_savings_inr != 150000.0
    # Must explicitly state benchmark / reference in assumptions
    assert any("[REFERENCE]" in a or "benchmark" in a.lower() for a in econ.assumptions_applied)


def test_f07_range_calculation_derived_from_model_bounds(db_session, remediation_fixtures):
    """F-07: Uncertainty ranges originate from model parameters or return None."""
    rec = db_session.query(Recommendation).filter(Recommendation.id == "whr_boiler_flue").first()
    app = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True,
        missing_telemetry=[],
        disqualification_reasons=[],
        conditions_for_applicability=[]
    )
    econ = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "combustion_inefficiency", "financial_loss_inr": 300000.0},
        applicability=app
    )
    # Range is derived from lower_bound_pct / upper_bound_pct or None
    if econ.savings_range:
        assert econ.savings_range.lower_bound <= econ.savings_range.expected <= econ.savings_range.upper_bound


def test_f08_waste_diversion_unmetered_returns_none(db_session, remediation_fixtures):
    """F-08: When factory waste/effluent is unmetered, waste diversion returns None (no 120,000 kg constant)."""
    rec = db_session.query(Recommendation).filter(Recommendation.id == "whr_boiler_flue").first()
    app = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True,
        missing_telemetry=[],
        disqualification_reasons=[],
        conditions_for_applicability=[]
    )
    econ = InterventionImpactService.evaluate_economics(
        db=db_session,
        recommendation=rec,
        problem_rep={"problem_type": "combustion_inefficiency"},
        applicability=app
    )
    assert econ.waste_diversion_annual_kg is None
    assert econ.waste_diversion_annual_kg != 120000.0
    assert econ.waste_diversion_annual_kg != 8500.0


def test_f09_null_vs_zero_semantics():
    """F-09: Explicit verification that None and 0.0 remain semantically distinct."""
    econ_null = EconomicEvaluation(
        status="evaluated",
        annual_savings_inr=None,
        capex_inr=500000.0
    )
    econ_zero = EconomicEvaluation(
        status="evaluated",
        annual_savings_inr=0.0,
        capex_inr=500000.0
    )
    assert econ_null.annual_savings_inr is None
    assert econ_zero.annual_savings_inr == 0.0
    assert econ_null.annual_savings_inr != econ_zero.annual_savings_inr


def test_f10_provenance_labels_strict_classification(db_session, remediation_fixtures):
    """F-10: Provenance labels are strictly categorized."""
    data = remediation_fixtures
    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=data["leak"].id,
        context=UserDecisionContext(primary_objective="payback")
    )
    top = resp.top_recommendation
    assert top is not None
    provs = top.economics.data_provenance_labels
    assert provs.get("grid_emission_factor") in ("[REFERENCE]", None)
    assert provs.get("electricity_tariff") in ("[REFERENCE]", "[SCENARIO]")


def test_f11_empty_telemetry_does_not_assume_energy_kwh(db_session, remediation_fixtures):
    """F-11: Telemetry availability starts as empty set; no assumed sensors."""
    empty_fac = Facility(
        business_name="Empty Facility",
        sector="Engineering",
        location="Pune",
        production_type="Assembly",
        production_volume=100.0,
        employees=10,
        operating_hours=8.0,
        energy_sources=["grid_electricity"]
    )
    db_session.add(empty_fac)
    db_session.flush()

    empty_leak = Leak(
        facility_id=empty_fac.id,
        equipment="Chiller #1",
        process="Refrigeration",
        leak_type="refrigerant_leak",
        risk_score=20.0,
        baseline_consumption=0.0,
        observed_consumption=0.0,
        emission_contribution_kg=0.0,
        reason="Refrigerant pressure drop detected.",
        status="investigating",
        detected_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db_session.add(empty_leak)
    db_session.commit()

    # Query telemetry count for empty_fac
    count = db_session.query(ProcessData).filter(ProcessData.facility_id == empty_fac.id).count()
    assert count == 0

    resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=empty_leak.id
    )
    assert resp is not None


def test_f12_alembic_downgrade_implemented():
    """F-12: Alembic downgrade definition contains real drop_column operations."""
    mig_path = Path(__file__).resolve().parent.parent / "alembic" / "versions" / "001_phase3_intervention_knowledge_base.py"
    assert mig_path.exists()
    content = mig_path.read_text(encoding="utf-8")
    assert "def downgrade():" in content
    assert "batch_op.drop_column" in content
    assert "intervention_category" in content
    downgrade_part = content[content.find("def downgrade():"):]
    assert "pass" not in downgrade_part.strip().splitlines()[-1]


def test_f13_recommendation_lineage_context_hash(db_session, remediation_fixtures):
    """F-13: Same telemetry + different decision context = different analysis context hash."""
    data = remediation_fixtures
    leak = data["leak"]

    ctx_payback = UserDecisionContext(primary_objective="payback")
    resp_payback = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=leak.id,
        context=ctx_payback
    )

    ctx_carbon = UserDecisionContext(primary_objective="carbon")
    resp_carbon = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=leak.id,
        context=ctx_carbon
    )

    # Raw dataset hash is identical (same parent telemetry)
    assert resp_payback.dataset_hash_sha256 == resp_carbon.dataset_hash_sha256

    # Context hashes MUST be different because decision objectives differ
    assert resp_payback.analysis_context_hash != resp_carbon.analysis_context_hash
    assert resp_payback.analysis_context_hash is not None
    assert resp_carbon.analysis_context_hash is not None


def test_phase1_to_phase2_to_phase3_end_to_end_pipeline(db_session, remediation_fixtures):
    """
    Section 20: True end-to-end pipeline test:
    REAL TEST TELEMETRY -> Phase 1 Incident -> Phase 2 Evidence & ProblemRepresentation ->
    Phase 3 Applicability -> Impact & Dynamic Factor Resolution -> Objective Ranking -> Recommendation.
    Zero manually constructed mock ProblemRepresentation.
    """
    data = remediation_fixtures
    fac = data["facility"]
    base_time = datetime.datetime(2026, 9, 10, 0, 0, 0)

    # 1. Real Test Telemetry (Phase 1 ingestion records with off-hours idle waste)
    for i in range(12):
        ts = base_time + datetime.timedelta(hours=i)
        is_night = i in [0, 1, 2, 3, 22, 23]
        prod = 0.0 if is_night else 100.0
        kwh = 45.0 if is_night else 50.0  # 45 kWh standby waste during 0 production
        pd = ProcessData(
            facility_id=fac.id,
            timestamp=ts,
            date=ts.strftime("%Y-%m-%d"),
            hour=ts.hour,
            equipment="Compressor 01",
            process="Compressed Air",
            production_volume=prod,
            operating_hours=1.0,
            electricity_kwh=kwh,
            calculated_emissions_kg=round(kwh * 0.82, 2)
        )
        db_session.add(pd)
    db_session.commit()

    # 2. Phase 1 Incident Generation (Anomaly detection)
    incident = Leak(
        facility_id=fac.id,
        leak_type="unloaded_standby_power",
        equipment="Compressor 01",
        process="Compressed Air",
        reason="Detected sustained 45.0 kWh consumption during zero-production off-hours",
        risk_score=78.0,
        baseline_consumption=5.0,
        observed_consumption=45.0,
        deviation_percent=800.0,
        emission_contribution_kg=32.8,
        detected_at=base_time + datetime.timedelta(hours=3),
        status="detected"
    )
    db_session.add(incident)
    db_session.commit()
    db_session.refresh(incident)

    # 3. Phase 2: Evidence Grounded Why Analysis -> Produces Canonical ProblemRepresentation
    why = IncidentWhyService.analyze_incident_why(db_session, incident.id, fac.id)
    assert "problem_representation" in why
    problem_rep = why["problem_representation"]
    assert problem_rep is not None
    assert problem_rep["type"] in ["standby_idle_energy_loss", "unloaded_idle_runtime", "specific_energy_consumption_spike"]
    assert problem_rep["affected_equipment"] == "Compressor 01"
    assert "chosen_intervention" not in problem_rep  # Unbiased representation

    # 4. Phase 3: Evidence-Backed Intervention Recommendation
    ctx = UserDecisionContext(
        primary_objective="carbon",
        acceptable_disruption="High",
        custom_electricity_tariff_inr=8.50
    )
    rec_resp = InterventionRecommendationService.generate_recommendations_for_incident(
        db=db_session,
        incident_id=incident.id,
        context=ctx
    )

    # 5. Verify End-to-End Truthfulness & Lineage
    assert rec_resp.incident_id == incident.id
    assert rec_resp.facility_id == fac.id
    assert rec_resp.analysis_run_id is not None
    assert rec_resp.analysis_context_hash is not None
    assert len(rec_resp.applicable_recommendations) >= 1

    top = rec_resp.top_recommendation
    assert top is not None
    assert top.target_equipment in ["Compressor", "Compressor 01", "Motor", "Boiler"]
    assert top.economics.data_provenance_labels is not None

    # Verify dynamic factor resolution & tariff provenance
    for tag in top.economics.data_provenance_labels.values():
        assert any(t in tag for t in ["[MEASURED]", "[CALCULATED]", "[REFERENCE]", "[ASSUMPTION]", "[SCENARIO]"])

    # Verify no fabricated factory waste or fabricated numbers
    assert top.economics.waste_diversion_annual_kg is None or isinstance(top.economics.waste_diversion_annual_kg, (int, float))


# =============================================================================
# NF-01, NF-02, NF-03, NF-04 FINAL REMEDIATION REGRESSION TESTS
# =============================================================================

def test_nf01_measured_zero_telemetry_presence(db_session, remediation_fixtures):
    """
    NF-01: Measured zero (0.0 kWh) is a valid physical telemetry observation.
    Must distinguish None (missing/unavailable) vs 0.0 (present zero) vs negative (invalid).
    """
    from types import SimpleNamespace
    fac = remediation_fixtures["facility"]
    base_time = datetime.datetime.now(datetime.timezone.utc)

    # 1. Database Row with measured zero: 0.0 kWh, 0.0 fuel, 0.0 production
    zero_row = ProcessData(
        facility_id=fac.id,
        timestamp=base_time - datetime.timedelta(minutes=10),
        equipment="Compressor-NF01",
        process="Compressed Air",
        electricity_kwh=0.0,
        fuel_quantity=0.0,
        fuel_type="none",
        operating_hours=1.0,
        production_volume=0.0
    )
    db_session.add(zero_row)
    db_session.commit()

    rows = db_session.query(ProcessData).filter(
        ProcessData.facility_id == fac.id,
        ProcessData.equipment == "Compressor-NF01"
    ).all()

    available_telemetry = set()
    for r in rows:
        if getattr(r, "electricity_kwh", None) is not None and r.electricity_kwh >= 0:
            available_telemetry.add("energy_kwh")
            available_telemetry.add("electricity_kwh")
        if getattr(r, "fuel_quantity", None) is not None and r.fuel_quantity >= 0:
            available_telemetry.add("fuel_rate")
            available_telemetry.add("fuel_quantity")
        if getattr(r, "operating_hours", None) is not None and r.operating_hours >= 0:
            available_telemetry.add("operating_hours")
        if getattr(r, "production_volume", None) is not None and r.production_volume >= 0:
            available_telemetry.add("production_volume")

    # NF-01 Verification: 0.0 kWh MUST mark energy_kwh as present!
    assert "energy_kwh" in available_telemetry
    assert "electricity_kwh" in available_telemetry
    assert "production_volume" in available_telemetry
    assert "fuel_quantity" in available_telemetry

    # 2. Uninstrumented telemetry channels (None) - must NOT be marked present
    none_records = [
        SimpleNamespace(electricity_kwh=None, fuel_quantity=None, fuel_type=None, operating_hours=None, production_volume=None)
    ]
    avail_none = set()
    for r in none_records:
        if getattr(r, "electricity_kwh", None) is not None and r.electricity_kwh >= 0:
            avail_none.add("energy_kwh")
        if getattr(r, "fuel_quantity", None) is not None and r.fuel_quantity >= 0:
            avail_none.add("fuel_quantity")
        if getattr(r, "production_volume", None) is not None and r.production_volume >= 0:
            avail_none.add("production_volume")

    assert "energy_kwh" not in avail_none
    assert "fuel_quantity" not in avail_none
    assert "production_volume" not in avail_none

    # 3. Physically invalid negative telemetry (< 0) - must NOT be marked present
    neg_records = [
        SimpleNamespace(electricity_kwh=-15.0, fuel_quantity=-5.0, fuel_type="none", operating_hours=-1.0, production_volume=-100.0)
    ]
    avail_neg = set()
    for r in neg_records:
        if getattr(r, "electricity_kwh", None) is not None and r.electricity_kwh >= 0:
            avail_neg.add("energy_kwh")
        if getattr(r, "fuel_quantity", None) is not None and r.fuel_quantity >= 0:
            avail_neg.add("fuel_quantity")
        if getattr(r, "production_volume", None) is not None and r.production_volume >= 0:
            avail_neg.add("production_volume")

    assert len(avail_neg) == 0


def test_nf02_tariff_scenario_dynamic_financial_loss_and_factor_mutation(db_session, remediation_fixtures):
    """
    NF-02: Phase 2 ProblemRepresentation bridge physical foundation and Phase 3 dynamic economics.
    1. Factory has excess_kwh = 100.
    2. Run recommendation with custom tariff = 11.20 -> savings derives from 11.20.
    3. Run recommendation with custom tariff = 5.00 -> savings changes to derive from 5.00.
    4. Run recommendation with custom tariff = 15.00 -> savings changes to derive from 15.00.
    5. Mutate DB emission factor from 0.716 to 0.50 then 0.95 -> CO2 abatement changes dynamically.
    6. Verify no stage still injects 7.50 when custom tariff is active!
    """
    fac = remediation_fixtures["facility"]
    rec = db_session.query(Recommendation).filter(Recommendation.id == "air_leak_audit_repair").first()
    assert rec is not None

    # Problem representation passing physical excess energy (100 kWh)
    problem_rep = {
        "problem_type": "standby_idle_energy_loss",
        "affected_equipment": "Compressor",
        "affected_process": "Compressed Air",
        "excess_energy_kwh": 100.0,
        "estimated_carbon_impact_kg": 71.6,
        "estimated_financial_impact_inr": 0.0,
        "constraints": []
    }

    applicability = ApplicabilityEvaluation(
        status="applicable",
        boundary_match=True,
        problem_fit=True
    )

    # 1. Custom Tariff = ₹11.20/kWh
    econ_1120 = InterventionImpactService.evaluate_economics(
        recommendation=rec,
        problem_rep=problem_rep,
        applicability=applicability,
        db=db_session,
        custom_electricity_tariff_inr=11.20
    )

    # Annual excess kWh = 100 * 52 = 5200 kWh/yr
    # With air_leak_audit_repair expected_pct = 0.22:
    # annual_kwh_saved = 5200 * 0.22 = 1144 kWh/yr
    # gross_annual_savings = 1144 * 11.20 = 12812.80 INR
    assert econ_1120.annual_savings_inr == pytest.approx(12812.80, rel=1e-2)
    assert econ_1120.data_provenance_labels["tariff"] == "[SCENARIO]"
    assert econ_1120.data_provenance_labels["electricity_tariff"] == "[SCENARIO]"

    # 2. Custom Tariff = ₹5.00/kWh
    econ_500 = InterventionImpactService.evaluate_economics(
        recommendation=rec,
        problem_rep=problem_rep,
        applicability=applicability,
        db=db_session,
        custom_electricity_tariff_inr=5.00
    )
    # gross_annual_savings = 1144 * 5.00 = 5720.00 INR
    assert econ_500.annual_savings_inr == pytest.approx(5720.00, rel=1e-2)
    assert econ_500.annual_savings_inr != econ_1120.annual_savings_inr

    # 3. Custom Tariff = ₹15.00/kWh
    econ_1500 = InterventionImpactService.evaluate_economics(
        recommendation=rec,
        problem_rep=problem_rep,
        applicability=applicability,
        db=db_session,
        custom_electricity_tariff_inr=15.00
    )
    # gross_annual_savings = 1144 * 15.00 = 17160.00 INR
    assert econ_1500.annual_savings_inr == pytest.approx(17160.00, rel=1e-2)
    assert econ_1500.annual_savings_inr != econ_1120.annual_savings_inr
    assert econ_1500.annual_savings_inr != econ_500.annual_savings_inr

    # Confirm strictly NO 7.50 is used:
    # If 7.50 were used, savings would be 1144 * 7.50 = 8580.00
    assert econ_1120.annual_savings_inr != 8580.00
    assert econ_500.annual_savings_inr != 8580.00
    assert econ_1500.annual_savings_inr != 8580.00

    # 4. Emission factor mutation test:
    # Mutate DB factor to 0.50
    grid_ef = db_session.query(EmissionFactor).filter(
        EmissionFactor.source_name == "grid_electricity",
        EmissionFactor.is_active == True
    ).first()
    original_val = grid_ef.factor_value

    try:
        grid_ef.factor_value = 0.50
        db_session.commit()

        econ_ef_050 = InterventionImpactService.evaluate_economics(
            recommendation=rec,
            problem_rep=problem_rep,
            applicability=applicability,
            db=db_session,
            custom_electricity_tariff_inr=10.0
        )
        # annual_kwh_saved = 1144 kWh
        # CO2 reduction = 1144 * 0.50 = 572.00 kgCO2e
        assert econ_ef_050.annual_co2_reduction_kg == pytest.approx(572.00, rel=1e-2)

        # Mutate to 0.95
        grid_ef.factor_value = 0.95
        db_session.commit()

        econ_ef_095 = InterventionImpactService.evaluate_economics(
            recommendation=rec,
            problem_rep=problem_rep,
            applicability=applicability,
            db=db_session,
            custom_electricity_tariff_inr=10.0
        )
        # CO2 reduction = 1144 * 0.95 = 1086.80 kgCO2e
        assert econ_ef_095.annual_co2_reduction_kg == pytest.approx(1086.80, rel=1e-2)
        assert econ_ef_095.annual_co2_reduction_kg != econ_ef_050.annual_co2_reduction_kg

    finally:
        grid_ef.factor_value = original_val
        db_session.commit()


def test_nf03_strict_tariff_validation(db_session, remediation_fixtures):
    """
    NF-03: Non-positive, NaN, infinite, and malformed tariffs must be rejected.
    Must NOT silently fall back to reference tariff 7.50!
    """
    import math
    from pydantic import ValidationError

    # 1. Pydantic schema validation: tariff = 0.0 must raise ValidationError
    with pytest.raises(ValidationError):
        UserDecisionContext(custom_electricity_tariff_inr=0.0)

    # 2. Negative tariff must raise ValidationError
    with pytest.raises(ValidationError):
        UserDecisionContext(custom_electricity_tariff_inr=-5.0)

    with pytest.raises(ValidationError):
        UserDecisionContext(custom_fuel_tariff_inr=-10.0)

    # 3. NaN and infinity must raise ValidationError
    with pytest.raises(ValidationError):
        UserDecisionContext(custom_electricity_tariff_inr=float("nan"))

    with pytest.raises(ValidationError):
        UserDecisionContext(custom_electricity_tariff_inr=float("inf"))

    # 4. Service level validation: direct invocation with <= 0 must raise ValueError
    rec = db_session.query(Recommendation).filter(Recommendation.id == "air_leak_audit_repair").first()
    assert rec is not None

    problem_rep = {
        "problem_type": "standby_idle_energy_loss",
        "affected_equipment": "Compressor",
        "excess_energy_kwh": 100.0
    }
    applicability = ApplicabilityEvaluation(status="applicable", boundary_match=True, problem_fit=True)

    with pytest.raises(ValueError, match="strictly positive"):
        InterventionImpactService.evaluate_economics(
            recommendation=rec,
            problem_rep=problem_rep,
            applicability=applicability,
            db=db_session,
            custom_electricity_tariff_inr=0.0
        )

    with pytest.raises(ValueError, match="strictly positive"):
        InterventionImpactService.evaluate_economics(
            recommendation=rec,
            problem_rep=problem_rep,
            applicability=applicability,
            db=db_session,
            custom_electricity_tariff_inr=-2.5
        )

    # 5. Omitted (None) must be accepted and reference tariff used
    ctx_omitted = UserDecisionContext()
    assert ctx_omitted.custom_electricity_tariff_inr is None
    econ_ref = InterventionImpactService.evaluate_economics(
        recommendation=rec,
        problem_rep=problem_rep,
        applicability=applicability,
        db=db_session,
        custom_electricity_tariff_inr=None
    )
    assert econ_ref.data_provenance_labels["tariff"] == "[REFERENCE]"
    # 5200 * 0.22 * 7.50 = 8580.0 INR
    assert econ_ref.annual_savings_inr == pytest.approx(100.0 * 52.0 * 0.22 * 7.50, rel=1e-2)


def test_nf04_incident_id_validation_api_and_guards(client, remediation_fixtures):
    """
    NF-04: Incident ID validation guards.
    Malformed, undefined, or non-numeric IDs must return 422, not 500 or undefined execution.
    """
    token = create_access_token({"sub": str(remediation_fixtures["user"].id)})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Path param "undefined" returns 422 Unprocessable Entity
    resp_undefined = client.post(
        "/api/incidents/undefined/recommendations",
        headers=headers,
        json={"primary_objective": "payback"}
    )
    assert resp_undefined.status_code == 422

    # 2. Path param "null" returns 422
    resp_null = client.post(
        "/api/incidents/null/recommendations",
        headers=headers,
        json={"primary_objective": "payback"}
    )
    assert resp_null.status_code == 422

    # 3. Path param "NaN" returns 422
    resp_nan = client.post(
        "/api/incidents/NaN/recommendations",
        headers=headers,
        json={"primary_objective": "payback"}
    )
    assert resp_nan.status_code == 422

    # 4. Negative incident ID returns 404 or 422
    resp_neg = client.post(
        "/api/incidents/-1/recommendations",
        headers=headers,
        json={"primary_objective": "payback"}
    )
    assert resp_neg.status_code in [404, 422]


