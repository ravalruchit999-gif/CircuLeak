from sqlalchemy import Column, Integer, String, Float
try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String(100), unique=True, nullable=False, index=True)
    average_emission_intensity = Column(Float, nullable=False)  # kgCO2e / unit output
    median_emission_intensity = Column(Float, nullable=False)
    best_in_class_intensity = Column(Float, nullable=False)
    ccts_threshold = Column(Float, nullable=False)  # India CCTS regulatory threshold
    unit = Column(String(50), default="kgCO2e/unit")
    sample_size = Column(Integer, default=100)
