from sqlalchemy import Column, String, Float, Text, Boolean, Integer, JSON
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Recommendation(Base):
    """
    Authoritative Database Knowledge Base for Industrial Circular Interventions.
    Maintains strict separation between published [REFERENCE] case-study parameters
    and factory-specific [SCENARIO] calculations.
    """
    __tablename__ = "recommendations"

    # Core Identifiers
    id = Column(String(100), primary_key=True, index=True)  # e.g., "auto_idle_shutdown"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    target_process = Column(String(150), nullable=False, index=True)
    target_equipment = Column(String(150), nullable=False, index=True)
    intervention_type = Column(String(100), nullable=False)  # "operational_optimization", etc.
    intervention_category = Column(String(100), default="operational_optimization", index=True)

    # Applicability Filters (Sector is an applicability filter, NOT the answer!)
    supported_sectors = Column(JSON, default=list)
    supported_processes = Column(JSON, default=list)
    supported_equipment = Column(JSON, default=list)
    applicable_problem_types = Column(JSON, default=list)
    objective_tags = Column(JSON, default=list)

    # Telemetry & Prerequisite Guards
    prerequisites = Column(JSON, default=dict)
    required_telemetry = Column(JSON, default=list)
    optional_telemetry = Column(JSON, default=list)
    contraindications = Column(JSON, default=list)
    implementation_constraints = Column(JSON, default=list)

    # Strictly Schema-Versioned Engineering & Economic Models
    capex_model = Column(JSON, default=dict)
    opex_model = Column(JSON, default=dict)
    savings_model = Column(JSON, default=dict)
    carbon_reduction_model = Column(JSON, default=dict)
    waste_reduction_model = Column(JSON, default=dict)
    revenue_model = Column(JSON, default=dict)

    # Operational Risk & Execution Characteristics
    implementation_complexity = Column(String(50), default="Medium")  # Low, Medium, High
    operational_disruption = Column(String(50), default="Low")        # Low (No downtime), Medium (Scheduled), High (Outage)
    risk_level = Column(String(50), default="Low")                    # Low, Medium, High
    feasibility = Column(String(50), default="High")
    is_standard = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    # Published External Reference Provenance ([REFERENCE] parameters only!)
    reference_type = Column(String(100), default="Industrial Energy Audit Case Study")
    reference_title = Column(String(255), default="")
    reference_organization = Column(String(150), default="Bureau of Energy Efficiency (BEE) / UNIDO")
    reference_url_or_document = Column(String(255), default="")
    reference_year = Column(Integer, default=2023)
    reference_parameter = Column(String(150), default="")
    reference_parameter_range = Column(String(100), default="")
    reference_applicability_notes = Column(Text, default="")

    # Versioning & Audit Metadata
    methodology_version = Column(String(50), default="1.0.0")
    knowledge_version = Column(String(50), default="2024.1")
    effective_date = Column(String(50), default="2024-01-01")

    # Baseline nominal parameters for backwards compatibility
    requirements = Column(Text, default="")
    estimated_co2_reduction_annual_kg = Column(Float, nullable=False, default=0.0)
    estimated_cost_inr = Column(Float, nullable=False, default=0.0)
    annual_savings_inr = Column(Float, nullable=False, default=0.0)
    payback_period_years = Column(Float, nullable=False, default=0.0)
