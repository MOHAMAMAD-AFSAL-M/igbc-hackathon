# KSEB VPP — Backend Development Specification (Supabase)

## 1. Purpose

This document defines the **backend-only implementation** for the KSEB Decentralized Virtual Power Plant (VPP) hackathon prototype.

The original project requires the backend to act as the handshake layer between:

- Prosumer Mobile App
- KSEB Web Dashboard

For the 4-hour hackathon, the backend will use **Supabase** instead of building a separate Node/Express or FastAPI + PostgreSQL stack.

The prototype will simulate:

- Prosumer battery/solar telemetry
- Grid stress
- Dispatch requests
- Prosumer responses
- Delivered capacity
- Incentive calculation

It must **not** claim to directly control KSEB's physical grid or real inverters.

---

# 2. Backend Architecture

```text
                    ┌────────────────────────────┐
                    │          SUPABASE          │
                    │                            │
                    │  PostgreSQL                │
                    │  Supabase Auth             │
                    │  Realtime                  │
                    │  Row Level Security (RLS)  │
                    │  Edge Functions (optional) │
                    └─────────────┬──────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
       Prosumer Mobile App                  KSEB Dashboard
                │                                   │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                         VPP Dispatch Logic
                                  │
                                  ▼
                              Database
```

## Backend principle

The frontend applications must not implement the VPP business rules themselves.

The frontend should:

- read permitted data
- create/update permitted records
- subscribe to Realtime changes
- call server-side logic where business rules are involved

The backend/database is responsible for:

- authentication
- authorization
- data integrity
- dispatch creation
- eligibility
- allocation
- response tracking
- incentive calculation
- event history

---

# 3. Supabase Services Used

## Required

### Supabase Auth

Used for:

- Prosumer login/register
- KSEB operator login
- Session management
- User identity

Roles:

```text
PROSUMER
KSEB_OPERATOR
ADMIN
```

Do not store plaintext passwords in custom tables.

Use Supabase Auth for credentials.

---

### PostgreSQL

Primary database for:

- users/profiles
- prosumers
- clusters
- telemetry
- dispatch requests
- dispatch participants
- incentives

---

### Supabase Realtime

Used for:

- new dispatch requests appearing on mobile
- prosumer acceptance/decline appearing on KSEB dashboard
- live dispatch status
- telemetry/dashboard updates

For the hackathon, Realtime can replace a custom WebSocket server.

---

### Row Level Security (RLS)

RLS is mandatory.

Examples:

- Prosumer can read/update their own profile.
- Prosumer can read dispatch requests assigned to them.
- KSEB operator can read cluster/prosumer/dispatch data.
- Only authorized backend/server-side logic should perform sensitive allocation or settlement operations.

---

### Edge Functions

Use Edge Functions only where server-side business logic is useful.

Recommended functions:

```text
create-dispatch
allocate-dispatch
respond-to-dispatch
complete-dispatch
simulate-telemetry
```

For the fastest MVP, some simple reads/writes can use Supabase directly, while allocation and sensitive operations should use server-side functions.

---

# 4. Database Schema

## 4.1 profiles

Supabase Auth owns the authentication identity.

`profiles` stores application-level user information.

```text
profiles
--------------------------------
id              uuid PK
name            text
phone           text
role            text
created_at      timestamptz
```

Allowed roles:

```text
PROSUMER
KSEB_OPERATOR
ADMIN
```

`profiles.id` should reference:

```text
auth.users.id
```

---

# 4.2 prosumers

Stores VPP-specific prosumer information.

```text
prosumers
--------------------------------
id                      uuid PK
user_id                 uuid FK -> profiles.id
prosumer_code           text UNIQUE
cluster_id              uuid FK -> clusters.id
latitude                double precision
longitude               double precision
solar_capacity_kw       numeric
battery_capacity_kwh    numeric
max_discharge_kw        numeric
minimum_reserve_soc     numeric
current_soc             numeric
availability_status     text
participation_mode      text
created_at              timestamptz
updated_at              timestamptz
```

### availability_status

```text
AVAILABLE
UNAVAILABLE
OFFLINE
```

### participation_mode

```text
AUTOMATIC
MANUAL
```

---

# 4.3 clusters

Represents logical/grid-support clusters for the prototype.

```text
clusters
--------------------------------
id                      uuid PK
name                    text
substation              text
latitude                double precision
longitude               double precision
grid_status             text
current_load_kw         numeric
available_capacity_kw   numeric
created_at              timestamptz
```

### grid_status

```text
NORMAL
WARNING
HIGH_STRESS
CRITICAL
```

---

# 4.4 telemetry

Stores simulated telemetry.

