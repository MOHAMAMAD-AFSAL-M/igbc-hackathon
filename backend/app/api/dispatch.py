"""
Dispatch API routes — the core VPP flow.
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from ..services import dispatch_service

router = APIRouter(prefix="/dispatch", tags=["dispatch"])


class CreateDispatchRequest(BaseModel):
    cluster_id: str
    requested_kw: float
    duration_minutes: int


class RespondToDispatchRequest(BaseModel):
    response: str          # ACCEPTED | DECLINED
    accepted_kw: Optional[float] = None


@router.post("/")
def create_dispatch(
    body: CreateDispatchRequest,
    x_user_id: str = Header(..., description="KSEB operator user ID"),
):
    """
    KSEB creates a new dispatch request.
    Only KSEB_OPERATOR or ADMIN should call this endpoint.
    """
    try:
        return dispatch_service.create_dispatch(
            cluster_id=body.cluster_id,
            requested_kw=body.requested_kw,
            duration_minutes=body.duration_minutes,
            created_by=x_user_id,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{dispatch_id}/allocate")
def allocate_dispatch(dispatch_id: str):
    """
    Run the allocation algorithm: find eligible prosumers and create participant records.
    Call this after creating a dispatch.
    """
    try:
        return dispatch_service.allocate_dispatch(dispatch_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{dispatch_id}/respond")
def respond_to_dispatch(
    dispatch_id: str,
    body: RespondToDispatchRequest,
    x_prosumer_id: str = Header(..., description="Prosumer UUID"),
):
    """
    Prosumer accepts or declines their dispatch participant record.
    """
    try:
        return dispatch_service.respond_to_dispatch(
            dispatch_id=dispatch_id,
            prosumer_id=x_prosumer_id,
            response=body.response,
            accepted_kw=body.accepted_kw,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{dispatch_id}/complete")
def complete_dispatch(dispatch_id: str):
    """
    Complete an active dispatch: calculate energy delivered and create incentive records.
    """
    try:
        return dispatch_service.complete_dispatch(dispatch_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{dispatch_id}")
def get_dispatch(dispatch_id: str):
    """Return a dispatch with all its participants (KSEB dashboard view)."""
    data = dispatch_service.get_dispatch_with_participants(dispatch_id)
    if not data:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    return data
