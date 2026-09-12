import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class ProcessData(Base):
    __tablename__ = "process_data"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    date = Column(String(50), nullable=True, index=True)  # YYYY-MM-DD
    hour = Column(Integer, nullable=True)  # 0 - 23
    equipment = Column(String(150), nullable=False)
    process = Column(String(150), nullable=False, index=True)
    electricity_kwh = Column(Float, default=0.0, nullable=False)
    fuel_type = Column(String(100), nullable=True)  # coal, diesel, natural_gas, lpg, biomass
    fuel_quantity = Column(Float, default=0.0, nullable=False)
    production_volume = Column(Float, default=0.0, nullable=False)
    operating_hours = Column(Float, default=1.0, nullable=False)
    calculated_emissions_kg = Column(Float, default=0.0, nullable=False)

    # Lineage, Audit & Emission Factor Provenance
    upload_id = Column(Integer, ForeignKey("data_uploads.id", ondelete="SET NULL"), nullable=True, index=True)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id", ondelete="SET NULL"), nullable=True)
    emission_factor_version = Column(String(50), nullable=True)
    emission_factor_source_reference = Column(String(255), nullable=True)
    emission_factor_effective_from = Column(DateTime, nullable=True)
    emission_factor_effective_to = Column(DateTime, nullable=True)
    calculation_method = Column(String(100), default="IPCC_Tier_1_Direct_Multiplication")
    calculated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    facility = relationship("Facility", back_populates="process_data")
    upload = relationship("DataUpload")
    emission_factor = relationship("EmissionFactor")

    __table_args__ = (
        UniqueConstraint("facility_id", "timestamp", "equipment", "process", name="uq_process_data_timestamp_identity"),
        Index("ix_process_data_facility_timestamp", "facility_id", "timestamp"),
        Index("ix_process_data_facility_date", "facility_id", "date"),
        Index("ix_process_data_facility_equipment", "facility_id", "equipment"),
    )
