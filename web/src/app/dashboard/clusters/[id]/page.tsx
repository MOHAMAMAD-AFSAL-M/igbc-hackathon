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
          <Link href="/dashboard/clusters" className="text-blue-600 font-semibold mt-2 inline-block">
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <Link
              href={`/dashboard/dispatch/new?cluster=${cluster?.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Request Support
            </Link>
          </div>
        }
      />

      {/* KPI Row */}
      {cluster && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="tech-panel rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Current Load
            </span>
            <span className="text-2xl font-bold text-slate-900 tech-mono mt-1 block">
              {formatPower(cluster.current_load_kw)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Substation Feeder Flow</span>
          </div>

          <div className="tech-panel rounded-xl p-4 border border-blue-200 bg-blue-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Available VPP Power
            </span>
            <span className="text-2xl font-bold text-blue-600 tech-mono mt-1 block">
              {formatPower(cluster.available_capacity_kw)}
            </span>
            <span className="text-[10px] text-blue-500 mt-0.5 block">Discharge Headroom</span>
          </div>

          <div className="tech-panel rounded-xl p-4 border border-emerald-200 bg-emerald-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Available Energy
            </span>
            <span className="text-2xl font-bold text-emerald-600 tech-mono mt-1 block">
              {formatEnergy(cluster.available_energy_kwh)}
            </span>
            <span className="text-[10px] text-emerald-500 mt-0.5 block">Above Reserve Threshold</span>
          </div>

          <div className="tech-panel rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Average Battery SoC
            </span>
            <span className="text-2xl font-bold text-slate-900 tech-mono mt-1 block">
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
