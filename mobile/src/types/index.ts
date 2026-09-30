// Types mirroring backend schema and API contracts

export type Role = 'PROSUMER' | 'KSEB_OPERATOR' | 'ADMIN';

export type GridStatus = 'NORMAL' | 'WARNING' | 'HIGH_STRESS' | 'CRITICAL';

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'OFFLINE';

export type ParticipationMode = 'AUTOMATIC' | 'MANUAL';

export type DispatchRequestStatus =
  | 'CREATED'
  | 'ALLOCATING'
  | 'AWAITING_RESPONSES'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PARTIAL';

export type ParticipantStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'EXCLUDED';

export type IncentiveStatus = 'PENDING' | 'CALCULATED' | 'SETTLED';

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  role: Role;
  created_at: string;
}

export interface Cluster {
  id: string;
  name: string;
  substation?: string;
  latitude?: number;
  longitude?: number;
  grid_status: GridStatus;
  current_load_kw?: number;
  available_capacity_kw?: number;
  created_at?: string;
}

export interface Prosumer {
  id: string;
  user_id: string;
  prosumer_code: string;
  cluster_id: string;
  cluster_name?: string;
  latitude?: number;
  longitude?: number;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
  max_discharge_kw: number;
  minimum_reserve_soc: number;
  current_soc: number;
  availability_status: AvailabilityStatus;
  participation_mode: ParticipationMode;
  created_at?: string;
  updated_at?: string;
}

export interface Telemetry {
  id?: string;
  prosumer_id: string;
  soc: number;
  solar_generation_kw: number;
  battery_power_kw: number; // positive = discharging, negative = charging
  available_energy_kwh: number;
  timestamp: string;
}

export interface DispatchRequest {
  id: string;
  cluster_id: string;
  cluster_name?: string;
  requested_kw: number;
  duration_minutes: number;
  status: DispatchRequestStatus;
  created_by?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
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
  responded_at?: string;
  created_at: string;
  dispatch_requests?: DispatchRequest;
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
  dispatch_requests?: {
    id: string;
    duration_minutes: number;
    created_at: string;
    clusters?: {
      name: string;
    };
  };
}
