from typing import Dict, Any, List
import pandas as pd


class DataQualityService:
    @staticmethod
    def evaluate_dataframe_quality(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluate dataset quality across 5 standard industrial dimensions:
        equipment, electricity, production, fuel, historical_baseline.
        Returns confidence_score, quality_level, dimensions, and warnings.
        """
        total_rows = len(df)
        if total_rows == 0:
            return {
                "confidence_score": 0.0,
                "quality_level": "needs_attention",
                "dimensions": {
                    "equipment": 0.0,
                    "electricity": 0.0,
                    "production": 0.0,
                    "fuel": 0.0,
                    "historical_baseline": 0.0,
                },
                "warnings": ["Dataset contains zero valid telemetry records."],
                "valid_row_count": 0,
                "invalid_row_count": 0,
            }

        warnings: List[str] = []

        # 1. Equipment Coverage
        if "equipment" in df.columns:
            valid_eq = df["equipment"].dropna().astype(str).str.strip()
            valid_eq = valid_eq[valid_eq != ""]
            eq_score = round((len(valid_eq) / total_rows) * 100.0, 1)
            num_equipments = df["equipment"].nunique()
            if eq_score < 95.0:
                warnings.append(f"Equipment identifiers missing in {round(100 - eq_score, 1)}% of rows.")
            if num_equipments < 2:
                warnings.append("Only 1 equipment asset tracked; multi-asset Pareto diagnostics will be limited.")
        else:
            eq_score = 0.0
            warnings.append("Equipment column missing from telemetry dataset.")

        # 2. Electricity Completeness
        if "electricity_kwh" in df.columns:
            elec_series = pd.to_numeric(df["electricity_kwh"], errors="coerce")
            valid_elec = elec_series.dropna()
            valid_elec = valid_elec[valid_elec >= 0]
            elec_score = round((len(valid_elec) / total_rows) * 100.0, 1)
            if elec_score < 98.0:
                warnings.append(f"Electricity kWh readings missing or negative in {round(100 - elec_score, 1)}% of rows.")
        else:
            elec_score = 0.0
            warnings.append("Electricity kWh column missing from dataset.")

        # 3. Production Data Coverage
        if "production_volume" in df.columns:
            prod_series = pd.to_numeric(df["production_volume"], errors="coerce")
            valid_prod = prod_series.dropna()
            valid_prod = valid_prod[valid_prod > 0]
            prod_score = round((len(valid_prod) / total_rows) * 100.0, 1)
            if prod_score < 80.0:
                warnings.append(f"Production output volume unrecorded in {round(100 - prod_score, 1)}% of records; specific intensity calculations will be affected.")
        else:
            prod_score = 50.0  # Optional fallback if factory only tracks energy
            warnings.append("Production volume not supplied; carbon intensity per metric ton cannot be calculated.")

        # 4. Fuel Data Coverage
        if "fuel_type" in df.columns and "fuel_quantity" in df.columns:
            fuel_qty = pd.to_numeric(df["fuel_quantity"], errors="coerce").fillna(0)
            valid_fuel = fuel_qty[fuel_qty >= 0]
            fuel_score = round((len(valid_fuel) / total_rows) * 100.0, 1)
        else:
            fuel_score = 80.0  # All-electric facility baseline

        # 5. Historical Baseline Depth
        # Standard: 168+ hours (1 full 7-day week of hourly observations) = 100%
        # 72-167 hours = 80%, 24-71 hours = 60%, <24 hours = 30%
        if total_rows >= 168:
            baseline_score = 100.0
        elif total_rows >= 72:
            baseline_score = 80.0
            warnings.append("Telemetry covers between 3 to 7 days; 7+ days recommended for seasonal diurnal baseline.")
        elif total_rows >= 24:
            baseline_score = 55.0
            warnings.append("Telemetry covers only 24-72 hours; baseline models will have higher uncertainty.")
        else:
            baseline_score = 25.0
            warnings.append("Fewer than 24 hours of data uploaded; insufficient depth for off-hours anomaly detection.")

        # Weighted aggregate confidence score
        # Electricity (30%) + Equipment (25%) + Production (20%) + Baseline (15%) + Fuel (10%)
        weighted_score = (
            (elec_score * 0.30)
            + (eq_score * 0.25)
            + (prod_score * 0.20)
            + (baseline_score * 0.15)
            + (fuel_score * 0.10)
        )
        confidence_score = round(min(100.0, max(0.0, weighted_score)), 1)

        if confidence_score >= 90.0:
            quality_level = "high"
        elif confidence_score >= 75.0:
            quality_level = "good"
        elif confidence_score >= 50.0:
            quality_level = "incomplete"
        else:
            quality_level = "needs_attention"

        return {
            "confidence_score": confidence_score,
            "quality_level": quality_level,
            "dimensions": {
                "equipment": eq_score,
                "electricity": elec_score,
                "production": prod_score,
                "fuel": fuel_score,
                "historical_baseline": baseline_score,
            },
            "warnings": warnings,
            "total_rows": total_rows,
        }
