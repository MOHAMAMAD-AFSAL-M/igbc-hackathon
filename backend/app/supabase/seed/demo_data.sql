-- =============================================================================
-- demo_data.sql
-- KSEB VPP — Seed data for hackathon demo
-- Run AFTER migrations 001, 002, 003
-- NOTE: Run this with the service-role key or as a superuser in SQL Editor
-- =============================================================================

-- =============================================================================
-- CLUSTERS — 5 Kerala substations
-- =============================================================================
INSERT INTO clusters (id, name, substation, latitude, longitude, grid_status, current_load_kw, available_capacity_kw)
VALUES
    ('11111111-0000-0000-0000-000000000001', 'Kalamassery',    'KSB-KLM', 10.0522,  76.3318,  'HIGH_STRESS',  820, 126),
    ('11111111-0000-0000-0000-000000000002', 'Edappally',      'KSB-EDP', 10.0159,  76.3074,  'WARNING',      650,  90),
    ('11111111-0000-0000-0000-000000000003', 'Aluva',          'KSB-ALV', 10.1076,  76.3548,  'NORMAL',       420, 200),
    ('11111111-0000-0000-0000-000000000004', 'Kakkanad',       'KSB-KKN', 10.0121,  76.3407,  'CRITICAL',     980,  60),
    ('11111111-0000-0000-0000-000000000005', 'Thrippunithura', 'KSB-TPR',  9.9437,  76.3500,  'NORMAL',       300, 150)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PROSUMERS — 30 simulated prosumers (no real auth.users, for demo display only)
-- NOTE: These prosumers have user_id = NULL because they are simulated.
--       Real prosumers are created when a user signs up.
-- =============================================================================

