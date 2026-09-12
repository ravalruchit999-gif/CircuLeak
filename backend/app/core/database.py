import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

from urllib.parse import urlparse
import psycopg2

logger = logging.getLogger(__name__)


def ensure_postgres_db_exists(url: str):
    """If target PostgreSQL database doesn't exist, connect to postgres and create it."""
    if not url.startswith("postgresql"):
        return
    try:
        parsed = urlparse(url)
        dbname = parsed.path.lstrip('/')
        if not dbname:
            return
        conn = psycopg2.connect(
            dbname='postgres',
            user=parsed.username or 'postgres',
            password=parsed.password or '',
            host=parsed.hostname or 'localhost',
            port=parsed.port or 5432,
            connect_timeout=3
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (dbname,))
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{dbname}";')
            logger.info(f"PostgreSQL database '{dbname}' created successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        logger.info(f"PostgreSQL pre-check/create step: {e}")


# Configure engine
db_url = settings.DATABASE_URL
ensure_postgres_db_exists(db_url)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        echo=False,
        pool_pre_ping=True,
        connect_args=connect_args
    )
except Exception as e:
    logger.warning(f"Failed to initialize primary database with {db_url}: {e}. Falling back to SQLite for local development.")
    sqlite_fallback_url = "sqlite:///./circuleak.db"
    engine = create_engine(
        sqlite_fallback_url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
