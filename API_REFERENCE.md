# KSEB VPP — Backend API Reference

> **For collaborators building the mobile app or web dashboard.**  
> This document is the single source of truth for all backend API contracts, Supabase table access patterns, Realtime subscriptions, and auth flows.

---

## Table of Contents

1. [Connection Details](#1-connection-details)
2. [Authentication](#2-authentication)
3. [User Roles](#3-user-roles)
4. [Direct Supabase Access (preferred)](#4-direct-supabase-access-preferred)
5. [REST API Endpoints (FastAPI)](#5-rest-api-endpoints-fastapi)
6. [Edge Functions](#6-edge-functions)
7. [Realtime Subscriptions](#7-realtime-subscriptions)
8. [Database Tables — Quick Reference](#8-database-tables--quick-reference)
9. [Enum Values](#9-enum-values)
10. [Common Response Shapes](#10-common-response-shapes)
11. [Error Handling](#11-error-handling)
12. [End-to-End Flow Examples](#12-end-to-end-flow-examples)
13. [Supabase JS Cheatsheet](#13-supabase-js-cheatsheet)

---

## 1. Connection Details

Get these values from the backend team (or from Supabase → Settings → API).

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<public anon key>
```

> **Never** use the `service_role` key in a mobile app or browser. That is server-side only.

### Installing the Supabase client

```bash
# JavaScript / TypeScript (React Native, Next.js, Vite)
npm install @supabase/supabase-js

# Flutter / Dart
flutter pub add supabase_flutter
```

### Initialising

```ts
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

---

## 2. Authentication

All authentication is handled by **Supabase Auth**. Do not build a custom login system.

### Sign up (new prosumer)

```ts
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "strongpassword",
  options: {
    data: {
      name: "Ravi Kumar",
      role: "PROSUMER",   // or KSEB_OPERATOR
    },
  },
});
```

> A `profiles` row is automatically created by a database trigger on sign-up.

---

### Sign in

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "strongpassword",
});

const session = data.session;    // contains access_token
const user    = data.user;       // contains user.id (UUID)
```

---

### Sign out

```ts
await supabase.auth.signOut();
```

---

### Get current user (on app start)

```ts
const { data: { user } } = await supabase.auth.getUser();
```

---

### Auth state listener

```ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN")  { /* navigate to home */ }
  if (event === "SIGNED_OUT") { /* navigate to login */ }
});
```

---

## 3. User Roles

| Role | Who | Access |
|---|---|---|
| `PROSUMER` | Home battery/solar owner | Own profile, telemetry, dispatches assigned to them, own incentives |
| `KSEB_OPERATOR` | KSEB grid operator | All clusters, all prosumers (read), create dispatches, monitor |
| `ADMIN` | System admin | Full access including seed/reset |

Role is stored in `profiles.role` and read by RLS policies automatically.  
You don't need to pass the role manually — Supabase reads it from the session.

---

## 4. Direct Supabase Access (preferred)

For most reads and simple writes, use the Supabase client directly. RLS enforces access rules automatically.

---

### 4.1 Get current user's profile

```ts
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Ravi Kumar",
  "phone": "+91-9876543210",
  "role": "PROSUMER",
  "created_at": "2026-09-30T08:00:00Z"
}
```

---

### 4.2 Get own prosumer record

```ts
const { data: prosumer } = await supabase
  .from("prosumers")
  .select("*")
  .eq("user_id", user.id)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "prosumer_code": "P001",
  "cluster_id": "uuid",
  "solar_capacity_kw": 5,
  "battery_capacity_kwh": 13.5,
  "max_discharge_kw": 5,
  "minimum_reserve_soc": 20,
  "current_soc": 85,
  "availability_status": "AVAILABLE",
  "participation_mode": "MANUAL"
}
```

---

### 4.3 Update availability

```ts
await supabase
  .from("prosumers")
  .update({ availability_status: "UNAVAILABLE" })
  .eq("user_id", user.id);
```

Valid values: `AVAILABLE` | `UNAVAILABLE` | `OFFLINE`

---

### 4.4 Get all clusters (with capacity data)

```ts
const { data: clusters } = await supabase
  .from("cluster_capacity_view")
  .select("*");
```

**Response (array):**
```json
[
  {
    "cluster_id": "uuid",
    "cluster_name": "Kalamassery",
    "substation": "KSB-KLM",
    "grid_status": "HIGH_STRESS",
    "current_load_kw": 820,
    "available_prosumers": 7,
    "total_prosumers": 8,
    "available_power_kw": 34.0,
    "available_energy_kwh": 96.2,
    "average_soc": 80.4
  }
]
```

---

### 4.5 Get prosumers in a cluster (KSEB dashboard)

```ts
const { data: prosumers } = await supabase
  .from("prosumers")
  .select("id, prosumer_code, current_soc, max_discharge_kw, availability_status, solar_capacity_kw")
  .eq("cluster_id", clusterId);
```

---

### 4.6 Get dispatch requests assigned to the current prosumer

```ts
// First get the prosumer's id
const { data: prosumer } = await supabase
  .from("prosumers")
  .select("id")
  .eq("user_id", user.id)
  .single();

// Then get their dispatch participants
const { data: assignments } = await supabase
  .from("dispatch_participants")
  .select(`
    id,
    requested_kw,
    accepted_kw,
    status,
    created_at,
    dispatch_requests (
      id,
      requested_kw,
      duration_minutes,
      status,
      created_at
    )
  `)
  .eq("prosumer_id", prosumer.id)
  .eq("status", "PENDING");   // filter to pending only
```

---

### 4.7 Prosumer responds to a dispatch (direct DB write)

```ts
await supabase
  .from("dispatch_participants")
  .update({
    status: "ACCEPTED",
    accepted_kw: 4.5,
    responded_at: new Date().toISOString(),
  })
  .eq("dispatch_id", dispatchId)
  .eq("prosumer_id", prosumerId);
```

Or to decline:
```ts
await supabase
  .from("dispatch_participants")
  .update({
    status: "DECLINED",
    responded_at: new Date().toISOString(),
  })
  .eq("dispatch_id", dispatchId)
  .eq("prosumer_id", prosumerId);
```

---

### 4.8 Get own incentive history

```ts
const { data: incentives } = await supabase
  .from("incentives")
  .select(`
    id,
    energy_kwh,
    rate_per_kwh,
    amount,
    status,
    created_at,
    dispatch_requests ( created_at, duration_minutes )
  `)
  .eq("prosumer_id", prosumerId)
  .order("created_at", { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "energy_kwh": 8.5,
    "rate_per_kwh": 10,
    "amount": 85.0,
    "status": "CALCULATED",
    "created_at": "2026-09-30T10:00:00Z"
  }
]
```

---

### 4.9 Get own telemetry history

```ts
const { data: telemetry } = await supabase
  .from("telemetry")
  .select("soc, solar_generation_kw, battery_power_kw, available_energy_kwh, timestamp")
  .eq("prosumer_id", prosumerId)
  .order("timestamp", { ascending: false })
  .limit(20);
```

---

### 4.10 Get dispatch summary (KSEB dashboard)

```ts
const { data: dispatches } = await supabase
  .from("dispatch_summary_view")
  .select("*")
  .order("created_at", { ascending: false });
```

**Response:**
```json
[
  {
    "dispatch_id": "uuid",
    "cluster_name": "Kalamassery",
    "requested_kw": 50,
    "duration_minutes": 120,
    "status": "ACTIVE",
    "total_participants": 10,
    "accepted_count": 8,
    "declined_count": 1,
    "pending_count": 1,
    "accepted_kw": 42.5,
    "delivered_kw": 42.5,
    "energy_delivered_kwh": 85.0
  }
]
```

---

## 5. REST API Endpoints (FastAPI)

Base URL: `http://localhost:8000` (dev) or your deployed server URL.

> The FastAPI server is an **optional** wrapper. For most operations, prefer direct Supabase queries (Section 4). Use the REST API for complex server-side operations or when the Edge Functions are not deployed.

---

### Health check

```
GET /health
```
```json
{ "status": "ok", "service": "KSEB VPP Backend" }
```

---

### Prosumer

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/prosumer/me` | PROSUMER | Get own profile + prosumer data |
| `PATCH` | `/prosumer/availability` | PROSUMER | Update availability status |
| `GET` | `/prosumer/telemetry` | PROSUMER | Get recent telemetry |
| `GET` | `/prosumer/incentives` | PROSUMER | Get incentive history |

All prosumer endpoints require the header:
```
x-user-id: <supabase user UUID>
```
(For PATCH availability and telemetry/incentives, also send `x-prosumer-id: <prosumer UUID>`)

#### GET /prosumer/me

```http
GET /prosumer/me
x-user-id: 3a4b5c6d-...
```

#### PATCH /prosumer/availability

```http
PATCH /prosumer/availability
x-prosumer-id: 22000000-...
Content-Type: application/json

{
  "availability_status": "AVAILABLE"
}
```

---

### Clusters

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/clusters/` | Any | List all clusters with capacity data |
| `GET` | `/clusters/{id}` | Any | Single cluster detail |
| `GET` | `/clusters/{id}/prosumers` | Any | Prosumers in a cluster |

```http
GET /clusters/
```
```json
[
  {
    "cluster_id": "11111111-0000-0000-0000-000000000001",
    "cluster_name": "Kalamassery",
    "grid_status": "HIGH_STRESS",
    "available_prosumers": 7,
    "available_power_kw": 34.0,
    "available_energy_kwh": 96.2,
    "average_soc": 80.4
  }
]
```

---

### Dispatch

| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/dispatch/` | KSEB_OPERATOR | Create a new dispatch request |
| `POST` | `/dispatch/{id}/allocate` | KSEB_OPERATOR | Run allocation algorithm |
| `POST` | `/dispatch/{id}/respond` | PROSUMER | Accept or decline |
| `POST` | `/dispatch/{id}/complete` | KSEB_OPERATOR | Complete + calculate incentives |
| `GET` | `/dispatch/{id}` | KSEB_OPERATOR | Get dispatch with participants |

#### POST /dispatch/ — Create dispatch

```http
POST /dispatch/
x-user-id: <kseb-operator-user-uuid>
Content-Type: application/json

{
  "cluster_id": "11111111-0000-0000-0000-000000000001",
  "requested_kw": 50,
  "duration_minutes": 120
}
```

**Response:**
```json
{
  "id": "uuid",
  "cluster_id": "uuid",
  "requested_kw": 50,
  "duration_minutes": 120,
  "status": "CREATED",
  "created_by": "uuid",
  "created_at": "2026-09-30T09:00:00Z"
}
```

---

#### POST /dispatch/{id}/allocate — Run allocation

```http
POST /dispatch/abc-123/allocate
```

**Response:**
```json
{
  "dispatch_id": "abc-123",
  "target_kw": 50,
  "allocated_kw": 47.5,
  "remaining_kw": 2.5,
  "participants_count": 10
}
```

> Dispatch status becomes `AWAITING_RESPONSES`. Prosumers receive a Realtime event.

---

#### POST /dispatch/{id}/respond — Prosumer responds

```http
POST /dispatch/abc-123/respond
x-prosumer-id: <prosumer-uuid>
Content-Type: application/json

{
  "response": "ACCEPTED",
  "accepted_kw": 4.5
}
```

Or to decline:
```json
{
  "response": "DECLINED"
}
```

---

#### POST /dispatch/{id}/complete — Complete dispatch

```http
POST /dispatch/abc-123/complete
```

**Response:**
```json
{
  "dispatch_id": "abc-123",
  "participants_completed": 8,
  "total_energy_kwh": 68.0,
  "total_incentive_inr": 680.0
}
```

---

#### GET /dispatch/{id} — Dispatch detail with participants

```http
GET /dispatch/abc-123
```

**Response:**
```json
{
  "id": "abc-123",
  "cluster_id": "uuid",
  "requested_kw": 50,
  "duration_minutes": 120,
  "status": "ACTIVE",
  "participants": [
    {
      "id": "uuid",
      "prosumer_id": "uuid",
      "requested_kw": 5,
      "accepted_kw": 5,
      "status": "ACCEPTED",
      "prosumers": {
        "prosumer_code": "P001",
        "current_soc": 85,
        "max_discharge_kw": 5
      }
    }
  ]
}
```

---

## 6. Edge Functions

These are deployed as Supabase Edge Functions and are the **preferred server-side option** (faster, no separate server needed).

Base URL: `https://<project-ref>.supabase.co/functions/v1`

All edge functions require:
```http
Authorization: Bearer <supabase-jwt-access-token>
Content-Type: application/json
```

---

### create-dispatch

```http
POST /functions/v1/create-dispatch
Authorization: Bearer <kseb-operator-jwt>

{
  "cluster_id": "11111111-0000-0000-0000-000000000001",
  "requested_kw": 50,
  "duration_minutes": 120
}
```

---

### allocate-dispatch

```http
POST /functions/v1/allocate-dispatch
Authorization: Bearer <kseb-operator-jwt>

{
  "dispatch_id": "abc-123"
}
```

---

### complete-dispatch

```http
POST /functions/v1/complete-dispatch
Authorization: Bearer <kseb-operator-jwt>

{
  "dispatch_id": "abc-123"
}
```

---

### Calling edge functions from the Supabase JS client

```ts
// Create dispatch (from KSEB dashboard)
const { data, error } = await supabase.functions.invoke("create-dispatch", {
  body: {
    cluster_id: "11111111-0000-0000-0000-000000000001",
    requested_kw: 50,
    duration_minutes: 120,
  },
});

// Allocate
const { data, error } = await supabase.functions.invoke("allocate-dispatch", {
  body: { dispatch_id: data.dispatch.id },
});

// Complete
const { data, error } = await supabase.functions.invoke("complete-dispatch", {
  body: { dispatch_id: "abc-123" },
});
```

---

## 7. Realtime Subscriptions

Supabase Realtime broadcasts database changes to subscribed clients.  
This is how the KSEB dashboard sees prosumer responses live, and how the mobile app receives dispatch requests.

---

### Mobile app — Listen for new dispatch assignments

```ts
const prosumerId = "22000000-..."; // current prosumer's ID

const channel = supabase
  .channel("my-dispatch-assignments")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "dispatch_participants",
      filter: `prosumer_id=eq.${prosumerId}`,
    },
    (payload) => {
      console.log("New dispatch assigned:", payload.new);
      // Show dispatch request notification to user
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

---

### KSEB Dashboard — Watch dispatch response progress

```ts
const dispatchId = "abc-123";

const channel = supabase
  .channel("dispatch-responses")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "dispatch_participants",
      filter: `dispatch_id=eq.${dispatchId}`,
    },
    (payload) => {
      console.log("Participant updated:", payload.new);
      // Re-fetch aggregate accepted_kw and update UI
    }
  )
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "dispatch_requests",
      filter: `id=eq.${dispatchId}`,
    },
    (payload) => {
      console.log("Dispatch status changed:", payload.new.status);
    }
  )
  .subscribe();
```

---

### Dashboard — Live telemetry feed

```ts
const channel = supabase
  .channel("live-telemetry")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "telemetry",
    },
    (payload) => {
      // Update SoC gauge, solar chart, battery chart
      updateProsumerTile(payload.new.prosumer_id, payload.new);
    }
  )
  .subscribe();
```

---

### Live cluster status

```ts
const channel = supabase
  .channel("cluster-status")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "clusters",
    },
    (payload) => {
      updateClusterCard(payload.new.id, payload.new.grid_status, payload.new.current_load_kw);
    }
  )
  .subscribe();
