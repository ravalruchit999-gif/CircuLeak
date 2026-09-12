import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False, index=True)
    sector = Column(String(100), nullable=False, index=True)
    location = Column(String(150), nullable=False)
    production_type = Column(String(150), nullable=False)
    production_volume = Column(Float, nullable=False)
    employees = Column(Integer, default=50)
    operating_hours = Column(Float, default=16.0)
    energy_sources = Column(JSON, default=list)  # e.g. ["grid_electricity", "natural_gas", "diesel"]
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    process_data = relationship("ProcessData", back_populates="facility", cascade="all, delete-orphan")
    leaks = relationship("Leak", back_populates="facility", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="facility", cascade="all, delete-orphan")
