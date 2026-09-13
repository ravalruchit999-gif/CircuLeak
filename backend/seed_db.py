import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models.facility import Facility
from app.schemas.facility import FacilityCreate
from app.services.facility_service import FacilityService
from app.services.csv_service import CSVService
from app.services.leak_service import LeakService

def seed_database():
    # 1. Initialize Tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 0. Seed official database emission factors with provenance
        from app.models.emission_factor import EmissionFactor
        import datetime

        official_factors = [
            {
                "source_name": "grid_electricity",
                "factor_value": 0.716,
                "unit": "kgCO2e/kWh",
                "reference": "India CEA CO2 Baseline Database v19 (2024)",
                "version": "v19-2024",
                "scope": "Scope 2",
                "effective_from": datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            },
            {
                "source_name": "coal",
                "factor_value": 2.420,
                "unit": "kgCO2e/kg",
                "reference": "IPCC 2006 / BEE India Industrial Energy Audit Guidelines",
                "version": "IPCC-2006-R2023",
                "scope": "Scope 1",
                "effective_from": datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            },
            {
                "source_name": "diesel",
                "factor_value": 2.680,
                "unit": "kgCO2e/L",
                "reference": "IPCC 2006 Guidelines for GHG Inventories (Stationary Combustion)",
                "version": "IPCC-2006-R2023",
                "scope": "Scope 1",
                "effective_from": datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            },
            {
                "source_name": "natural_gas",
                "factor_value": 1.930,
                "unit": "kgCO2e/m3",
                "reference": "IPCC 2006 / GAIL India Reference Data",
                "version": "IPCC-2006-R2023",
                "scope": "Scope 1",
                "effective_from": datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            },
            {
                "source_name": "lpg",
                "factor_value": 2.980,
                "unit": "kgCO2e/kg",
                "reference": "IPCC 2006 Fuel Inventory Guidelines",
                "version": "IPCC-2006-R2023",
                "scope": "Scope 1",
                "effective_from": datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            },
            {
                "source_name": "biomass",
                "factor_value": 0.035,
                "unit": "kgCO2e/kg",
                "reference": "BEE / Ministry of New and Renewable Energy (MNRE) India",
                "version": "MNRE-2023.2",
                "scope": "Scope 1",
                "effective_from": datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
                "is_active": True
            }
        ]

        for ef_data in official_factors:
            existing = db.query(EmissionFactor).filter(EmissionFactor.source_name == ef_data["source_name"]).first()
            if not existing:
                ef = EmissionFactor(**ef_data)
                db.add(ef)
        db.commit()
        print("Official emission factors seeded into database.")

        # Check if facility already seeded
        existing_facility = db.query(Facility).first()
        if existing_facility:
            facility = existing_facility
            print(f"Facility already exists (ID: {facility.id}, Name: {facility.business_name}).")
        else:
            print("Creating baseline facility: Apex Metals & Casting Unit 4...")
            facility_in = FacilityCreate(
                business_name="Apex Metals & Casting Unit 4",
                sector="Metals & Heavy Alloys",
                location="Vadodara Industrial Estate, Gujarat",
                production_type="Alloy & Steel Fabrication",
                production_volume=45000.0,
                employees=280,
                operating_hours=24.0,
                energy_sources=["grid_electricity", "natural_gas", "diesel"]
            )
            facility = FacilityService.create_facility(db, facility_in)
            print(f"Created facility with ID {facility.id}")

        # 2. Ingest demo CSV
        demo_csv = os.path.join(os.path.dirname(__file__), "app", "data", "demo_industrial_data.csv")
        if os.path.exists(demo_csv):
            print(f"Ingesting industrial CSV telemetry from {demo_csv}...")
            with open(demo_csv, "rb") as f:
                content = f.read()
            summary = CSVService.process_csv_upload(db=db, facility_id=facility.id, file_content=content)
            print(f"Ingestion complete: {summary.get('rows_valid', 0)} rows processed.")

        # 4. Seed default admin and facility manager users
        from app.models.user import User
        from app.core.security import hash_password

        admin_email = "admin@circuleak.com"
        if not db.query(User).filter(User.email == admin_email).first():
            print("Creating Platform Admin account (admin@circuleak.com)...")
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password("AdminPassword123!"),
                full_name="Chief Sustainability Auditor",
                company_name="CircuLeak Platform Administration",
                role="admin",
                facility_id=facility.id if 'facility' in locals() else (existing_facility.id if existing_facility else 1)
            )
            db.add(admin_user)
            db.commit()

        manager_email = "manager@apexmetals.com"
        if not db.query(User).filter(User.email == manager_email).first():
            print("Creating Facility Manager account (manager@apexmetals.com)...")
            mgr_user = User(
                email=manager_email,
                hashed_password=hash_password("ManagerPassword123!"),
                full_name="Rajesh Nair",
                company_name="Apex Metals & Casting Ltd.",
                role="facility_manager",
                facility_id=facility.id if 'facility' in locals() else (existing_facility.id if existing_facility else 1)
            )
            db.add(mgr_user)
            db.commit()
            print("Default authentication credentials ready!")

        # 5. Seed Authoritative Intervention Catalog
        from app.models.recommendation import Recommendation
        from app.data.recommendations import DEFAULT_RECOMMENDATIONS

        print("Seeding/updating authoritative intervention catalog in database...")
        for rec_data in DEFAULT_RECOMMENDATIONS:
            # Filter out non-model keys like 'keywords' if not in model
            rec_id = rec_data["id"]
            existing_rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
            
            # Extract fields that map to Recommendation model columns
            model_fields = {c.name for c in Recommendation.__table__.columns}
            filtered_data = {k: v for k, v in rec_data.items() if k in model_fields}
            
            if existing_rec:
                for k, v in filtered_data.items():
                    setattr(existing_rec, k, v)
            else:
                new_rec = Recommendation(**filtered_data)
                db.add(new_rec)
        db.commit()
        print(f"Seeded {len(DEFAULT_RECOMMENDATIONS)} authoritative intervention pathways into database.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
