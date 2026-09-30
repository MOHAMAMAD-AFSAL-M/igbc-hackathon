"""
Prosumer service — reads/writes prosumer data via Supabase.
"""
from typing import Optional
from ..core.supabase_client import supabase, supabase_admin


def get_prosumer_by_user_id(user_id: str) -> Optional[dict]:
    """Return a prosumer record for the authenticated user."""
    result = (
        supabase.table("prosumers")
        .select("*, profiles(name, phone, role)")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return result.data


def update_availability(prosumer_id: str, status: str) -> dict:
    """Update the prosumer availability_status field."""
    valid = {"AVAILABLE", "UNAVAILABLE", "OFFLINE"}
    if status not in valid:
        raise ValueError(f"availability_status must be one of {valid}")

    result = (
        supabase.table("prosumers")
        .update({"availability_status": status})
        .eq("id", prosumer_id)
        .execute()
    )
    return result.data[0]


def get_prosumer_telemetry(prosumer_id: str, limit: int = 20) -> list:
    """Return the most recent telemetry records for a prosumer."""
    result = (
        supabase.table("telemetry")
        .select("*")
        .eq("prosumer_id", prosumer_id)
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def get_prosumer_incentives(prosumer_id: str) -> list:
    """Return all incentive records for a prosumer."""
    result = (
        supabase.table("incentives")
        .select("*, dispatch_requests(status, created_at)")
        .eq("prosumer_id", prosumer_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
