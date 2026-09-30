-- =============================================================================
-- 003_views.sql
-- KSEB VPP — Database views for aggregate queries
-- Run this AFTER 001_initial_schema.sql
-- =============================================================================

-- =============================================================================
-- VIEW: cluster_capacity_view
-- Provides aggregate capacity data per cluster for the KSEB dashboard.
-- Used instead of running multiple queries in the frontend.
-- =============================================================================
CREATE OR REPLACE VIEW cluster_capacity_view AS
SELECT
    c.id                                                    AS cluster_id,
    c.name                                                  AS cluster_name,
    c.substation,
    c.latitude,
    c.longitude,
    c.grid_status,
    c.current_load_kw,
    c.available_capacity_kw,

    -- Aggregate prosumer data
    COUNT(p.id) FILTER (WHERE p.availability_status = 'AVAILABLE')
                                                            AS available_prosumers,
    COUNT(p.id)                                             AS total_prosumers,

    -- Sum of max discharge power from available prosumers
    COALESCE(SUM(p.max_discharge_kw) FILTER (WHERE p.availability_status = 'AVAILABLE'), 0)
                                                            AS available_power_kw,

    -- Sum of available energy (above reserve SoC)
    COALESCE(SUM(
        (p.current_soc - p.minimum_reserve_soc) / 100.0 * p.battery_capacity_kwh
    ) FILTER (WHERE p.availability_status = 'AVAILABLE' AND p.current_soc > p.minimum_reserve_soc), 0)
                                                            AS available_energy_kwh,

    -- Average SoC of available prosumers
    COALESCE(AVG(p.current_soc) FILTER (WHERE p.availability_status = 'AVAILABLE'), 0)
                                                            AS average_soc

FROM clusters c
LEFT JOIN prosumers p ON p.cluster_id = c.id
GROUP BY c.id, c.name, c.substation, c.latitude, c.longitude,
         c.grid_status, c.current_load_kw, c.available_capacity_kw;

-- Grant access
GRANT SELECT ON cluster_capacity_view TO authenticated;
GRANT SELECT ON cluster_capacity_view TO anon;

-- =============================================================================
-- VIEW: dispatch_summary_view
-- Summary of each dispatch with accepted/delivered totals.
-- =============================================================================
CREATE OR REPLACE VIEW dispatch_summary_view AS
SELECT
    dr.id                                               AS dispatch_id,
    dr.cluster_id,
    c.name                                              AS cluster_name,
    dr.requested_kw,
    dr.duration_minutes,
    dr.status,
    dr.created_at,
    dr.started_at,
    dr.completed_at,

    -- Participant counts
    COUNT(dp.id)                                        AS total_participants,
    COUNT(dp.id) FILTER (WHERE dp.status = 'ACCEPTED') AS accepted_count,
    COUNT(dp.id) FILTER (WHERE dp.status = 'DECLINED') AS declined_count,
    COUNT(dp.id) FILTER (WHERE dp.status = 'PENDING')  AS pending_count,

    -- Capacity totals
    COALESCE(SUM(dp.accepted_kw) FILTER (WHERE dp.status IN ('ACCEPTED', 'ACTIVE', 'COMPLETED')), 0)
                                                        AS accepted_kw,
    COALESCE(SUM(dp.delivered_kw) FILTER (WHERE dp.status = 'COMPLETED'), 0)
                                                        AS delivered_kw,
    COALESCE(SUM(dp.energy_delivered_kwh) FILTER (WHERE dp.status = 'COMPLETED'), 0)
                                                        AS energy_delivered_kwh

FROM dispatch_requests dr
LEFT JOIN clusters c ON c.id = dr.cluster_id
LEFT JOIN dispatch_participants dp ON dp.dispatch_id = dr.id
GROUP BY dr.id, c.name;

GRANT SELECT ON dispatch_summary_view TO authenticated;
