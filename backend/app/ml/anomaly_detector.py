import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.ensemble import IsolationForest
from app.ml.feature_engineering import extract_timeseries_features


class AnomalyDetector:
    """
    Industrial Behavioral Anomaly Detector combining Isolation Forest
    with statistical baseline checks for full explainability.
    """

    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )

    def detect_anomalies(self, df: pd.DataFrame, operating_hours: float = 16.0) -> List[Dict[str, Any]]:
        """
        Run anomaly detection across equipment and processes in the provided dataframe.
        """
        if df.empty or len(df) < 5:
            return []

        featured_df = extract_timeseries_features(df, operating_hours=operating_hours)
        detected_anomalies: List[Dict[str, Any]] = []

        # Group by equipment to compute localized baselines
        for equipment_name, group in featured_df.groupby("equipment"):
            if len(group) < 3:
                continue

            process_name = group["process"].iloc[0] if "process" in group.columns else "General"

            # 1. Baseline during normal production
            active_mask = group["is_production_active"] == 1
            off_hours_mask = group["is_off_hours"] == 1

            normal_baseline = float(group.loc[active_mask, "electricity_kwh"].median()) if active_mask.any() else float(group["electricity_kwh"].median())
            if normal_baseline <= 0:
                normal_baseline = max(float(group["electricity_kwh"].mean()), 1.0)

            # 2. Check for Off-Hours Idle Consumption Leak (e.g. Compressor/Oven running overnight)
            off_hours_data = group[off_hours_mask]
            if not off_hours_data.empty:
                off_hours_mean = float(off_hours_data["electricity_kwh"].mean())
                # If off-hours consumption is > 30% of normal baseline while production is zero
                if off_hours_mean > (0.30 * normal_baseline) and off_hours_mean > 5.0:
                    deviation = round(((off_hours_mean - 0.0) / normal_baseline) * 100, 1)
                    risk = min(95.0, round(50.0 + (off_hours_mean / normal_baseline) * 35.0, 1))
                    
                    potential_causes = [
                        "Pneumatic distribution leak causing compressor continuous cycling",
                        "Idle machinery left powered on overnight without interlock cutoff",
                        "Failure of automatic shutdown switch or timer relay"
                    ]
                    
                    detected_anomalies.append({
                        "equipment": equipment_name,
                        "process": process_name,
                        "risk_score": float(risk),
                        "baseline_consumption": round(0.0, 2),
                        "observed_consumption": round(off_hours_mean, 2),
                        "deviation_percent": float(deviation),
                        "abnormal_period": "22:00-06:00 (Off-Hours / Non-Production)",
                        "production_status": "inactive",
                        "reason": f"{equipment_name} averages {round(off_hours_mean, 1)} kWh during non-production hours when baseline expectation is near zero.",
                        "potential_causes": potential_causes
                    })

            # 3. Isolation Forest for Multi-variate Spikes
            feat_cols = ["electricity_kwh", "fuel_quantity", "hour", "is_off_hours", "energy_per_unit"]
            X = group[feat_cols].fillna(0.0).values

            if len(X) >= 10:
                try:
                    iso = IsolationForest(contamination=self.contamination, random_state=42)
                    preds = iso.fit_predict(X)
                    scores = -iso.score_samples(X)  # higher means more abnormal

                    # Find worst outlier index
                    outlier_indices = np.where(preds == -1)[0]
                    if len(outlier_indices) > 0:
                        worst_idx = outlier_indices[np.argmax(scores[outlier_indices])]
                        outlier_row = group.iloc[worst_idx]
                        observed_val = float(outlier_row["electricity_kwh"])

                        if observed_val > (1.25 * normal_baseline) and observed_val > 10.0:
                            dev_pct = round(((observed_val - normal_baseline) / normal_baseline) * 100, 1)
                            spike_risk = min(98.0, round(60.0 + (dev_pct / 100.0) * 25.0, 1))
                            hour_val = int(outlier_row["hour"])
                            period_str = f"{hour_val:02d}:00-{(hour_val+1)%24:02d}:00"

                            # Avoid duplicate if already flagged as off-hours
                            already_flagged = any(a["equipment"] == equipment_name and a["abnormal_period"] == period_str for a in detected_anomalies)
                            if not already_flagged:
                                detected_anomalies.append({
                                    "equipment": equipment_name,
                                    "process": process_name,
                                    "risk_score": float(spike_risk),
                                    "baseline_consumption": round(normal_baseline, 2),
                                    "observed_consumption": round(observed_val, 2),
                                    "deviation_percent": float(dev_pct),
                                    "abnormal_period": period_str,
                                    "production_status": "active" if outlier_row["production_volume"] > 0 else "inactive",
                                    "reason": f"Energy spike of {round(observed_val, 1)} kWh observed ({dev_pct}% above {round(normal_baseline, 1)} kWh baseline).",
                                    "potential_causes": [
                                        "Mechanical jamming or worn motor bearing inducing excessive electrical draw",
                                        "Improper thermal insulation or fouling causing heater cycle extension",
                                        "Unsynchronized production line bottlenecking"
                                    ]
                                })
                except Exception:
                    pass

        # Sort anomalies by risk score descending
        detected_anomalies.sort(key=lambda x: x["risk_score"], reverse=True)
        return detected_anomalies
