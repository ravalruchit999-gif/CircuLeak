import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure engine
db_url = settings.DATABASE_URL
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
