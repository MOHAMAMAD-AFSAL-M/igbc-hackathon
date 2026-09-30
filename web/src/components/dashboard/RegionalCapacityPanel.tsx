"use client";

import React from "react";
import { GridRegion } from "@/lib/types";
import { MapPin, Zap, BatteryCharging, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface RegionalCapacityPanelProps {
  regions: GridRegion[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  onRequestSupport: (region: GridRegion) => void;
}

export function RegionalCapacityPanel({
  regions,
  selectedRegionId,
  onSelectRegion,
  onRequestSupport,
}: RegionalCapacityPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#659287]" />
            Regional Demand vs Baseline Supply Planning
          </h2>
          <p className="text-xs text-slate-500">
            Compare regional consumer load needed against standard baseline capacity to spot deficit stress points.
          </p>
        </div>
        {selectedRegionId && (
          <button
            onClick={() => onSelectRegion(null)}
            className="text-xs font-semibold text-[#659287] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Show All Regions
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((reg) => {
          const isDeficit = reg.current_load_mw > reg.baseline_supply_mw;
          const deficitAmount = reg.current_load_mw - reg.baseline_supply_mw;
          const isSelected = selectedRegionId === reg.id;
          const loadPercentage = Math.min(100, Math.round((reg.current_load_mw / (reg.baseline_supply_mw * 1.15)) * 100));

          return (
            <div
              key={reg.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-200 relative ${
                isSelected
                  ? "border-[#659287] ring-2 ring-[#88BDA4]/40 bg-white/80 shadow-lg"
                  : "border-white/80 hover:border-[#88BDA4]/60 shadow-md"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#88BDA4]/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#193029]">
                      {reg.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{reg.zone}</p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tech-mono border ${
                    reg.status === "HIGH_STRESS"
                      ? "bg-rose-500/15 text-rose-700 border-rose-400/30"
                      : reg.status === "WARNING"
                      ? "bg-amber-500/15 text-amber-800 border-amber-400/30"
                      : "bg-[#88BDA4]/20 text-[#659287] border-[#88BDA4]/40"
                  }`}
                >
                  {isDeficit ? `-${deficitAmount} MW DEFICIT` : "BALANCED"}
                </span>
              </div>

              {/* Demand vs Baseline Comparison */}
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/60 border border-white/90">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Currently Needed
                    </span>
                    <span className="text-lg font-bold text-[#193029] tech-mono block mt-0.5">
                      {reg.current_load_mw} MW
                    </span>
                    <span className="text-[10px] text-slate-400">Regional Load</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#659287]/10 border border-[#88BDA4]/30">
                    <span className="text-[10px] uppercase font-bold text-[#659287] block">
                      Baseline Supply
                    </span>
                    <span className="text-lg font-bold text-[#659287] tech-mono block mt-0.5">
                      {reg.baseline_supply_mw} MW
                    </span>
                    <span className="text-[10px] text-[#659287]/80">Grid Infeed</span>
                  </div>
                </div>

                {/* Progress bar: Load vs Supply */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Supply / Load Stress</span>
                    <span className="font-bold text-[#193029] tech-mono">{loadPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDeficit ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gradient-to-r from-[#88BDA4] to-[#659287]"
                      }`}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                </div>

                {/* VPP Hybrid Reserves Available */}
                <div className="p-2.5 rounded-xl bg-[#88BDA4]/15 border border-[#88BDA4]/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#193029] flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#659287]" />
                      VPP Hybrid Reserve:
                    </span>
                    <strong className="text-[#659287] tech-mono font-bold">
                      {reg.vpp_hybrid_capacity_mw} MW
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {reg.enrolled_hybrid_prosumers} enrolled hybrid solar + battery systems
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#88BDA4]/20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectRegion(isSelected ? null : reg.id)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    isSelected
                      ? "bg-[#659287] text-white border-transparent shadow-xs"
                      : "bg-white/70 hover:bg-[#88BDA4]/20 text-[#193029] border-white/90"
                  }`}
                >
                  {isSelected ? "Showing Clusters" : "Inspect Clusters"}
                </button>

                <button
                  type="button"
                  onClick={() => onRequestSupport(reg)}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#659287] to-[#88BDA4] hover:brightness-105 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  title="Request Prosumer Support"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Request
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
