# KSEB VPP Prosumer Mobile App ⚡🔋

A high-performance React Native (Expo) mobile application developed for the **KSEB Virtual Power Plant (VPP)** decentralized peak load management system.

The app enables green energy prosumers (residential/commercial solar + battery storage owners) across Kerala substations (Kalamassery, Kakkanad, Aluva, Edappally, Thrippunithura) to monitor their battery State of Charge (SoC), participate in automated grid peak demand response, respond to real-time KSEB dispatch requests, and track their earned financial incentives.

---

## 📱 Features

1. **Authentication & Profile Management**
   - Supabase Auth integration (email/password login and registration)
   - Cluster assignment to local 110kV/66kV/220kV KSEB substations
   - Quick 1-tap demo logins for hackathon evaluation (`P001` Anoop Kumar, `P002` Reshma Nair, `P003` Deepak Varma)

2. **Real-Time SoC & Capacity Dashboard**
   - Battery State of Charge (SoC) gauge with reserve threshold line marker
   - Real-time charging / discharging power indicators
   - Rooftop solar PV generation tracking
   - Available grid-exportable energy (`kWh`) above home safety reserve
   - Instant VPP participation switch (`AVAILABLE` ↔ `UNAVAILABLE`)

3. **Incoming Grid Support Dispatch Requests**
   - High-priority modal popup when KSEB operators initiate peak load reduction
   - Full event parameters: Cluster name, requested kW, duration (hours), estimated kWh, and estimated incentive (₹)
   - Battery reserve impact preview (projected final SoC ensuring home safety buffer)
   - Interactive **[ ACCEPT REQUEST ]** and **[ DECLINE ]** actions

4. **Active Dispatch Real-Time Monitoring**
   - Live requested power vs actual delivered power (`kW`)
   - Event duration countdown timer (`01:34:00` remaining)
   - Live energy delivered counter (`kWh`)
   - Real-time accumulated reward counter (`₹`)

5. **Incentive Ledger & Bill Credits**
   - Total earnings tracker in INR (`₹10.00 / kWh` standard feed-in rate)
   - Breakdown of settled credits (deducted from KSEB electricity bills) vs pending settlement
   - Itemized history with event dates, substation cluster, energy supplied, and status badges (`SETTLED`, `CALCULATED`, `PENDING`)

6. **Prosumer Preferences & Inverter Controls**
   - Minimum Reserve SoC protection buffer (15%, 20%, 25%, 30%)
   - Maximum allowed discharge power (3.0 kW, 4.0 kW, 5.0 kW, 7.0 kW)
   - Operating mode: `AUTOMATIC` (auto-dispatch) vs `MANUAL` (prompt on every event)
   - Preferred support window (e.g. 18:00 – 22:00 Kerala Evening Peak)

---

## 🔌 Backend Handshake & Architecture

The mobile app integrates directly with the Supabase database and Realtime engine using `@supabase/supabase-js`:

```
┌────────────────────────────────┐
│   Prosumer Mobile App (Expo)   │
└───────────────┬────────────────┘
                │
                │ Supabase JS Client & Realtime WebSocket
                ▼
┌────────────────────────────────────────────────────────┐
│                    Supabase Backend                    │
│                                                        │
│ • profiles              - User role & metadata         │
│ • prosumers             - Battery capacity, SoC, mode  │
│ • clusters              - Substation & grid stress     │
│ • telemetry             - Live generation & battery kW │
│ • dispatch_requests     - KSEB operator demand events  │
│ • dispatch_participants - Prosumer allocation & status │
│ • incentives            - Financial earnings ledger    │
└────────────────────────────────────────────────────────┘
```

### Realtime Channels:
- **`dispatch_participants`**: Listens for `INSERT` events filtered by `prosumer_id` to trigger the **Grid Support Request** alert modal instantly when KSEB allocates a dispatch.
- **`telemetry`**: Streams battery and solar measurements directly to the dashboard.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Note: If `.env` is omitted, the app gracefully operates in full interactive Demo Mode with simulated live telemetry and preloaded Kerala substation clusters).*

### 3. Run the App
To start Expo:
```bash
npm start
```

- **iOS / Android**: Scan the QR code using the **Expo Go** app on your phone.
- **Web Preview**: Press `w` in terminal or run:
  ```bash
  npm run web
  ```

---

## 🎯 Hackathon Demo Tips

1. **Test Incoming Dispatch Alert**: Tap the **"Test Alert"** button on the top right header to simulate an incoming KSEB dispatch request (`4 kW, 2 hours, ₹80`).
2. **Accept Request**: Tap **[ ACCEPT REQUEST ]** to transition to the live active dispatch state showing real-time discharge telemetry and reward accumulation.
3. **Switch Profiles**: In Settings or the Login screen, tap `P001`, `P002`, or `P003` to switch between different prosumers with distinct battery capacities and clusters.
