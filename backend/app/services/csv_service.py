import io
import uuid
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.models.process_data import ProcessData
from app.models.facility import Facility
from app.models.data_upload import DataUpload
from app.models.audit_log import AuditLog
from app.services.data_quality_service import DataQualityService
from app.services.leak_service import LeakService
from app.utils.calculations import calculate_emissions_for_row

CANONICAL_FIELDS = {
    "date": ["date", "timestamp", "datetime", "record_date", "day"],
    "hour": ["hour", "hr", "time_hour"],
    "equipment": ["equipment", "asset", "machine", "machine_name", "equipment_name", "device", "unit"],
    "process": ["process", "process_name", "department", "area", "line", "stage"],
    "electricity_kwh": ["electricity_kwh", "electricity", "kwh", "power_kwh", "active_power", "energy_kwh", "electricity_consumption", "energy"],
    "fuel_type": ["fuel_type", "energy_source", "thermal_carrier"],
    "fuel_quantity": ["fuel_quantity", "fuel_consumed", "fuel_liters", "fuel_scm", "fuel_volume", "fuel_amount"],
    "production_volume": ["production_volume", "production", "output", "output_mt", "production_tons", "tons", "batch_yield"],
    "operating_hours": ["operating_hours", "runtime_hours", "uptime_hours", "run_hours", "op_hours"]
}


