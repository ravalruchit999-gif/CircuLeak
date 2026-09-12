from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import validate_csv_extension
from app.schemas.upload import UploadSummaryResponse
from app.schemas.common import APIResponse
from app.services.csv_service import CSVService
from app.services.leak_service import LeakService

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/csv", response_model=APIResponse[UploadSummaryResponse])
async def upload_industrial_csv(
    facility_id: int = Form(..., description="Target facility ID"),
    file: UploadFile = File(..., description="Industrial time-series CSV file"),
    db: Session = Depends(get_db)
):
    """
    Ingest and validate industrial energy/process CSV telemetry.
    Computes emissions per row and detects preliminary behavioral anomalies.
    """
    if not validate_csv_extension(file.filename or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only .csv files are supported."
        )

    try:
        content = await file.read()
        summary = CSVService.process_csv_upload(db=db, facility_id=facility_id, file_content=content)
        
        # Pre-calculate and sync behavioral anomalies for faster downstream queries
        try:
            LeakService.detect_and_sync_anomalies(db=db, facility_id=facility_id)
        except Exception:
            pass

        return APIResponse(success=True, data=UploadSummaryResponse(**summary))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process CSV: {str(e)}")
