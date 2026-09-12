from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FacilityBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255, json_schema_extra={"example": "ABC Textiles Ltd."})
    sector: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Textile"})
    location: str = Field(..., min_length=2, max_length=150, json_schema_extra={"example": "Ahmedabad, Gujarat"})
    production_type: str = Field(..., min_length=2, max_length=150, json_schema_extra={"example": "Fabric Manufacturing"})
    production_volume: float = Field(..., gt=0, json_schema_extra={"example": 12000.0})
    employees: Optional[int] = Field(default=50, ge=1, json_schema_extra={"example": 85})
    operating_hours: Optional[float] = Field(default=16.0, ge=1, le=24, json_schema_extra={"example": 16.0})
    energy_sources: List[str] = Field(default=["grid_electricity", "natural_gas", "diesel"], json_schema_extra={"example": ["grid_electricity", "natural_gas", "diesel"]})


class FacilityCreate(FacilityBase):
    pass


class FacilityResponse(FacilityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
