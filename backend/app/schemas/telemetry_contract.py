import re
from typing import Dict, List, Optional, Any, Tuple
import pandas as pd
from datetime import datetime, timezone


class TelemetryContractValidationError(ValueError):
    """Raised when an uploaded industrial telemetry dataset violates the production data contract."""
    def __init__(self, message: str, missing_fields: List[str] = None, details: List[str] = None):
        super().__init__(message)
        self.message = message
        self.missing_fields = missing_fields or []
        self.details = details or []


# Canonical Column Mapping Dictionary
CANONICAL_ALIASES: Dict[str, List[str]] = {
    "timestamp": ["timestamp", "datetime", "date_time", "time", "recorded_at", "reading_time"],
    "date": ["date", "day", "reading_date"],
    "hour": ["hour", "hr", "time_hour"],
    "equipment": ["equipment", "equipment_name", "machine", "asset", "device", "unit", "asset_id"],
    "process": ["process", "process_area", "area", "section", "line", "department", "manufacturing_stage"],
    "electricity_kwh": ["electricity_kwh", "kwh", "power_kwh", "energy_kwh", "electricity", "consumption_kwh", "electric_kwh"],
    "fuel_type": ["fuel_type", "fuel", "energy_source", "thermal_fuel"],
    "fuel_quantity": ["fuel_quantity", "fuel_amount", "fuel_consumed", "fuel_vol", "fuel_usage", "fuel_consumption"],
    "production_volume": ["production_volume", "production", "output", "output_tonnes", "units_produced", "volume", "batch_output"],
    "operating_hours": ["operating_hours", "operating_status", "status", "runtime_hours", "hours", "run_hours"],
    "shift": ["shift", "work_shift", "operating_shift"],
    "temperature": ["temperature", "temp_c", "temp"],
    "pressure": ["pressure", "pressure_bar", "bar"]
}

REQUIRED_CANONICAL_FIELDS = ["equipment", "electricity_kwh"]


