import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime

try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False, index=True)  # e.g., grid_electricity, coal, diesel
    factor_value = Column(Float, nullable=False)  # kgCO2e per unit
    unit = Column(String(50), nullable=False)  # kgCO2e/kWh, kgCO2e/kg, kgCO2e/L
    reference = Column(String(255), nullable=False)  # India CEA CO2 Baseline Database v19 / IPCC
    version = Column(String(50), default="2024.1", nullable=False)
    scope = Column(String(20), default="Scope 2", nullable=False)  # Scope 1, Scope 2
    effective_from = Column(DateTime, nullable=True)
    effective_to = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
