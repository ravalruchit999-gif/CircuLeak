from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class InspectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    filename: str
    total_rows_detected: int
    detected_columns: List[str]
    suggested_mapping: Dict[str, str]
    canonical_fields: List[str]
    missing_required: List[str]
    can_proceed_auto: bool
    preview_rows: List[Dict[str, Any]]


class UploadSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    facility_id: int
    upload_id: Optional[int] = None
    filename: Optional[str] = None
    rows_processed: int
    rows_valid: int
    rows_rejected: int
    duplicates_count: Optional[int] = 0
    rejection_reasons: List[str] = []
    quality_score: Optional[float] = None
    quality_level: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    warnings: Optional[List[str]] = []
    anomalies_detected: Optional[int] = 0
    analysis_run_id: Optional[str] = None
    summary_insights: Dict[str, Any] = {}
