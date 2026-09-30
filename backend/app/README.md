# KSEB VPP Backend — Developer Guide

This folder contains the complete backend for the KSEB Virtual Power Plant hackathon prototype.

---

## Stack

| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| RLS | Supabase Row Level Security |
| Edge Functions | Supabase Edge Functions (Deno/TypeScript) |
| API wrapper | FastAPI (Python) — optional |
| Simulator | Python script |

---

## Folder structure

```
backend/app/
├── core/                    # Config + Supabase client
│   ├── config.py
│   └── supabase_client.py
├── services/                # Business logic
│   ├── prosumer_service.py
│   ├── cluster_service.py
│   ├── dispatch_service.py
│   └── incentive_service.py
├── api/                     # FastAPI routes
│   ├── main.py
│   ├── prosumer.py
│   ├── cluster.py
│   └── dispatch.py
├── simulation/
│   └── telemetry_simulator.py
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   ← Run first
│   │   ├── 002_rls.sql              ← Run second
│   │   └── 003_views.sql            ← Run third
│   ├── functions/
│   │   ├── create-dispatch/index.ts
│   │   ├── allocate-dispatch/index.ts
│   │   └── complete-dispatch/index.ts
│   └── seed/
│       └── demo_data.sql            ← Run last
├── .env.example
├── requirements.txt
└── README.md                        ← You are here
```

---

## Step 1 — Create Supabase project (you do this manually)

1. Go to [https://supabase.com](https://supabase.com)
2. Click **New project**
3. Choose a name (e.g. `kseb-vpp-hackathon`) and a strong password
4. Select a region close to India (e.g. **ap-south-1** Singapore or Mumbai)
5. Wait for the project to be ready (~2 minutes)
6. Go to **Settings → API**
7. Copy:
   - `Project URL`
   - `anon / public` key
   - `service_role` key (keep secret)

---

## Step 2 — Set up .env

```bash
cp .env.example .env
```

Edit `.env` with your project values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
INCENTIVE_RATE_PER_KWH=10.0
```

---

## Step 3 — Run SQL migrations (you do this in Supabase SQL Editor)

In your Supabase project, go to **SQL Editor** and run each file in order:

### 3a. Initial schema
Copy and run: `supabase/migrations/001_initial_schema.sql`

### 3b. Row Level Security
Copy and run: `supabase/migrations/002_rls.sql`

### 3c. Views
Copy and run: `supabase/migrations/003_views.sql`

### 3d. Seed demo data
Copy and run: `supabase/seed/demo_data.sql`

---

## Step 4 — Enable Realtime (manual — Supabase dashboard)

Go to **Database → Replication** in Supabase and enable Realtime for:

- `dispatch_requests`
- `dispatch_participants`
- `prosumers`
- `telemetry`
- `incentives`

Or run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE prosumers;
ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE incentives;
```

---

## Step 5 — Install Python dependencies

```bash
cd backend/app
pip install -r requirements.txt
```

---

## Step 6 — Run the telemetry simulator

```bash
cd backend/app
python -m simulation.telemetry_simulator
```

This will update prosumer SoC, solar generation, and battery power every 5 seconds.

---

## Step 7 — Run the FastAPI server (optional, for REST API)

```bash
cd backend/app
uvicorn api.main:app --reload
```

API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Step 8 — Deploy Edge Functions (optional, for production flow)

```bash
# Install Supabase CLI first
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-dispatch
supabase functions deploy allocate-dispatch
supabase functions deploy complete-dispatch
```

---

## Core dispatch flow (how it works)

```
1. KSEB creates dispatch     POST /dispatch/
                                 ↓
2. Allocate prosumers        POST /dispatch/{id}/allocate
   - Find AVAILABLE prosumers with SoC > min_reserve
   - Sort by SoC desc, discharge capacity desc
   - Create dispatch_participants (PENDING)
                                 ↓
3. Prosumers respond         POST /dispatch/{id}/respond
   - Supabase Realtime notifies mobile app
   - Prosumer taps ACCEPT/DECLINE
   - Dispatch status → ACTIVE or PARTIAL
                                 ↓
4. Simulate delivery         Telemetry simulator runs
                                 ↓
5. Complete dispatch         POST /dispatch/{id}/complete
   - Calculate energy_delivered_kwh per participant
   - Create incentive records
   - dispatch_requests.status → COMPLETED
```

---

## Environment variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key (safe for frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only, never commit) |
| `INCENTIVE_RATE_PER_KWH` | INR rate for incentive calculation (default: 10) |
| `SIMULATOR_INTERVAL_SECONDS` | How often the simulator ticks (default: 5) |

---

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. **Never expose it to the frontend.**
- The `.env` file is in `.gitignore`. Never commit it.
- RLS policies enforce that prosumers can only see their own data.
- Edge Functions use the service role internally but are called with user JWTs.
