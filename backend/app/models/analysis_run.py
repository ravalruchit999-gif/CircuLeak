import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(100), primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    upload_id = Column(Integer, ForeignKey("data_uploads.id", ondelete="SET NULL"), nullable=True, index=True)
    analysis_type = Column(String(50), nullable=False)  # "anomaly_detection", "peer_clustering", "recommendation", "circularity", "trajectory"
    model_name = Column(String(100), nullable=False)    # "IsolationForest", "KMeans", "TfidfCosine", "ParametricDecay"
    model_version = Column(String(50), default="1.0.0")
    parameters = Column(JSON, default=dict)             # Hyperparameters, e.g. contamination, k_clusters
    feature_set = Column(JSON, default=list)            # Feature columns used
    input_row_count = Column(Integer, default=0)
    dataset_hash_sha256 = Column(String(64), nullable=True)
    code_version = Column(String(100), nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="running")      # "running", "completed", "failed"
    error_message = Column(Text, nullable=True)

    # Relationships
    facility = relationship("Facility")
    upload = relationship("DataUpload")