```text
telemetry
--------------------------------
id                      uuid PK
prosumer_id             uuid FK -> prosumers.id
soc                     numeric
solar_generation_kw     numeric
battery_power_kw        numeric
available_energy_kwh    numeric
timestamp               timestamptz
```

The simulator should periodically create telemetry records.

Example:

```json
{
  "prosumer_id": "P001",
  "soc": 81,
  "solar_generation_kw": 4.2,
  "battery_power_kw": 0,
  "available_energy_kwh": 8.5
}
```

---

# 4.5 dispatch_requests

Represents a KSEB grid-support request.

```text
dispatch_requests
--------------------------------
id                      uuid PK
cluster_id              uuid FK -> clusters.id
requested_kw            numeric
duration_minutes        integer
status                  text
created_by              uuid FK -> profiles.id
created_at              timestamptz
started_at              timestamptz
completed_at            timestamptz
```

### status

```text
CREATED
ALLOCATING
AWAITING_RESPONSES
ACTIVE
COMPLETED
CANCELLED
PARTIAL
```

---

# 4.6 dispatch_participants

Stores the relationship between a dispatch and selected prosumers.

```text
dispatch_participants
--------------------------------
id                      uuid PK
dispatch_id             uuid FK -> dispatch_requests.id
prosumer_id             uuid FK -> prosumers.id
requested_kw            numeric
accepted_kw             numeric
delivered_kw            numeric
energy_delivered_kwh    numeric
status                  text
responded_at            timestamptz
created_at              timestamptz
```

### status

```text
PENDING
ACCEPTED
DECLINED
ACTIVE
COMPLETED
EXCLUDED
```

---

# 4.7 incentives

Stores the prosumer incentive/earning record.

```text
incentives
--------------------------------
id                      uuid PK
prosumer_id             uuid FK -> prosumers.id
dispatch_id             uuid FK -> dispatch_requests.id
energy_kwh              numeric
rate_per_kwh            numeric
amount                  numeric
status                  text
created_at              timestamptz
```

### status

```text
PENDING
CALCULATED
SETTLED
```

For the hackathon, settlement can remain simulated.

---

# 5. Relationships

```text
auth.users
     │
     ▼
profiles
     │
     ▼
prosumers ───────────────► clusters
     │
     └──────────────► telemetry


clusters
     │
     ▼
dispatch_requests
     │
     ▼
dispatch_participants
     │
     ▼
prosumers

dispatch_requests
     │
     ▼
incentives
```

---

# 6. Database Constraints

Implement basic constraints to prevent invalid demo data.

Examples:

```text
soc >= 0
soc <= 100

minimum_reserve_soc >= 0
minimum_reserve_soc <= 100

max_discharge_kw >= 0
battery_capacity_kwh >= 0

requested_kw > 0
duration_minutes > 0

accepted_kw >= 0
delivered_kw >= 0
energy_delivered_kwh >= 0
```

Also ensure:

```text
prosumer_code UNIQUE
```

---

# 7. Authentication and Authorization

## Prosumer

A prosumer can:

- read own profile
- update own availability
- update permitted capacity/preferences
- read own telemetry
- read dispatch requests assigned to them
- respond to their dispatch request
- read own incentives/history

A prosumer must NOT:

- read another prosumer's private data
- create a KSEB dispatch
- modify another prosumer
- modify incentive settlement

---

## KSEB Operator

A KSEB operator can:

- read clusters
- read prosumer availability/capacity
- read aggregate telemetry
- create dispatch requests
- monitor dispatches
- read event history

Sensitive operations should be validated server-side.

---

## Admin

Admin can:

- manage users
- manage clusters
- seed/reset demo data
- manage system configuration

---

# 8. RLS Strategy

Enable RLS on all application tables.

Example conceptual policies:

```text
profiles:
  PROSUMER → own profile
  KSEB_OPERATOR → authorized profiles
  ADMIN → all

prosumers:
  PROSUMER → own record
  KSEB_OPERATOR → read
  ADMIN → all

telemetry:
  PROSUMER → own telemetry
  KSEB_OPERATOR → read
  ADMIN → all

dispatch_requests:
  PROSUMER → assigned requests only
  KSEB_OPERATOR → read/create
  ADMIN → all

dispatch_participants:
  PROSUMER → own participation
  KSEB_OPERATOR → read
  ADMIN → all

incentives:
  PROSUMER → own records
  KSEB_OPERATOR → read
  ADMIN → all
```

Do not blindly expose service-role credentials to frontend applications.

---

# 9. Backend API / Function Contract

Even though Supabase provides the database API, keep a clear logical API contract.

## Authentication

