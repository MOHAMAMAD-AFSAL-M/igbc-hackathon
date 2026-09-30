export type UserRole = "PROSUMER" | "KSEB_OPERATOR" | "ADMIN";

export type GridStatus = "NORMAL" | "WARNING" | "HIGH_STRESS" | "CRITICAL";

export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "OFFLINE";

export type ParticipationMode = "AUTOMATIC" | "MANUAL";

export type DispatchStatus =
  | "CREATED"
  | "ALLOCATING"
  | "AWAITING_RESPONSES"
  | "ACTIVE"
  | "PARTIAL"
  | "COMPLETED"
  | "CANCELLED";

export type ParticipantStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXCLUDED";

export type IncentiveStatus = "PENDING" | "CALCULATED" | "SETTLED";

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  created_at: string;
}

export interface Cluster {
  id: string;
  name: string;
  substation: string;
  latitude: number;
  longitude: number;
  grid_status: GridStatus;
  current_load_kw: number;
  available_capacity_kw: number;
  created_at: string;
  // Computed / Aggregated properties
  prosumer_count?: number;
  available_energy_kwh?: number;
  average_soc?: number;
  active_dispatches_count?: number;
}

export interface Prosumer {
  id: string;
  user_id: string;
  prosumer_code: string;
  cluster_id: string;
  latitude: number;
  longitude: number;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
  max_discharge_kw: number;
  minimum_reserve_soc: number;
  current_soc: number;
  availability_status: AvailabilityStatus;
  participation_mode: ParticipationMode;
  created_at: string;
  updated_at: string;
  // Join properties
  name?: string;
  cluster_name?: string;
  current_output_kw?: number;
  last_updated?: string;
}

export interface Telemetry {
  id: string;
  prosumer_id: string;
  soc: number;
  solar_generation_kw: number;
  battery_power_kw: number;
  available_energy_kwh: number;
  timestamp: string;
}

export interface DispatchRequest {
  id: string;
  cluster_id: string;
  requested_kw: number;
  duration_minutes: number;
  status: DispatchStatus;
  created_by: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string;
  // Aggregated fields
  cluster_name?: string;
  accepted_kw?: number;
  delivered_kw?: number;
  participants_count?: number;
  energy_delivered_kwh?: number;
  total_incentive?: number;
}

export interface DispatchParticipant {
  id: string;
  dispatch_id: string;
  prosumer_id: string;
  requested_kw: number;
  accepted_kw: number;
  delivered_kw: number;
  energy_delivered_kwh: number;
  status: ParticipantStatus;
  responded_at?: string | null;
  created_at: string;
  // Enriched
  prosumer_code?: string;
  prosumer_name?: string;
  soc?: number;
  max_discharge_kw?: number;
  estimated_incentive?: number;
}

export interface Incentive {
  id: string;
  prosumer_id: string;
  dispatch_id: string;
  energy_kwh: number;
  rate_per_kwh: number;
  amount: number;
  status: IncentiveStatus;
  created_at: string;
  // Enriched
  prosumer_code?: string;
  prosumer_name?: string;
  cluster_name?: string;
}

export interface DispatchTimelineEvent {
  id: string;
  dispatch_id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "active";
}

export interface DashboardKPIData {
  totalProsumers: number;
  totalProsumersChange: string;
  availableNow: number;
  availablePercent: string;
  availableCapacityKw: number;
  capacityChange: string;
  activeSupportKw: number;
  activeRequestsCount: number;
}

export interface GridRegion {
  id: string;
  name: string;
  zone: string;
  districts: string[];
  current_load_mw: number;
  baseline_supply_mw: number;
  predicted_peak_mw: number;
  voltage_kv: number;
  frequency_hz: number;
  power_factor: number;
  status: GridStatus;
  vpp_hybrid_capacity_mw: number;
  enrolled_hybrid_prosumers: number;
  cluster_ids: string[];
}

export interface GridVitals {
  system_frequency_hz: number;
  nominal_voltage_kv: number;
  current_voltage_kv: number;
  voltage_deviation_percent: number;
  total_demand_mw: number;
  baseline_supply_mw: number;
  predicted_peak_mw: number;
  predicted_deficit_mw: number;
  vpp_total_reserve_mw: number;
  system_power_factor: number;
}
