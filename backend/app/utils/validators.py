from typing import List, Dict, Any, Tuple, Optional

REQUIRED_CSV_COLUMNS = [
    "date",
    "hour",
    "equipment",
    "process",
    "electricity_kwh",
    "fuel_type",
    "fuel_quantity",
    "production_volume",
    "operating_hours"
]


def validate_csv_columns(columns: List[str]) -> Tuple[bool, List[str]]:
    """Verify that all required columns are present in the uploaded CSV."""
    normalized_cols = [c.strip().lower() for c in columns]
    missing = [req for req in REQUIRED_CSV_COLUMNS if req not in normalized_cols]
    return len(missing) == 0, missing


def validate_row_data(row: Dict[str, Any], row_idx: int) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """Validate a single parsed row of industrial data."""
    try:
        date_str = str(row.get("date", "")).strip()
        if not date_str or date_str.lower() == "nan":
            return False, f"Row {row_idx}: Missing or invalid date", {}

        hour = int(float(row.get("hour", 0)))
        if not (0 <= hour <= 23):
            return False, f"Row {row_idx}: Hour must be between 0 and 23 (got {hour})", {}

        equipment = str(row.get("equipment", "")).strip()
        if not equipment or equipment.lower() == "nan":
            return False, f"Row {row_idx}: Equipment cannot be empty", {}

        process = str(row.get("process", "")).strip()
        if not process or process.lower() == "nan":
            return False, f"Row {row_idx}: Process cannot be empty", {}

        electricity_kwh = float(row.get("electricity_kwh", 0.0) or 0.0)
        if electricity_kwh < 0:
            return False, f"Row {row_idx}: electricity_kwh cannot be negative", {}

        fuel_type_raw = str(row.get("fuel_type", "")).strip().lower()
        fuel_type = None if fuel_type_raw in ["", "none", "nan", "null"] else fuel_type_raw

        fuel_quantity = float(row.get("fuel_quantity", 0.0) or 0.0)
        if fuel_quantity < 0:
            return False, f"Row {row_idx}: fuel_quantity cannot be negative", {}

        production_volume = float(row.get("production_volume", 0.0) or 0.0)
        if production_volume < 0:
            return False, f"Row {row_idx}: production_volume cannot be negative", {}

        operating_hours = float(row.get("operating_hours", 1.0) or 1.0)
        if not (0 <= operating_hours <= 24):
            return False, f"Row {row_idx}: operating_hours must be between 0 and 24", {}

        clean_row = {
            "date": date_str,
            "hour": hour,
            "equipment": equipment,
            "process": process,
            "electricity_kwh": electricity_kwh,
            "fuel_type": fuel_type,
            "fuel_quantity": fuel_quantity,
            "production_volume": production_volume,
            "operating_hours": operating_hours
        }
        return True, None, clean_row
    except (ValueError, TypeError) as e:
        return False, f"Row {row_idx}: Data conversion error: {str(e)}", {}