class TelemetryContract:
    """
    Formal Industrial Production Telemetry Schema Contract.
    Enforces required field completeness, native sub-hourly timestamp integrity,
    and non-negative measurement constraints.
    """

    @staticmethod
    def detect_column_mappings(df_columns: List[str], custom_mapping: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Map raw header names to canonical schema columns."""
        clean_headers = {str(c).strip().lower(): str(c) for c in df_columns}
        normalized_headers = {re.sub(r'[^a-z0-9_]', '', k.replace(" ", "_").replace("-", "_")): orig 
                              for k, orig in clean_headers.items()}
        
        detected_mapping: Dict[str, str] = {}
        assigned_canonical: set = set()

        # Apply user's custom mappings first if valid
        if custom_mapping:
            for raw_col, canonical in custom_mapping.items():
                if raw_col in df_columns and canonical in CANONICAL_ALIASES:
                    detected_mapping[raw_col] = canonical
                    assigned_canonical.add(canonical)

        # Match remaining columns against alias dictionary
        for canonical, aliases in CANONICAL_ALIASES.items():
            if canonical in assigned_canonical:
                continue
            for alias in aliases:
                norm_alias = re.sub(r'[^a-z0-9_]', '', alias.lower())
                if norm_alias in normalized_headers:
                    raw_col = normalized_headers[norm_alias]
                    if raw_col not in detected_mapping:
                        detected_mapping[raw_col] = canonical
                        assigned_canonical.add(canonical)
                        break

        return detected_mapping

    @staticmethod
    def validate_and_normalize(
        df: pd.DataFrame,
        custom_mapping: Optional[Dict[str, str]] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Validate incoming DataFrame against production telemetry contract.
        Returns:
            normalized_df: validated DataFrame with canonical columns and native timestamps
            contract_report: inspection statistics and rejection details
        """
        if df.empty:
            raise TelemetryContractValidationError("Uploaded dataset is completely empty (0 rows).")

        raw_columns = list(df.columns)
        mapping = TelemetryContract.detect_column_mappings(raw_columns, custom_mapping)
        renamed_df = df.rename(columns=mapping).copy()
        renamed_df = renamed_df.loc[:, ~renamed_df.columns.duplicated()].copy()

        # Check required fields
        missing_required = []
        for req in REQUIRED_CANONICAL_FIELDS:
            if req not in renamed_df.columns:
                missing_required.append(req)

        # Check timestamp requirement: either 'timestamp' or ('date' and 'hour') or ('date')
        has_time_fidelity = ("timestamp" in renamed_df.columns) or ("date" in renamed_df.columns)
        if not has_time_fidelity:
            missing_required.append("timestamp (or date + hour)")

        if missing_required:
            raise TelemetryContractValidationError(
                message=(
                    f"Production Data Contract Violation: Telemetry is missing required columns: {', '.join(missing_required)}. "
                    f"Available headers in uploaded file: {raw_columns}."
                ),
                missing_fields=missing_required,
                details=[f"Unmapped required field: '{field}'" for field in missing_required]
            )

        # 1. Normalize Timestamp (Preserve native sub-hourly fidelity)
        if "timestamp" in renamed_df.columns:
            renamed_df["normalized_timestamp"] = pd.to_datetime(renamed_df["timestamp"], errors="coerce")
        else:
            # Construct timestamp from date and optional hour
            if "hour" in renamed_df.columns:
                hour_col = pd.to_numeric(renamed_df["hour"], errors="coerce").fillna(0).astype(int) % 24
                date_str = renamed_df["date"].astype(str).str.strip()
                time_str = date_str + " " + hour_col.astype(str).str.zfill(2) + ":00:00"
                renamed_df["normalized_timestamp"] = pd.to_datetime(time_str, errors="coerce")
            else:
                renamed_df["normalized_timestamp"] = pd.to_datetime(renamed_df["date"], errors="coerce")

        # Fill any unparseable timestamps with UTC now rather than crashing
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        renamed_df["normalized_timestamp"] = renamed_df["normalized_timestamp"].fillna(now_utc)

        # Retain date string and hour integer for indexing convenience
        renamed_df["date"] = renamed_df["normalized_timestamp"].dt.strftime("%Y-%m-%d")
        renamed_df["hour"] = renamed_df["normalized_timestamp"].dt.hour

        # 2. Equipment & Process Normalization
        renamed_df["equipment"] = renamed_df["equipment"].astype(str).str.strip()
        # Drop rows with empty equipment
        renamed_df = renamed_df[renamed_df["equipment"].str.len() > 0].copy()

        if "process" not in renamed_df.columns:
            renamed_df["process"] = "Manufacturing Operation"
        else:
            renamed_df["process"] = renamed_df["process"].fillna("Manufacturing Operation").astype(str).str.strip()
            renamed_df["process"] = renamed_df["process"].replace("", "Manufacturing Operation")

        # 3. Numeric Sanitation & Non-Negativity
        renamed_df["electricity_kwh"] = pd.to_numeric(renamed_df["electricity_kwh"], errors="coerce")
        if "fuel_quantity" not in renamed_df.columns:
            renamed_df["fuel_quantity"] = 0.0
        else:
            renamed_df["fuel_quantity"] = pd.to_numeric(renamed_df["fuel_quantity"], errors="coerce").fillna(0.0)

        if "production_volume" not in renamed_df.columns:
            renamed_df["production_volume"] = 0.0
        else:
            renamed_df["production_volume"] = pd.to_numeric(renamed_df["production_volume"], errors="coerce").fillna(0.0)

        if "operating_hours" not in renamed_df.columns:
            renamed_df["operating_hours"] = 1.0
        else:
            renamed_df["operating_hours"] = pd.to_numeric(renamed_df["operating_hours"], errors="coerce").fillna(1.0)

        
        if "fuel_type" not in renamed_df.columns:
            renamed_df["fuel_type"] = "none"
        else:
            renamed_df["fuel_type"] = renamed_df["fuel_type"].fillna("none").astype(str).str.strip()

        # Reject negative values and NaNs
        raw_count = len(df)
        valid_mask = (
            renamed_df["electricity_kwh"].notna() &
            (renamed_df["electricity_kwh"] >= 0.0) &
            (renamed_df["fuel_quantity"] >= 0.0) &
            (renamed_df["production_volume"] >= 0.0) &
            (renamed_df["operating_hours"] >= 0.0)
        )
        valid_df = renamed_df[valid_mask].copy()
        valid_count = len(valid_df)
        rejected_count = raw_count - valid_count

        # Detect duplicate records on composite key
        dup_subset = ["normalized_timestamp", "equipment", "process"]
        duplicate_count = int(valid_df.duplicated(subset=dup_subset).sum())

        contract_report = {
            "raw_count": raw_count,
            "valid_count": valid_count,
            "rejected_count": rejected_count,
            "duplicate_count": duplicate_count,
            "mapped_columns": mapping,
            "missing_required": missing_required
        }

        return valid_df, contract_report