```

---

## 8. Database Tables — Quick Reference

| Table | Description | Who reads | Who writes |
|---|---|---|---|
| `profiles` | User name, role | Self (prosumer), KSEB | Signup trigger, self |
| `clusters` | Grid clusters | Everyone | Admin, simulator |
| `prosumers` | VPP prosumer data | Self, KSEB | Self (availability), simulator |
| `telemetry` | Simulated telemetry | Self, KSEB | Simulator only |
| `dispatch_requests` | KSEB grid support requests | Assigned prosumers, KSEB | KSEB operator / Edge Function |
| `dispatch_participants` | Per-prosumer dispatch assignments | Self (prosumer), KSEB | Allocator (server), prosumer (respond) |
| `incentives` | Earnings per dispatch | Self (prosumer), KSEB | complete-dispatch function |

### Views (read-only, no writes)

| View | Description |
|---|---|
| `cluster_capacity_view` | Aggregated cluster data for dashboard |
| `dispatch_summary_view` | Per-dispatch accepted/delivered totals |

---

## 9. Enum Values

### `profiles.role`
| Value | Meaning |
|---|---|
| `PROSUMER` | Home battery/solar owner |
| `KSEB_OPERATOR` | KSEB grid operator |
| `ADMIN` | System administrator |

### `prosumers.availability_status`
| Value | Meaning |
|---|---|
| `AVAILABLE` | Ready to participate in dispatch |
| `UNAVAILABLE` | Online but opted out |
| `OFFLINE` | Not reachable |

### `prosumers.participation_mode`
| Value | Meaning |
|---|---|
| `AUTOMATIC` | Auto-accept dispatches |
| `MANUAL` | Prosumer must tap Accept |

### `dispatch_requests.status`
| Value | Meaning |
|---|---|
| `CREATED` | Just created, not yet allocated |
| `ALLOCATING` | Finding eligible prosumers |
| `AWAITING_RESPONSES` | Participants notified, waiting |
| `ACTIVE` | Enough prosumers accepted, running |
| `PARTIAL` | Running but below target capacity |
| `COMPLETED` | Finished, incentives calculated |
| `CANCELLED` | Cancelled by operator |

### `dispatch_participants.status`
| Value | Meaning |
|---|---|
| `PENDING` | Prosumer notified, no response yet |
| `ACCEPTED` | Prosumer accepted |
| `DECLINED` | Prosumer declined |
| `ACTIVE` | Actively discharging |
| `COMPLETED` | Dispatch ended |
| `EXCLUDED` | Removed from dispatch |

### `incentives.status`
| Value | Meaning |
|---|---|
| `PENDING` | Not yet calculated |
| `CALCULATED` | Amount determined |
| `SETTLED` | Simulated payment done |

### `clusters.grid_status`
| Value | UI indicator |
|---|---|
| `NORMAL` | Green |
| `WARNING` | Yellow |
| `HIGH_STRESS` | Orange |
| `CRITICAL` | Red — dispatch should be triggered |

---

## 10. Common Response Shapes

### Prosumer object
```json
{
  "id": "22000000-0000-0000-0000-000000000001",
  "prosumer_code": "P001",
  "cluster_id": "11111111-0000-0000-0000-000000000001",
  "solar_capacity_kw": 5,
  "battery_capacity_kwh": 13.5,
  "max_discharge_kw": 5,
  "minimum_reserve_soc": 20,
  "current_soc": 85.0,
  "availability_status": "AVAILABLE",
  "participation_mode": "MANUAL"
}
```

### Telemetry record
```json
{
  "id": "uuid",
  "prosumer_id": "uuid",
  "soc": 82.4,
  "solar_generation_kw": 4.2,
  "battery_power_kw": 3.0,
  "available_energy_kwh": 8.5,
  "timestamp": "2026-09-30T09:05:00Z"
}
```

### Dispatch participant
```json
{
  "id": "uuid",
  "dispatch_id": "uuid",
  "prosumer_id": "uuid",
  "requested_kw": 5,
  "accepted_kw": 5,
  "delivered_kw": 5,
  "energy_delivered_kwh": 10,
  "status": "COMPLETED",
  "responded_at": "2026-09-30T09:02:00Z"
}
```

### Incentive record
```json
{
  "id": "uuid",
  "prosumer_id": "uuid",
  "dispatch_id": "uuid",
  "energy_kwh": 10,
  "rate_per_kwh": 10,
  "amount": 100.0,
  "status": "CALCULATED",
  "created_at": "2026-09-30T11:00:00Z"
}
```

---

## 11. Error Handling

### Supabase client errors

```ts
const { data, error } = await supabase.from("prosumers").select("*").single();

