-- =============================================================================
-- 002_rls.sql
-- KSEB VPP — Row Level Security policies
-- Run this AFTER 001_initial_schema.sql
-- =============================================================================

-- Helper function: get current user's role from profiles
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's prosumer id
CREATE OR REPLACE FUNCTION get_my_prosumer_id()
RETURNS UUID AS $$
    SELECT id FROM public.prosumers WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================================================
-- profiles
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Prosumers can read and update their own profile
CREATE POLICY "Prosumer reads own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Prosumer updates own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- KSEB operators and admins can read all profiles
CREATE POLICY "KSEB reads all profiles"
    ON profiles FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Admins can do everything
CREATE POLICY "Admin all on profiles"
    ON profiles FOR ALL
    USING (get_my_role() = 'ADMIN');

-- Allow insert during signup (trigger creates profile)
CREATE POLICY "Allow profile creation on signup"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- clusters
-- =============================================================================
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read clusters
CREATE POLICY "Authenticated reads clusters"
    ON clusters FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin can manage clusters
CREATE POLICY "Admin all on clusters"
    ON clusters FOR ALL
    USING (get_my_role() = 'ADMIN');

-- KSEB operator can update cluster grid_status/load (for simulation)
CREATE POLICY "KSEB operator updates clusters"
    ON clusters FOR UPDATE
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- =============================================================================
-- prosumers
-- =============================================================================
ALTER TABLE prosumers ENABLE ROW LEVEL SECURITY;

-- Prosumer can read their own record
CREATE POLICY "Prosumer reads own record"
    ON prosumers FOR SELECT
    USING (user_id = auth.uid());

-- Prosumer can update availability and participation_mode on own record
CREATE POLICY "Prosumer updates own availability"
    ON prosumers FOR UPDATE
    USING (user_id = auth.uid());

-- KSEB operator reads all prosumers
CREATE POLICY "KSEB reads all prosumers"
    ON prosumers FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Admin all
CREATE POLICY "Admin all on prosumers"
    ON prosumers FOR ALL
    USING (get_my_role() = 'ADMIN');

-- =============================================================================
-- telemetry
-- =============================================================================
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- Prosumer reads own telemetry
CREATE POLICY "Prosumer reads own telemetry"
    ON telemetry FOR SELECT
    USING (prosumer_id = get_my_prosumer_id());

-- KSEB reads all telemetry
CREATE POLICY "KSEB reads all telemetry"
    ON telemetry FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Only service role (simulator) inserts telemetry — handled via admin client
CREATE POLICY "Service role inserts telemetry"
    ON telemetry FOR INSERT
    WITH CHECK (get_my_role() = 'ADMIN');

-- =============================================================================
-- dispatch_requests
-- =============================================================================
ALTER TABLE dispatch_requests ENABLE ROW LEVEL SECURITY;

-- Prosumers can read dispatch requests they are assigned to
CREATE POLICY "Prosumer reads own dispatch"
    ON dispatch_requests FOR SELECT
    USING (
        id IN (
            SELECT dispatch_id FROM dispatch_participants
            WHERE prosumer_id = get_my_prosumer_id()
        )
    );

-- KSEB operators can read and create dispatches
CREATE POLICY "KSEB reads all dispatches"
    ON dispatch_requests FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

CREATE POLICY "KSEB creates dispatches"
    ON dispatch_requests FOR INSERT
    WITH CHECK (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

CREATE POLICY "KSEB updates dispatches"
    ON dispatch_requests FOR UPDATE
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Admin all
CREATE POLICY "Admin all on dispatch_requests"
    ON dispatch_requests FOR ALL
    USING (get_my_role() = 'ADMIN');

-- =============================================================================
-- dispatch_participants
-- =============================================================================
ALTER TABLE dispatch_participants ENABLE ROW LEVEL SECURITY;

-- Prosumer reads and updates their own participation
CREATE POLICY "Prosumer reads own participation"
    ON dispatch_participants FOR SELECT
    USING (prosumer_id = get_my_prosumer_id());

CREATE POLICY "Prosumer updates own participation"
    ON dispatch_participants FOR UPDATE
    USING (prosumer_id = get_my_prosumer_id());

-- KSEB reads all participants
CREATE POLICY "KSEB reads all participants"
    ON dispatch_participants FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Admin all
CREATE POLICY "Admin all on dispatch_participants"
    ON dispatch_participants FOR ALL
    USING (get_my_role() = 'ADMIN');

-- =============================================================================
-- incentives
-- =============================================================================
ALTER TABLE incentives ENABLE ROW LEVEL SECURITY;

-- Prosumer reads own incentives
CREATE POLICY "Prosumer reads own incentives"
    ON incentives FOR SELECT
    USING (prosumer_id = get_my_prosumer_id());

-- KSEB reads all incentives
CREATE POLICY "KSEB reads all incentives"
    ON incentives FOR SELECT
    USING (get_my_role() IN ('KSEB_OPERATOR', 'ADMIN'));

-- Admin all
CREATE POLICY "Admin all on incentives"
    ON incentives FOR ALL
    USING (get_my_role() = 'ADMIN');
