"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProsumerTable } from "@/components/prosumers/ProsumerTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { getProsumers } from "@/lib/api/prosumers";
import { getClusters } from "@/lib/api/clusters";
import { Prosumer, Cluster } from "@/lib/types";
import { Users, CheckCircle, XCircle, WifiOff, Search, Filter } from "lucide-react";

export default function ProsumersPage() {
  const [prosumers, setProsumers] = useState<Prosumer[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pList, cList] = await Promise.all([getProsumers(), getClusters()]);
      setProsumers(pList);
      setClusters(cList);
      setIsLoading(false);
    }
    load();
  }, []);

  const total = 128; // Network total
  const available = prosumers.filter((p) => p.availability_status === "AVAILABLE").length;
  const unavailable = prosumers.filter((p) => p.availability_status === "UNAVAILABLE").length;
  const offline = prosumers.filter((p) => p.availability_status === "OFFLINE").length;

  const filtered = prosumers.filter((p) => {
    const matchesSearch =
      p.prosumer_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.cluster_name && p.cluster_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCluster = clusterFilter === "ALL" || p.cluster_id === clusterFilter;
    const matchesStatus = statusFilter === "ALL" || p.availability_status === statusFilter;
    return matchesSearch && matchesCluster && matchesStatus;
  });

  return (
    <DashboardShell pageTitle="Prosumer Network">
      <PageHeader
        title="Prosumer Network"
        description="Comprehensive registry of decentralized solar + battery storage prosumers connected across KSEB substations."
      />

      {/* Network Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Registered"
          value={total}
          subtitle="Enrolled VPP clients"
          icon={Users}
          accentColor="blue"
        />
        <MetricCard
          title="Available Now"
          value={94}
          subtitle="Ready for dispatch"
          icon={CheckCircle}
          accentColor="green"
        />
        <MetricCard
          title="Reserve Preserved"
          value={22}
          subtitle="SoC below minimum threshold"
          icon={XCircle}
          accentColor="amber"
        />
        <MetricCard
          title="Offline Inverters"
          value={12}
          subtitle="Communication timeout"
          icon={WifiOff}
          accentColor="slate"
        />
      </div>

      {/* Filter and Search */}
      <div className="tech-panel rounded-xl p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by code, client name, or cluster..."
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
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      <ProsumerTable prosumers={filtered} />
    </DashboardShell>
  );
}
