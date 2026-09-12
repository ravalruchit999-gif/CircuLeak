import pandas as pd
import numpy as np
from typing import List, Dict, Any


def extract_timeseries_features(df: pd.DataFrame, operating_hours: float = 16.0) -> pd.DataFrame:
    """
    Extract temporal, operational, and ratio features for industrial anomaly detection.
    """
    df = df.copy()

    # Ensure correct types with explicit Series conversion for Pyright compatibility
    elec_series = pd.Series(pd.to_numeric(df["electricity_kwh"], errors="coerce"))
    df["electricity_kwh"] = elec_series.fillna(0.0)

    fuel_series = pd.Series(pd.to_numeric(df["fuel_quantity"], errors="coerce"))
    df["fuel_quantity"] = fuel_series.fillna(0.0)

    prod_series = pd.Series(pd.to_numeric(df["production_volume"], errors="coerce"))
    df["production_volume"] = prod_series.fillna(0.0)

    hour_series = pd.Series(pd.to_numeric(df["hour"], errors="coerce"))
    df["hour"] = hour_series.fillna(0).astype(int)

    # Convert date if possible
    if "date" in df.columns:
        dt_series = pd.to_datetime(df["date"], errors="coerce")
        df["dt"] = dt_series
        day_series = pd.Series(dt_series.dt.dayofweek)
        df["day_of_week"] = day_series.fillna(0).astype(int)
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    else:
        df["day_of_week"] = 0
        df["is_weekend"] = 0

    # Off-hours flag: typical night shift or beyond facility daily operating hours
    df["is_off_hours"] = ((df["hour"] >= 22) | (df["hour"] <= 5) | (df["is_weekend"] == 1)).astype(int)

    # Active vs Inactive Production status
    df["is_production_active"] = (df["production_volume"] > 0.0).astype(int)

    # Specific Energy Consumption (SEC): Energy / Production Volume
    df["energy_per_unit"] = np.where(
        df["production_volume"] > 0,
        df["electricity_kwh"] / df["production_volume"],
        df["electricity_kwh"]
    )

    return df
