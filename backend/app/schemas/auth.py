from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "manager@apexmetals.com"})
    password: str = Field(..., min_length=6, json_schema_extra={"example": "StrongPass123!"})
    full_name: str = Field(..., min_length=2, json_schema_extra={"example": "Rajesh Nair"})
    company_name: Optional[str] = Field(None, json_schema_extra={"example": "Apex Metals & Casting Ltd."})
    sector: Optional[str] = Field(None, json_schema_extra={"example": "Metals & Heavy Alloys"})
    role: Optional[str] = Field("facility_manager", json_schema_extra={"example": "facility_manager"})


class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "manager@apexmetals.com"})
    password: str = Field(..., json_schema_extra={"example": "StrongPass123!"})


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    company_name: Optional[str] = None
    role: str
    facility_id: Optional[int] = None
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
