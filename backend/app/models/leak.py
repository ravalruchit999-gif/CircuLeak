import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Leak(Base):
    __tablename__ = "leaks"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    leak_type = Column(String(50), nullable=False)  # "structural" (hotspot) or "behavioral" (anomaly)
    equipment = Column(String(150), nullable=False, index=True)
    process = Column(String(150), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0 - 100
    emission_contribution_kg = Column(Float, default=0.0)
    baseline_consumption = Column(Float, default=0.0)
    observed_consumption = Column(Float, default=0.0)
    deviation_percent = Column(Float, default=0.0)
    abnormal_period = Column(String(100), default="N/A")
    production_status = Column(String(50), default="active")  # "active", "inactive", "idle"
    reason = Column(Text, nullable=False)
    potential_causes = Column(JSON, default=list)  # list of strings
    detected_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    facility = relationship("Facility", back_populates="leaks")
