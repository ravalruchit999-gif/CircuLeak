import pytest
import pandas as pd
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.feature_engineering import extract_timeseries_features


def test_feature_engineering():
    """Verify temporal and ratio features extraction."""
    df = pd.DataFrame([
        {"date": "2026-08-03", "hour": 23, "electricity_kwh": 30.0, "fuel_quantity": 0.0, "production_volume": 0.0, "operating_hours": 1.0},
        {"date": "2026-08-03", "hour": 10, "electricity_kwh": 30.0, "fuel_quantity": 0.0, "production_volume": 100.0, "operating_hours": 1.0}
    ])
    feat_df = extract_timeseries_features(df, operating_hours=16.0)
    assert "is_off_hours" in feat_df.columns
    assert feat_df.iloc[0]["is_off_hours"] == 1  # 23:00 is off-hours
    assert feat_df.iloc[1]["is_off_hours"] == 0  # 10:00 on Monday is active hours


def test_anomaly_detection_detects_off_hours_idle_leak():
    """Verify IsolationForest & baseline detector flags off-hours compressor leak."""
    rows = []
    # 20 hours of normal active consumption
    for h in range(6, 22):
        rows.append({
            "date": "2026-08-01", "hour": h, "equipment": "Compressor 01", "process": "Compressed Air",
            "electricity_kwh": 35.0, "fuel_type": "none", "fuel_quantity": 0.0,
            "production_volume": 100.0, "operating_hours": 1.0
        })
    # 8 hours of abnormal off-hours consumption with 0 production
    for h in [22, 23, 0, 1, 2, 3, 4, 5]:
        rows.append({
            "date": "2026-08-01", "hour": h, "equipment": "Compressor 01", "process": "Compressed Air",
            "electricity_kwh": 28.0,  # leak!
            "fuel_type": "none", "fuel_quantity": 0.0,
            "production_volume": 0.0, "operating_hours": 0.0
        })

    df = pd.DataFrame(rows)
    detector = AnomalyDetector()
    anomalies = detector.detect_anomalies(df, operating_hours=16.0)

    assert len(anomalies) > 0
    top_anomaly = anomalies[0]
    assert top_anomaly["equipment"] == "Compressor 01"
    assert top_anomaly["risk_score"] >= 50.0
    assert "off-hours" in top_anomaly["abnormal_period"].lower()
    assert len(top_anomaly["potential_causes"]) > 0
