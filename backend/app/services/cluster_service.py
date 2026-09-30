"""
Cluster service — reads cluster data and capacity aggregates.
"""
from ..core.supabase_client import supabase


def get_all_clusters() -> list:
    """Return all clusters with capacity view data."""
    result = (
        supabase.table("cluster_capacity_view")
        .select("*")
        .execute()
    )
    return result.data


def get_cluster_by_id(cluster_id: str) -> dict:
    """Return a single cluster with capacity data."""
    result = (
        supabase.table("cluster_capacity_view")
        .select("*")
        .eq("cluster_id", cluster_id)
        .single()
        .execute()
    )
    return result.data


def get_cluster_prosumers(cluster_id: str) -> list:
    """Return prosumers in a cluster with their current state."""
    result = (
        supabase.table("prosumers")
        .select("id, prosumer_code, current_soc, max_discharge_kw, availability_status, participation_mode, solar_capacity_kw, battery_capacity_kwh")
        .eq("cluster_id", cluster_id)
        .execute()
    )
    return result.data
