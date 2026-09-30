"use client";

import React, { useEffect, useState, use } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { TelemetryChart } from "@/components/charts/TelemetryChart";
import { getProsumer } from "@/lib/api/prosumers";
import { getProsumerTelemetry } from "@/lib/api/telemetry";
import { Prosumer } from "@/lib/types";
import { ProsumerTelemetryPoint } from "@/lib/mock/telemetry";
import { formatPower, formatEnergy, formatPercent, formatCurrency } from "@/lib/utils/formatters";
import Link from "next/link";
import { ArrowLeft, BatteryCharging, Sun, Zap, Shield, History, Award } from "lucide-react";

export default function ProsumerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const prosumerId = resolvedParams.id;

  const [prosumer, setProsumer] = useState<Prosumer | null>(null);
  const [telemetry, setTelemetry] = useState<ProsumerTelemetryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await getProsumer(prosumerId);
      if (p) {
        setProsumer(p);
        const t = await getProsumerTelemetry(p.id);
        setTelemetry(t);
      }
      setIsLoading(false);
    }
    load();
  }, [prosumerId]);

  if (!prosumer && !isLoading) {
    return (
      <DashboardShell pageTitle="Prosumer Not Found">
        <div className="text-center py-12">
          <p className="text-slate-600">Prosumer {prosumerId} could not be found.</p>
          <Link href="/dashboard/prosumers" className="text-[#659287] font-semibold mt-2 inline-block">
            Back to Prosumers
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle={prosumer?.name || "Prosumer Details"}>
      <PageHeader
        title={prosumer ? `${prosumer.prosumer_code} — ${prosumer.name}` : "Prosumer Details"}
        description={`Cluster: ${prosumer?.cluster_name} • Participation Mode: ${prosumer?.participation_mode} • Min Reserve: ${prosumer?.minimum_reserve_soc}%`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Prosumers", href: "/dashboard/prosumers" },
          { label: prosumer?.prosumer_code || prosumerId },
        ]}
        badge={prosumer && <StatusBadge status={prosumer.availability_status} size="md" />}
        actions={
          <Link
            href="/dashboard/prosumers"
            className="btn-secondary-theme inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
          </Link>
        }
      />

      {/* KPI Cards */}
      {prosumer && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Current SoC"
            value={formatPercent(prosumer.current_soc)}
            subtitle={`Reserve floor: ${prosumer.minimum_reserve_soc}%`}
            icon={BatteryCharging}
            accentColor={prosumer.current_soc >= 60 ? "green" : "amber"}
          />
          <MetricCard
            title="Battery Capacity"
            value={formatEnergy(prosumer.battery_capacity_kwh)}
            subtitle="LiFePO4 ESS Pack"
            icon={Shield}
            accentColor="green"
          />
          <MetricCard
            title="Max Discharge"
            value={formatPower(prosumer.max_discharge_kw)}
            subtitle="Bi-directional hybrid inverter"
            icon={Zap}
            accentColor="blue"
          />
          <MetricCard
            title="Solar Generation"
            value={formatPower(prosumer.solar_capacity_kw)}
            subtitle="Rooftop PV array rating"
            icon={Sun}
            accentColor="amber"
          />
        </div>
      )}

      {/* Telemetry Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-md mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20 mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
              Live Inverter Telemetry Curves
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated real-time battery SoC progression, solar PV generation, and discharge output
            </p>
          </div>
          <span className="text-xs font-semibold text-[#659287] bg-[#88BDA4]/20 px-2.5 py-1 rounded-full border border-[#88BDA4]/40 tech-mono">
            Active Stream
          </span>
        </div>
        <TelemetryChart data={telemetry} />
      </div>

      {/* Dispatch Participation and Incentive History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation History */}
        <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
              <History className="w-4 h-4 text-[#659287]" />
              Dispatch History
            </h3>
          </div>
          <div className="mt-3 divide-y divide-[#88BDA4]/15 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#193029] tech-mono">DSP-1001</span>
                <p className="text-[11px] text-slate-500">Kalamassery Peak Mitigation</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#659287] tech-mono">4.8 kW delivered</span>
                <p className="text-[10px] text-slate-400">Today, 12:30</p>
              </div>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#193029] tech-mono">DSP-0998</span>
                <p className="text-[11px] text-slate-500">Feeders 2 & 4 Relief</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#659287] tech-mono">5.0 kW delivered</span>
                <p className="text-[10px] text-slate-400">Yesterday, 17:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Incentive Ledger */}
        <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#659287]" />
              Earnings & Incentives Ledger
            </h3>
            <span className="text-xs font-bold text-[#659287] tech-mono bg-[#88BDA4]/15 px-2.5 py-1 rounded-full border border-[#88BDA4]/30">
              Total: ₹1,420
            </span>
          </div>
          <div className="mt-3 divide-y divide-[#88BDA4]/15 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#193029]">DSP-1001 Active Allocation</p>
                <p className="text-[10px] text-slate-400">₹10.00 / kWh rate</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#659287] tech-mono">+₹48.00</span>
                <span className="block text-[10px] text-amber-600 font-semibold">PENDING</span>
              </div>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#193029]">DSP-0998 Completed Event</p>
                <p className="text-[10px] text-slate-400">10.0 kWh total delivered</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#193029] tech-mono">+₹100.00</span>
                <span className="block text-[10px] text-[#659287] font-semibold">SETTLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
