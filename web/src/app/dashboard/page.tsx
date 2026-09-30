"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICards } from "@/components/dashboard/KPICards";
import { GridStressPanel } from "@/components/dashboard/GridStressPanel";
import { ActiveDispatchPanel } from "@/components/dashboard/ActiveDispatchPanel";
import { LiveResponseMonitor } from "@/components/dashboard/LiveResponseMonitor";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { CapacityChart } from "@/components/charts/CapacityChart";
import { ClusterMap } from "@/components/maps/ClusterMap";
import { getDashboardKPIs, getDispatches, getDispatchParticipants } from "@/lib/api/dispatch";
import { getClusters } from "@/lib/api/clusters";
import { getEvents } from "@/lib/api/events";
import { getCapacitySeries } from "@/lib/api/telemetry";
import { mockStore } from "@/lib/mock/mockStore";
import { Cluster, DispatchRequest, DispatchParticipant, DashboardKPIData } from "@/lib/types";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { CapacityChartPoint } from "@/lib/mock/telemetry";
import Link from "next/link";
import { Zap, RefreshCw } from "lucide-react";

export default function DashboardOverviewPage() {
  const [kpiData, setKpiData] = useState<DashboardKPIData | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRequest[]>([]);
  const [participants, setParticipants] = useState<DispatchParticipant[]>([]);
  const [events, setEvents] = useState<VPPEventHistoryItem[]>([]);
  const [capacitySeries, setCapacitySeries] = useState<CapacityChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [kpis, cls, disps, evts, series] = await Promise.all([
        getDashboardKPIs(),
        getClusters(),
        getDispatches(),
        getEvents(),
        getCapacitySeries(),
      ]);
      setKpiData(kpis);
      setClusters(cls);
      setDispatches(disps);
      setEvents(evts);
      setCapacitySeries(series);

      // Get participants for first active dispatch
      const activeDisp = disps.find((d) => d.status === "ACTIVE") || disps[0];
      if (activeDisp) {
        const parts = await getDispatchParticipants(activeDisp.id);
        setParticipants(parts);
      }
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to reactive store for live telemetry/dispatch updates
    const unsubscribe = mockStore.subscribe(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardShell pageTitle="VPP Overview">
      {/* Header */}
      <PageHeader
        title="VPP Overview"
        description="Monitor distributed energy capacity, grid stress, and active support events across Kerala electrical substations."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard/dispatch/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4 fill-white" />
              Request Grid Support
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row */}
      {kpiData && <KPICards data={kpiData} />}

      {/* Main Grid: Map & Stress Panel */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="tech-panel rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Regional Cluster Distribution Map
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realtime prosumer aggregations and substation feeder nodes across Kerala
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 tech-mono">
                {clusters.length} Active Nodes
              </span>
            </div>
            <ClusterMap clusters={clusters} height="390px" />
          </div>

          {/* Capacity Trends Chart */}
          <div className="tech-panel rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Distributed Capacity & Infeed
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available VPP battery reserve vs requested & delivered power
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tech-mono">
                642 kW Online
              </span>
            </div>
            <CapacityChart data={capacitySeries} />
          </div>
        </div>

        {/* Right Column: Grid Stress & Active Dispatch */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <GridStressPanel clusters={clusters} />
          <ActiveDispatchPanel dispatches={dispatches} />
          <LiveResponseMonitor participants={participants} />
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="mt-6">
        <RecentEventsTable events={events} />
      </div>
    </DashboardShell>
  );
}
