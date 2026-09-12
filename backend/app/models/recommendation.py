from sqlalchemy import Column, String, Float, Text, Boolean
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(100), primary_key=True, index=True)  # e.g., "whr_furnace_01"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    target_process = Column(String(150), nullable=False, index=True)
    target_equipment = Column(String(150), nullable=False, index=True)
    intervention_type = Column(String(100), nullable=False)  # "waste_heat_recovery", "solar_integration", etc.
    requirements = Column(Text, default="")
    estimated_co2_reduction_annual_kg = Column(Float, nullable=False)
    estimated_cost_inr = Column(Float, nullable=False)
    annual_savings_inr = Column(Float, nullable=False)
    payback_period_years = Column(Float, nullable=False)
    feasibility = Column(String(50), default="High")  # "High", "Medium", "Low"
    is_standard = Column(Boolean, default=True)
