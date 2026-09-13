from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HotspotItem(BaseModel):
    rank: int
    equipment: str
    process: str
    emissions_kg: float
    percentage_of_total: float
    leak_category: str = "Structural Leak"


class HotspotsResponse(BaseModel):
    facility_id: int
    total_emissions_kg: float
    hotspots: List[HotspotItem]


class AnomalyItem(BaseModel):
    leak_id: Optional[int] = None
    equipment: str
    process: str
    risk_score: float  # 0 - 100
    baseline_consumption: float
    observed_consumption: float
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str] = []
    status: str = "detected"


class AnomaliesResponse(BaseModel):
    facility_id: int
    anomalies_detected_count: int
    anomalies: List[AnomalyItem]


# =====================================================================
# Phase 1 Carbon Incident Investigation Detailed Schemas
# =====================================================================

class IncidentMetadata(BaseModel):
    id: int
    status: str = "detected"  # "detected", "investigating", "resolved", "dismissed"
    severity: str = "Medium"   # "Critical", "High", "Medium", "Low"
    detected_at: datetime
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    facility_id: int
    facility_name: Optional[str] = None
    equipment: str
    process_area: str
    location: Optional[str] = None
    metric: str = "Electricity Consumption"
    detection_method: str = "Historical/operational anomaly detection (Isolation Forest)"
    model_name: Optional[str] = "IsolationForest"
    model_version: Optional[str] = "1.0.0"
    analysis_run_id: Optional[str] = None
    dataset_hash_sha256: Optional[str] = None
    code_version: Optional[str] = None


class ObservedMetric(BaseModel):
    metric_name: str = "Electricity Consumption"
    value: float
    unit: str = "kWh/hr"
    production_volume: Optional[float] = None
    operating_hours: Optional[float] = None
    period_description: Optional[str] = None


class BaselineMetric(BaseModel):
    metric_name: str = "Expected Baseline"
    value: float
    unit: str = "kWh/hr"
    methodology: str = "Historical Median Active Baseline"
    reference_description: str = "Calculated from normal active production cycles."


class DeviationMetric(BaseModel):
    percent: float
    absolute_difference: float
    direction: str = "excess"


class EmissionFactorProvenance(BaseModel):
    factor_id: Optional[int] = None
    factor_value: float
    unit: str = "kgCO2e/kWh"
    version: str = "2024.1"
    reference: str
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None


class ImpactMetrics(BaseModel):
    energy_impact_kwh: Optional[float] = None
    excess_fuel_quantity: Optional[float] = None
    fuel_unit: Optional[str] = None
    carbon_impact_kg: Optional[float] = None
    carbon_impact_tco2e: Optional[float] = None
    carbon_calculation_method: str = "IPCC Tier 1 Direct Multiplication"
    emission_factor_provenance: Optional[EmissionFactorProvenance] = None
    financial_impact_inr: Optional[float] = None
    financial_status: Optional[str] = None
    production_impact: Optional[str] = None


class TimelinePoint(BaseModel):
    timestamp: str
    observed: float
    baseline: float
    is_anomaly: bool = False


class EvidenceItem(BaseModel):
    signal: str
    detail: str


class DataQualitySummary(BaseModel):
    available: List[str] = []
    missing: List[str] = []
    limitation_note: str


class DetectionConfidence(BaseModel):
    level: str = "Medium"  # "High", "Medium", "Low"
    reason: str


class IncidentStatusUpdateRequest(BaseModel):
    status: str  # "investigating", "resolved", "dismissed", "detected"
    note: Optional[str] = None


# =====================================================================
# Phase 2 Evidence-Based "Why?" Detailed Schemas
# =====================================================================

class StructuredEvidenceItem(BaseModel):
    evidence_id: str
    category: str  # "production_state", "intensity_spike", "off_hours_idle", "temporal_concentration", "equipment_localization"
    title: str
    description: str
    observed_value: Optional[float] = None
    reference_value: Optional[float] = None
    difference: Optional[float] = None
    difference_percent: Optional[float] = None
    unit: Optional[str] = None
    strength: str = "STRONG"  # "STRONG", "MODERATE", "WEAK" (composite deterministic score)
    supports: str
    source_metric: str
    time_window: str
    sample_size: int = 0
    baseline_method: str = "Tier 1: same_equipment_same_process_comparable_operating_state"
    data_quality: str = "Direct IoT SCADA Telemetry"
    analysis_run_id: Optional[str] = None
    is_fact: bool = True
    telemetry_timestamps: List[str] = []  # Exact observation timestamps that produced this finding


class WhatChangedItem(BaseModel):
    metric: str
    observed: float
    baseline: float
    difference: float
    difference_percent: float
    unit: str
    baseline_method_tier: str  # "Tier 1", "Tier 2", "Tier 3", or "baseline_unavailable"
    interpretation: str


