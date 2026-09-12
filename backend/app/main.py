import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensure all SQLAlchemy models are registered
from app.api.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("circuleak")

# Create database tables automatically on startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-seed initial facility & telemetry if empty for immediate live demo readiness
    from app.core.database import SessionLocal
    from app.models.facility import Facility
    from app.services.csv_service import CSVService
    from app.services.leak_service import LeakService
    import os

    _seed_db = SessionLocal()
    try:
        if _seed_db.query(Facility).first() is None:
            logger.info("Database is empty. Seeding initial industrial facility & telemetry...")
            demo_facility = Facility(
                id=1,
                business_name="Apex Metals & Casting Unit 4",
                sector="metal_fabrication",
                location="Vadodara Industrial Estate, Gujarat, India",
                production_type="Alloy & Steel Fabrication",
                production_volume=45000.0,
                employees=280,
                operating_hours=24.0,
                energy_sources=["grid_electricity", "natural_gas", "diesel"]
            )
            _seed_db.add(demo_facility)
            _seed_db.commit()
            _seed_db.refresh(demo_facility)

            csv_path = os.path.join(os.path.dirname(__file__), "data", "demo_industrial_data.csv")
            if os.path.exists(csv_path):
                with open(csv_path, "rb") as f:
                    CSVService.process_csv_upload(db=_seed_db, facility_id=demo_facility.id, file_content=f.read())
                try:
                    LeakService.detect_and_sync_anomalies(db=_seed_db, facility_id=demo_facility.id)
                except Exception as ex:
                    logger.warning(f"Could not pre-calculate anomalies: {ex}")
            logger.info("Initial facility and telemetry seeded successfully.")
    except Exception as se:
        logger.warning(f"Auto-seed check encountered: {se}")
    finally:
        _seed_db.close()
except Exception as e:
    logger.warning(f"Could not initialize database on startup: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "CircuLeak is an AI/ML-powered industrial carbon intelligence and decision-support platform. "
        "It ingests industrial telemetry, computes standardized emissions, detects explainable structural "
        "hotspots and behavioral anomalies, matches circular interventions, simulates decarbonization trajectories, "
        "and synthesizes Executive Audit Summaries."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite / React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Error Handlers for Consistent API Responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append(f"{loc}: {err.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed",
                "details": errors
            }
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc)
            }
        }
    )


# Include API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "CircuLeak Backend",
        "version": settings.VERSION,
        "database_connected": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
