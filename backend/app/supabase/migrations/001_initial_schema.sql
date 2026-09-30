-- =============================================================================
-- 001_initial_schema.sql
-- KSEB VPP — Initial database schema
-- Run this first in Supabase SQL Editor
-- =============================================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: profiles
-- Application-level user info. Supabase Auth owns credentials.
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT,
    phone       TEXT,
    role        TEXT NOT NULL CHECK (role IN ('PROSUMER', 'KSEB_OPERATOR', 'ADMIN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically create a profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'PROSUMER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TABLE: clusters
-- Logical/grid-support clusters (Supabase-only, no physical KSEB grid control)
-- =============================================================================
CREATE TABLE IF NOT EXISTS clusters (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                  TEXT NOT NULL,
    substation            TEXT,
    latitude              DOUBLE PRECISION,
    longitude             DOUBLE PRECISION,
    grid_status           TEXT NOT NULL DEFAULT 'NORMAL'
                              CHECK (grid_status IN ('NORMAL', 'WARNING', 'HIGH_STRESS', 'CRITICAL')),
    current_load_kw       NUMERIC DEFAULT 0 CHECK (current_load_kw >= 0),
    available_capacity_kw NUMERIC DEFAULT 0 CHECK (available_capacity_kw >= 0),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABLE: prosumers
-- VPP-specific prosumer information
-- =============================================================================
CREATE TABLE IF NOT EXISTS prosumers (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES profiles(id) ON DELETE SET NULL,
    prosumer_code         TEXT UNIQUE NOT NULL,
    cluster_id            UUID REFERENCES clusters(id),
    latitude              DOUBLE PRECISION,
    longitude             DOUBLE PRECISION,
    solar_capacity_kw     NUMERIC DEFAULT 0 CHECK (solar_capacity_kw >= 0),
    battery_capacity_kwh  NUMERIC DEFAULT 0 CHECK (battery_capacity_kwh >= 0),
    max_discharge_kw      NUMERIC DEFAULT 0 CHECK (max_discharge_kw >= 0),
    minimum_reserve_soc   NUMERIC DEFAULT 20 CHECK (minimum_reserve_soc >= 0 AND minimum_reserve_soc <= 100),
    current_soc           NUMERIC DEFAULT 50 CHECK (current_soc >= 0 AND current_soc <= 100),
    availability_status   TEXT NOT NULL DEFAULT 'AVAILABLE'
                              CHECK (availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'OFFLINE')),
    participation_mode    TEXT NOT NULL DEFAULT 'MANUAL'
                              CHECK (participation_mode IN ('AUTOMATIC', 'MANUAL')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_prosumers_updated_at ON prosumers;
CREATE TRIGGER set_prosumers_updated_at
    BEFORE UPDATE ON prosumers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: telemetry
-- Simulated prosumer telemetry data
-- =============================================================================
CREATE TABLE IF NOT EXISTS telemetry (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prosumer_id           UUID NOT NULL REFERENCES prosumers(id) ON DELETE CASCADE,
    soc                   NUMERIC NOT NULL CHECK (soc >= 0 AND soc <= 100),
    solar_generation_kw   NUMERIC DEFAULT 0 CHECK (solar_generation_kw >= 0),
    battery_power_kw      NUMERIC DEFAULT 0,
    available_energy_kwh  NUMERIC DEFAULT 0 CHECK (available_energy_kwh >= 0),
    timestamp             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient prosumer telemetry queries
CREATE INDEX IF NOT EXISTS idx_telemetry_prosumer_id ON telemetry(prosumer_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);

-- =============================================================================
-- TABLE: dispatch_requests
-- KSEB grid support requests
-- =============================================================================
CREATE TABLE IF NOT EXISTS dispatch_requests (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id       UUID NOT NULL REFERENCES clusters(id),
    requested_kw     NUMERIC NOT NULL CHECK (requested_kw > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    status           TEXT NOT NULL DEFAULT 'CREATED'
                         CHECK (status IN ('CREATED', 'ALLOCATING', 'AWAITING_RESPONSES', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PARTIAL')),
    created_by       UUID REFERENCES profiles(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dispatch_requests_cluster_id ON dispatch_requests(cluster_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_requests_status ON dispatch_requests(status);

-- =============================================================================
-- TABLE: dispatch_participants
-- Prosumers selected for a dispatch
-- =============================================================================
CREATE TABLE IF NOT EXISTS dispatch_participants (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id           UUID NOT NULL REFERENCES dispatch_requests(id) ON DELETE CASCADE,
    prosumer_id           UUID NOT NULL REFERENCES prosumers(id),
    requested_kw          NUMERIC NOT NULL CHECK (requested_kw >= 0),
    accepted_kw           NUMERIC DEFAULT 0 CHECK (accepted_kw >= 0),
    delivered_kw          NUMERIC DEFAULT 0 CHECK (delivered_kw >= 0),
    energy_delivered_kwh  NUMERIC DEFAULT 0 CHECK (energy_delivered_kwh >= 0),
    status                TEXT NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'ACTIVE', 'COMPLETED', 'EXCLUDED')),
    responded_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dispatch_id, prosumer_id)
);

CREATE INDEX IF NOT EXISTS idx_dispatch_participants_dispatch_id ON dispatch_participants(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_participants_prosumer_id ON dispatch_participants(prosumer_id);

-- =============================================================================
-- TABLE: incentives
-- Prosumer earning records per dispatch
-- =============================================================================
CREATE TABLE IF NOT EXISTS incentives (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prosumer_id    UUID NOT NULL REFERENCES prosumers(id),
    dispatch_id    UUID NOT NULL REFERENCES dispatch_requests(id),
    energy_kwh     NUMERIC NOT NULL DEFAULT 0,
    rate_per_kwh   NUMERIC NOT NULL DEFAULT 10,
    amount         NUMERIC NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'CALCULATED', 'SETTLED')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(prosumer_id, dispatch_id)
);

CREATE INDEX IF NOT EXISTS idx_incentives_prosumer_id ON incentives(prosumer_id);
CREATE INDEX IF NOT EXISTS idx_incentives_dispatch_id ON incentives(dispatch_id);