class CSVService:
    @staticmethod
    def read_file_to_dataframe(file_content: bytes, filename: str) -> pd.DataFrame:
        """Parse CSV or XLSX binary content into a pandas DataFrame."""
        is_excel = filename.lower().endswith((".xlsx", ".xls"))
        try:
            if is_excel:
                df = pd.read_excel(io.BytesIO(file_content))
            else:
                df = pd.read_csv(io.BytesIO(file_content))
            return df
        except Exception as e:
            raise ValueError(f"Failed to parse file '{filename}': {str(e)}")

    @staticmethod
    def inspect_file(file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Inspect uploaded file without saving: detect columns, suggest mappings,
        and provide preview rows and preliminary diagnostics.
        """
        df = CSVService.read_file_to_dataframe(file_content, filename)
        detected_columns = [str(c).strip() for c in df.columns]

        # Auto-match detected columns to canonical schema with 1-to-1 priority
        suggested_mapping: Dict[str, str] = {}
        used_canonicals = set()

        # Pass 1: Exact matches
        for col in detected_columns:
            clean_col = re.sub(r"[^a-zA-Z0-9_]", "", col.lower().replace(" ", "_"))
            for canonical, aliases in CANONICAL_FIELDS.items():
                if canonical in used_canonicals:
                    continue
                if clean_col == canonical or clean_col in aliases:
                    suggested_mapping[col] = canonical
                    used_canonicals.add(canonical)
                    break

        # Pass 2: Word boundary / substring matches for remaining unmapped columns
        for col in detected_columns:
            if col in suggested_mapping:
                continue
            clean_col = re.sub(r"[^a-zA-Z0-9_]", "", col.lower().replace(" ", "_"))
            col_tokens = set(clean_col.split("_"))
            for canonical, aliases in CANONICAL_FIELDS.items():
                if canonical in used_canonicals:
                    continue
                if any(alias in col_tokens for alias in aliases):
                    suggested_mapping[col] = canonical
                    used_canonicals.add(canonical)
                    break

        # Preview rows (up to 5) with clean JSON serializable values
        preview_df = df.head(5).fillna("")
        preview_rows = preview_df.to_dict(orient="records")

        # Canonical requirement checklist
        mapped_canonicals = set(suggested_mapping.values())
        required_fields = ["date", "equipment", "process", "electricity_kwh"]
        missing_required = [req for req in required_fields if req not in mapped_canonicals]

        return {
            "filename": filename,
            "total_rows_detected": len(df),
            "detected_columns": detected_columns,
            "suggested_mapping": suggested_mapping,
            "canonical_fields": list(CANONICAL_FIELDS.keys()),
            "missing_required": missing_required,
            "can_proceed_auto": len(missing_required) == 0,
            "preview_rows": preview_rows
        }

    @staticmethod
    def process_csv_upload(
        db: Session,
        facility_id: int,
        file_content: bytes,
        filename: str = "telemetry.csv",
        user_id: Optional[int] = None,
        custom_mapping: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Ingest, remap, validate, compute emissions per row, evaluate data quality,
        and persist telemetry into PostgreSQL with audit logging.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility with ID {facility_id} does not exist.")

        df = CSVService.read_file_to_dataframe(file_content, filename)
        raw_rows_count = len(df)
        if raw_rows_count == 0:
            raise ValueError("The uploaded dataset is completely empty (0 rows).")

        # Apply column mapping
        mapping = custom_mapping or {}
        if not mapping:
            # Auto-detect mapping
            inspection = CSVService.inspect_file(file_content, filename)
            mapping = inspection["suggested_mapping"]

        # Rename columns to canonical names
        renamed_df = df.rename(columns=mapping)

        # Deduplicate columns if any mappings collided
        renamed_df = renamed_df.loc[:, ~renamed_df.columns.duplicated()].copy()

        # Check essential columns
        if "equipment" not in renamed_df.columns:
            renamed_df["equipment"] = renamed_df.get("process", "Primary Industrial Unit")
        if "process" not in renamed_df.columns:
            renamed_df["process"] = "General Manufacturing"
        if "electricity_kwh" not in renamed_df.columns:
            num_cols = renamed_df.select_dtypes(include=["number"]).columns
            if len(num_cols) > 0:
                renamed_df["electricity_kwh"] = renamed_df[num_cols[0]]
            else:
                raise ValueError("Could not map or find a numeric electricity consumption column (kWh).")

        today_str = datetime.now().strftime("%Y-%m-%d")

        # Normalize date & hour
        if "date" not in renamed_df.columns:
            renamed_df["date"] = today_str
        else:
            try:
                parsed_dates = pd.to_datetime(renamed_df["date"], errors="coerce")
                renamed_df["date"] = parsed_dates.dt.strftime("%Y-%m-%d").fillna(today_str)
                if "hour" not in renamed_df.columns and parsed_dates.dt.hour is not None:
                    renamed_df["hour"] = parsed_dates.dt.hour.fillna(0).astype(int)
            except Exception:
                renamed_df["date"] = renamed_df["date"].astype(str)

        if "hour" not in renamed_df.columns:
            renamed_df["hour"] = 0
        else:
            renamed_df["hour"] = pd.to_numeric(renamed_df["hour"], errors="coerce").fillna(0).astype(int) % 24

        # Clean numeric fields
        renamed_df["electricity_kwh"] = pd.to_numeric(renamed_df["electricity_kwh"], errors="coerce").fillna(0.0)

        if "production_volume" not in renamed_df.columns:
            renamed_df["production_volume"] = 0.0
        else:
            renamed_df["production_volume"] = pd.to_numeric(renamed_df["production_volume"], errors="coerce").fillna(0.0)

        if "fuel_type" not in renamed_df.columns:
            renamed_df["fuel_type"] = "none"
        else:
            renamed_df["fuel_type"] = renamed_df["fuel_type"].fillna("none").astype(str)

        if "fuel_quantity" not in renamed_df.columns:
            renamed_df["fuel_quantity"] = 0.0
        else:
            renamed_df["fuel_quantity"] = pd.to_numeric(renamed_df["fuel_quantity"], errors="coerce").fillna(0.0)

        if "operating_hours" not in renamed_df.columns:
            renamed_df["operating_hours"] = 1.0
        else:
            renamed_df["operating_hours"] = pd.to_numeric(renamed_df["operating_hours"], errors="coerce").fillna(1.0)

        # Detect duplicate rows
        subset_cols = ["date", "hour", "equipment"]
        available_subset = [c for c in subset_cols if c in renamed_df.columns]
        duplicates_count = int(renamed_df.duplicated(subset=available_subset).sum()) if available_subset else 0

        # Discard invalid negative electricity rows
        valid_df = renamed_df[renamed_df["electricity_kwh"] >= 0].copy()
        valid_count = len(valid_df)
        rejected_count = raw_rows_count - valid_count
        rejection_reasons = []
        if rejected_count > 0:
            rejection_reasons.append(f"{rejected_count} rows contained negative or unparseable electricity values.")
        if duplicates_count > 0:
            rejection_reasons.append(f"{duplicates_count} duplicate timestamp-equipment rows were identified.")

        # Compute dynamic Data Quality
        quality_eval = DataQualityService.evaluate_dataframe_quality(valid_df)
        data_coverage = round((valid_count / max(1, raw_rows_count)) * 100.0, 1)

        # Calculate emissions per row
        valid_df["calculated_emissions_kg"] = valid_df.apply(
            lambda r: calculate_emissions_for_row(
                electricity_kwh=float(r["electricity_kwh"]),
                fuel_type=str(r["fuel_type"]),
                fuel_quantity=float(r["fuel_quantity"])
            ),
            axis=1
        )

        # Clear prior telemetry for clean replacement
        db.query(ProcessData).filter(ProcessData.facility_id == facility_id).delete()

        # Bulk save objects
        records_to_save = [
            ProcessData(
                facility_id=facility_id,
                date=str(row["date"]),
                hour=int(row["hour"]),
                equipment=str(row["equipment"]).strip(),
                process=str(row["process"]).strip(),
                electricity_kwh=float(row["electricity_kwh"]),
                fuel_type=str(row["fuel_type"]).strip(),
                fuel_quantity=float(row["fuel_quantity"]),
                production_volume=float(row["production_volume"]),
                operating_hours=float(row["operating_hours"]),
                calculated_emissions_kg=float(row["calculated_emissions_kg"])
            )
            for _, row in valid_df.iterrows()
        ]

        if records_to_save:
            db.bulk_save_objects(records_to_save)
            db.commit()

        # Pre-compute and sync anomalies
        anomalies_detected = 0
        try:
            detected_leaks = LeakService.detect_and_sync_anomalies(db=db, facility_id=facility_id)
            anomalies_detected = len(detected_leaks)
        except Exception as e:
            print(f"Warning: Anomaly detector sync notice: {e}")

        # Record upload in data_uploads table
        analysis_run_id = f"RUN-{uuid.uuid4().hex[:8].upper()}"
        upload_entry = DataUpload(
            facility_id=facility_id,
            filename=filename,
            uploaded_by=user_id,
            uploaded_at=datetime.now(timezone.utc),
            row_count=raw_rows_count,
            valid_row_count=valid_count,
            invalid_row_count=rejected_count,
            data_coverage=data_coverage,
            quality_score=quality_eval["confidence_score"],
            quality_level=quality_eval["quality_level"],
            dimensions=quality_eval["dimensions"],
            warnings=quality_eval["warnings"],
            rejection_reasons=rejection_reasons,
            analysis_status="completed",
            analysis_run_id=analysis_run_id
        )
        db.add(upload_entry)

        # Audit log entry
        audit_entry = AuditLog(
            user_id=user_id,
            action="dataset_uploaded",
            resource="facility",
            resource_id=str(facility_id),
            details={
                "filename": filename,
                "rows_ingested": valid_count,
                "anomalies_detected": anomalies_detected,
                "confidence_score": quality_eval["confidence_score"]
            }
        )
        db.add(audit_entry)
        db.commit()

        total_kwh = float(valid_df["electricity_kwh"].sum())
        total_emiss = float(valid_df["calculated_emissions_kg"].sum())
        equipments_tracked = sorted(list(set(valid_df["equipment"].astype(str))))
        processes_tracked = sorted(list(set(valid_df["process"].astype(str))))

        return {
            "status": "success",
            "upload_id": upload_entry.id,
            "facility_id": facility_id,
            "filename": filename,
            "rows_processed": raw_rows_count,
            "rows_valid": valid_count,
            "rows_rejected": rejected_count,
            "duplicates_count": duplicates_count,
            "rejection_reasons": rejection_reasons,
            "quality_score": quality_eval["confidence_score"],
            "quality_level": quality_eval["quality_level"],
            "dimensions": quality_eval["dimensions"],
            "warnings": quality_eval["warnings"],
            "anomalies_detected": anomalies_detected,
            "analysis_run_id": analysis_run_id,
            "summary_insights": {
                "total_electricity_kwh": round(total_kwh, 2),
                "total_emissions_kg": round(total_emiss, 2),
                "equipments_count": len(equipments_tracked),
                "equipments": equipments_tracked,
                "processes": processes_tracked
            }
        }