if (error) {
  console.error(error.message);  // "JSON object requested, multiple (or no) rows returned"
  // handle error
}
```

### Common error codes

| Code | Meaning |
|---|---|
| `PGRST116` | No rows found (`.single()` returned nothing) |
| `42501` | RLS violation — user doesn't have permission |
| `23505` | Unique constraint violation |

### FastAPI REST errors

All errors return:
```json
{
  "detail": "Human-readable error message"
}
```
with appropriate HTTP status codes (`400`, `401`, `403`, `404`, `500`).

---

## 12. End-to-End Flow Examples

### Mobile app — Prosumer dispatch flow

```ts
// 1. Listen for incoming dispatch assignment
supabase.channel("dispatches")
  .on("postgres_changes", {
    event: "INSERT",
    table: "dispatch_participants",
    filter: `prosumer_id=eq.${prosumerId}`,
  }, async (payload) => {
    const assignment = payload.new;

    // 2. Fetch dispatch details
    const { data: dispatch } = await supabase
      .from("dispatch_requests")
      .select("requested_kw, duration_minutes, clusters(name)")
      .eq("id", assignment.dispatch_id)
      .single();

    // 3. Show notification to user
    showDispatchModal({
      requestedKw: assignment.requested_kw,
      durationMinutes: dispatch.duration_minutes,
      estimatedEarnings: assignment.requested_kw * (dispatch.duration_minutes / 60) * 10,
    });
  })
  .subscribe();

