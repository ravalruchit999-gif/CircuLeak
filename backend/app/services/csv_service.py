import io
import uuid
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.models.process_data import ProcessData
from app.models.facility import Facility
from app.models.data_upload import DataUpload
from app.models.analysis_run import AnalysisRun
from app.models.audit_log import AuditLog
from app.models.emission_factor import EmissionFactor
from app.services.data_quality_service import DataQualityService
from app.services.leak_service import LeakService
from app.services.emission_service import EmissionService
from app.services.dataset_hash_service import compute_canonical_dataset_hash, get_code_version
from app.schemas.telemetry_contract import TelemetryContract, TelemetryContractValidationError, CANONICAL_ALIASES


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
            raise ValueError(f"Failed to parse spreadsheet '{filename}': {str(e)}")

    @staticmethod
    def inspect_file(file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Inspect uploaded file without saving: detect columns against the canonical
        data contract, suggest mappings, and provide preview rows and diagnostics.
        """
        df = CSVService.read_file_to_dataframe(file_content, filename)
        detected_columns = [str(c).strip() for c in df.columns]

        suggested_mapping = TelemetryContract.detect_column_mappings(detected_columns)
        mapped_canonicals = set(suggested_mapping.values())

        # Check required fields
        required_fields = ["equipment", "electricity_kwh"]
        missing_required = [req for req in required_fields if req not in mapped_canonicals]

        # Check time fidelity: timestamp or date
        if "timestamp" not in mapped_canonicals and "date" not in mapped_canonicals:
            missing_required.append("timestamp (or date)")

        preview_df = df.head(5).fillna("")
        preview_rows = preview_df.to_dict(orient="records")

        return {
            "filename": filename,
            "total_rows_detected": len(df),
            "detected_columns": detected_columns,
            "suggested_mapping": suggested_mapping,
            "canonical_fields": list(CANONICAL_ALIASES.keys()),
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
        Production Telemetry Ingestion Pipeline:
        1. Validates against production data contract (no silent column invention).
        2. Preserves native sub-hourly timestamp fidelity (minute, 15-min, hourly).
        3. Enforces non-destructive idempotent upsert on (facility_id, timestamp, equipment, process).
        4. Calculates emissions using active database EmissionFactors with auditor provenance.
        5. Logs full ML lineage in analysis_runs and audit_logs.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility with ID {facility_id} does not exist.")

        df = CSVService.read_file_to_dataframe(file_content, filename)
        raw_rows_count = len(df)
        if raw_rows_count == 0:
            raise ValueError("The uploaded dataset is completely empty (0 rows).")

        # 1. Validate & Normalize against formal Production Data Contract
        valid_df, contract_report = TelemetryContract.validate_and_normalize(df, custom_mapping)
        valid_count = len(valid_df)
        rejected_count = contract_report["rejected_count"]
        duplicates_count = contract_report["duplicate_count"]

        rejection_reasons = []
        if rejected_count > 0:
            rejection_reasons.append(f"{rejected_count} rows contained negative, unparseable, or missing required values.")
        if duplicates_count > 0:
            rejection_reasons.append(f"{duplicates_count} duplicate timestamp-equipment rows were merged.")

        # 2. Dynamic Data Quality Evaluation
        quality_eval = DataQualityService.evaluate_dataframe_quality(valid_df)
        data_coverage = round((valid_count / max(1, raw_rows_count)) * 100.0, 1)

        analysis_run_id = f"RUN-INGEST-{uuid.uuid4().hex[:8].upper()}"
        start_time = datetime.now(timezone.utc)

        # 3. Create Upload & Ingestion Run Tracking Records
        upload_entry = DataUpload(
            facility_id=facility_id,
            filename=filename,
            uploaded_by=user_id,
            uploaded_at=start_time,
            row_count=raw_rows_count,
            valid_row_count=valid_count,
            invalid_row_count=rejected_count,
            data_coverage=data_coverage,
            quality_score=quality_eval["confidence_score"],
            quality_level=quality_eval["quality_level"],
            dimensions=quality_eval["dimensions"],
            warnings=quality_eval["warnings"],
            rejection_reasons=rejection_reasons,
            analysis_status="processing",
            analysis_run_id=analysis_run_id
        )
        db.add(upload_entry)
        db.flush()

        dataset_hash = compute_canonical_dataset_hash(valid_df)
        code_ver = get_code_version()

        ingest_run = AnalysisRun(
            id=analysis_run_id,
            facility_id=facility_id,
            upload_id=upload_entry.id,
            analysis_type="telemetry_ingestion",
            model_name="CanonicalIngestionPipeline",
            model_version="1.0.0",
            parameters={
                "custom_mapping": custom_mapping or {},
                "dataset_hash_sha256": dataset_hash,
                "code_version": code_ver
            },
            dataset_hash_sha256=dataset_hash,
            code_version=code_ver,
            feature_set=list(valid_df.columns),
            input_row_count=raw_rows_count,
            started_at=start_time,
            status="running"
        )
        db.add(ingest_run)
        db.flush()

        # 4. Database-Driven Emission Calculation with Full Provenance & Validity Windowing
        ef_cache = {}

        def compute_row_emissions_and_provenance(row):
            elec_kwh = float(row.get("electricity_kwh", 0.0) or 0.0)
            fuel_qty = float(row.get("fuel_quantity", 0.0) or 0.0)
            fuel_type_str = str(row.get("fuel_type", "none") or "none").strip().lower()

            row_ts = row["normalized_timestamp"]
            if hasattr(row_ts, "to_pydatetime"):
                row_ts = row_ts.to_pydatetime()
            elif isinstance(row_ts, str):
                row_ts = datetime.fromisoformat(row_ts)

            date_key = row_ts.date() if hasattr(row_ts, "date") else None
            grid_key = ("grid_electricity", date_key)
            if grid_key not in ef_cache:
                ef_cache[grid_key] = EmissionService.get_factor_for_telemetry(db, "grid_electricity", row_ts)
            grid_ef = ef_cache[grid_key]
            total_emiss = elec_kwh * grid_ef.factor_value

            ef_id = grid_ef.id
            ef_version = grid_ef.version or "2024.1"
            ef_ref = grid_ef.reference
            ef_from = grid_ef.effective_from
            ef_to = grid_ef.effective_to

            if fuel_type_str != "none" and fuel_qty > 0:
                fuel_clean = fuel_type_str.replace(" ", "_").replace("-", "_")
                fuel_key = (fuel_clean, date_key)
                if fuel_key not in ef_cache:
                    ef_cache[fuel_key] = EmissionService.get_factor_for_telemetry(db, fuel_clean, row_ts)
                fuel_ef = ef_cache[fuel_key]
                total_emiss += fuel_qty * fuel_ef.factor_value

            return pd.Series([round(total_emiss, 4), ef_id, ef_version, ef_ref, ef_from, ef_to])

        provenance_df = valid_df.apply(compute_row_emissions_and_provenance, axis=1)
        valid_df["calculated_emissions_kg"] = provenance_df[0]
        valid_df["ef_id"] = provenance_df[1]
        valid_df["ef_version"] = provenance_df[2]
        valid_df["ef_ref"] = provenance_df[3]
        valid_df["ef_from"] = provenance_df[4]
        valid_df["ef_to"] = provenance_df[5]

        # 5. Non-Destructive Idempotent Telemetry Upsert
        # Preserves historical records outside the uploaded file time window
        records_to_upsert = []
        for _, row in valid_df.iterrows():
            ts = row["normalized_timestamp"]
            if hasattr(ts, "to_pydatetime"):
                ts = ts.to_pydatetime()

            records_to_upsert.append({
                "facility_id": facility_id,
                "timestamp": ts,
                "date": str(row["date"]),
                "hour": int(row["hour"]),
                "equipment": str(row["equipment"]).strip(),
                "process": str(row["process"]).strip(),
                "electricity_kwh": float(row["electricity_kwh"]),
                "fuel_type": str(row["fuel_type"]).strip(),
                "fuel_quantity": float(row["fuel_quantity"]),
                "production_volume": float(row["production_volume"]),
                "operating_hours": float(row["operating_hours"]),
                "calculated_emissions_kg": float(row["calculated_emissions_kg"]),
                "upload_id": upload_entry.id,
                "emission_factor_id": row["ef_id"] if pd.notna(row["ef_id"]) else None,
                "emission_factor_version": str(row["ef_version"]) if pd.notna(row["ef_version"]) else None,
                "emission_factor_source_reference": str(row["ef_ref"]) if pd.notna(row["ef_ref"]) else None,
                "emission_factor_effective_from": row["ef_from"] if pd.notna(row["ef_from"]) else None,
                "emission_factor_effective_to": row["ef_to"] if pd.notna(row["ef_to"]) else None,
                "calculation_method": "IPCC_Tier_1_Direct_Multiplication",
                "calculated_at": datetime.now(timezone.utc)
            })

        if records_to_upsert:
            is_pg = bool(db.bind and "postgresql" in str(db.bind.dialect.name))
            if is_pg:
                # Production PostgreSQL high-performance batch upsert
                batch_size = 500
                for i in range(0, len(records_to_upsert), batch_size):
                    batch = records_to_upsert[i:i + batch_size]
                    stmt = pg_insert(ProcessData).values(batch)
                    stmt = stmt.on_conflict_do_update(
                        index_elements=["facility_id", "timestamp", "equipment", "process"],
                        set_={
                            "electricity_kwh": stmt.excluded.electricity_kwh,
                            "fuel_type": stmt.excluded.fuel_type,
                            "fuel_quantity": stmt.excluded.fuel_quantity,
                            "production_volume": stmt.excluded.production_volume,
                            "operating_hours": stmt.excluded.operating_hours,
                            "calculated_emissions_kg": stmt.excluded.calculated_emissions_kg,
                            "upload_id": stmt.excluded.upload_id,
                            "emission_factor_id": stmt.excluded.emission_factor_id,
                            "emission_factor_version": stmt.excluded.emission_factor_version,
                            "emission_factor_source_reference": stmt.excluded.emission_factor_source_reference,
                            "emission_factor_effective_from": stmt.excluded.emission_factor_effective_from,
                            "emission_factor_effective_to": stmt.excluded.emission_factor_effective_to,
                            "calculation_method": stmt.excluded.calculation_method,
                            "calculated_at": stmt.excluded.calculated_at,
                        }
                    )
                    db.execute(stmt)
            else:
                # Portable upsert loop for in-memory SQLite testing
                for r in records_to_upsert:
                    existing = db.query(ProcessData).filter(
                        ProcessData.facility_id == r["facility_id"],
                        ProcessData.timestamp == r["timestamp"],
                        ProcessData.equipment == r["equipment"],
                        ProcessData.process == r["process"]
                    ).first()
                    if existing:
                        for k, v in r.items():
                            setattr(existing, k, v)
                    else:
                        db.add(ProcessData(**r))
            db.commit()


        # 6. ML Behavioral Anomaly Detection & Model Run Tracking
        anomalies_detected = 0
        anomaly_run_id = f"RUN-ANOMALY-{uuid.uuid4().hex[:8].upper()}"
        try:
            detected_leaks = LeakService.detect_and_sync_anomalies(
                db=db,
                facility_id=facility_id,
                upload_id=upload_entry.id,
                analysis_run_id=anomaly_run_id
            )
            anomalies_detected = len(detected_leaks)
        except Exception as e:
            print(f"Warning: Anomaly detector sync notice: {e}")

        # Complete ingestion run
        ingest_run.status = "completed"
        ingest_run.completed_at = datetime.now(timezone.utc)
        upload_entry.analysis_status = "completed"

        # 7. Audit Log Entry
        audit_entry = AuditLog(
            user_id=user_id,
            action="dataset_uploaded",
            resource="facility",
            resource_id=str(facility_id),
            details={
                "filename": filename,
                "upload_id": upload_entry.id,
                "ingest_run_id": analysis_run_id,
                "anomaly_run_id": anomaly_run_id,
                "rows_ingested": valid_count,
                "anomalies_detected": anomalies_detected,
                "confidence_score": quality_eval["confidence_score"],
                "dataset_hash_sha256": dataset_hash
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