Handled primarily by Supabase Auth.

Frontend operations:

```text
signUp()
signInWithPassword()
signOut()
getUser()
```

---

# 10. Prosumer Operations

## Get own profile

```text
GET /prosumer/me
```

Returns:

```json
{
  "id": "uuid",
  "name": "Demo Prosumer",
  "prosumerCode": "P001",
  "clusterId": "CL001",
  "currentSoc": 78,
  "maxDischargeKw": 5,
  "availabilityStatus": "AVAILABLE"
}
```

---

## Update availability

```text
PATCH /prosumer/availability
```

Body:

```json
{
  "availabilityStatus": "AVAILABLE"
}
```

---

## Get own capacity

```text
GET /prosumer/capacity
```

---

# 11. Cluster Operations

## Get clusters

```text
GET /clusters
```

Example response:

```json
[
  {
    "id": "CL001",
    "name": "Kalamassery",
    "availablePowerKw": 126,
    "availableEnergyKwh": 410,
    "averageSoc": 74,
    "availableProsumers": 24,
    "gridStatus": "HIGH_STRESS"
  }
]
```

---

## Get cluster details

```text
GET /clusters/:id
```

---

## Get cluster prosumers

```text
GET /clusters/:id/prosumers
```

---

# 12. Dispatch Flow

This is the most important backend flow.

## Step 1 — KSEB creates request

Input:

```json
{
  "clusterId": "CL001",
  "requestedPowerKw": 50,
  "durationMinutes": 120
}
```

Create:

```text
dispatch_requests
```

with:

```text
status = CREATED
```

---

## Step 2 — Find eligible prosumers

A prosumer is eligible when:

```text
availability_status = AVAILABLE

AND current_soc > minimum_reserve_soc

AND max_discharge_kw > 0

AND prosumer belongs to requested cluster
```

---

## Step 3 — Calculate available capacity

For each eligible prosumer:

```text
available_discharge =
    min(
        max_discharge_kw,
        energy_available / duration_hours
    )
```

For the hackathon, a simpler calculation using `max_discharge_kw` is also acceptable.

---

# 13. Dispatch Allocation Algorithm

Use a deterministic and explainable MVP algorithm.

## Algorithm

```text
1. Receive target kW.
2. Fetch eligible prosumers.
3. Calculate available capacity.
4. Sort eligible prosumers.
5. Allocate requested kW sequentially.
6. Create dispatch_participants rows.
7. Send/Expose requests to prosumers.
8. Collect ACCEPTED / DECLINED responses.
9. Recalculate accepted capacity.
10. If accepted capacity < target:
       allocate remaining requirement to other eligible prosumers.
11. During active dispatch, track delivered capacity.
12. On completion, calculate energy and incentives.
```

## Suggested sorting

For MVP:

```text
1. Higher SoC first
2. Higher available discharge capacity first
```

Do not make the algorithm unnecessarily complex during the hackathon.

Later it can include:

- fairness
- historical participation
- distance
- response reliability
- battery reserve weighting

---

# 14. Example Allocation

KSEB requests:

```text
50 kW
```

Eligible:

```text
P001 → 5 kW → SoC 85%
P002 → 3 kW → SoC 72%
P003 → 7 kW → SoC 90%
P005 → 5 kW → SoC 78%
P006 → 4 kW → SoC 80%
P007 → 6 kW → SoC 83%
P008 → 5 kW → SoC 75%
P009 → 5 kW → SoC 81%
P010 → 5 kW → SoC 77%
P011 → 5 kW → SoC 79%
```

The allocator creates participant records until the requested capacity is covered.

---

# 15. Prosumer Response

Prosumer receives:

```json
{
  "dispatchId": "DSP1001",
  "requestedPowerKw": 4,
  "durationMinutes": 120,
  "estimatedEnergyKwh": 8,
  "estimatedIncentive": 80
}
```

Prosumer responds:

```json
{
  "response": "ACCEPTED",
  "acceptedKw": 4
}
```

or:

```json
{
  "response": "DECLINED"
}
```

The backend updates:

```text
dispatch_participants.status
```

and:

```text
accepted_kw
```

---

# 16. Partial Acceptance

Example:

```text
Requested = 50 kW
Accepted  = 37 kW
Remaining = 13 kW
```

The backend should:

1. calculate remaining requirement
2. find additional eligible prosumers
3. create additional participant requests
4. update the dispatch aggregate

The KSEB dashboard should be able to show:

```text
Requested: 50 kW
Accepted: 37 kW
Remaining: 13 kW
```

---

# 17. Dispatch Status

Recommended lifecycle:

