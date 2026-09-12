import os
import pytest


def test_health_check(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CircuLeak Backend"


def test_full_pipeline_flow(client):
    """
    Test full end-to-end pipeline:
    Create Facility -> Upload CSV -> Emissions -> Leaks -> Simulation -> Audit Summary -> PDF Report
    """
    # 1. Create Facility
    fac_payload = {
        "business_name": "Gujarat Synthetics Ltd.",
        "sector": "Textile",
        "location": "Surat, Gujarat",
        "production_type": "Dyeing and Weaving",
        "production_volume": 15000.0,
        "employees": 95,
        "operating_hours": 16.0,
        "energy_sources": ["grid_electricity", "natural_gas"]
    }
    fac_resp = client.post("/api/facility", json=fac_payload)
    assert fac_resp.status_code == 201
    fac_data = fac_resp.json()
    assert fac_data["success"] is True
    facility_id = fac_data["data"]["id"]

    # 2. Upload Demo CSV
    demo_csv_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "demo_industrial_data.csv")
    assert os.path.exists(demo_csv_path), "Demo CSV must exist"

    with open(demo_csv_path, "rb") as f:
        upload_resp = client.post(
            "/api/upload/csv",
            data={"facility_id": facility_id},
            files={"file": ("demo.csv", f, "text/csv")}
        )
    assert upload_resp.status_code == 200
    upload_data = upload_resp.json()
    assert upload_data["success"] is True
    assert upload_data["data"]["rows_valid"] > 100

    # 3. Verify Emissions Summary
    emiss_resp = client.get(f"/api/emissions/summary/{facility_id}")
    assert emiss_resp.status_code == 200
    emiss_data = emiss_resp.json()
    assert emiss_data["data"]["total_emissions"] > 0
    assert len(emiss_data["data"]["by_source"]) > 0
    assert len(emiss_data["data"]["by_equipment"]) > 0

    # 4. Verify Sankey Graph
    sankey_resp = client.get(f"/api/emissions/sankey/{facility_id}")
    assert sankey_resp.status_code == 200
    sankey_data = sankey_resp.json()
    assert len(sankey_data["data"]["nodes"]) > 0
    assert len(sankey_data["data"]["links"]) > 0

    # 5. Verify Leaks (Hotspots and Anomalies)
    hotspots_resp = client.get(f"/api/leaks/hotspots/{facility_id}")
    assert hotspots_resp.status_code == 200
    assert len(hotspots_resp.json()["data"]["hotspots"]) > 0

    anomalies_resp = client.get(f"/api/leaks/anomalies/{facility_id}")
    assert anomalies_resp.status_code == 200
    anomalies_list = anomalies_resp.json()["data"]["anomalies"]
    assert len(anomalies_list) > 0
    # Top anomaly should have explainable reason and risk score
    assert anomalies_list[0]["risk_score"] > 0
    assert len(anomalies_list[0]["reason"]) > 10

    # 6. Verify Recommendations & Priorities
    recs_resp = client.get(f"/api/recommendations/{facility_id}")
    assert recs_resp.status_code == 200
    assert len(recs_resp.json()["data"]) > 0

    priority_resp = client.get(f"/api/interventions/priority/{facility_id}")
    assert priority_resp.status_code == 200
    assert len(priority_resp.json()["data"]["ranked_interventions"]) > 0

    # 7. What-If Simulation
    sim_payload = {
        "facility_id": facility_id,
        "intervention_ids": ["whr_boiler_flue", "air_leak_audit_repair"]
    }
    sim_resp = client.post("/api/simulation/what-if", json=sim_payload)
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["data"]["total_reduction"] > 0
    assert sim_data["data"]["investment"] > 0
    assert sim_data["data"]["annual_savings"] > 0

    # 8. Scenario Comparison
    scenarios_resp = client.post("/api/simulation/scenarios", json={"facility_id": facility_id})
    assert scenarios_resp.status_code == 200
    assert len(scenarios_resp.json()["data"]["scenarios"]) == 3

    # 9. 5-Year Trajectory
    traj_resp = client.get(f"/api/trajectory/{facility_id}")
    assert traj_resp.status_code == 200
    assert len(traj_resp.json()["data"]["trajectory"]) == 5

    # 10. Benchmarking & Circularity Score
    bench_resp = client.get(f"/api/benchmark/{facility_id}")
    assert bench_resp.status_code == 200
    assert bench_resp.json()["data"]["benchmark_average"] > 0

    circ_resp = client.get(f"/api/circularity/{facility_id}")
    assert circ_resp.status_code == 200
    assert 0 <= circ_resp.json()["data"]["overall_score"] <= 100

    # 11. AI Audit Summary (Executive Audit Summary)
    audit_resp = client.post("/api/audit/summary", json={"facility_id": facility_id})
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()["data"]
    assert audit_data["report_title"] == "Executive Audit Summary"
    assert len(audit_data["executive_narrative"]) > 50
    assert len(audit_data["key_findings"]) > 0
    assert "structured_audit_data" in audit_data

    # 12. PDF Report Generation
    report_resp = client.post("/api/report/generate", json={"facility_id": facility_id})
    assert report_resp.status_code == 200
    report_data = report_resp.json()["data"]
    assert report_data["file_size_bytes"] > 1000
    assert len(report_data["sections_included"]) == 12

    # Download the report
    download_resp = client.get(report_data["download_url"])
    assert download_resp.status_code == 200
    assert download_resp.headers["content-type"] == "application/pdf"
