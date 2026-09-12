from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.facility import Facility
from app.schemas.auth import UserCreate, UserLogin, UserOut, TokenResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[TokenResponse])
def register_user(request: UserCreate, db: Session = Depends(get_db)):
    """Register a new user, create a facility container for them, and return a JWT access token."""
    # Check if email already registered
    existing = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Automatically create user's manufacturing facility container
    facility_name = request.company_name or f"{request.full_name}'s Industrial Facility"
    sector = request.sector or "Metals & Heavy Alloys"

    facility = Facility(
        business_name=facility_name,
        sector=sector,
        location="Industrial Corridor, India",
        production_type="General Manufacturing & Precision Forming",
        production_volume=25000.0,
        employees=120,
        operating_hours=16.0,
        energy_sources=["grid_electricity", "natural_gas"]
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)

    # Create User
    new_user = User(
        email=request.email.lower().strip(),
        hashed_password=hash_password(request.password),
        full_name=request.full_name.strip(),
        company_name=request.company_name,
        role=request.role or "facility_manager",
        facility_id=facility.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT Token
    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    user_out = UserOut(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        company_name=new_user.company_name,
        role=new_user.role,
        facility_id=new_user.facility_id,
        created_at=new_user.created_at
    )

    return APIResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out)
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
def login_user(request: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password and receive a JWT access token."""
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        company_name=user.company_name,
        role=user.role,
        facility_id=user.facility_id,
        created_at=user.created_at
    )

    return APIResponse(
        success=True,
        data=TokenResponse(access_token=token, token_type="bearer", user=user_out)
    )


@router.get("/me", response_model=APIResponse[UserOut])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get profile of currently logged-in user."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return APIResponse(
        success=True,
        data=UserOut.from_orm(current_user)
    )
