from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel


class UploadSummaryResponse(BaseModel):
    status: str
    facility_id: Union[int, str]
    rows_processed: int
    rows_valid: int
    rows_rejected: int
    rejection_reasons: List[str] = []
    summary_insights: Dict[str, Any] = {}
