"use client";

import React, { useEffect, useState, use } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProsumerTable } from "@/components/prosumers/ProsumerTable";
import { getCluster, getClusterProsumers } from "@/lib/api/clusters";
import { Cluster, Prosumer } from "@/lib/types";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";
import Link from "next/link";
import { Zap, ArrowLeft, Users, BatteryCharging, Activity } from "lucide-react";

export default function ClusterDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clusterId = resolvedParams.id;

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [prosumers, setProsumers] = useState<Prosumer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await getCluster(clusterId);
      if (c) {
        setCluster(c);
        const pList = await getClusterProsumers(c.id);
        setProsumers(pList);
      }
      setIsLoading(false);
    }
    load();
  }, [clusterId]);

  if (!cluster && !isLoading) {
    return (
      <DashboardShell pageTitle="Cluster Not Found">
        <div className="text-center py-12">
          <p className="text-slate-600">Cluster {clusterId} could not be located.</p>
          <Link href="/dashboard/clusters" className="text-[#659287] font-semibold mt-2 inline-block">
            Back to Clusters
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle={cluster?.name || "Cluster Details"}>
      <PageHeader
        title={cluster?.name || "Cluster Details"}
        description={`Cluster ID: ${cluster?.id} • Substation: ${cluster?.substation}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clusters", href: "/dashboard/clusters" },
          { label: cluster?.name || clusterId },
        ]}
        badge={cluster && <StatusBadge status={cluster.grid_status} size="md" />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/clusters"
              className="btn-secondary-theme inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <Link
              href={`/dashboard/dispatch/new?cluster=${cluster?.id}`}
              className="btn-primary-theme inline-flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Request Support
            </Link>
          </div>
        }
      />

      {/* KPI Row */}
      {cluster && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193029]/70 block">
              Current Load
            </span>
            <span className="text-2xl font-bold text-[#193029] tech-mono mt-1 block">
              {formatPower(cluster.current_load_kw)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Substation Feeder Flow</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-[#88BDA4]/40 bg-[#88BDA4]/15 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#659287] block">
              Available VPP Power
            </span>
            <span className="text-2xl font-bold text-[#659287] tech-mono mt-1 block">
              {formatPower(cluster.available_capacity_kw)}
            </span>
            <span className="text-[10px] text-[#659287]/80 mt-0.5 block">Discharge Headroom</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-[#659287]/40 bg-[#659287]/15 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193029] block">
              Available Energy
            </span>
            <span className="text-2xl font-bold text-[#193029] tech-mono mt-1 block">
              {formatEnergy(cluster.available_energy_kwh)}
            </span>
            <span className="text-[10px] text-[#193029]/70 mt-0.5 block">Above Reserve Threshold</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#193029]/70 block">
              Average Battery SoC
            </span>
            <span className="text-2xl font-bold text-[#193029] tech-mono mt-1 block">
              {formatPercent(cluster.average_soc)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {cluster.prosumer_count} batteries enrolled
            </span>
          </div>
        </div>
      )}

      {/* Prosumer Table in this Cluster */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Enrolled Prosumers in {cluster?.name}
        </h3>
        <ProsumerTable prosumers={prosumers} />
      </div>
    </DashboardShell>
  );
}
