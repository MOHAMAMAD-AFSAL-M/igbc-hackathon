"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getClusters } from "@/lib/api/clusters";
import { createDispatch } from "@/lib/api/dispatch";
import { Cluster } from "@/lib/types";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";
import Link from "next/link";
import { Zap, AlertTriangle, ArrowRight, CheckCircle2, BatteryCharging, Users, Activity, Loader2 } from "lucide-react";

function CreateDispatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCluster = searchParams.get("cluster");

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [targetKw, setTargetKw] = useState<number>(50);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [mode, setMode] = useState<string>("AUTOMATIC");
  const [notes, setNotes] = useState<string>("Feeder load relief for peak evening transition");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getClusters();
      setClusters(data);
      if (preselectedCluster && data.some((c) => c.id === preselectedCluster)) {
        setSelectedClusterId(preselectedCluster);
      } else if (data.length > 0) {
        // Default to Kalamassery for demo flow
        const kalamassery = data.find((c) => c.name === "Kalamassery") || data[0];
        setSelectedClusterId(kalamassery.id);
      }
      setIsLoading(false);
    }
    load();
  }, [preselectedCluster]);

  const activeCluster = clusters.find((c) => c.id === selectedClusterId);
  const availableKw = activeCluster?.available_capacity_kw || 0;
  const isOverCapacity = targetKw > availableKw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClusterId) return;

    setIsSubmitting(true);
    try {
      const newDispatch = await createDispatch({
        cluster_id: selectedClusterId,
        requested_kw: Number(targetKw),
        duration_minutes: Number(durationMinutes),
        notes,
      });

      router.push(`/dashboard/dispatch/${newDispatch.id}`);
    } catch (err) {
      console.error("Failed to create dispatch", err);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell pageTitle="Request Grid Support">
      <PageHeader
        title="Request Grid Support"
        description="Create an automated demand-response dispatch request to draw prosumer battery infeed for feeder peak shaving."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Dispatch", href: "/dashboard/dispatch" },
          { label: "New Request" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
        {/* Left: Dispatch Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="tech-panel rounded-xl p-6 border border-slate-200 space-y-5"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Electrical Cluster
              </label>
              <select
                value={selectedClusterId}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.substation}) — {c.grid_status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Reduction (kW)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={500}
                    step={5}
                    value={targetKw}
                    onChange={(e) => setTargetKw(Number(e.target.value))}
                    className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 tech-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold tech-mono">
                    kW
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Dispatch Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour (60 mins)</option>
                  <option value={90}>1.5 Hours (90 mins)</option>
                  <option value={120}>2 Hours (120 mins)</option>
                  <option value={180}>3 Hours (180 mins)</option>
                  <option value={240}>4 Hours (240 mins)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Prosumer Participation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-xs font-semibold ${
                    mode === "AUTOMATIC"
                      ? "border-blue-600 bg-blue-50/60 text-blue-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === "AUTOMATIC"}
                      onChange={() => setMode("AUTOMATIC")}
                      className="text-blue-600"
                    />
                    <span>Automatic Matching</span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${mode === "AUTOMATIC" ? "text-blue-600" : "text-transparent"}`} />
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-xs font-semibold ${
                    mode === "MANUAL"
                      ? "border-blue-600 bg-blue-50/60 text-blue-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === "MANUAL"}
                      onChange={() => setMode("MANUAL")}
                      className="text-blue-600"
                    />
                    <span>Manual Opt-in</span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${mode === "MANUAL" ? "text-blue-600" : "text-transparent"}`} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                SLDC Dispatch Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Operational purpose, feeder details, or grid contingencies..."
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Warning if Target Exceeds Available Capacity */}
            {isOverCapacity && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Capacity Limit Warning</p>
                  <p className="mt-0.5">
                    Requested <strong>{formatPower(targetKw)}</strong>, but only{" "}
                    <strong>{formatPower(availableKw)}</strong> is currently available in{" "}
                    {activeCluster?.name}. Full target may not be fulfilled.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link
                href="/dashboard/dispatch"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                {isSubmitting ? "Creating & Allocating..." : "Create Dispatch Request"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right: Selected Cluster Telemetry Preview */}
        <div className="lg:col-span-5">
          <div className="tech-panel rounded-xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
              Selected Cluster Reserve
            </h3>

            {activeCluster ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{activeCluster.name}</h4>
                  <p className="text-xs text-slate-500">{activeCluster.substation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-blue-600" /> Available Power
                    </span>
                    <span className="text-xl font-bold text-blue-600 tech-mono mt-1 block">
                      {formatPower(activeCluster.available_capacity_kw)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Available Energy
                    </span>
                    <span className="text-xl font-bold text-emerald-600 tech-mono mt-1 block">
                      {formatEnergy(activeCluster.available_energy_kwh)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Eligible Prosumers
                    </span>
                    <span className="text-xl font-bold text-slate-900 tech-mono mt-1 block">
                      {activeCluster.prosumer_count}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-slate-400" /> Average SoC
                    </span>
                    <span className="text-xl font-bold text-slate-900 tech-mono mt-1 block">
                      {formatPercent(activeCluster.average_soc)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Substation Feeder Load:</span>
                    <strong className="text-slate-900 tech-mono">{formatPower(activeCluster.current_load_kw)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispatch Incentive Rate:</span>
                    <strong className="text-blue-700 tech-mono">₹10.00 / kWh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Total Incentive:</span>
                    <strong className="text-emerald-700 tech-mono">
                      ₹{Math.round(targetKw * (durationMinutes / 60) * 10).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">Loading cluster telemetry...</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function CreateDispatchPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell pageTitle="Request Grid Support">
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <span className="text-sm font-medium">Loading Dispatch Parameters...</span>
          </div>
        </DashboardShell>
      }
    >
      <CreateDispatchContent />
    </Suspense>
  );
}
