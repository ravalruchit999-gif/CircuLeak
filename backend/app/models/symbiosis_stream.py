import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except (ImportError, ModuleNotFoundError):
    from ..core.database import Base


class SymbiosisStream(Base):
    __tablename__ = "symbiosis_streams"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    byproduct_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="Solid Waste")
    annual_quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(50), default="Tonnes/year")
    linear_pathway = Column(String(255), default="Landfill disposal")
    circular_loop = Column(String(255), default="Circular secondary off-take")
    offtaker_partner = Column(String(255), default="Regional Eco-Industrial Cluster")
    distance_km = Column(Integer, default=25)
    disposal_cost_avoided_inr = Column(Float, default=0.0)
    byproduct_revenue_inr = Column(Float, default=0.0)
    net_benefit_inr = Column(Float, default=0.0)
    co2_abatement_tonnes = Column(Float, default=0.0)
    diversion_rate_percent = Column(Float, default=95.0)
    circular_tier = Column(String(100), default="Upcycled By-Product")
    symbiosis_status = Column(String(100), default="Off-Taker Match Verified")
    readiness = Column(String(100), default="Immediate Contract")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    facility = relationship("Facility")
