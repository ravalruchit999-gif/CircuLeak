from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class AnalysisRule(Base):
    __tablename__ = "analysis_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(100), unique=True, nullable=False)
    anomaly_threshold = Column(Float, default=2.5)  # Z-score / sigma threshold
    min_data_points = Column(Integer, default=24)  # Minimum hourly rows required
    off_hours_threshold = Column(Float, default=0.25)  # Max allowed ratio of peak load during inactive hours
    min_baseline_period_days = Column(Integer, default=7)
    quality_threshold = Column(Float, default=70.0)  # Min data quality % to certify analysis
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
