# Decentralized VPP for KSEB — Team Development Specification

## 1. Project Overview

### Project
**Decentralized Virtual Power Plant (VPP) for KSEB Peak Load Management**

### Core idea

The system has two user-facing products that must work together through a common backend:

1. **Prosumer Mobile App** — clients/prosumers report their available electricity/battery capacity, availability, preferences, and respond to KSEB support requests.
2. **KSEB Web Dashboard** — KSEB operators view available distributed capacity, identify clusters, send electricity-support requests, and monitor responses.

The **backend/VPP engine** acts as the handshake layer between them.

### Simplified architecture

```text
┌──────────────────────┐
│  PROSUMER MOBILE APP │
│                      │
│ • Available kW/kWh   │
│ • Battery/solar data │
│ • Availability       │
│ • Request received   │
│ • Accept/decline     │
│ • Incentive ledger   │
└──────────┬───────────┘
           │
           │ REST API / WebSocket
           ▼
┌────────────────────────────────────┐
│       VPP BACKEND / API            │
│                                    │
│ • Authentication                   │
│ • Prosumer management              │
│ • Capacity aggregation             │
│ • Cluster management               │
│ • Dispatch orchestration           │
│ • Request routing                  │
│ • Response monitoring              │
│ • Incentive calculation            │
└──────────────┬─────────────────────┘
               │
               │ REST API / WebSocket
               ▼
┌─────────────────────────┐
│    KSEB WEB DASHBOARD   │
│                         │
│ • Map / clusters        │
│ • Available capacity    │
│ • Grid stress           │
│ • Dispatch request      │
│ • Live response         │
│ • Event history         │
└─────────────────────────┘
               │
               ▼
        ┌─────────────┐
        │  DATABASE   │
        └─────────────┘
```

---

# 2. MVP Scope

The hackathon/demo version should **simulate the electrical grid and battery response** rather than attempt direct control of real KSEB infrastructure or physical inverters.

## Must-have features

### Prosumer Mobile App

- Login/register
- Prosumer profile
- Location/cluster
- Available generation capacity
- Available battery capacity
- State of Charge (SoC)
- Maximum discharge power
- Minimum reserve SoC
- Availability status
- Opt-in/opt-out
- Incoming KSEB/VPP dispatch request
- Accept/decline request
- Requested kW
- Requested duration
- Estimated energy contribution
- Estimated incentive
- Current dispatch status
- Contribution history
- Incentive/earnings ledger

### KSEB Website

- Secure operator login
- Dashboard overview
- Kerala/cluster map
- Prosumer locations
- Cluster-level available capacity
- Cluster SoC
- Number of available prosumers
- Simulated grid-stress indicator
- Cluster details
- Create dispatch request
- Select target kW
- Select duration
- View eligible prosumers
- Send dispatch request
- Live response monitoring
- Requested vs accepted vs delivered capacity
- Event completion
- Incentive/event summary
- Historical dispatch events

### Backend

- Authentication
- User/role management
- Prosumer registration
- Capacity data storage
- Cluster assignment
- Dispatch request creation
- Dispatch request distribution
- Prosumer response handling
- Dispatch status tracking
- Aggregated capacity calculation
- Incentive calculation
- Event history
- Real-time status updates

---

# 3. Team Structure

Recommended team structure:

| Role | Main Responsibility |
|---|---|
| Team Lead / System Architect | Overall architecture, integration, GitHub, final demo |
| Mobile Developer | Prosumer mobile application |
| Frontend/Web Developer | KSEB dashboard |
| Backend/API Developer | Server, APIs, authentication |
| Database/Data Engineer | Schema, queries, seed data |
| VPP/Algorithm Developer | Capacity aggregation and dispatch algorithm |
| UI/UX Designer | App + dashboard interface |
| Testing/Integration Lead | End-to-end testing and deployment |
| Pitch/Documentation Lead | Presentation, architecture diagram, demo script |

One person may handle multiple roles if the team is small.

---

# 4. Role 1 — Team Lead / System Architect

## Responsibilities

Define and enforce the overall architecture.

### Tasks