-- Cluster 1 (Kalamassery) — 8 prosumers
INSERT INTO prosumers (id, prosumer_code, cluster_id, latitude, longitude, solar_capacity_kw, battery_capacity_kwh, max_discharge_kw, minimum_reserve_soc, current_soc, availability_status, participation_mode)
VALUES
    ('22000000-0000-0000-0000-000000000001', 'P001', '11111111-0000-0000-0000-000000000001', 10.0510, 76.3300, 5,  13.5, 5, 20, 85, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000002', 'P002', '11111111-0000-0000-0000-000000000001', 10.0520, 76.3310, 3,   9.0, 3, 20, 72, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000003', 'P003', '11111111-0000-0000-0000-000000000001', 10.0530, 76.3320, 7,  18.0, 7, 20, 90, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000004', 'P004', '11111111-0000-0000-0000-000000000001', 10.0540, 76.3330, 4,  10.0, 4, 30, 45, 'UNAVAILABLE', 'MANUAL'),
    ('22000000-0000-0000-0000-000000000005', 'P005', '11111111-0000-0000-0000-000000000001', 10.0550, 76.3340, 5,  13.5, 5, 20, 78, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000006', 'P006', '11111111-0000-0000-0000-000000000001', 10.0560, 76.3350, 4,  11.0, 4, 20, 80, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000007', 'P007', '11111111-0000-0000-0000-000000000001', 10.0570, 76.3360, 6,  16.0, 6, 20, 83, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000008', 'P008', '11111111-0000-0000-0000-000000000001', 10.0580, 76.3370, 5,  13.5, 5, 25, 75, 'AVAILABLE',   'MANUAL')
ON CONFLICT (prosumer_code) DO NOTHING;

-- Cluster 2 (Edappally) — 6 prosumers
INSERT INTO prosumers (id, prosumer_code, cluster_id, latitude, longitude, solar_capacity_kw, battery_capacity_kwh, max_discharge_kw, minimum_reserve_soc, current_soc, availability_status, participation_mode)
VALUES
    ('22000000-0000-0000-0000-000000000009', 'P009', '11111111-0000-0000-0000-000000000002', 10.0150, 76.3070, 5, 13.5, 5, 20, 81, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000010', 'P010', '11111111-0000-0000-0000-000000000002', 10.0160, 76.3080, 5, 13.5, 5, 20, 77, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000011', 'P011', '11111111-0000-0000-0000-000000000002', 10.0170, 76.3090, 5, 13.5, 5, 20, 79, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000012', 'P012', '11111111-0000-0000-0000-000000000002', 10.0180, 76.3100, 3,  9.0, 3, 20, 62, 'UNAVAILABLE', 'MANUAL'),
    ('22000000-0000-0000-0000-000000000013', 'P013', '11111111-0000-0000-0000-000000000002', 10.0190, 76.3110, 7, 18.0, 7, 20, 88, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000014', 'P014', '11111111-0000-0000-0000-000000000002', 10.0200, 76.3120, 4, 11.0, 4, 25, 68, 'AVAILABLE',   'MANUAL')
ON CONFLICT (prosumer_code) DO NOTHING;

-- Cluster 3 (Aluva) — 6 prosumers
INSERT INTO prosumers (id, prosumer_code, cluster_id, latitude, longitude, solar_capacity_kw, battery_capacity_kwh, max_discharge_kw, minimum_reserve_soc, current_soc, availability_status, participation_mode)
VALUES
    ('22000000-0000-0000-0000-000000000015', 'P015', '11111111-0000-0000-0000-000000000003', 10.1060, 76.3540, 6, 16.0, 6, 20, 91, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000016', 'P016', '11111111-0000-0000-0000-000000000003', 10.1070, 76.3550, 5, 13.5, 5, 20, 74, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000017', 'P017', '11111111-0000-0000-0000-000000000003', 10.1080, 76.3560, 8, 20.0, 8, 20, 86, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000018', 'P018', '11111111-0000-0000-0000-000000000003', 10.1090, 76.3570, 4, 11.0, 4, 30, 35, 'OFFLINE',     'MANUAL'),
    ('22000000-0000-0000-0000-000000000019', 'P019', '11111111-0000-0000-0000-000000000003', 10.1100, 76.3580, 5, 13.5, 5, 20, 70, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000020', 'P020', '11111111-0000-0000-0000-000000000003', 10.1110, 76.3590, 3,  9.0, 3, 20, 65, 'AVAILABLE',   'MANUAL')
ON CONFLICT (prosumer_code) DO NOTHING;

-- Cluster 4 (Kakkanad) — 5 prosumers
INSERT INTO prosumers (id, prosumer_code, cluster_id, latitude, longitude, solar_capacity_kw, battery_capacity_kwh, max_discharge_kw, minimum_reserve_soc, current_soc, availability_status, participation_mode)
VALUES
    ('22000000-0000-0000-0000-000000000021', 'P021', '11111111-0000-0000-0000-000000000004', 10.0110, 76.3400, 5, 13.5, 5, 20, 82, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000022', 'P022', '11111111-0000-0000-0000-000000000004', 10.0120, 76.3410, 7, 18.0, 7, 20, 89, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000023', 'P023', '11111111-0000-0000-0000-000000000004', 10.0130, 76.3420, 4, 11.0, 4, 20, 71, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000024', 'P024', '11111111-0000-0000-0000-000000000004', 10.0140, 76.3430, 3,  9.0, 3, 25, 58, 'UNAVAILABLE', 'MANUAL'),
    ('22000000-0000-0000-0000-000000000025', 'P025', '11111111-0000-0000-0000-000000000004', 10.0150, 76.3440, 6, 16.0, 6, 20, 77, 'AVAILABLE',   'AUTOMATIC')
ON CONFLICT (prosumer_code) DO NOTHING;

-- Cluster 5 (Thrippunithura) — 5 prosumers
INSERT INTO prosumers (id, prosumer_code, cluster_id, latitude, longitude, solar_capacity_kw, battery_capacity_kwh, max_discharge_kw, minimum_reserve_soc, current_soc, availability_status, participation_mode)
VALUES
    ('22000000-0000-0000-0000-000000000026', 'P026', '11111111-0000-0000-0000-000000000005', 9.9430, 76.3490, 5, 13.5, 5, 20, 76, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000027', 'P027', '11111111-0000-0000-0000-000000000005', 9.9440, 76.3500, 8, 20.0, 8, 20, 93, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000028', 'P028', '11111111-0000-0000-0000-000000000005', 9.9450, 76.3510, 4, 11.0, 4, 20, 67, 'AVAILABLE',   'MANUAL'),
    ('22000000-0000-0000-0000-000000000029', 'P029', '11111111-0000-0000-0000-000000000005', 9.9460, 76.3520, 5, 13.5, 5, 20, 84, 'AVAILABLE',   'AUTOMATIC'),
    ('22000000-0000-0000-0000-000000000030', 'P030', '11111111-0000-0000-0000-000000000005', 9.9470, 76.3530, 6, 16.0, 6, 25, 55, 'OFFLINE',     'MANUAL')
ON CONFLICT (prosumer_code) DO NOTHING;

-- =============================================================================
-- INITIAL TELEMETRY — one record per prosumer
-- =============================================================================
INSERT INTO telemetry (prosumer_id, soc, solar_generation_kw, battery_power_kw, available_energy_kwh)
SELECT
    id,
    current_soc,
    ROUND((solar_capacity_kw * (0.5 + RANDOM() * 0.5))::NUMERIC, 2),
    0,
    ROUND(((current_soc - minimum_reserve_soc) / 100.0 * battery_capacity_kwh)::NUMERIC, 2)
FROM prosumers;
