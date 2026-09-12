import io
import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.process_data import ProcessData
from app.models.facility import Facility
from app.utils.validators import validate_csv_columns, validate_row_data
from app.utils.calculations import calculate_emissions_for_row


class CSVService:
    @staticmethod
    def process_csv_upload(
        db: Session,
        facility_id: int,
        file_content: bytes
    ) -> Dict[str, Any]:
        """
        Process uploaded industrial CSV file, validate rows, compute standardized emissions,
        and store records in the database.
        """
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility with ID {facility_id} does not exist.")

        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            raise ValueError(f"Failed to parse CSV file: {str(e)}")

        # 1. Validate Columns
        is_valid_cols, missing_cols = validate_csv_columns(list(df.columns))
        if not is_valid_cols:
            raise ValueError(f"Missing required CSV columns: {', '.join(missing_cols)}")

        rows_processed = 0
        rows_valid = 0
        rows_rejected = 0
        rejection_reasons: List[str] = []
        valid_records: List[ProcessData] = []

        # Clear any prior upload records for this facility if re-uploading
        db.query(ProcessData).filter(ProcessData.facility_id == facility_id).delete()

        for idx, row in df.iterrows():
            row_num = int(idx) + 1 if isinstance(idx, (int, float, str)) and str(idx).isdigit() else rows_processed + 1
            rows_processed += 1
            row_dict = row.to_dict()
            is_valid, err_msg, clean_data = validate_row_data(row_dict, row_num)

            if not is_valid:
                rows_rejected += 1
                if len(rejection_reasons) < 10:  # Cap reasons to 10 to keep response clean
                    rejection_reasons.append(err_msg or f"Row {row_num} invalid")
                continue

            # Calculate emissions for row
            row_emissions = calculate_emissions_for_row(
                electricity_kwh=clean_data["electricity_kwh"],
                fuel_type=clean_data["fuel_type"],
                fuel_quantity=clean_data["fuel_quantity"]
            )

            record = ProcessData(
                facility_id=facility_id,
                date=clean_data["date"],
                hour=clean_data["hour"],
                equipment=clean_data["equipment"],
                process=clean_data["process"],
                electricity_kwh=clean_data["electricity_kwh"],
                fuel_type=clean_data["fuel_type"],
                fuel_quantity=clean_data["fuel_quantity"],
                production_volume=clean_data["production_volume"],
                operating_hours=clean_data["operating_hours"],
                calculated_emissions_kg=row_emissions
            )
            valid_records.append(record)
            rows_valid += 1

        if valid_records:
            db.bulk_save_objects(valid_records)
            db.commit()

        # Generate summary insights
        total_kwh = float(sum(float(getattr(r, "electricity_kwh", 0.0)) for r in valid_records))
        total_emiss = float(sum(float(getattr(r, "calculated_emissions_kg", 0.0)) for r in valid_records))
        equipments_tracked = list(set(r.equipment for r in valid_records))
        processes_tracked = list(set(r.process for r in valid_records))

        return {
            "status": "success",
            "facility_id": facility_id,
            "rows_processed": rows_processed,
            "rows_valid": rows_valid,
            "rows_rejected": rows_rejected,
            "rejection_reasons": rejection_reasons,
            "summary_insights": {
                "total_electricity_kwh": round(total_kwh, 2),
                "total_emissions_kg": round(total_emiss, 2),
                "equipments_count": len(equipments_tracked),
                "equipments": equipments_tracked,
                "processes": processes_tracked
            }
        }
