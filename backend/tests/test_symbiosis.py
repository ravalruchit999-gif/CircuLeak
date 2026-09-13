import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, get_db, SessionLocal
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.services.symbiosis_service import SymbiosisService
from app.services.circularity_service import CircularityService


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_symbiosis_service_calculation():
    db = SessionLocal()
    try:
        facility = db.query(Facility).first()
        assert facility is not None, "Facility should exist in database"
        
        result = SymbiosisService.get_facility_symbiosis(db, facility.id)
        assert result["facility_id"] == facility.id
        assert "streams" in result
        assert "totals" in result
        assert result["totals"]["matches_count"] >= 1
        assert result["totals"]["landfill_diverted_tonnes"] >= 0
        assert result["totals"]["material_reuse_score"] >= 0
        assert result["totals"]["net_economic_benefit_inr"] >= 0
    finally:
        db.close()


def test_circularity_service_with_symbiosis():
    db = SessionLocal()
    try:
        facility = db.query(Facility).first()
        circ = CircularityService.calculate_circularity_score(db, facility.id)
        
        # 4 dimensions should now be measured (coverage 80%)
        assert circ["telemetry_coverage_percent"] == 80.0
        assert circ["dimensions"]["material_reuse"] is not None
        assert circ["dimensions"]["material_reuse"] > 0
        assert "symbiosis_summary" in circ
        
        # Verify material_reuse pillar is measured
        material_pillar = next((p for p in circ["pillars"] if p["id"] == "material_reuse"), None)
        assert material_pillar is not None
        assert material_pillar["status"] == "measured"
        assert material_pillar["weight"] == 20
    finally:
        db.close()


def test_symbiosis_api_endpoint(client):
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
        resp = client.get(f"/api/symbiosis/{facility.id}", headers=headers)
        assert resp.status_code == 200
        json_data = resp.json()
        assert json_data["success"] is True
        assert "streams" in json_data["data"]
        assert json_data["data"]["totals"]["landfill_diverted_tonnes"] > 0

        # Test adding a custom waste stream
        post_resp = client.post(
            f"/api/symbiosis/{facility.id}/stream",
            json={
                "byproduct_name": "Used Quenching Oil",
                "category": "Hazardous Liquid Waste",
                "annual_quantity": 45.0,
                "unit": "Tonnes/year",
                "current_disposal_cost_per_unit": 3500.0,
                "selling_price_per_unit": 1800.0
            },
            headers=headers
        )
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["success"] is True
        stream_id = post_data["data"]["id"]
        assert post_data["data"]["net_benefit_inr"] == round(45.0 * 3500.0 + 45.0 * 1800.0)
        assert "Re-Refining" in post_data["data"]["circular_tier"]

        # Verify updated totals now include the custom stream
        updated_resp = client.get(f"/api/symbiosis/{facility.id}", headers=headers)
        assert updated_resp.status_code == 200
        streams_list = updated_resp.json()["data"]["streams"]
        custom_found = any(s.get("is_custom") and s.get("byproduct_name") == "Used Quenching Oil" for s in streams_list)
        assert custom_found is True

        # Test deleting the custom stream
        del_resp = client.delete(f"/api/symbiosis/{facility.id}/stream/{stream_id}", headers=headers)
        assert del_resp.status_code == 200
        assert del_resp.json()["success"] is True
    finally:
        db.close()