- Create GitHub repository
- Define project folders
- Decide technology stack
- Define API contracts with backend developer
- Coordinate mobile/web/backend development
- Maintain `.env.example`
- Define common naming conventions
- Review pull requests
- Resolve integration conflicts
- Prepare final system demonstration

### Deliverables

- System architecture diagram
- Repository structure
- API contract document
- Integration checklist
- Final demo flow

### Suggested repository

```text
vpp-kseb/
│
├── mobile/
├── web/
├── backend/
├── database/
├── docs/
├── simulation/
└── README.md
```

---

# 5. Role 2 — Mobile App Developer

## Product

**Prosumer Mobile Application**

Recommended technologies:

- Flutter + Dart
- React Native + TypeScript

Choose one. Do not develop both.

## Main screens

### 1. Login/Register

Fields:

- Name
- Phone/email
- Password
- Prosumer ID

### 2. Home Dashboard

Display:

```text
Battery SoC             78%
Available Capacity      12.4 kWh
Max Discharge           5 kW
Solar Generation        3.2 kW
Grid Status             NORMAL
Availability            AVAILABLE
```

### 3. Availability

Prosumer can configure:

- Available / unavailable
- Maximum discharge power
- Minimum battery reserve
- Preferred support hours
- Automatic/manual participation

### 4. Dispatch Request

Example:

```text
GRID SUPPORT REQUEST

Cluster: Kalamassery
Requested contribution: 4 kW
Duration: 2 hours
Estimated energy: 8 kWh
Estimated incentive: ₹80

[ ACCEPT ]   [ DECLINE ]
```

### 5. Active Dispatch

Display:

```text
DISPATCH ACTIVE

Requested:       4.0 kW
Current output:  3.8 kW
Duration:        02:00
Remaining:       01:34

Energy delivered: 1.7 kWh
Estimated reward: ₹17
```

### 6. Incentive Ledger

Show:

- Total energy supplied
- Total events
- Total incentives
- Pending settlement
- Completed events

### Mobile API requirements

The mobile developer should NOT directly access the database.

Use:

```text
Mobile App
    ↓
Backend API
    ↓
Database
```

---

# 6. Role 3 — KSEB Web Developer

## Product

**KSEB VPP Command Center**

Recommended:

- React
- Next.js or Vite
- TypeScript
- Tailwind CSS
- Leaflet / Mapbox for map

## Main pages

### 1. Operator Login

Only authorized KSEB operators can access the dashboard.

### 2. Main Dashboard

Display:

```text
Total Prosumers       128
Available Now         94
Available Capacity    642 kW
Active Requests       3
Current Support       118 kW
```

### 3. Cluster Map

Each cluster should show:

- Cluster name
- Number of prosumers
- Available kW
- Available kWh
- Average SoC
- Grid stress
- Active dispatch

Example:

```text
Cluster A
----------------
Prosumer count: 24
Available power: 126 kW
Available energy: 410 kWh
Average SoC: 74%
Status: HIGH STRESS
```

### 4. Dispatch Console

Operator enters:

```text
Cluster:
[ Cluster A ]

Target reduction:
[ 50 ] kW

Duration:
[ 2 ] hours

[ SEND REQUEST ]
```

### 5. Live Dispatch Monitoring

Display:

```text
REQUESTED       50 kW
ACCEPTED        46 kW
ACTIVE          44 kW
DELIVERED       41 kW

Status: ACTIVE
```

### 6. Event History

Display:

- Date/time
- Cluster
- Requested capacity
- Delivered capacity
- Duration
- Participating prosumers
- Total energy
- Total incentive

---

# 7. Role 4 — Backend/API Developer

## Most important integration role

The backend is the **handshake** between the mobile app and KSEB website.

The two frontends should never communicate directly.

```text
KSEB Website
     │
     ▼
   API
     │
     ▼
 VPP ENGINE
     │
     ▼
   API
     │
     ▼
Mobile Apps
```

## Suggested stack

Option A:

- Node.js
- Express
- TypeScript
- PostgreSQL

Option B:

- Python
- FastAPI
- PostgreSQL

For a rapid prototype, either is acceptable.

