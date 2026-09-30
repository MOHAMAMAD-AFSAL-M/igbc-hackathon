export interface VPPEventHistoryItem {
  id: string;
  cluster_id: string;
  cluster_name: string;
  date: string;
  requested_kw: number;
  delivered_kw: number;
  duration_minutes: number;
  participants_count: number;
  energy_delivered_kwh: number;
  total_incentive: number;
  status: "COMPLETED" | "PARTIAL" | "CANCELLED";
  notes?: string;
}

export const MOCK_EVENT_HISTORY: VPPEventHistoryItem[] = [
  {
    id: "DSP-0998",
    cluster_id: "CL001",
    cluster_name: "Kalamassery",
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    requested_kw: 50,
    delivered_kw: 47.8,
    duration_minutes: 120,
    participants_count: 18,
    energy_delivered_kwh: 95.6,
    total_incentive: 956,
    status: "COMPLETED",
    notes: "Feeders 2 & 4 industrial peak shaving completed successfully",
  },
  {
    id: "DSP-0995",
    cluster_id: "CL002",
    cluster_name: "Kakkanad",
    date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    requested_kw: 35,
    delivered_kw: 34.2,
    duration_minutes: 90,
    participants_count: 11,
    energy_delivered_kwh: 51.3,
    total_incentive: 513,
    status: "COMPLETED",
    notes: "Infopark commercial area voltage stabilization",
  },
  {
    id: "DSP-0991",
    cluster_id: "CL005",
    cluster_name: "Palakkad Industrial",
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    requested_kw: 75,
    delivered_kw: 71.5,
    duration_minutes: 150,
    participants_count: 22,
    energy_delivered_kwh: 178.75,
    total_incentive: 1788,
    status: "COMPLETED",
    notes: "Kanjikode evening peak demand response event",
  },
  {
    id: "DSP-0988",
    cluster_id: "CL003",
    cluster_name: "Aluva",
    date: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    requested_kw: 40,
    delivered_kw: 28.5,
    duration_minutes: 60,
    participants_count: 9,
    energy_delivered_kwh: 28.5,
    total_incentive: 285,
    status: "PARTIAL",
    notes: "Partial delivery due to local cloud cover and early reserve thresholds",
  },
  {
    id: "DSP-0982",
    cluster_id: "CL007",
    cluster_name: "Trivandrum Technopark",
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    requested_kw: 45,
    delivered_kw: 44.0,
    duration_minutes: 120,
    participants_count: 14,
    energy_delivered_kwh: 88.0,
    total_incentive: 880,
    status: "COMPLETED",
    notes: "Campus server cluster peak curtailment",
  },
];
