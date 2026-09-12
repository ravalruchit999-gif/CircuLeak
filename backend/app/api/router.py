from fastapi import APIRouter
from app.api.routes import (
    auth,
    admin,
    facility,
    upload,
    emissions,
    leaks,
    recommendations,
    simulation,
    trajectory,
    benchmark,
    circularity,
    audit,
    report
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(facility.router)
api_router.include_router(upload.router)
api_router.include_router(emissions.router)
api_router.include_router(leaks.router)
api_router.include_router(recommendations.router)
api_router.include_router(simulation.router)
api_router.include_router(trajectory.router)
api_router.include_router(benchmark.router)
api_router.include_router(circularity.router)
api_router.include_router(audit.router)
api_router.include_router(report.router)

