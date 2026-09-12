from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from datetime import datetime
from app.core.database import Base


class DataUpload(Base):
    __tablename__ = "data_uploads"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    row_count = Column(Integer, default=0)
    valid_row_count = Column(Integer, default=0)
    invalid_row_count = Column(Integer, default=0)
    data_coverage = Column(Float, default=0.0)  # percentage
    quality_score = Column(Float, default=0.0)  # 0 - 100
    quality_level = Column(String(50), default="incomplete")  # high, good, incomplete, needs_attention
    dimensions = Column(JSON, nullable=True)  # breakdown of equipment, electricity, production, fuel, baseline
    warnings = Column(JSON, nullable=True)  # list of warning strings
    rejection_reasons = Column(JSON, nullable=True)  # sample error messages
    analysis_status = Column(String(50), default="uploaded")  # uploaded, validating, analyzing, completed, failed
    analysis_run_id = Column(String(100), nullable=True)