// 4. User taps Accept
async function acceptDispatch(dispatchId: string, acceptedKw: number) {
  await supabase
    .from("dispatch_participants")
    .update({
      status: "ACCEPTED",
      accepted_kw: acceptedKw,
      responded_at: new Date().toISOString(),
    })
    .eq("dispatch_id", dispatchId)
    .eq("prosumer_id", prosumerId);
}
```

---

### KSEB dashboard — Create and monitor dispatch

```ts
// 1. Operator clicks "Create Dispatch"
const { data: dispatch } = await supabase.functions.invoke("create-dispatch", {
  body: { cluster_id: selectedClusterId, requested_kw: 50, duration_minutes: 120 },
});

// 2. Run allocation
await supabase.functions.invoke("allocate-dispatch", {
  body: { dispatch_id: dispatch.dispatch.id },
});

// 3. Watch responses in real time
supabase.channel("watch-dispatch")
  .on("postgres_changes", {
    event: "UPDATE",
    table: "dispatch_participants",
    filter: `dispatch_id=eq.${dispatch.dispatch.id}`,
  }, (payload) => {
    refreshDispatchSummary(); // re-query dispatch_summary_view
  })
  .subscribe();

// 4. When dispatch window ends, complete it
await supabase.functions.invoke("complete-dispatch", {
  body: { dispatch_id: dispatch.dispatch.id },
});
```

---

## 13. Supabase JS Cheatsheet

```ts
// Select with filter
supabase.from("table").select("col1, col2").eq("field", value)

// Select with join (foreign key)
supabase.from("dispatch_participants")
  .select("*, prosumers(prosumer_code, current_soc)")

// Insert
supabase.from("table").insert({ col: value })

// Update
supabase.from("table").update({ col: newValue }).eq("id", id)

// Single row
.single()              // throws if 0 or >1 rows
.maybeSingle()         // returns null if no row

// Ordering and pagination
.order("created_at", { ascending: false })
.limit(20)
.range(0, 9)           // pagination

// Realtime — subscribe to all changes on a table
supabase.channel("name")
  .on("postgres_changes", { event: "*", schema: "public", table: "tablename" }, handler)
  .subscribe()

// Call edge function
supabase.functions.invoke("function-name", { body: { key: value } })
```

---

*Last updated: 2026-09-30 — KSEB VPP Hackathon Backend Team*
