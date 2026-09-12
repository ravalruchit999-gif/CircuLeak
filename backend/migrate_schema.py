from sqlalchemy import text
from app.core.database import engine

def migrate_database():
    with engine.begin() as conn:
        print("Migrating emission_factors...")
        conn.execute(text("""
            ALTER TABLE emission_factors 
            ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '2024.1',
            ADD COLUMN IF NOT EXISTS scope VARCHAR(20) DEFAULT 'Scope 2',
            ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS effective_to TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        """))

        print("Migrating process_data...")
        conn.execute(text("""
            ALTER TABLE process_data 
            ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES data_uploads(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS emission_factor_id INTEGER REFERENCES emission_factors(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS emission_factor_version VARCHAR(50) NULL,
            ADD COLUMN IF NOT EXISTS emission_factor_source_reference VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS emission_factor_effective_from TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS emission_factor_effective_to TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS calculation_method VARCHAR(100) DEFAULT 'IPCC_Tier_1_Direct_Multiplication',
            ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP DEFAULT NOW();
        """))

        # Backfill timestamp for any existing rows in process_data that have date and hour
        print("Backfilling existing timestamps...")
        conn.execute(text("""
            UPDATE process_data 
            SET timestamp = (date || ' ' || LPAD(hour::text, 2, '0') || ':00:00')::timestamp
            WHERE timestamp IS NULL AND date IS NOT NULL;
        """))

        # If any rows still have null timestamp, set to created_at or now
        conn.execute(text("""
            UPDATE process_data 
            SET timestamp = COALESCE(created_at, NOW())
            WHERE timestamp IS NULL;
        """))

        # Now add unique index for deduplication and sub-hourly upsert
        print("Ensuring unique index on process_data...")
        conn.execute(text("""
            CREATE UNIQUE INDEX IF NOT EXISTS uq_process_data_timestamp_identity 
            ON process_data (facility_id, timestamp, equipment, process);
        """))

        print("Migrating leaks...")
        conn.execute(text("""
            ALTER TABLE leaks 
            ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES data_uploads(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS analysis_run_id VARCHAR(100) REFERENCES analysis_runs(id) ON DELETE SET NULL;
        """))

        print("Migration complete!")

if __name__ == "__main__":
    migrate_database()
