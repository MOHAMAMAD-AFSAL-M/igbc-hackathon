import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Zap } from "lucide-react";
import { formatPower } from "@/lib/utils/formatters";

export function GridStressPanel({ clusters }: { clusters: Cluster[] }) {
  const highStressClusters = clusters.filter(
    (c) => c.grid_status === "HIGH_STRESS" || c.grid_status === "CRITICAL"
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Grid Stress & Load Distribution
          </h3>
          <p className="text-xs text-[#52796f] mt-0.5">
            Regional feeder load levels vs distributed VPP headroom
          </p>
        </div>
        <Link
          href="/dashboard/clusters"
          className="text-xs font-bold text-[#659287] hover:text-[#52796f] flex items-center gap-1 transition-colors"
        >
          All Clusters <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid Stress Spectrum Bar with Frosted Track */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#52796f] uppercase tracking-wider mb-1.5 tech-mono">
          <span className="text-[#457b6d]">Normal (2)</span>
          <span className="text-amber-700">Warning (2)</span>
          <span className="text-orange-700">High Stress (2)</span>
          <span className="text-rose-700">Critical (1)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/70 backdrop-blur-md p-0.5 flex gap-1 border border-[#88BDA4]/30 shadow-inner">
          <div className="h-full rounded-l-full bg-[#88BDA4] w-[28%]" title="Normal (Thrissur, Kozhikode)" />
          <div className="h-full bg-amber-500 w-[28%]" title="Warning (Aluva, Palakkad)" />
          <div className="h-full bg-orange-500 w-[28%]" title="High Stress (Kalamassery, Kakkanad)" />
          <div className="h-full rounded-r-full bg-rose-600 w-[16%]" title="Critical (Trivandrum)" />
        </div>
      </div>

      {/* Stressed Cluster Cards Grid with Frosted Glass */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {highStressClusters.map((cluster) => (
          <div
            key={cluster.id}
            className="p-3.5 rounded-xl border border-orange-400/30 bg-white/50 backdrop-blur-md hover:bg-white/75 transition-all shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#193029]">{cluster.name}</h4>
                <StatusBadge status={cluster.grid_status} size="sm" />
              </div>
              <p className="text-[11px] text-[#52796f] mt-0.5">{cluster.substation}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-[#88BDA4]/25">
                <span className="text-[10px] uppercase text-[#52796f] font-bold block">
                  Current Load
                </span>
                <span className="font-bold text-[#193029] tech-mono text-sm">
                  {formatPower(cluster.current_load_kw)}
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-[#88BDA4]/25">
                <span className="text-[10px] uppercase text-[#52796f] font-bold block">
                  Available VPP
                </span>
                <span className="font-bold text-[#659287] tech-mono text-sm">
                  {formatPower(cluster.available_capacity_kw)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#88BDA4]/20">
              <span className="text-[11px] text-[#3a6055]">
                <strong className="text-[#193029] tech-mono">{cluster.prosumer_count}</strong> batteries
              </span>
              <Link
                href={`/dashboard/dispatch/new?cluster=${cluster.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg btn-primary-theme"
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
