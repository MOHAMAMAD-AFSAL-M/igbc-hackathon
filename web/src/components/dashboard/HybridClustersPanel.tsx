"use client";

import React from "react";
import { Cluster } from "@/lib/types";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";
import { Zap, Users, BatteryCharging, Radio, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

interface HybridClustersPanelProps {
  clusters: Cluster[];
  selectedRegionName?: string | null;
  onRequestClusterSupport: (cluster: Cluster) => void;
}

export function HybridClustersPanel({
  clusters,
  selectedRegionName,
  onRequestClusterSupport,
}: HybridClustersPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#659287]" />
            Renewable Energy Hybrid Clusters (Virtual Power Plant)
          </h2>
          <p className="text-xs text-[#3a6055]">
            {selectedRegionName ? (
              <>Showing hybrid prosumer aggregations filtered for <strong>{selectedRegionName}</strong></>
            ) : (
              "Decentralized solar + battery hybrid systems monitored centrally via IoT gateway hardware across regional substations."
            )}
          </p>
        </div>

        <Link
          href="/dashboard/clusters"
          className="text-xs font-semibold text-[#659287] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors duration-200"
        >
          View Full Registry <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.map((c) => {
          const isStressed = c.grid_status === "HIGH_STRESS" || c.grid_status === "CRITICAL";

          return (
            <div
              key={c.id}
              className="glass-panel rounded-2xl p-4.5 border border-white/80 shadow-md hover:border-[#88BDA4]/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#88BDA4]/20">
                  <div>
                    <h3 className="text-sm font-bold text-[#193029]">{c.name}</h3>
                    <p className="text-[11px] text-[#3a6055] truncate max-w-[180px]">{c.substation}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tech-mono border ${
                      isStressed
                        ? "bg-rose-500/15 text-rose-700 border-rose-400/30"
                        : "bg-[#88BDA4]/20 text-[#659287] border-[#88BDA4]/40"
                    }`}
                  >
                    {c.grid_status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Hybrid Systems Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {/* How many people in hybrid system */}
                  <div className="p-2 rounded-xl bg-white/60 border border-white/90">
                    <span className="text-[10px] uppercase font-bold text-[#3a6055] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#659287]" /> Enrolled Prosumers
                    </span>
                    <span className="text-base font-bold text-[#193029] tech-mono block mt-0.5">
                      {c.prosumer_count || 0} Hybrid Homes
                    </span>
                    <span className="text-[10px] text-[#3a6055]">Solar + ESS Units</span>
                  </div>

                  {/* Available Capacity */}
                  <div className="p-2 rounded-xl bg-[#88BDA4]/15 border border-[#88BDA4]/30">
                    <span className="text-[10px] uppercase font-bold text-[#659287] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#659287]" /> Available Infeed
                    </span>
                    <span className="text-base font-bold text-[#659287] tech-mono block mt-0.5">
                      {formatPower(c.available_capacity_kw)}
                    </span>
                    <span className="text-[10px] text-[#659287]/80">{formatEnergy(c.available_energy_kwh || 0)}</span>
                  </div>
                </div>

                {/* Battery SoC & IoT Status */}
                <div className="mt-2.5 p-2 rounded-xl bg-white/50 border border-white/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#3a6055] flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-[#659287]" />
                      Average Battery SoC:
                    </span>
                    <strong className="text-[#193029] tech-mono font-bold">
                      {formatPercent(c.average_soc || 0)}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
                    <span className="text-[#3a6055] flex items-center gap-1">
                      <Radio className="w-3 h-3 text-[#659287] animate-pulse" />
                      IoT Gateway:
                    </span>
                    <span className="text-[#659287] font-semibold tech-mono">
                      Hardware Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#88BDA4]/20 flex items-center gap-2">
                <Link
                  href={`/dashboard/clusters/${c.id}`}
                  className="flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-semibold border border-white/90 bg-white/70 hover:bg-[#88BDA4]/20 text-[#193029] transition-all duration-200 cursor-pointer"
                >
                  Cluster Details
                </Link>

                <button
                  type="button"
                  onClick={() => onRequestClusterSupport(c)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#659287] to-[#88BDA4] hover:brightness-105 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all duration-200 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Zap className="w-3 h-3 fill-white" />
                  Request Support
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
