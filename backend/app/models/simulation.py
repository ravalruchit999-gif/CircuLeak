import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_name = Column(String(100), default="custom")  # "custom", "cost_saver", "balanced", "max_decarbonization"
    selected_interventions = Column(JSON, default=list)  # list of recommendation IDs
    baseline_emissions_kg = Column(Float, nullable=False)
    projected_emissions_kg = Column(Float, nullable=False)
    total_reduction_kg = Column(Float, nullable=False)
    reduction_percent = Column(Float, nullable=False)
    investment_inr = Column(Float, nullable=False)
    annual_savings_inr = Column(Float, nullable=False)
    payback_years = Column(Float, nullable=False)
    five_year_savings_inr = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    facility = relationship("Facility", back_populates="simulations")
