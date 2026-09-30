import {
  Cluster,
  Prosumer,
  DispatchRequest,
  DispatchParticipant,
  DispatchTimelineEvent,
  DashboardKPIData,
} from "@/lib/types";
import { MOCK_CLUSTERS } from "./clusters";
import { MOCK_PROSUMERS } from "./prosumers";
import {
  MOCK_DISPATCHES,
  MOCK_PARTICIPANTS_DSP1001,
  MOCK_TIMELINE_DSP1001,
} from "./dispatch";
import { MOCK_EVENT_HISTORY, VPPEventHistoryItem } from "./events";

type Listener = () => void;

class MockStore {
  private clusters: Cluster[] = [...MOCK_CLUSTERS];
  private prosumers: Prosumer[] = [...MOCK_PROSUMERS];
  private dispatches: DispatchRequest[] = [...MOCK_DISPATCHES];
  private participants: Record<string, DispatchParticipant[]> = {
    "DSP-1001": [...MOCK_PARTICIPANTS_DSP1001],
  };
  private timelines: Record<string, DispatchTimelineEvent[]> = {
    "DSP-1001": [...MOCK_TIMELINE_DSP1001],
  };
  private events: VPPEventHistoryItem[] = [...MOCK_EVENT_HISTORY];
  private listeners: Set<Listener> = new Set();
  private simulationTimers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.recalculateAggregates();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.recalculateAggregates();
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("MockStore listener error", err);
      }
    });
  }

  private recalculateAggregates() {
    this.clusters = this.clusters.map((cluster) => {
      const clusterProsumers = this.prosumers.filter((p) => p.cluster_id === cluster.id);
      const availableProsumers = clusterProsumers.filter((p) => p.availability_status === "AVAILABLE");
      const activeDisp = this.dispatches.filter(
        (d) => d.cluster_id === cluster.id && (d.status === "ACTIVE" || d.status === "AWAITING_RESPONSES")
      );

      const totalCap = availableProsumers.reduce((sum, p) => sum + p.max_discharge_kw, 0);
      const totalEnergy = availableProsumers.reduce(
        (sum, p) => sum + (p.battery_capacity_kwh * (p.current_soc - p.minimum_reserve_soc)) / 100,
        0
      );
      const avgSoc =
        clusterProsumers.length > 0
          ? Math.round(clusterProsumers.reduce((sum, p) => sum + p.current_soc, 0) / clusterProsumers.length)
          : 0;

      return {
        ...cluster,
        prosumer_count: clusterProsumers.length,
        available_capacity_kw: Math.round(totalCap),
        available_energy_kwh: Math.max(0, Math.round(totalEnergy)),
        average_soc: avgSoc,
        active_dispatches_count: activeDisp.length,
      };
    });
  }

  // --- Read Methods ---

  public getKPIData(): DashboardKPIData {
    const total = this.prosumers.length;
    const available = this.prosumers.filter((p) => p.availability_status === "AVAILABLE").length;
    const availCap = this.clusters.reduce((sum, c) => sum + (c.available_capacity_kw || 0), 0);
    const activeDispatches = this.dispatches.filter((d) => d.status === "ACTIVE");
    const activeKw = activeDispatches.reduce((sum, d) => sum + (d.delivered_kw || d.accepted_kw || 0), 0);

    return {
      totalProsumers: 128, // Network total display
      totalProsumersChange: "+8.4% from last week",
      availableNow: 94,
      availablePercent: "73.4% of network",
      availableCapacityKw: 642,
      capacityChange: "+42 kW in last hour",
      activeSupportKw: Math.round(activeKw > 0 ? activeKw : 118),
      activeRequestsCount: activeDispatches.length || 3,
    };
  }

  public getClusters(): Cluster[] {
    return [...this.clusters];
  }

  public getCluster(id: string): Cluster | undefined {
    return this.clusters.find((c) => c.id === id);
  }

  public getProsumers(clusterId?: string): Prosumer[] {
    if (clusterId) {
      return this.prosumers.filter((p) => p.cluster_id === clusterId);
    }
    return [...this.prosumers];
  }

  public getProsumer(id: string): Prosumer | undefined {
    return this.prosumers.find((p) => p.id === id || p.prosumer_code === id);
  }

  public getDispatches(): DispatchRequest[] {
    return [...this.dispatches].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getDispatch(id: string): DispatchRequest | undefined {
    return this.dispatches.find((d) => d.id === id);
  }

  public getParticipants(dispatchId: string): DispatchParticipant[] {
    return [...(this.participants[dispatchId] || [])];
  }

  public getTimeline(dispatchId: string): DispatchTimelineEvent[] {
    return [...(this.timelines[dispatchId] || [])];
  }

  public getEvents(): VPPEventHistoryItem[] {
    return [...this.events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getEvent(id: string): VPPEventHistoryItem | undefined {
    return this.events.find((e) => e.id === id);
  }

  // --- Mutation Methods & Realtime Simulation ---

  public createDispatch(input: {
    cluster_id: string;
    requested_kw: number;
    duration_minutes: number;
    notes?: string;
  }): DispatchRequest {
    const cluster = this.getCluster(input.cluster_id);
    const dispatchNum = 1002 + this.dispatches.length;
    const dispatchId = `DSP-${dispatchNum}`;
    const now = new Date();

    const newDispatch: DispatchRequest = {
      id: dispatchId,
      cluster_id: input.cluster_id,
      cluster_name: cluster ? cluster.name : "Cluster " + input.cluster_id,
      requested_kw: Number(input.requested_kw),
      accepted_kw: 0,
      delivered_kw: 0,
      duration_minutes: Number(input.duration_minutes),
      status: "AWAITING_RESPONSES",
      created_by: "u-operator",
      created_at: now.toISOString(),
      started_at: null,
      completed_at: null,
      participants_count: 0,
      energy_delivered_kwh: 0,
      notes: input.notes || "Grid support requested by operator",
    };

    // Filter eligible prosumers in cluster
    const eligibleProsumers = this.prosumers.filter(
      (p) =>
        p.cluster_id === input.cluster_id &&
        p.availability_status === "AVAILABLE" &&
        p.current_soc > p.minimum_reserve_soc
    );

    // Create participant entries
    let allocated = 0;
    const initialParticipants: DispatchParticipant[] = [];

    for (const p of eligibleProsumers) {
      if (allocated >= input.requested_kw * 1.1) break; // 10% headroom
      const needed = input.requested_kw - allocated;
      const targetKw = Math.min(p.max_discharge_kw, Math.max(1, Math.round(needed)));

      initialParticipants.push({
        id: `dp-${dispatchId}-${p.prosumer_code}`,
        dispatch_id: dispatchId,
        prosumer_id: p.id,
        prosumer_code: p.prosumer_code,
        prosumer_name: p.name,
        requested_kw: targetKw,
        accepted_kw: 0,
        delivered_kw: 0,
        energy_delivered_kwh: 0,
        status: "PENDING",
        soc: p.current_soc,
        max_discharge_kw: p.max_discharge_kw,
        estimated_incentive: targetKw * (input.duration_minutes / 60) * 10,
        created_at: now.toISOString(),
      });

      allocated += targetKw;
    }

    newDispatch.participants_count = initialParticipants.length;

    // Timeline setup
    const initialTimeline: DispatchTimelineEvent[] = [
      {
        id: `tl-${dispatchId}-1`,
        dispatch_id: dispatchId,
        timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Dispatch Created",
        description: `KSEB Operator initiated ${input.requested_kw} kW support request for ${newDispatch.cluster_name}`,
        type: "info",
      },
      {
        id: `tl-${dispatchId}-2`,
        dispatch_id: dispatchId,
        timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Eligible Prosumers Found",
        description: `VPP algorithm selected ${initialParticipants.length} eligible battery prosumers`,
        type: "info",
      },
    ];

    this.dispatches.unshift(newDispatch);
    this.participants[dispatchId] = initialParticipants;
    this.timelines[dispatchId] = initialTimeline;

    this.notify();

    // Trigger mock realtime simulation steps (Requirement #38 & #50)
    this.startMockDispatchSimulation(dispatchId, input.requested_kw);

    return newDispatch;
  }

  private startMockDispatchSimulation(dispatchId: string, requestedKw: number) {
    // Step 1 (+1.5s): First batch of prosumers accept (~25% of target)
    const t1 = setTimeout(() => {
      const d = this.getDispatch(dispatchId);
      const parts = this.participants[dispatchId];
      if (!d || !parts || d.status === "COMPLETED" || d.status === "CANCELLED") return;

      const firstBatchCount = Math.max(1, Math.floor(parts.length * 0.4));
      let currentAccepted = 0;

      for (let i = 0; i < firstBatchCount; i++) {
        parts[i].status = "ACCEPTED";
        parts[i].accepted_kw = parts[i].requested_kw;
        parts[i].responded_at = new Date().toISOString();
        currentAccepted += parts[i].accepted_kw;
      }

      d.accepted_kw = Math.round(currentAccepted);
      this.timelines[dispatchId].push({
        id: `tl-${dispatchId}-step1`,
        dispatch_id: dispatchId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Initial Responses Received",
        description: `${firstBatchCount} prosumers accepted (${d.accepted_kw} kW confirmed)`,
        type: "info",
      });

      this.notify();
    }, 1500);

    // Step 2 (+3.5s): Second batch accepts (~65% of target)
    const t2 = setTimeout(() => {
      const d = this.getDispatch(dispatchId);
      const parts = this.participants[dispatchId];
      if (!d || !parts || d.status === "COMPLETED" || d.status === "CANCELLED") return;

      const secondBatchCount = Math.max(1, Math.floor(parts.length * 0.75));
      let currentAccepted = 0;

      for (let i = 0; i < secondBatchCount; i++) {
        if (parts[i].status === "PENDING") {
          parts[i].status = "ACCEPTED";
          parts[i].accepted_kw = parts[i].requested_kw;
          parts[i].responded_at = new Date().toISOString();
        }
        currentAccepted += parts[i].accepted_kw;
      }

      d.accepted_kw = Math.round(currentAccepted);
      this.timelines[dispatchId].push({
        id: `tl-${dispatchId}-step2`,
        dispatch_id: dispatchId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Responses Aggregated",
        description: `Total confirmed capacity increased to ${d.accepted_kw} kW`,
        type: "success",
      });

      this.notify();
    }, 3500);

    // Step 3 (+5.5s): Remaining acceptances arrive (~88% of target), becomes ACTIVE
    const t3 = setTimeout(() => {
      const d = this.getDispatch(dispatchId);
      const parts = this.participants[dispatchId];
      if (!d || !parts || d.status === "COMPLETED" || d.status === "CANCELLED") return;

      let currentAccepted = 0;
      for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1 && parts.length > 2) {
          // One manual decline for realism
          parts[i].status = "DECLINED";
          parts[i].accepted_kw = 0;
          parts[i].responded_at = new Date().toISOString();
        } else {
          parts[i].status = "ACTIVE";
          parts[i].accepted_kw = parts[i].requested_kw;
          parts[i].responded_at = new Date().toISOString();
          currentAccepted += parts[i].accepted_kw;
        }
      }

      d.status = "ACTIVE";
      d.started_at = new Date().toISOString();
      d.accepted_kw = Math.round(currentAccepted);

      this.timelines[dispatchId].push({
        id: `tl-${dispatchId}-step3`,
        dispatch_id: dispatchId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Dispatch Became ACTIVE",
        description: `${d.accepted_kw} kW accepted by prosumer network. Handshake active.`,
        type: "active",
      });

      this.notify();
    }, 5500);

    // Step 4 (+7.5s): Delivery reaches target (~82-90% delivered)
    const t4 = setTimeout(() => {
      const d = this.getDispatch(dispatchId);
      const parts = this.participants[dispatchId];
      if (!d || !parts || d.status !== "ACTIVE") return;

      let currentDelivered = 0;
      for (const p of parts) {
        if (p.status === "ACTIVE" || p.status === "ACCEPTED") {
          p.status = "ACTIVE";
          p.delivered_kw = Math.round(p.accepted_kw * 0.94 * 10) / 10;
          p.energy_delivered_kwh = Math.round(p.delivered_kw * 0.5 * 10) / 10;
          currentDelivered += p.delivered_kw;
        }
      }

      d.delivered_kw = Math.round(currentDelivered * 10) / 10;
      d.energy_delivered_kwh = Math.round(d.delivered_kw * 0.5 * 10) / 10;

      this.timelines[dispatchId].push({
        id: `tl-${dispatchId}-step4`,
        dispatch_id: dispatchId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Discharge Stabilized",
        description: `${d.delivered_kw} kW live discharge delivering to local substation feeder`,
        type: "active",
      });

      this.notify();
    }, 7500);

    this.simulationTimers.push(t1, t2, t3, t4);
  }

  public completeDispatch(dispatchId: string): DispatchRequest | undefined {
    const d = this.getDispatch(dispatchId);
    if (!d) return undefined;

    const parts = this.participants[dispatchId] || [];
    const now = new Date();

    const deliveredKw = d.delivered_kw || Math.round(d.accepted_kw ? d.accepted_kw * 0.95 : d.requested_kw * 0.95 * 10) / 10;
    const durationHours = d.duration_minutes / 60;
    const energyKwh = Math.round(deliveredKw * durationHours * 10) / 10;
    const totalIncentive = Math.round(energyKwh * 10); // ₹10 per kWh

    d.status = "COMPLETED";
    d.completed_at = now.toISOString();
    d.delivered_kw = deliveredKw;
    d.energy_delivered_kwh = energyKwh;
    d.total_incentive = totalIncentive;

    // Update participants
    for (const p of parts) {
      if (p.status === "ACTIVE" || p.status === "ACCEPTED") {
        p.status = "COMPLETED";
        p.energy_delivered_kwh = Math.round((p.delivered_kw || p.accepted_kw) * durationHours * 10) / 10;
        p.estimated_incentive = Math.round(p.energy_delivered_kwh * 10);
      }
    }

    // Add to timelines
    this.timelines[dispatchId]?.push({
      id: `tl-${dispatchId}-completed`,
      dispatch_id: dispatchId,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Dispatch Completed",
      description: `Delivered ${deliveredKw} kW (${energyKwh} kWh). Total calculated incentives: ₹${totalIncentive.toLocaleString()}`,
      type: "success",
    });

    // Add record to events history (Requirement #50)
    const historyItem: VPPEventHistoryItem = {
      id: d.id,
      cluster_id: d.cluster_id,
      cluster_name: d.cluster_name || "Cluster",
      date: now.toISOString(),
      requested_kw: d.requested_kw,
      delivered_kw: deliveredKw,
      duration_minutes: d.duration_minutes,
      participants_count: parts.filter((p) => p.status === "COMPLETED").length || d.participants_count || 1,
      energy_delivered_kwh: energyKwh,
      total_incentive: totalIncentive,
      status: "COMPLETED",
      notes: d.notes,
    };

    // Avoid duplicate in events
    const existingIdx = this.events.findIndex((e) => e.id === d.id);
    if (existingIdx >= 0) {
      this.events[existingIdx] = historyItem;
    } else {
      this.events.unshift(historyItem);
    }

    this.notify();
    return d;
  }

  public cancelDispatch(dispatchId: string): DispatchRequest | undefined {
    const d = this.getDispatch(dispatchId);
    if (!d) return undefined;

    d.status = "CANCELLED";
    d.completed_at = new Date().toISOString();

    const parts = this.participants[dispatchId] || [];
    for (const p of parts) {
      if (p.status !== "DECLINED" && p.status !== "COMPLETED") {
        p.status = "EXCLUDED";
      }
    }

    this.timelines[dispatchId]?.push({
      id: `tl-${dispatchId}-cancelled`,
      dispatch_id: dispatchId,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Dispatch Cancelled",
      description: "Support request cancelled by operator. Discharging suspended.",
      type: "warning",
    });

    this.notify();
    return d;
  }
}

// Global singleton instance
export const mockStore = new MockStore();
