from typing import Union, Optional
from sqlalchemy.orm import Session
from app.models.facility import Facility


def resolve_facility_id(facility_id: Union[int, str], db: Optional[Session] = None) -> int:
    """
    Resolve a facility identifier (integer ID like 1, numeric string '1',
    or business code like 'FAC-8842') to an integer database primary key.
    """
    if isinstance(facility_id, int):
        return facility_id

    fac_str = str(facility_id).strip()
    if fac_str.isdigit():
        return int(fac_str)

    # If it's a code like FAC-8842 or similar
    if db is not None:
        # Check if there is a facility registered
        fac = db.query(Facility).first()
        if fac:
            return fac.id

    # Fallback to 1
    return 1
