"use client";

import React from "react";
import { GridVitals } from "@/lib/types";
import { Zap, AlertTriangle, Activity, Gauge, TrendingUp, ShieldCheck } from "lucide-react";

interface GridVitalsBannerProps {
  vitals: GridVitals;
}

export function GridVitalsBanner({ vitals }: GridVitalsBannerProps) {
  const isDeficit = vitals.total_demand_mw > vitals.baseline_supply_mw;
  const currentGap = vitals.total_demand_mw - vitals.baseline_supply_mw;

  return (
    <div className="space-y-4">
      {/* Predictive Deficit & Action Banner */}
      <div className="glass-panel rounded-2xl p-4.5 border border-[#88BDA4]/40 bg-gradient-to-r from-[#659287]/15 via-[#88BDA4]/10 to-transparent shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shadow-sm shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#659287]">
                  Predictive Grid Load Forecast (Next 2 Hours)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-400/30 tech-mono">
                  Peak Deficit Warning
                </span>
              </div>
              <p className="text-sm font-semibold text-[#193029] mt-0.5">
                System predicts electricity demand will surge to{" "}
                <strong className="text-[#659287]">{vitals.predicted_peak_mw.toLocaleString()} MW</strong>, exceeding baseline thermal/hydro supply by{" "}
                <strong className="text-rose-600">+{vitals.predicted_deficit_mw} MW</strong>.
              </p>
              <p className="text-xs text-[#193029]/70 mt-0.5">
                Operator Action: Request decentralized support from enrolled hybrid clusters to shave peak evening feeder stress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/90 text-right shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#193029]/60 block">
                Available VPP Reserve
              </span>
              <span className="text-lg font-bold text-[#659287] tech-mono">
                {vitals.vpp_total_reserve_mw} MW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Telemetry Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Voltage Vital */}
        <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#193029]/70 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Bus Voltage</span>
            <Gauge className="w-4 h-4 text-[#659287]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#193029] tech-mono">
              {vitals.current_voltage_kv.toFixed(2)} kV
            </span>
            <span className="text-[11px] font-semibold text-[#659287] tech-mono">
              +{vitals.voltage_deviation_percent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Nominal {vitals.nominal_voltage_kv.toFixed(2)} kV &bull; Within ±5% tolerance
          </span>
        </div>

        {/* Frequency Vital */}
        <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#193029]/70 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Grid Frequency</span>
            <Activity className="w-4 h-4 text-[#659287]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#193029] tech-mono">
              {vitals.system_frequency_hz.toFixed(2)} Hz
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 tech-mono">
              Stable
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Target 50.00 Hz &bull; Power Factor: {vitals.system_power_factor}
          </span>
        </div>

        {/* Current Total Load vs Baseline */}
        <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#193029]/70 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Current Load</span>
            <Zap className="w-4 h-4 text-[#659287]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#193029] tech-mono">
              {vitals.total_demand_mw.toLocaleString()} MW
            </span>
            <span className="text-[11px] font-semibold text-amber-700 tech-mono">
              Peak Hours
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            State-wide consumer draw across all circles
          </span>
        </div>

        {/* Baseline Supply Capacity */}
        <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs text-[#193029]/70 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Baseline Supply</span>
            <ShieldCheck className="w-4 h-4 text-[#659287]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#659287] tech-mono">
              {vitals.baseline_supply_mw.toLocaleString()} MW
            </span>
            {isDeficit && (
              <span className="text-[11px] font-bold text-rose-600 tech-mono">
                -{currentGap} MW
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Standard thermal + central hydro generation
          </span>
        </div>
      </div>
    </div>
  );
}
