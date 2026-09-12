import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.core.security import hash_password, create_access_token


def test_unauthenticated_requests_fail_with_401(client: TestClient):
    """Verify that unauthenticated callers cannot access protected endpoints."""
    # Emissions endpoint without token
    resp = client.get("/api/emissions/summary/1")
    assert resp.status_code == 401

    # Upload endpoint without token
    resp = client.post("/api/upload/csv", files={"file": ("test.csv", b"dummy,data\n1,2")})
    assert resp.status_code == 401

    # Leaks endpoint without token
    resp = client.get("/api/leaks/hotspots/1")
    assert resp.status_code == 401

    # Circularity endpoint without token
    resp = client.get("/api/circularity/1")
    assert resp.status_code == 401



def test_cross_tenant_isolation_enforced(client: TestClient, db_session):
    """Verify that Tenant A cannot access or modify telemetry belonging to Tenant B."""
    # Create Facility 1 and User 1
    fac1 = Facility(
        business_name="Tenant 1 Facility",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Alloy Casting",
        production_volume=10000.0,
        employees=50,
        operating_hours=16.0
    )
    # Create Facility 2
    fac2 = Facility(
        business_name="Tenant 2 Facility",
        sector="Textiles & Apparel",
        location="Maharashtra",
        production_type="Spinning",
        production_volume=8000.0,
        employees=40,
        operating_hours=16.0
    )
    db_session.add_all([fac1, fac2])
    db_session.commit()

    user1 = User(
        email="tenant1@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Tenant One",
        role="facility_manager",
        facility_id=fac1.id
    )
    db_session.add(user1)
    db_session.commit()

    token1 = create_access_token({"sub": str(user1.id)})
    headers1 = {"Authorization": f"Bearer {token1}"}

    # User 1 accesses their own facility -> 200 OK
    resp_own = client.get(f"/api/emissions/summary/{fac1.id}", headers=headers1)
    assert resp_own.status_code == 200

    # User 1 attempts to access Facility 2 -> 403 Forbidden
    resp_cross = client.get(f"/api/emissions/summary/{fac2.id}", headers=headers1)
    assert resp_cross.status_code == 403
    assert "Unauthorized" in resp_cross.json().get("error", {}).get("message", "")


def test_admin_role_authorization_required(client: TestClient, db_session):
    """Verify that non-admin users cannot access admin console endpoints."""
    fac = Facility(
        business_name="Test Plant",
        sector="Chemicals",
        location="Vadodara",
        production_type="Polymers",
        production_volume=5000.0,
        employees=20,
        operating_hours=24.0
    )
    db_session.add(fac)
    db_session.commit()

    regular_user = User(
        email="regular@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Regular User",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(regular_user)
    db_session.commit()

    token = create_access_token({"sub": str(regular_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # Accessing admin routes as non-admin must yield 403 Forbidden
    resp = client.get("/api/admin/users", headers=headers)
    assert resp.status_code == 403
    assert "Admin privileges required" in resp.json().get("error", {}).get("message", "")