## Required API endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
```

### Prosumer

```http
GET  /api/prosumers/:id
POST /api/prosumers
PATCH /api/prosumers/:id/availability
GET  /api/prosumers/:id/capacity
```

### Clusters

```http
GET /api/clusters
GET /api/clusters/:id
GET /api/clusters/:id/prosumers
GET /api/clusters/:id/capacity
```

### Dispatch

```http
POST /api/dispatch
GET  /api/dispatch/:id
GET  /api/dispatch/:id/status
POST /api/dispatch/:id/respond
POST /api/dispatch/:id/complete
```

### Incentives

```http
GET /api/prosumers/:id/incentives
GET /api/dispatch/:id/settlement
```

---

# 8. Role 5 — Database Engineer

## Suggested database

PostgreSQL.

## Core tables

### users

```text
id
name
email
phone
password_hash
role
created_at
```

Roles:

```text
PROSUMER
KSEB_OPERATOR
ADMIN
```

### prosumers

```text
id
user_id
prosumer_code
cluster_id
latitude
longitude
solar_capacity_kw
battery_capacity_kwh
max_discharge_kw
minimum_reserve_soc
current_soc
availability_status
created_at
```

### clusters

```text
id
name
substation
latitude
longitude
grid_status
current_load_kw
available_capacity_kw
```

### telemetry

```text
id
prosumer_id
soc
solar_generation_kw
battery_power_kw
available_energy_kwh
timestamp
```

### dispatch_requests

```text
id
cluster_id
requested_kw
duration_minutes
status
created_by
created_at
started_at
completed_at
```

### dispatch_participants

```text
id
dispatch_id
prosumer_id
requested_kw
accepted_kw
delivered_kw
energy_delivered_kwh
status
```

### incentives

```text
id
prosumer_id
dispatch_id
energy_kwh
rate_per_kwh
amount
status
created_at
```

---

# 9. Role 6 — VPP Algorithm Developer

This person builds the **intelligence of the project**.

## Input

Example:

```text
Cluster A
Target = 50 kW
Duration = 2 hours
```

Available prosumers:

```text
P001 → max 5 kW → SoC 85%
P002 → max 3 kW → SoC 72%
P003 → max 7 kW → SoC 90%
P004 → max 2 kW → SoC 35%
P005 → max 5 kW → SoC 78%
...
```

## Eligibility rules

A prosumer can participate if:

```text
availability = AVAILABLE

AND

current_soc > minimum_reserve_soc

AND

max_discharge_kw > 0

AND

prosumer belongs to requested cluster
```

## Simple dispatch algorithm

For MVP:

1. Filter eligible prosumers.
2. Calculate available discharge capacity.
3. Sort by available capacity/SoC.
4. Allocate the requested power.
5. Send individual requests.
6. Collect acceptances.
7. Recalculate remaining requirement.
8. Redispatch if necessary.
9. Track actual delivered power.

### Example

KSEB requests:

```text
50 kW
```

VPP allocates:

```text
P001 → 5 kW
P002 → 3 kW
P003 → 7 kW
P005 → 5 kW
P006 → 4 kW
P007 → 6 kW
P008 → 5 kW
P009 → 5 kW
P010 → 5 kW
P011 → 5 kW
```

Total:

```text
50 kW
```

The exact allocation strategy can later be improved with:

- SoC weighting
- Battery reserve
- Fair participation
- Distance/electrical proximity
- Historical participation
- Response reliability

For the hackathon, a deterministic and explainable algorithm is preferable.

---

# 10. Role 7 — UI/UX Designer

## Design principle

Both products should look like parts of the same system.

### Shared design language

- Same typography
- Same icon style
- Same status colors
- Same terminology
- Same terminology for kW/kWh/SoC
- Consistent notification states

## Mobile priority

The prosumer should understand within seconds:

```text
How much energy can I provide?
Is KSEB requesting support?
How much will I earn?
What happens if I accept?
```

## KSEB priority

The operator should understand within seconds:

```text
Where is the grid stressed?
How much distributed capacity is available there?
How much can I request?
What happened after the request?
```

---

# 11. Role 8 — Testing & Integration

## Test the complete handshake

### Test Case 1 — Normal availability

```text
Prosumer sets:
AVAILABLE

