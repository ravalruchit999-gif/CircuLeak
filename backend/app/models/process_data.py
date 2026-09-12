import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class ProcessData(Base):
    __tablename__ = "process_data"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, index=True)  # YYYY-MM-DD
    hour = Column(Integer, nullable=False)  # 0 - 23
    equipment = Column(String(150), nullable=False)
    process = Column(String(150), nullable=False, index=True)
    electricity_kwh = Column(Float, default=0.0, nullable=False)
    fuel_type = Column(String(100), nullable=True)  # coal, diesel, natural_gas, lpg, biomass
    fuel_quantity = Column(Float, default=0.0, nullable=False)
    production_volume = Column(Float, default=0.0, nullable=False)
    operating_hours = Column(Float, default=1.0, nullable=False)
    calculated_emissions_kg = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    facility = relationship("Facility", back_populates="process_data")

    __table_args__ = (
        Index("ix_process_data_facility_date", "facility_id", "date"),
        Index("ix_process_data_facility_equipment", "facility_id", "equipment"),
    )
