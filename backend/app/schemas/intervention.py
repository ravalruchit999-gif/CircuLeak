"""
Pydantic Schemas for Phase 3: Evidence-Backed Intervention Recommendations.
Enforces strict typing, provenance tagging ([REFERENCE], [SCENARIO], [MEASURED], [CALCULATED]),
transparent additive score decomposition, and data completeness guards.
"""

import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator


class EngineeringModelConfig(BaseModel):
    model_type: str
    formula_version: str = "1.0.0"
    input_variables: List[str] = Field(default_factory=list)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    valid_ranges: Dict[str, List[float]] = Field(default_factory=dict)
    valid_units: Dict[str, str] = Field(default_factory=dict)
    calculation_basis: str = ""


class ReferenceMetadata(BaseModel):
    reference_type: str = "Industrial Energy Audit Case Study"
    reference_title: str = ""
    reference_organization: str = "Bureau of Energy Efficiency (BEE) / UNIDO"
    reference_url_or_document: str = ""
    reference_year: int = 2023
    reference_parameter: str = ""
    reference_parameter_range: str = ""
    reference_applicability_notes: str = ""


class UserDecisionContext(BaseModel):
    primary_objective: str = Field(default="payback", description="One of: payback, carbon, capex, disruption, circularity")
    max_capex_inr: Optional[float] = Field(default=None, ge=0.0, description="Maximum Capex budget in INR. Must be non-negative.")
    max_payback_years: Optional[float] = Field(default=None, gt=0.0, description="Maximum acceptable payback period in years.")
    acceptable_disruption: Optional[str] = "High"  # "Low", "Medium", "High"
    max_risk_level: Optional[str] = "High"          # "Low", "Medium", "High"
    target_sector: Optional[str] = None
    custom_weights: Optional[Dict[str, float]] = None
    custom_electricity_tariff_inr: Optional[float] = Field(
        default=None,
        gt=0.0,
        description="Custom electricity tariff in INR/kWh. Must be strictly positive (> 0)."
    )
    custom_fuel_tariff_inr: Optional[float] = Field(
        default=None,
        gt=0.0,
        description="Custom thermal fuel tariff in INR/unit. Must be strictly positive (> 0)."
    )

    @field_validator("custom_electricity_tariff_inr", "custom_fuel_tariff_inr")
    @classmethod
    def validate_tariffs_strict(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if math.isnan(v) or math.isinf(v):
                raise ValueError("Tariff value cannot be NaN or infinite.")
            if v <= 0.0:
                raise ValueError("Custom tariff must be strictly positive (> 0.0).")
        return v


class ApplicabilityEvaluation(BaseModel):
    status: str = Field(..., description="'applicable', 'conditionally_applicable', 'not_applicable'")
    boundary_match: bool
    problem_fit: bool
    missing_telemetry: List[str] = Field(default_factory=list)
    disqualification_reasons: List[str] = Field(default_factory=list)
    conditions_for_applicability: List[str] = Field(default_factory=list)


class EconomicEvaluation(BaseModel):
    status: str = Field(..., description="'evaluated', 'insufficient_data', 'not_evaluable'")
    capex_inr: Optional[float] = None
    capex_range: Optional[Dict[str, float]] = None
    annual_opex_inr: Optional[float] = None
    annual_savings_inr: Optional[float] = None
    savings_range: Optional[Dict[str, float]] = None
    payback_period_years: Optional[float] = None
    roi_pct: Optional[float] = None
    annual_co2_reduction_kg: Optional[float] = None
    co2_reduction_range: Optional[Dict[str, float]] = None
    co2_abatement_cost_inr_per_ton: Optional[float] = None
    waste_diversion_annual_kg: Optional[float] = None
    data_provenance_labels: Dict[str, str] = Field(default_factory=dict)
    assumptions_applied: List[str] = Field(default_factory=list)
    missing_variables: List[str] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    total_score: float
    problem_fit_score: float
    problem_fit_detail: str
    objective_alignment_score: float
    objective_alignment_detail: str
    economic_attractiveness_score: float
    economic_attractiveness_detail: str
    evidence_support_score: float
    evidence_support_detail: str
    implementation_fit_score: float
    implementation_fit_detail: str
    safety_score: float
    safety_detail: str
    weight_multipliers: Dict[str, float] = Field(default_factory=dict)


class ConfidenceEvaluation(BaseModel):
    level: str = Field(..., description="'HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT_DATA'")
    confidence_score: float
    contributing_factors: List[str] = Field(default_factory=list)
    uncertainty_drivers: List[str] = Field(default_factory=list)
    what_would_change_this: str = ""


class RecommendationCard(BaseModel):
    id: str
    title: str
    description: str
    intervention_type: str
    intervention_category: str
    target_process: str
    target_equipment: str
    applicability: ApplicabilityEvaluation
    economics: EconomicEvaluation
    score_breakdown: ScoreBreakdown
    confidence: ConfidenceEvaluation
    reference: ReferenceMetadata
    implementation_complexity: str
    operational_disruption: str
    risk_level: str
    feasibility: str
    prerequisites: Dict[str, Any] = Field(default_factory=dict)
    contraindications: List[str] = Field(default_factory=list)
    implementation_constraints: List[str] = Field(default_factory=list)


class IncidentRecommendationResponse(BaseModel):
    incident_id: int
    facility_id: int
    facility_name: str
    analysis_run_id: Optional[str] = None
    dataset_hash_sha256: Optional[str] = None
    analysis_context_hash: Optional[str] = None
    decision_context: UserDecisionContext
    problem_summary: Dict[str, Any] = Field(default_factory=dict)
    top_recommendation: Optional[RecommendationCard] = None
    applicable_recommendations: List[RecommendationCard] = Field(default_factory=list)
    conditionally_applicable_recommendations: List[RecommendationCard] = Field(default_factory=list)
    inapplicable_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    why_this_option_fits: List[str] = Field(default_factory=list)
    why_not_others: List[Dict[str, Any]] = Field(default_factory=list)
    challenge_my_recommendation: Dict[str, Any] = Field(default_factory=dict)
    verification_checklist: List[Dict[str, Any]] = Field(default_factory=list)
    evaluated_at: str


class RecommendationComparisonRequest(BaseModel):
    intervention_ids: List[str]
    decision_context: Optional[UserDecisionContext] = None


class RecommendationComparisonResponse(BaseModel):
    items: List[RecommendationCard]
    tradeoff_analysis: List[Dict[str, Any]]
