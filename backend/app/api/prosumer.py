"""
Prosumer API routes.
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from ..services import prosumer_service

router = APIRouter(prefix="/prosumer", tags=["prosumer"])


class AvailabilityUpdate(BaseModel):
    availability_status: str


@router.get("/me")
def get_my_profile(x_user_id: str = Header(..., description="Auth user ID from Supabase JWT")):
    """Return the prosumer profile for the authenticated user."""
    data = prosumer_service.get_prosumer_by_user_id(x_user_id)
    if not data:
        raise HTTPException(status_code=404, detail="Prosumer not found")
    return data


@router.patch("/availability")
def update_my_availability(
    body: AvailabilityUpdate,
    x_prosumer_id: str = Header(..., description="Prosumer UUID"),
):
    """Update prosumer availability_status."""
    try:
        return prosumer_service.update_availability(x_prosumer_id, body.availability_status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/telemetry")
def get_my_telemetry(
    x_prosumer_id: str = Header(...),
    limit: int = 20,
):
    """Return recent telemetry for the prosumer."""
    return prosumer_service.get_prosumer_telemetry(x_prosumer_id, limit=limit)


@router.get("/incentives")
def get_my_incentives(x_prosumer_id: str = Header(...)):
    """Return all incentive records for the prosumer."""
    return prosumer_service.get_prosumer_incentives(x_prosumer_id)
