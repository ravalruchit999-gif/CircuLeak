from sqlalchemy import Column, Integer, String, Float, Boolean
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), unique=True, nullable=False, index=True)  # e.g., grid_electricity, coal, diesel
    factor_value = Column(Float, nullable=False)  # kgCO2e per unit
    unit = Column(String(50), nullable=False)  # kgCO2e/kWh, kgCO2e/kg, kgCO2e/L
    reference = Column(String(255), nullable=False)  # India CEA CO2 Baseline Database v19 / IPCC
    is_active = Column(Boolean, default=True)