class EvidenceChainStep(BaseModel):
    step: int
    type: str  # "fact", "observation", "baseline_divergence", "equipment_localization", "supported_interpretation"
    statement: str
    evidence_id: Optional[str] = None
    is_fact: bool = True


class SupportedContributor(BaseModel):
    factor: str
    strength: str = "STRONG"  # "STRONG", "MODERATE", "WEAK"
    reason: str
    evidence_ids: List[str] = []


class NotConfirmedItem(BaseModel):
    factor: str
    reason: str
    missing_telemetry: List[str] = []


class MissingDataItem(BaseModel):
    telemetry_channel: str
    status: str = "Missing"
    impact: str
    importance: str = "High"  # "High", "Medium", "Low"


class HypothesisFalsificationItem(BaseModel):
    hypothesis: str
    strengthening_condition: str
    falsifying_condition: str


class RankedInvestigationAction(BaseModel):
    priority: int  # 1, 2, 3
    priority_label: str  # "High", "Medium", "Low"
    action: str
    investigation_priority: str
    information_gain_rationale: str


class MultivariableAssociation(BaseModel):
    variable_a: str
    variable_b: str
    association_r: Optional[float] = None
    sample_size: int
    note: str
    caveat: str = "Association indicates mutual variation across paired timestamps, not physical causation."


class ProblemRepresentation(BaseModel):
    """Phase 3 Extension Point: Narrow structured definition of the verified operational problem."""
    problem_type: Optional[str] = None
    type: Optional[str] = None
    affected_equipment: str = ""
    affected_process: str = ""
    severity: str = "Medium"
    evidence_strength: str = "STRONG"
    excess_energy_kwh: float = 0.0
    carbon_factor_used: Optional[float] = None
    estimated_carbon_impact_kg: float = 0.0
    estimated_financial_impact_inr: float = 0.0
    constraints: List[str] = []
    missing_data: List[str] = []
    provenance_notes: Dict[str, Any] = Field(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        if not self.problem_type and self.type:
            self.problem_type = self.type
        elif not self.type and self.problem_type:
            self.type = self.problem_type


class AnalysisMetadata(BaseModel):
    analysis_type: str = "incident_evidence_investigation"
    methodology_version: str = "1.0.0"
    generated_at: str
    dataset_hash: Optional[str] = None
    analysis_run_id: Optional[str] = None
    input_record_count: int = 0
    window_start: Optional[str] = None
    window_end: Optional[str] = None


class WhyAnalysisResponse(BaseModel):
    summary: str
    why_flagged_statement: str
    evidence_chain: List[EvidenceChainStep] = []
    what_changed: List[WhatChangedItem] = []
    evidence_items: List[StructuredEvidenceItem] = []
    supported_contributors: List[SupportedContributor] = []
    not_confirmed: List[NotConfirmedItem] = []
    missing_data: List[MissingDataItem] = []
    what_would_change_conclusion: List[HypothesisFalsificationItem] = []
    ranked_next_investigation: List[RankedInvestigationAction] = []
    multivariable_analysis: List[MultivariableAssociation] = []
    problem_representation: Optional[ProblemRepresentation] = None
    analysis_metadata: Optional[AnalysisMetadata] = None
    methodology: str
    scientific_distinction: str = (
        "ANOMALY DETECTION flags unusual statistical divergence. "
        "EVIDENCE-BASED EXPLANATION identifies measured telemetry signals associated with the divergence. "
        "CAUSAL INFERENCE requires physical sensor proof (e.g. pressure/temperature transducer confirmation) "
        "and is explicitly not asserted when those transducers are uninstrumented."
    )


class LeakDetailResponse(BaseModel):
    # Core legacy fields
    id: int
    facility_id: int
    leak_type: str
    equipment: str
    process: str
    risk_score: float
    status: str = "detected"
    emission_contribution_kg: float
    baseline_consumption: float
    observed_consumption: float
    deviation_percent: float
    abnormal_period: str
    production_status: str
    reason: str
    potential_causes: List[str]
    recommended_interventions: List[Any] = []
    detected_at: datetime

    # Phase 1 Carbon Incident Detailed Sections
    incident: Optional[IncidentMetadata] = None
    observed: Optional[ObservedMetric] = None
    baseline: Optional[BaselineMetric] = None
    deviation: Optional[DeviationMetric] = None
    impact: Optional[ImpactMetrics] = None
    timeline: List[TimelinePoint] = []
    evidence: List[EvidenceItem] = []
    possible_contributing_factors: List[str] = []
    data_quality: Optional[DataQualitySummary] = None
    confidence: Optional[DetectionConfidence] = None
    next_investigation: List[str] = []

    # Phase 2 Evidence-Based "Why?" Detailed Section
    why_analysis: Optional[WhyAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

