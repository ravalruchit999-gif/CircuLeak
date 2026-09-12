from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field


class AuditSummaryRequest(BaseModel):
    facility_id: Union[int, str] = Field(..., json_schema_extra={"example": 1})
    include_benchmarks: bool = True
    custom_target_year: Optional[int] = 2030


class AuditSummaryResponse(BaseModel):
    facility_id: Union[int, str]
    audit_id: Optional[str] = None
    audit_date: Optional[str] = None
    facility_name: Optional[str] = None
    lead_auditor: Optional[str] = None
    verification_status: Optional[str] = None
    report_title: str = "Executive Audit Summary"
    generated_by: str = "CircuLeak AI Audit Intelligence Pipeline"
    is_llm_narrative: bool = False
    executive_narrative: str
    executive_summary: Optional[str] = None
    overall_carbon_status: str
    structured_audit_data: Dict[str, Any]
    key_findings: List[Union[Dict[str, Any], str]]
    priority_action_plan: List[Dict[str, Any]]
    recommended_package: Optional[Dict[str, Any]] = None
    regulatory_ccts_standing: str
    compliance_notes: Optional[List[str]] = None
    generated_at: str
