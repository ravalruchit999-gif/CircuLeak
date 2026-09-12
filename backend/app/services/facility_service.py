from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.facility import Facility
from app.schemas.facility import FacilityCreate


class FacilityService:
    @staticmethod
    def create_facility(db: Session, facility_in: FacilityCreate) -> Facility:
        facility = Facility(
            business_name=facility_in.business_name,
            sector=facility_in.sector,
            location=facility_in.location,
            production_type=facility_in.production_type,
            production_volume=facility_in.production_volume,
            employees=facility_in.employees,
            operating_hours=facility_in.operating_hours,
            energy_sources=facility_in.energy_sources
        )
        db.add(facility)
        db.commit()
        db.refresh(facility)
        return facility

    @staticmethod
    def get_facility(db: Session, facility_id: int) -> Optional[Facility]:
        return db.query(Facility).filter(Facility.id == facility_id).first()

    @staticmethod
    def list_facilities(db: Session, skip: int = 0, limit: int = 100) -> List[Facility]:
        return db.query(Facility).offset(skip).limit(limit).all()
