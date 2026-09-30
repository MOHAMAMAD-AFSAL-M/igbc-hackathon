"""
Dispatch service — core VPP business logic.

This implements the dispatch lifecycle in Python as a fallback/alternative
to Supabase Edge Functions. The same logic is also in the Edge Functions
(supabase/functions/) for production use.

Flow:
  create_dispatch → allocate_dispatch → prosumer responds → complete_dispatch
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from ..core.supabase_client import supabase_admin
from ..core.config import settings


# ---------------------------------------------------------------------------
# Create dispatch
# ---------------------------------------------------------------------------

def create_dispatch(cluster_id: str, requested_kw: float, duration_minutes: int, created_by: str) -> dict:
    """
    Create a new dispatch request with status=CREATED.
    Only KSEB_OPERATOR/ADMIN should call this.
    """
    record = {
        "id": str(uuid.uuid4()),
        "cluster_id": cluster_id,
        "requested_kw": requested_kw,
        "duration_minutes": duration_minutes,
        "status": "CREATED",
        "created_by": created_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = supabase_admin.table("dispatch_requests").insert(record).execute()
    return result.data[0]


# ---------------------------------------------------------------------------
# Allocate dispatch
# ---------------------------------------------------------------------------

def allocate_dispatch(dispatch_id: str) -> dict:
    """
    Run eligibility check and create dispatch_participant records.

    Eligibility criteria:
    - availability_status = AVAILABLE
    - current_soc > minimum_reserve_soc
    - max_discharge_kw > 0
    - belongs to dispatch's cluster

    Sorting: higher SoC first, then higher discharge capacity.
    """
    # Get the dispatch request
    dispatch = (
        supabase_admin.table("dispatch_requests")
        .select("*")
        .eq("id", dispatch_id)
        .single()
        .execute()
        .data
    )
    if not dispatch:
        raise ValueError(f"Dispatch {dispatch_id} not found")
    if dispatch["status"] != "CREATED":
        raise ValueError(f"Dispatch {dispatch_id} is not in CREATED state")

    cluster_id = dispatch["cluster_id"]
    target_kw = float(dispatch["requested_kw"])
    duration_hours = dispatch["duration_minutes"] / 60.0

    # Mark as ALLOCATING
    supabase_admin.table("dispatch_requests").update({"status": "ALLOCATING"}).eq("id", dispatch_id).execute()

    # Fetch eligible prosumers
    candidates = (
        supabase_admin.table("prosumers")
        .select("id, current_soc, minimum_reserve_soc, max_discharge_kw, battery_capacity_kwh")
        .eq("cluster_id", cluster_id)
        .eq("availability_status", "AVAILABLE")
        .gt("max_discharge_kw", 0)
        .execute()
        .data
    )

    # Filter out those below minimum reserve SoC
    eligible = [
        p for p in candidates
        if float(p["current_soc"]) > float(p["minimum_reserve_soc"])
    ]

    # Sort: higher SoC first, then higher discharge capacity
    eligible.sort(key=lambda p: (-float(p["current_soc"]), -float(p["max_discharge_kw"])))

    # Allocate sequentially until target is met
    participants = []
    remaining_kw = target_kw

    for prosumer in eligible:
        if remaining_kw <= 0:
            break

        # Available discharge for this prosumer
        available_kwh = (float(prosumer["current_soc"]) - float(prosumer["minimum_reserve_soc"])) / 100.0 * float(prosumer["battery_capacity_kwh"])
        available_discharge_kw = min(
            float(prosumer["max_discharge_kw"]),
            available_kwh / duration_hours if duration_hours > 0 else float(prosumer["max_discharge_kw"])
        )

        allocated_kw = min(available_discharge_kw, remaining_kw)
        if allocated_kw <= 0:
            continue

        remaining_kw -= allocated_kw

        participants.append({
            "id": str(uuid.uuid4()),
            "dispatch_id": dispatch_id,
            "prosumer_id": prosumer["id"],
            "requested_kw": round(allocated_kw, 2),
            "accepted_kw": 0,
            "delivered_kw": 0,
            "energy_delivered_kwh": 0,
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    if participants:
        supabase_admin.table("dispatch_participants").insert(participants).execute()

    # Update dispatch status to AWAITING_RESPONSES
    supabase_admin.table("dispatch_requests").update({"status": "AWAITING_RESPONSES"}).eq("id", dispatch_id).execute()

    return {
        "dispatch_id": dispatch_id,
        "target_kw": target_kw,
        "allocated_kw": round(target_kw - remaining_kw, 2),
        "remaining_kw": round(remaining_kw, 2),
        "participants_count": len(participants),
    }


# ---------------------------------------------------------------------------
# Prosumer responds to dispatch
# ---------------------------------------------------------------------------

def respond_to_dispatch(dispatch_id: str, prosumer_id: str, response: str, accepted_kw: Optional[float] = None) -> dict:
    """
    Prosumer accepts or declines a dispatch participant record.
    response: "ACCEPTED" | "DECLINED"
    """
    if response not in {"ACCEPTED", "DECLINED"}:
        raise ValueError("response must be ACCEPTED or DECLINED")

    update_data: dict = {
        "status": response,
        "responded_at": datetime.now(timezone.utc).isoformat(),
    }
    if response == "ACCEPTED" and accepted_kw is not None:
        update_data["accepted_kw"] = accepted_kw

    result = (
        supabase_admin.table("dispatch_participants")
        .update(update_data)
        .eq("dispatch_id", dispatch_id)
        .eq("prosumer_id", prosumer_id)
        .execute()
    )

    # Check if all participants have responded → update dispatch status
    _update_dispatch_status_after_response(dispatch_id)

    return result.data[0] if result.data else {}


def _update_dispatch_status_after_response(dispatch_id: str):
    """
    After a prosumer responds, check aggregate and update dispatch status.
    If any accepted → ACTIVE (or PARTIAL if < target).
    """
    participants = (
        supabase_admin.table("dispatch_participants")
        .select("status, accepted_kw, requested_kw")
        .eq("dispatch_id", dispatch_id)
        .execute()
        .data
    )

    total_pending = sum(1 for p in participants if p["status"] == "PENDING")
    total_accepted_kw = sum(float(p["accepted_kw"] or 0) for p in participants if p["status"] == "ACCEPTED")

    dispatch = (
        supabase_admin.table("dispatch_requests")
        .select("requested_kw, status")
        .eq("id", dispatch_id)
        .single()
        .execute()
        .data
    )

    if dispatch["status"] not in {"AWAITING_RESPONSES", "PARTIAL"}:
        return

    if total_pending == 0:
        # All responded
        new_status = "ACTIVE" if total_accepted_kw >= float(dispatch["requested_kw"]) else "PARTIAL"
        supabase_admin.table("dispatch_requests").update({
            "status": new_status,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", dispatch_id).execute()


# ---------------------------------------------------------------------------
# Complete dispatch
# ---------------------------------------------------------------------------

def complete_dispatch(dispatch_id: str) -> dict:
    """
    Mark dispatch as COMPLETED. Calculate energy delivered and create incentive records.
    """
    dispatch = (
        supabase_admin.table("dispatch_requests")
        .select("*")
        .eq("id", dispatch_id)
        .single()
        .execute()
        .data
    )
    if not dispatch:
        raise ValueError(f"Dispatch {dispatch_id} not found")

    duration_hours = dispatch["duration_minutes"] / 60.0
    rate = settings.INCENTIVE_RATE_PER_KWH

    # Get all accepted participants
    participants = (
        supabase_admin.table("dispatch_participants")
        .select("*")
        .eq("dispatch_id", dispatch_id)
        .in_("status", ["ACCEPTED", "ACTIVE"])
        .execute()
        .data
    )

    incentive_records = []
    for p in participants:
        delivered_kw = float(p["accepted_kw"] or 0)
        energy_kwh = round(delivered_kw * duration_hours, 4)
        amount = round(energy_kwh * rate, 2)

        # Update participant
        supabase_admin.table("dispatch_participants").update({
            "delivered_kw": delivered_kw,
            "energy_delivered_kwh": energy_kwh,
            "status": "COMPLETED",
        }).eq("id", p["id"]).execute()

        # Create incentive record
        incentive_records.append({
            "id": str(uuid.uuid4()),
            "prosumer_id": p["prosumer_id"],
            "dispatch_id": dispatch_id,
            "energy_kwh": energy_kwh,
            "rate_per_kwh": rate,
            "amount": amount,
            "status": "CALCULATED",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    if incentive_records:
        supabase_admin.table("incentives").insert(incentive_records).execute()

    # Mark dispatch as complete
    supabase_admin.table("dispatch_requests").update({
        "status": "COMPLETED",
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", dispatch_id).execute()

    total_energy = sum(r["energy_kwh"] for r in incentive_records)
    total_incentive = sum(r["amount"] for r in incentive_records)

    return {
        "dispatch_id": dispatch_id,
        "participants_completed": len(incentive_records),
        "total_energy_kwh": round(total_energy, 4),
        "total_incentive_inr": round(total_incentive, 2),
    }


def get_dispatch_with_participants(dispatch_id: str) -> dict:
    """Return a dispatch with all its participants (for dashboard view)."""
    dispatch = (
        supabase_admin.table("dispatch_requests")
        .select("*")
        .eq("id", dispatch_id)
        .single()
        .execute()
        .data
    )
    participants = (
        supabase_admin.table("dispatch_participants")
        .select("*, prosumers(prosumer_code, current_soc, max_discharge_kw)")
        .eq("dispatch_id", dispatch_id)
        .execute()
        .data
    )
    return {**dispatch, "participants": participants}
