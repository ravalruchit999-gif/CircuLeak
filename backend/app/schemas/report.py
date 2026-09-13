from typing import List, Optional
from pydantic import BaseModel, Field


class ReportGenerateRequest(BaseModel):
    facility_id: int = Field(..., json_schema_extra={"example": 1})
    executive_notes: Optional[str] = None


class ReportGenerateResponse(BaseModel):
    facility_id: int
    report_title: str
    file_name: str
    download_url: str
    preview_url: Optional[str] = None
    file_size_bytes: int
    sections_included: List[str]
