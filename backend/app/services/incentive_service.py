"""
Incentive service — reads incentive data.
"""
from ..core.supabase_client import supabase_admin


def get_all_incentives(status: str = None) -> list:
    """Return all incentives, optionally filtered by status."""
    query = supabase_admin.table("incentives").select(
        "*, prosumers(prosumer_code), dispatch_requests(created_at, duration_minutes)"
    )
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data


def settle_incentive(incentive_id: str) -> dict:
    """Mark an incentive as SETTLED (simulated payment)."""
    result = (
        supabase_admin.table("incentives")
        .update({"status": "SETTLED"})
        .eq("id", incentive_id)
        .execute()
    )
    return result.data[0] if result.data else {}