```text
CREATED
   ↓
ALLOCATING
   ↓
AWAITING_RESPONSES
   ↓
PARTIAL / ACTIVE
   ↓
COMPLETED
```

Possible cancellation:

```text
CREATED → CANCELLED
AWAITING_RESPONSES → CANCELLED
ACTIVE → CANCELLED
```

---

# 18. Realtime

Enable Supabase Realtime for the tables required by the demo.

Recommended:

```text
dispatch_requests
dispatch_participants
prosumers
telemetry
incentives
```

## Mobile

Subscribe to dispatch records relevant to the logged-in prosumer.

Conceptually:

```text
INSERT dispatch participant
        ↓
Supabase Realtime
        ↓
Mobile app
        ↓
Show dispatch request
```

## KSEB Dashboard

Subscribe to:

```text
dispatch_participants
dispatch_requests
```

Conceptually:

```text
Prosumer accepts
        ↓
Database UPDATE
        ↓
Supabase Realtime
        ↓
KSEB Dashboard
        ↓
Accepted capacity changes
```

This is one of the most important parts of the demo.

---

# 19. Aggregate Capacity

The dashboard needs:

```text
Available power
Available energy
Average SoC
Available prosumers
```

For a cluster:

```text
availablePowerKw
availableEnergyKwh
averageSoc
availableProsumerCount
```

For the hackathon, these can be calculated with SQL queries/views rather than creating complicated backend services.

Consider creating:

```text
cluster_capacity_view
```

Example conceptual output:

```text
cluster_id
available_power_kw
available_energy_kwh
average_soc
available_prosumers
```

---

# 20. Incentive Calculation

Use a simple configurable rate.

Example:

```text
rate = ₹10 / kWh
```

Formula:

```text
incentive = energy_delivered_kwh × rate_per_kwh
```

Example:

```text
Energy delivered = 8 kWh
Rate = ₹10/kWh

Incentive = ₹80
```

Store the result in:

```text
incentives
```

The rate should be configurable rather than hardcoded into frontend code.

---

# 21. Dispatch Completion

When a dispatch finishes:

For every participant:

```text
energy_delivered_kwh =
    delivered_kw × duration_hours
```

Then:

```text
incentive =
    energy_delivered_kwh × rate_per_kwh
```

Update:

```text
dispatch_participants.status = COMPLETED

dispatch_requests.status = COMPLETED

incentives.status = CALCULATED
```

---

# 22. Telemetry Simulator

The simulator makes the demo look alive.

Create 20–50 simulated prosumers.

Every few seconds, update:

```text
SoC
solar_generation_kw
battery_power_kw
available_energy_kwh
availability_status
```

Example:

```text
P001
SoC: 81.0 → 80.8
Solar: 4.2 → 4.7 kW
Battery: 0 → 3 kW
```

During dispatch:

```text
Battery power:
0 kW
↓
3 kW
↓
3 kW
↓
2.8 kW
↓
0 kW
```

For a 4-hour hackathon, this can be a simple Python script or Node script.

---

# 23. Grid Stress Simulation

Clusters should have simulated grid conditions.

Example:

```text
NORMAL
WARNING
HIGH_STRESS
CRITICAL
```

A simple simulator can change:

```text
current_load_kw
grid_status
```

Example:

```text
Cluster A
Load: 820 kW
Status: HIGH_STRESS
```

The KSEB dashboard can then initiate a support request.

---

# 24. Seed Data

Before the demo, seed:

```text
5 clusters
20–50 prosumers
multiple telemetry records
different SoC values
different availability statuses
```

Example clusters:

```text
CL001 → Kalamassery
CL002 → Edappally
CL003 → Aluva
CL004 → Kakkanad
CL005 → Thrippunithura
```

These are demo labels only.

---

# 25. Recommended Supabase Functions

For a clean implementation, create:

```text
supabase/
└── functions/
    ├── create-dispatch/
    ├── allocate-dispatch/
    ├── respond-to-dispatch/
    ├── complete-dispatch/
    └── simulate-telemetry/
```

However, do not create all of these if they slow down the hackathon.

Minimum recommended server-side functions:

```text
create-dispatch
allocate-dispatch
complete-dispatch
```

Prosumer response can be a direct authenticated database operation if RLS safely controls it.

---

# 26. Suggested Repository Structure

```text
vpp-kseb/
│
├── mobile/
├── web/
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls.sql
│   │   └── 003_views.sql
│   │
│   ├── functions/
│   │   ├── create-dispatch/
│   │   ├── allocate-dispatch/
│   │   └── complete-dispatch/
│   │
│   └── seed/
│       └── demo_data.sql
│
├── simulation/
│   └── telemetry_simulator.py
│
└── docs/
    └── backend.md
```

