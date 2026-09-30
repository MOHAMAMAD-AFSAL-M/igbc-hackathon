import {
  Cluster,
  Prosumer,
  Telemetry,
  DispatchParticipant,
  Incentive,
  Profile,
} from '../types';

export const DEMO_CLUSTERS: Cluster[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    name: 'Kalamassery',
    substation: 'KSB-KLM (110kV)',
    latitude: 10.0522,
    longitude: 76.3318,
    grid_status: 'HIGH_STRESS',
    current_load_kw: 820,
    available_capacity_kw: 126,
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    name: 'Edappally',
    substation: 'KSB-EDP (66kV)',
    latitude: 10.0159,
    longitude: 76.3074,
    grid_status: 'WARNING',
    current_load_kw: 650,
    available_capacity_kw: 90,
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    name: 'Aluva',
    substation: 'KSB-ALV (110kV)',
    latitude: 10.1076,
    longitude: 76.3548,
    grid_status: 'NORMAL',
    current_load_kw: 420,
    available_capacity_kw: 200,
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    name: 'Kakkanad',
    substation: 'KSB-KKN (220kV)',
    latitude: 10.0121,
    longitude: 76.3407,
    grid_status: 'CRITICAL',
    current_load_kw: 980,
    available_capacity_kw: 60,
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    name: 'Thrippunithura',
    substation: 'KSB-TPR (66kV)',
    latitude: 9.9437,
    longitude: 76.3500,
    grid_status: 'NORMAL',
    current_load_kw: 300,
    available_capacity_kw: 150,
  },
];

export interface DemoAccount {
  profile: Profile;
  prosumer: Prosumer;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    profile: {
      id: 'usr-001',
      name: 'Anoop Kumar',
      phone: '+91 98470 12345',
      role: 'PROSUMER',
      created_at: new Date().toISOString(),
    },
    prosumer: {
      id: '22000000-0000-0000-0000-000000000001',
      user_id: 'usr-001',
      prosumer_code: 'P001',
      cluster_id: '11111111-0000-0000-0000-000000000001',
      cluster_name: 'Kalamassery',
      latitude: 10.0510,
      longitude: 76.3300,
      solar_capacity_kw: 5.0,
      battery_capacity_kwh: 13.5,
      max_discharge_kw: 5.0,
      minimum_reserve_soc: 20,
      current_soc: 78,
      availability_status: 'AVAILABLE',
      participation_mode: 'AUTOMATIC',
    },
  },
  {
    profile: {
      id: 'usr-002',
      name: 'Reshma Nair',
      phone: '+91 98471 23456',
      role: 'PROSUMER',
      created_at: new Date().toISOString(),
    },
    prosumer: {
      id: '22000000-0000-0000-0000-000000000002',
      user_id: 'usr-002',
      prosumer_code: 'P002',
      cluster_id: '11111111-0000-0000-0000-000000000001',
      cluster_name: 'Kalamassery',
      latitude: 10.0520,
      longitude: 76.3310,
      solar_capacity_kw: 3.0,
      battery_capacity_kwh: 9.0,
      max_discharge_kw: 3.0,
      minimum_reserve_soc: 20,
      current_soc: 72,
      availability_status: 'AVAILABLE',
      participation_mode: 'MANUAL',
    },
  },
  {
    profile: {
      id: 'usr-003',
      name: 'Deepak Varma',
      phone: '+91 98472 34567',
      role: 'PROSUMER',
      created_at: new Date().toISOString(),
    },
    prosumer: {
      id: '22000000-0000-0000-0000-000000000003',
      user_id: 'usr-003',
      prosumer_code: 'P003',
      cluster_id: '11111111-0000-0000-0000-000000000001',
      cluster_name: 'Kalamassery',
      latitude: 10.0530,
      longitude: 76.3320,
      solar_capacity_kw: 7.0,
      battery_capacity_kwh: 18.0,
      max_discharge_kw: 7.0,
      minimum_reserve_soc: 20,
      current_soc: 90,
      availability_status: 'AVAILABLE',
      participation_mode: 'AUTOMATIC',
    },
  },
];

export const INITIAL_DEMO_TELEMETRY: Telemetry = {
  prosumer_id: '22000000-0000-0000-0000-000000000001',
  soc: 78,
  solar_generation_kw: 3.2,
  battery_power_kw: 0.0,
  available_energy_kwh: 10.53, // (78 - 20) / 100 * 13.5
  timestamp: new Date().toISOString(),
};

export const INITIAL_DISPATCH_REQUEST: DispatchParticipant = {
  id: 'dp-001',
  dispatch_id: 'disp-001',
  prosumer_id: '22000000-0000-0000-0000-000000000001',
  requested_kw: 4.0,
  accepted_kw: 4.0,
  delivered_kw: 0,
  energy_delivered_kwh: 0,
  status: 'PENDING',
  created_at: new Date().toISOString(),
  dispatch_requests: {
    id: 'disp-001',
    cluster_id: '11111111-0000-0000-0000-000000000001',
    cluster_name: 'Kalamassery Substation',
    requested_kw: 50.0,
    duration_minutes: 120,
    status: 'AWAITING_RESPONSES',
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
};

export const DEMO_INCENTIVES: Incentive[] = [
  {
    id: 'inc-001',
    prosumer_id: '22000000-0000-0000-0000-000000000001',
    dispatch_id: 'disp-hist-01',
    energy_kwh: 8.0,
    rate_per_kwh: 10,
    amount: 80.0,
    status: 'SETTLED',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    dispatch_requests: {
      id: 'disp-hist-01',
      duration_minutes: 120,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      clusters: {
        name: 'Kalamassery Substation',
      },
    },
  },
  {
    id: 'inc-002',
    prosumer_id: '22000000-0000-0000-0000-000000000001',
    dispatch_id: 'disp-hist-02',
    energy_kwh: 6.5,
    rate_per_kwh: 10,
    amount: 65.0,
    status: 'SETTLED',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    dispatch_requests: {
      id: 'disp-hist-02',
      duration_minutes: 90,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      clusters: {
        name: 'Kalamassery Substation',
      },
    },
  },
  {
    id: 'inc-003',
    prosumer_id: '22000000-0000-0000-0000-000000000001',
    dispatch_id: 'disp-hist-03',
    energy_kwh: 9.2,
    rate_per_kwh: 10,
    amount: 92.0,
    status: 'CALCULATED',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    dispatch_requests: {
      id: 'disp-hist-03',
      duration_minutes: 150,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      clusters: {
        name: 'Kalamassery Substation',
      },
    },
  },
];
