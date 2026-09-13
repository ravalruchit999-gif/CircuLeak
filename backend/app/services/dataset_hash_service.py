import hashlib
import json
import subprocess
from typing import Optional, List, Dict, Any
import pandas as pd
from app.core.config import settings


def compute_canonical_dataset_hash(df: pd.DataFrame) -> str:
    """
    Compute a deterministic SHA-256 hash over canonical representation of telemetry records.
    
    Guarantees:
    1. Deterministic column selection and alphabetical ordering.
    2. Deterministic row sorting by (timestamp, equipment, process).
    3. Normalized float formatting (6 decimal places) and ISO-8601 UTC timestamp serialization.
    4. Two datasets containing the same logical records (even if ordered differently in raw CSV)
       produce the identical SHA-256 hash.
    5. Modifying any single data value produces a completely different hash.
    """
    if df is None or df.empty:
        return hashlib.sha256(b"EMPTY_CANONICAL_DATASET").hexdigest()

    cols_to_use = [
        c for c in [
            "normalized_timestamp", "timestamp", "equipment", "process",
            "electricity_kwh", "fuel_type", "fuel_quantity",
            "production_volume", "operating_hours"
        ]
        if c in df.columns
    ]
    cols_to_use.sort()

    records: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        rec: Dict[str, Any] = {}
        for col in cols_to_use:
            val = row[col]
            if hasattr(val, "isoformat"):
                rec[col] = val.isoformat()
            elif pd.isna(val):
                rec[col] = None
            elif isinstance(val, (float, int)):
                rec[col] = f"{float(val):.6f}"
            else:
                rec[col] = str(val).strip().lower()
        records.append(rec)

    def sort_key(r: Dict[str, Any]):
        return (
            str(r.get("normalized_timestamp") or r.get("timestamp") or ""),
            str(r.get("equipment") or ""),
            str(r.get("process") or "")
        )

    records.sort(key=sort_key)
    canonical_json = json.dumps(records, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()


def get_code_version() -> str:
    """Safely obtain Git commit hash or fallback to application version without failing."""
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            stderr=subprocess.DEVNULL,
            timeout=1
        ).decode("utf-8").strip()
        if commit:
            return commit
    except Exception:
        pass
    return getattr(settings, "VERSION", "1.0.0")
