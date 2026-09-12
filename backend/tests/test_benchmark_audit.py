import pytest
import os
import re
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.facility import Facility
from app.core.security import hash_password, create_access_token
from app.ml.peer_clustering import PeerClusterEngine


def test_zero_synthetic_peer_codebase_integrity():
    """Verify that peer_clustering.py contains ZERO occurrences of np.random."""
    peer_clustering_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "app", "ml", "peer_clustering.py"
    )
    with open(peer_clustering_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "np.random" not in content, "VIOLATION: peer_clustering.py contains synthetic random generator!"
    assert "uniform" not in content
    assert "normal" not in content


def test_peer_benchmark_returns_insufficient_when_peers_under_10(client: TestClient, db_session):
    """Verify that having fewer than 10 sector peers returns an honest insufficient_data state."""
    fac = Facility(
        business_name="Solitary Metal Plant",
        sector="Metals & Heavy Alloys",
        location="Gujarat",
        production_type="Casting",
        production_volume=10000.0,
        employees=30,
        operating_hours=16.0
    )
    db_session.add(fac)
    db_session.commit()

    user = User(
        email="solitary@circuleak.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Facility Head",
        role="facility_manager",
        facility_id=fac.id
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get(f"/api/benchmark/peer-cluster/{fac.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]


    # When no telemetry exists or eligible peers < 10, has_peer_data MUST be False
    assert data["has_peer_data"] is False
    assert data["status"] == "insufficient_data"
    assert "Insufficient" in data["cluster_name"] or "No Telemetry" in data["cluster_name"]
