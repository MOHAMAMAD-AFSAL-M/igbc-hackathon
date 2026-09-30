"""
KSEB VPP — Telemetry Simulator
================================
Simulates live prosumer telemetry by periodically updating:
  - current_soc
  - solar_generation_kw
  - battery_power_kw
  - available_energy_kwh

Also inserts a telemetry row for each update so the dashboard shows history.

Usage:
    cd backend/app
    python -m simulation.telemetry_simulator

Or from any directory:
    python backend/app/simulation/telemetry_simulator.py

Requires:
    pip install supabase python-dotenv
"""

import os
import sys
import time
import random
import logging
from datetime import datetime, timezone
from pathlib import Path

# Allow running as a standalone script
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

from supabase import create_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SIMULATOR] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
UPDATE_INTERVAL_SECONDS = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", "5"))

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    log.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def fetch_all_prosumers() -> list:
    result = client.table("prosumers").select(
        "id, prosumer_code, current_soc, minimum_reserve_soc, max_discharge_kw, "
        "battery_capacity_kwh, solar_capacity_kw, availability_status"
    ).execute()
    return result.data or []


def simulate_step(prosumer: dict, active_dispatch_prosumer_ids: set) -> dict:
    """
    Calculate the next state for a prosumer.
    During active dispatch, battery_power_kw > 0 and SoC decreases faster.
    """
    soc = float(prosumer["current_soc"])
    solar_cap = float(prosumer["solar_capacity_kw"])
    battery_cap = float(prosumer["battery_capacity_kwh"])
    max_discharge = float(prosumer["max_discharge_kw"])
    min_reserve = float(prosumer["minimum_reserve_soc"])
    in_dispatch = prosumer["id"] in active_dispatch_prosumer_ids

    # --- Solar generation (sinusoidal around midday, with noise) ---
    hour = datetime.now().hour
    solar_factor = max(0.0, (1.0 - abs(hour - 12) / 6.0))  # peak at noon
    solar_kw = round(solar_cap * solar_factor * (0.7 + random.uniform(0, 0.3)), 2)

    # --- Battery discharge during dispatch ---
    if in_dispatch and soc > min_reserve + 5:
        battery_kw = round(min(max_discharge, max_discharge * random.uniform(0.7, 1.0)), 2)
    else:
        battery_kw = 0.0

    # --- SoC change ---
    # SoC increases with solar, decreases with discharge
    soc_change = (solar_kw * 0.05) - (battery_kw * 0.15)
    # Add small random drift
    soc_change += random.uniform(-0.3, 0.3)
    soc = max(min_reserve, min(100.0, soc + soc_change))

    # --- Available energy ---
    available_kwh = round(max(0, (soc - min_reserve) / 100.0 * battery_cap), 2)

    return {
        "current_soc": round(soc, 1),
        "solar_generation_kw": solar_kw,
        "battery_power_kw": battery_kw,
        "available_energy_kwh": available_kwh,
    }


def get_active_dispatch_prosumer_ids() -> set:
    """Return prosumer IDs that are currently in an ACTIVE or ACCEPTED dispatch."""
    result = client.table("dispatch_participants").select("prosumer_id").in_(
        "status", ["ACCEPTED", "ACTIVE"]
    ).execute()
    return {row["prosumer_id"] for row in (result.data or [])}


def run_simulation_tick():
    prosumers = fetch_all_prosumers()
    if not prosumers:
        log.warning("No prosumers found. Have you run the seed data SQL?")
        return

    active_ids = get_active_dispatch_prosumer_ids()
    log.info(f"Updating {len(prosumers)} prosumers | {len(active_ids)} in active dispatch")

    telemetry_inserts = []
    now = datetime.now(timezone.utc).isoformat()

    for prosumer in prosumers:
        if prosumer["availability_status"] == "OFFLINE":
            continue

        state = simulate_step(prosumer, active_ids)

        # Update prosumer current state
        client.table("prosumers").update({
            "current_soc": state["current_soc"],
            "updated_at": now,
        }).eq("id", prosumer["id"]).execute()

        # Insert telemetry record
        telemetry_inserts.append({
            "prosumer_id": prosumer["id"],
            "soc": state["current_soc"],
            "solar_generation_kw": state["solar_generation_kw"],
            "battery_power_kw": state["battery_power_kw"],
            "available_energy_kwh": state["available_energy_kwh"],
            "timestamp": now,
        })

    if telemetry_inserts:
        client.table("telemetry").insert(telemetry_inserts).execute()
        log.info(f"Inserted {len(telemetry_inserts)} telemetry records")

    # Also simulate grid stress changes on clusters
    _simulate_grid_stress()


def _simulate_grid_stress():
    """Randomly shift cluster load and grid_status to make the dashboard feel alive."""
    clusters = client.table("clusters").select("id, current_load_kw, available_capacity_kw").execute().data or []
    for cluster in clusters:
        load = float(cluster["current_load_kw"])
        # Small random walk on load
        load += random.uniform(-20, 20)
        load = max(200, min(1000, load))

        if load >= 900:
            status = "CRITICAL"
        elif load >= 750:
            status = "HIGH_STRESS"
        elif load >= 550:
            status = "WARNING"
        else:
            status = "NORMAL"

        client.table("clusters").update({
            "current_load_kw": round(load, 1),
            "grid_status": status,
        }).eq("id", cluster["id"]).execute()


def main():
    log.info("=" * 60)
    log.info("KSEB VPP Telemetry Simulator starting...")
    log.info(f"Supabase URL: {SUPABASE_URL}")
    log.info(f"Update interval: {UPDATE_INTERVAL_SECONDS}s")
    log.info("Press Ctrl+C to stop.")
    log.info("=" * 60)

    while True:
        try:
            run_simulation_tick()
        except Exception as e:
            log.error(f"Tick error: {e}")
        time.sleep(UPDATE_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