Backend:
Stores status

KSEB:
Sees prosumer capacity
```

### Test Case 2 — Dispatch

```text
KSEB:
Requests 50 kW

Backend:
Finds eligible prosumers

Mobile:
Receives request

Prosumer:
Accepts

Backend:
Updates dispatch status

KSEB:
Sees accepted capacity
```

### Test Case 3 — Partial acceptance

```text
Requested = 50 kW
Accepted = 37 kW
```

Backend should display:

```text
Remaining requirement = 13 kW
```

and allocate the remaining requirement to other eligible prosumers.

### Test Case 4 — Prosumer unavailable

If a prosumer becomes unavailable:

```text
P007 = OFFLINE
```

the backend should exclude P007 from new dispatch allocations.

### Test Case 5 — Low SoC

If:

```text
SoC = 28%
Reserve = 30%
```

the prosumer should not be selected.

### Test Case 6 — Dispatch completion

After the event:

```text
Requested = 50 kW
Delivered = 47.8 kW
Duration = 2 hours
```

The backend should calculate the actual contribution and incentive.

---

# 12. Critical API Contract Between Teams

The backend team should publish the API specification before frontend development gets too far.

## Example: Available capacity

### Request

```http
GET /api/clusters/CL001/capacity
```

### Response

```json
{
  "clusterId": "CL001",
  "availablePowerKw": 126,
  "availableEnergyKwh": 410,
  "averageSoc": 74,
  "availableProsumers": 24
}
```

The KSEB website uses this response to display cluster capacity.

---

## Example: Dispatch creation

### KSEB sends

```json
{
  "clusterId": "CL001",
  "requestedPowerKw": 50,
  "durationMinutes": 120
}
```

### Backend returns

```json
{
  "dispatchId": "DSP1001",
  "status": "CREATED",
  "requestedPowerKw": 50,
  "durationMinutes": 120
}
```

---

## Example: Mobile request

The mobile app receives:

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
  "dispatchId": "DSP1001",
  "response": "ACCEPTED"
}
```

Backend updates the KSEB dashboard.

---

# 13. Real-Time Handshake

For the demo, REST APIs are sufficient for most operations.

For live dispatch status, use:

- WebSocket, or
- Server-Sent Events

If time is limited, implement REST polling first.

### Recommended MVP

```text
KSEB
  │
  │ POST dispatch
  ▼
Backend
  │
  │ create requests
  ▼
Database
  │
  │
  ▼
Mobile App
  │
  │ accept
  ▼
Backend
  │
  ▼
Database
  │
  ▼
KSEB Dashboard
```

### Optional advanced implementation

```text
Backend
   │
   ├── WebSocket → KSEB Dashboard
   │
   └── WebSocket → Mobile App
```

This makes the demo feel significantly more like a real VPP platform.

---

# 14. Simulation Layer

Because this is a software prototype, create a simulated telemetry generator.

Example:

```text
P001
SoC = 81%
Solar = 4.2 kW
Battery available = 8.5 kWh
Max discharge = 4 kW
Status = AVAILABLE
```

The simulator can periodically change:

- SoC
- Solar generation
- Battery power
- Availability
- Grid stress

This allows the dashboard to look alive during the demonstration.

## Example simulation

Every 5 seconds:

```text
P001 SoC: 81 → 80.8%
P002 SoC: 67 → 66.9%
P003 Solar: 4.2 → 4.7 kW
```

During dispatch:

```text
Battery power:
0 kW → 3 kW → 3 kW → 2.8 kW → 0 kW
```

---

# 15. Suggested Technology Stack

## Mobile

```text
Flutter
Dart
```

## KSEB Dashboard

```text
React
TypeScript
Tailwind CSS
Leaflet
```

## Backend

```text
FastAPI
Python
```

or:

```text
Node.js
Express
TypeScript
```

## Database

```text
PostgreSQL
```

## Real-time communication

```text
WebSocket
```

## Authentication

```text
JWT
```

## Deployment

Possible prototype deployment:

