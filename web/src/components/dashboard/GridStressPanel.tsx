import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { formatPower } from "@/lib/utils/formatters";

export function GridStressPanel({ clusters }: { clusters: Cluster[] }) {
  const highStressClusters = clusters.filter(
    (c) => c.grid_status === "HIGH_STRESS" || c.grid_status === "CRITICAL"
  );
  const warningClusters = clusters.filter((c) => c.grid_status === "WARNING");
  const normalClusters = clusters.filter((c) => c.grid_status === "NORMAL");

  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Grid Stress & Load Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional feeder load levels vs distributed VPP headroom
          </p>
        </div>
        <Link
          href="/dashboard/clusters"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          All Clusters <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid Stress Spectrum Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 tech-mono">
          <span className="text-emerald-700">Normal (2)</span>
          <span className="text-amber-700">Warning (2)</span>
          <span className="text-orange-700">High Stress (2)</span>
          <span className="text-rose-700">Critical (1)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 p-0.5 flex gap-1 border border-slate-200">
          <div className="h-full rounded-l-full bg-emerald-500 w-[28%]" title="Normal (Thrissur, Kozhikode)" />
          <div className="h-full bg-amber-500 w-[28%]" title="Warning (Aluva, Palakkad)" />
          <div className="h-full bg-orange-500 w-[28%]" title="High Stress (Kalamassery, Kakkanad)" />
          <div className="h-full rounded-r-full bg-rose-600 w-[16%]" title="Critical (Trivandrum)" />
        </div>
      </div>

      {/* Stressed Cluster Cards Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {highStressClusters.map((cluster) => (
          <div
            key={cluster.id}
            className="p-3.5 rounded-lg border border-orange-200 bg-orange-50/40 hover:bg-orange-50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{cluster.name}</h4>
                <StatusBadge status={cluster.grid_status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{cluster.substation}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-md border border-orange-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Current Load
                </span>
                <span className="font-bold text-slate-900 tech-mono text-sm">
                  {formatPower(cluster.current_load_kw)}
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded-md border border-orange-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Available VPP
                </span>
                <span className="font-bold text-blue-600 tech-mono text-sm">
                  {formatPower(cluster.available_capacity_kw)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-orange-200/60">
              <span className="text-[11px] text-slate-600">
                <strong className="text-slate-900 tech-mono">{cluster.prosumer_count}</strong> batteries online
              </span>
              <Link
                href={`/dashboard/dispatch/new?cluster=${cluster.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors"
              >
                <Zap className="w-3 h-3 fill-white" /> Request Support
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
