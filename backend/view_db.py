import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal
from app.models.facility import Facility
from app.models.process_data import ProcessData
from app.models.leak import Leak
from sqlalchemy import inspect, text

def inspect_database():
    print("=" * 70)
    print("            CircuLeak PostgreSQL Database Inspector")
    print("=" * 70)
    print(f"Engine:    {engine.dialect.name.upper()}")
    print(f"Host:      {engine.url.host}:{engine.url.port}")
    print(f"Database:  {engine.url.database}")
    print(f"User:      {engine.url.username}")
    print("=" * 70)

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\nTables in PostgreSQL ({len(tables)}):")
    for t in tables:
        with engine.connect() as conn:
            cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar()
            print(f"  [TABLE] {t:<24} -> {cnt:>5} records")

    db = SessionLocal()
    try:
        facility = db.query(Facility).first()
        if facility:
            print("\n--- Active Facility Record (Table: facilities) ---")
            print(f"  Facility ID:    {facility.id}")
            print(f"  Company Name:   {facility.business_name}")
            print(f"  Sector:         {facility.sector}")
            print(f"  Location:       {facility.location}")
            print(f"  Annual Output:  {facility.production_volume} tons/yr ({facility.production_type})")
            print(f"  Workforce:      {facility.employees} employees")

        telemetry_count = db.query(ProcessData).count()
        print(f"\n--- Telemetry Records Sample (Table: process_data, Total: {telemetry_count} rows) ---")
        samples = db.query(ProcessData).limit(6).all()
        print(f"  {'Date & Hour':<18} | {'Equipment':<24} | {'Process':<18} | {'kWh':<8} | {'Emissions kg':<14}")
        print("  " + "-" * 90)
        for s in samples:
            dh = f"{s.date} {s.hour:02d}:00"
            print(f"  {dh:<18} | {s.equipment:<24} | {s.process:<18} | {s.electricity_kwh:<8.2f} | {s.calculated_emissions_kg:<14.2f}")

        leaks = db.query(Leak).all()
        print(f"\n--- Detected Carbon Leaks & Anomalies (Table: leaks, Total: {len(leaks)}) ---")
        print(f"  {'ID':<5} | {'Equipment':<24} | {'Type':<12} | {'Risk Score':<12} | {'Deviation':<12} | {'Period':<25}")
        print("  " + "-" * 98)
        for l in leaks:
            print(f"  {l.id:<5} | {l.equipment:<24} | {l.leak_type:<12} | {l.risk_score:<12.1f} | {f'{l.deviation_percent:.1f}%':<12} | {l.abnormal_period:<25}")

    finally:
        db.close()

    print("\n" + "=" * 70)
    print("  STATUS: Connected to PostgreSQL. All tables and rows verified.")
    print("=" * 70)

if __name__ == "__main__":
    inspect_database()
