import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.core.security import hash_password, create_access_token


@pytest.fixture
def empty_facility_user(db_session):
    """Create a brand-new facility and authenticated user with ZERO telemetry data."""
    fac = Facility(
        business_name="Greenfield Clean Plant",
        sector="Textiles & Apparel",
        location="Surat Industrial Park, Gujarat",
        production_type="Fabric Processing",
        production_volume=0.0,
        employees=15,
        operating_hours=16.0
    )
    db_session.add(fac)
    db_session.commit()

    user = User(
        email="greenfield@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Greenfield Operations Manager",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}
    return fac, user, headers


def test_empty_facility_zero_demo_truthful_states(client: TestClient, empty_facility_user):
    """
    Ultimate Zero-Demo Test:
    On an authenticated account with 0 ingested telemetry:
    Verify that EVERY module API returns truthful empty/insufficient states
    with zero hardcoded numbers, zero fake anomalies, zero fake recommendations,
    zero fake peers, and zero synthetic charts.
    """
    fac, user, headers = empty_facility_user

    # 1. Emissions Summary
    resp_emiss = client.get(f"/api/emissions/summary/{fac.id}", headers=headers)
    assert resp_emiss.status_code == 200
    emiss_data = resp_emiss.json()["data"]
    assert emiss_data["total_emissions"] == 0.0
    assert emiss_data["emissions_intensity"] == 0.0
    assert len(emiss_data["by_source"]) == 0
    assert len(emiss_data["by_process"]) == 0
    assert len(emiss_data["by_equipment"]) == 0

    # 2. Emissions Timeline
    resp_time = client.get(f"/api/emissions/timeline/{fac.id}?timeline_type=daily", headers=headers)
    assert resp_time.status_code == 200
    assert len(resp_time.json()["data"]["points"]) == 0

    # 3. Behavioral Anomaly Leaks
    resp_leaks = client.get(f"/api/leaks/anomalies/{fac.id}", headers=headers)
    assert resp_leaks.status_code == 200
    leaks_data = resp_leaks.json()["data"]
    assert leaks_data["anomalies_detected_count"] == 0
    assert len(leaks_data["anomalies"]) == 0

    # 4. Structural Hotspots
    resp_hotspots = client.get(f"/api/leaks/hotspots/{fac.id}", headers=headers)
    assert resp_hotspots.status_code == 200
    hotspots_data = resp_hotspots.json()["data"]
    assert hotspots_data["total_emissions_kg"] == 0.0
    assert len(hotspots_data["hotspots"]) == 0

    # 5. Circular Recommendations
    resp_recs = client.get(f"/api/recommendations/{fac.id}", headers=headers)
    assert resp_recs.status_code == 200
    recs_data = resp_recs.json()["data"]
    # Must NOT return fake recommendations when facility has zero data
    assert len(recs_data) == 0

    # 6. Circularity Index
    resp_circ = client.get(f"/api/circularity/{fac.id}", headers=headers)
    assert resp_circ.status_code == 200
    circ_data = resp_circ.json()["data"]
    assert circ_data["has_data"] is False
    assert circ_data["overall_score"] == 0.0
    assert len(circ_data["missing_inputs"]) >= 1

    # 7. Decarbonization Trajectory
    resp_traj = client.get(f"/api/trajectory/{fac.id}", headers=headers)
    assert resp_traj.status_code == 200
    traj_data = resp_traj.json()["data"]
    assert traj_data["has_data"] is False
    assert traj_data["baseline_emissions"] == 0.0
    assert len(traj_data["yearly_projection"]) == 0

    # 8. Peer Benchmarking
    resp_bench = client.get(f"/api/benchmark/{fac.id}", headers=headers)
    assert resp_bench.status_code == 200
    bench_data = resp_bench.json()["data"]
    assert bench_data["has_data"] is False
    assert bench_data["facility_intensity"] == 0.0

    # 9. Machine-Learned Peer Clustering
    resp_cluster = client.get(f"/api/benchmark/peer-cluster/{fac.id}", headers=headers)
    assert resp_cluster.status_code == 200
    cluster_data = resp_cluster.json()["data"]
    assert cluster_data["has_peer_data"] is False
    assert cluster_data["status"] == "insufficient_data"

