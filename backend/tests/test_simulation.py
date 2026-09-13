import pytest
from app.utils.calculations import calculate_payback
from app.models.facility import Facility
from app.models.user import User
from app.core.security import hash_password, create_access_token
from app.services.simulation_service import SimulationService


def test_payback_calculation():
    """Verify simple payback period arithmetic."""
    # 250,000 INR capex / 100,000 INR annual savings = 2.50 years
    payback = calculate_payback(250000.0, 100000.0)
    assert payback == 2.50

    # Zero savings test
    assert calculate_payback(250000.0, 0.0) == 999.0


def test_what_if_endpoint_accepts_empty_interventions(client, db_session):
    """Verify POST /api/simulation/what-if does not fail with 422 when intervention_ids is empty."""
    fac = Facility(
        business_name="Test Sim Facility",
        sector="Textile & Garment",
        location="Surat",
        production_type="Fabric Dyeing",
        production_volume=1000.0,
        operating_hours=16.0
    )
    db_session.add(fac)
    db_session.flush()

    user = User(
        email="sim_manager@test.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Sim Manager",
        facility_id=fac.id,
        role="facility_manager"
    )
    db_session.add(user)
    db_session.flush()

    token = create_access_token({"sub": str(user.id), "facility_id": fac.id, "role": user.role})

    resp = client.post(
        "/api/simulation/what-if",
        json={"facility_id": fac.id, "intervention_ids": []},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["total_reduction"] == 0.0
    assert data["investment"] == 0.0
    assert data["selected_interventions"] == []
