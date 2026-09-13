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

        print("Migrating analysis_runs...")
        conn.execute(text("""
            ALTER TABLE analysis_runs 
            ADD COLUMN IF NOT EXISTS dataset_hash_sha256 VARCHAR(64) NULL,
            ADD COLUMN IF NOT EXISTS code_version VARCHAR(100) NULL;
        """))

        print("Migrating audit_logs...")
        conn.execute(text("""
            ALTER TABLE audit_logs 
            ADD COLUMN IF NOT EXISTS facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL;
        """))

        print("Migrating recommendations...")
        conn.execute(text("""
            ALTER TABLE recommendations 
            ADD COLUMN IF NOT EXISTS intervention_category VARCHAR(100) DEFAULT 'operational_optimization',
            ADD COLUMN IF NOT EXISTS supported_sectors JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS supported_processes JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS supported_equipment JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS applicable_problem_types JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS objective_tags JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS prerequisites JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS required_telemetry JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS optional_telemetry JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS contraindications JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS implementation_constraints JSON DEFAULT '[]'::json,
            ADD COLUMN IF NOT EXISTS capex_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS opex_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS savings_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS carbon_reduction_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS waste_reduction_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS revenue_model JSON DEFAULT '{}'::json,
            ADD COLUMN IF NOT EXISTS implementation_complexity VARCHAR(50) DEFAULT 'Medium',
            ADD COLUMN IF NOT EXISTS operational_disruption VARCHAR(50) DEFAULT 'Low',
            ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'Low',
            ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS reference_type VARCHAR(100) DEFAULT 'Industrial Energy Audit Case Study',
            ADD COLUMN IF NOT EXISTS reference_title VARCHAR(255) DEFAULT '',
            ADD COLUMN IF NOT EXISTS reference_organization VARCHAR(150) DEFAULT 'Bureau of Energy Efficiency (BEE) / UNIDO',
            ADD COLUMN IF NOT EXISTS reference_url_or_document VARCHAR(255) DEFAULT '',
            ADD COLUMN IF NOT EXISTS reference_year INTEGER DEFAULT 2023,
            ADD COLUMN IF NOT EXISTS reference_parameter VARCHAR(150) DEFAULT '',
            ADD COLUMN IF NOT EXISTS reference_parameter_range VARCHAR(100) DEFAULT '',
            ADD COLUMN IF NOT EXISTS reference_applicability_notes TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS methodology_version VARCHAR(50) DEFAULT '1.0.0',
            ADD COLUMN IF NOT EXISTS knowledge_version VARCHAR(50) DEFAULT '2024.1',
            ADD COLUMN IF NOT EXISTS effective_date VARCHAR(50) DEFAULT '2024-01-01';
        """))

        print("Migration complete!")

if __name__ == "__main__":
    migrate_database()
