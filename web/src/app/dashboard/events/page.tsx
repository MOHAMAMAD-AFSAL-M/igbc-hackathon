"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventHistoryTable } from "@/components/events/EventHistoryTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { getEvents } from "@/lib/api/events";
import { getClusters } from "@/lib/api/clusters";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { Cluster } from "@/lib/types";
import { mockStore } from "@/lib/mock/mockStore";
import { formatPower, formatEnergy, formatCurrency } from "@/lib/utils/formatters";
import { History, Zap, Award, CheckCircle2, Search, Filter } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<VPPEventHistoryItem[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const [eList, cList] = await Promise.all([getEvents(), getClusters()]);
    setEvents(eList);
    setClusters(cList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = mockStore.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const totalDeliveredEnergy = events.reduce((sum, e) => sum + (e.energy_delivered_kwh || 0), 0);
  const totalIncentives = events.reduce((sum, e) => sum + (e.total_incentive || 0), 0);
  const completedCount = events.filter((e) => e.status === "COMPLETED").length;

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.cluster_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCluster = clusterFilter === "ALL" || e.cluster_id === clusterFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesCluster && matchesStatus;
  });

  return (
    <DashboardShell pageTitle="Event History">
      <PageHeader
        title="Event History"
        description="Historical archive of executed VPP support sessions, cumulative demand response energy, and prosumer incentive disbursements."
      />

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Energy Delivered"
          value={formatEnergy(totalDeliveredEnergy)}
          subtitle="Cumulative battery infeed to grid"
          icon={Zap}
          accentColor="green"
        />
        <MetricCard
          title="Total Incentives Paid"
          value={formatCurrency(totalIncentives)}
          subtitle="Calculated reward ledger"
          icon={Award}
          accentColor="blue"
        />
        <MetricCard
          title="Successful Events"
          value={`${completedCount} / ${events.length}`}
          subtitle="Fulfilled demand-response requests"
          icon={CheckCircle2}
          accentColor="amber"
        />
      </div>

      {/* Filters Bar */}
      <div className="tech-panel rounded-xl p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by event ID or cluster name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="ALL">All Clusters</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL">Partial</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <EventHistoryTable events={filtered} />
    </DashboardShell>
  );
}