```text
Frontend → Vercel
Backend → Render/Railway
Database → Supabase/Neon
```

Use whichever services the team is already comfortable with.

---

# 16. GitHub Workflow

## Branches

```text
main
develop

feature/mobile-app
feature/kseb-dashboard
feature/backend
feature/database
feature/vpp-engine
feature/simulation
feature/testing
```

## Rules

Do not directly modify `main`.

Each developer:

```text
git checkout -b feature/your-feature
```

Then:

```text
git add .
git commit -m "Add dispatch request screen"
git push
```

Create a pull request into `develop`.

After integration testing, merge `develop` into `main`.

---

# 17. Definition of Done

A feature is complete only when:

- UI is implemented
- Backend endpoint exists if required
- Database integration works
- Error states are handled
- Feature is tested
- Feature is connected to the other relevant component
- Code is pushed to GitHub
- Another team member can run it locally

---

# 18. Minimum Viable Demo

If development time becomes limited, prioritize this exact flow:

### Step 1

Create 20–50 simulated prosumers.

### Step 2

Show them on the KSEB dashboard.

### Step 3

Show available capacity for each cluster.

### Step 4

Mark one cluster as:

```text
HIGH GRID STRESS
```

### Step 5

KSEB operator clicks:

```text
REQUEST SUPPORT
```

and enters:

```text
50 kW
2 hours
```

### Step 6

Backend selects eligible prosumers.

### Step 7

Mobile apps receive requests.

### Step 8

Some prosumers accept.

### Step 9

Dashboard immediately changes:

```text
Requested: 50 kW
Accepted: 44 kW
Delivered: 41 kW
```

### Step 10

After completion:

```text
Energy delivered
+
Prosumer contribution
+
Incentive
```

are recorded.

This is the core demonstration.

---

# 19. Final Demo Narrative

The entire product should be explainable in one sentence:

> **KSEB identifies a stressed grid cluster, requests temporary power support, and our VPP automatically finds available prosumer capacity, distributes the request through the mobile app, tracks the response, and calculates the prosumer's incentive.**

### Demo sequence

```text
GRID STRESS
     ↓
KSEB SELECTS CLUSTER
     ↓
KSEB REQUESTS 50 kW
     ↓
VPP FINDS AVAILABLE BATTERIES
     ↓
MOBILE APPS RECEIVE REQUEST
     ↓
PROSUMERS ACCEPT
     ↓
VPP AGGREGATES RESPONSE
     ↓
KSEB SEES LIVE DELIVERY
     ↓
EVENT COMPLETES
     ↓
INCENTIVES CALCULATED
```

---

# 20. Team Coordination Checklist

## Before development

- [ ] Finalize technology stack
- [ ] Create GitHub repository
- [ ] Finalize database schema
- [ ] Finalize API contracts
- [ ] Finalize mobile wireframes
- [ ] Finalize KSEB dashboard wireframes
- [ ] Create sample prosumer data
- [ ] Define cluster IDs

## During development

- [ ] Backend running locally
- [ ] Database connected
- [ ] Mobile app connected to API
- [ ] KSEB dashboard connected to API
- [ ] Dispatch API working
- [ ] Prosumer response API working
- [ ] Live status working
- [ ] Incentive calculation working
- [ ] Simulation working

## Before final demo

- [ ] Test complete handshake
- [ ] Test failed/declined request
- [ ] Test partial capacity
- [ ] Test low SoC exclusion
- [ ] Test dispatch completion
- [ ] Test incentive calculation
- [ ] Seed realistic demo data
- [ ] Deploy backend
- [ ] Deploy website
- [ ] Build/install mobile APK
- [ ] Prepare fallback demo data

---

# 21. Important Product Boundary

This prototype should represent a **VPP coordination and demand-response platform**.

It should not claim that the prototype directly controls KSEB's physical grid.

For the demonstration:

```text
Realistic data model
+
Simulated grid telemetry
+
Simulated battery response
+
Real API communication
+
Real-time UI updates
=
Convincing VPP prototype
```

The key technical achievement is the **handshake between KSEB's dispatch request and distributed prosumer responses**.

That handshake is the heart of the project.