---

# 27. Environment Variables

Frontend:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

React Native should use the corresponding Supabase project URL and public client key.

Server-side functions may use protected credentials where required.

Never commit:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to GitHub.

---

# 28. MCP / Agentic Development

If the development environment provides a Supabase MCP integration, it can be used to accelerate database development.

Useful agent tasks:

```text
"Create the database schema from backend.md."

"Create the RLS policies described in backend.md."

"Create demo clusters and 30 simulated prosumers."

"Create a view for cluster aggregate capacity."

"Check whether the dispatch tables and foreign keys are correctly configured."

"Add Realtime configuration for dispatch_requests and dispatch_participants."

"Create the dispatch allocation function."

"Test the dispatch flow using seeded data."
```

### Important

The AI agent should not blindly execute destructive database operations.

Review:

```text
DROP TABLE
DELETE
TRUNCATE
ALTER TABLE
RLS policy changes
service-role operations
```

before applying them to the shared project.

Use a dedicated hackathon Supabase project.

---

# 29. Backend Team Division

If two people are working on backend:

## Developer A — Database + Auth

Responsible for:

```text
Supabase project
Auth
profiles
prosumers
clusters
telemetry
dispatch tables
incentives
RLS
seed data
views
```

## Developer B — VPP Logic + Realtime

Responsible for:

```text
dispatch creation
eligibility
allocation algorithm
prosumer response
partial acceptance
dispatch completion
incentive calculation
Realtime integration
telemetry simulation
```

Both developers should coordinate through:

```text
backend.md
database migrations
API/function contracts
```

---

# 30. Git Workflow

Use:

```text
main
develop

feature/supabase-schema
feature/rls
feature/dispatch-engine
feature/realtime
feature/simulator
```

Never directly experiment destructively on `main`.

Every backend change should be represented by a migration where practical.

---

# 31. Backend Definition of Done

The backend is ready for the frontend team when:

- [ ] Supabase project created
- [ ] Auth working
- [ ] Profiles working
- [ ] Prosumer table working
- [ ] Cluster table working
- [ ] Telemetry table working
- [ ] Dispatch tables working
- [ ] Incentive table working
- [ ] RLS configured
- [ ] Demo data seeded
- [ ] Cluster capacity query working
- [ ] Dispatch creation working
- [ ] Eligibility logic working
- [ ] Allocation working
- [ ] Prosumer accept/decline working
- [ ] Partial acceptance working
- [ ] Dispatch completion working
- [ ] Incentive calculation working
- [ ] Realtime working
- [ ] Telemetry simulation working

---

# 32. Minimum 4-Hour Backend Target

Do NOT attempt every advanced feature.

The minimum successful backend should support:

```text
1. Login
      ↓
2. Prosumer data
      ↓
3. Cluster data
      ↓
4. KSEB creates 50 kW dispatch
      ↓
5. Backend finds eligible prosumers
      ↓
6. Dispatch participants created
      ↓
7. Prosumer accepts/declines
      ↓
8. Realtime updates KSEB dashboard
      ↓
9. Delivered capacity simulated
      ↓
10. Incentive calculated
```

If this flow works reliably, the backend supports the complete core demo.

---

# 33. Final End-to-End Backend Flow

```text
                 GRID STRESS
                     │
                     ▼
             KSEB creates request
                     │
                     │ 50 kW / 2 hours
                     ▼
              dispatch_requests
                     │
                     ▼
              Eligibility check
                     │
          ┌──────────┴──────────┐
          ▼          ▼          ▼
        P001       P002       P003 ...
          │          │          │
          ▼          ▼          ▼
       Request    Request    Request
          │          │          │
       ACCEPT      ACCEPT     DECLINE
          │          │          │
          └──────────┼──────────┘
                     ▼
              Aggregate response
                     │
                     ▼
              ACTIVE DISPATCH
                     │
                     ▼
             Telemetry simulator
                     │
                     ▼
              Delivered capacity
                     │
                     ▼
              Dispatch COMPLETE
                     │
                     ▼
             Energy calculation
                     │
                     ▼
             Incentive calculation
                     │
                     ▼
              Incentive ledger
```

---

# 34. Core Backend Goal

The backend should make this statement demonstrably true:

> KSEB can request temporary support from a grid cluster, the VPP can identify eligible prosumers and distribute the request, prosumers can respond, and the system can aggregate the response and record the resulting energy contribution and incentive.

The hackathon's key technical demonstration is the **real-time handshake between the KSEB dispatch request and distributed prosumer responses**.

Do not over-engineer the backend beyond this flow during the 4-hour hackathon.
