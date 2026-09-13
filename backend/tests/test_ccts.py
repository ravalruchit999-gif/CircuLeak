import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.facility import Facility
from app.services.ccts_service import CCTSService
from app.services.simulation_service import SimulationService


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_ccts_service_status_calculation():
    db = SessionLocal()
    try:
        facility = db.query(Facility).first()
        assert facility is not None

        ccts_data = CCTSService.get_facility_ccts_status(db, facility.id, carbon_price_inr=1850.0)
        assert ccts_data["facility_id"] == facility.id
        assert "actual_intensity_tco2_per_tonne" in ccts_data
        assert "target_intensity_tco2_per_tonne" in ccts_data
        assert "compliance_status" in ccts_data
        assert ccts_data["compliance_status"] in ["CREDIT_SURPLUS", "DEFICIT_PENALTY_RISK"]
        assert ccts_data["regulation_code"].startswith("BEE-CCTS")
    finally:
        db.close()


def test_ccts_monetization_impact_speedup():
    impact = CCTSService.calculate_monetization_impact(
        abatement_tonnes=250.0,
        investment_inr=1500000.0,
        annual_savings_inr=750000.0,
        actual_intensity=0.80,
        target_intensity=0.82,
        prod_volume=10000.0,
        carbon_price_inr=2000.0
    )
    assert impact["standard_payback_years"] == 2.0  # 1.5M / 750k
    assert impact["accelerated_payback_years"] < impact["standard_payback_years"]
    assert impact["payback_speedup_percent"] > 0
    assert impact["annual_carbon_revenue_inr"] > 0
    assert impact["tradable_ccc_earned"] > 0


def test_ccts_api_endpoints(client):
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@circuleak.com",
        "password": "AdminPassword123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    try:
        facility = db.query(Facility).first()

        # GET /api/ccts/{facility_id}
        get_resp = client.get(f"/api/ccts/{facility.id}?carbon_price_inr=2000", headers=headers)
        assert get_resp.status_code == 200
        get_json = get_resp.json()
        assert get_json["success"] is True
        assert get_json["data"]["carbon_price_inr"] == 2000.0

        # POST /api/ccts/monetize
        post_resp = client.post(
            "/api/ccts/monetize",
            json={
                "facility_id": facility.id,
                "abatement_tonnes": 200.0,
                "investment_inr": 1200000.0,
                "annual_savings_inr": 600000.0,
                "carbon_price_inr": 1900.0
            },
            headers=headers
        )
        assert post_resp.status_code == 200
        post_json = post_resp.json()
        assert post_json["success"] is True
        assert "simulation_impact" in post_json["data"]
        assert post_json["data"]["simulation_impact"]["accelerated_payback_years"] > 0
    finally:
        db.close()
