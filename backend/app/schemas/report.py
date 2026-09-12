from typing import List, Optional, Union
from pydantic import BaseModel, Field


class ReportGenerateRequest(BaseModel):
    facility_id: Union[int, str] = Field(..., json_schema_extra={"example": 1})
    executive_notes: Optional[str] = None
    format: Optional[str] = "pdf"


class ReportGenerateResponse(BaseModel):
    facility_id: Union[int, str]
    report_title: str
    file_name: str
    download_url: str
    file_size_bytes: int
    sections_included: List[str]
    report_url: Optional[str] = None
    generated_at: Optional[str] = None
    message: Optional[str] = "Comprehensive Industrial Decarbonization Audit Report generated successfully."
