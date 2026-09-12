from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AuditSummaryRequest(BaseModel):
    facility_id: int = Field(..., json_schema_extra={"example": 1})
    include_benchmarks: bool = True
    custom_target_year: Optional[int] = 2030


class AuditSummaryResponse(BaseModel):
    facility_id: int
    has_data: bool = True
    report_title: str = "Executive Audit Summary"
    generated_by: str = "CircuLeak AI Audit Intelligence Pipeline"
    is_llm_narrative: bool = False
    facility_name: Optional[str] = "Industrial Facility"
    sector: Optional[str] = "Manufacturing"
    executive_narrative: str
    executive_summary: Optional[str] = None
    overall_carbon_status: str = "Standard Transition"
    structured_audit_data: Dict[str, Any] = {}
    verified_metrics: Optional[Dict[str, Any]] = {}
    key_findings: List[Any] = []
    priority_action_plan: List[Dict[str, Any]] = []
    recommended_roadmap: Optional[List[Dict[str, Any]]] = []
    regulatory_ccts_standing: str = "Awaiting Verification"
    generated_at: str
