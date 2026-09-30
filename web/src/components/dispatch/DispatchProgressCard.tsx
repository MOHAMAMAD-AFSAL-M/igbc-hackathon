import React from "react";
import { DispatchRequest } from "@/lib/types";
import { formatPower } from "@/lib/utils/formatters";

export function DispatchProgressCard({ dispatch }: { dispatch: DispatchRequest }) {
  const requested = dispatch.requested_kw || 1;
  const accepted = dispatch.accepted_kw || 0;
  const delivered = dispatch.delivered_kw || 0;
  const remaining = Math.max(0, requested - accepted);

  const acceptedPct = Math.min(100, Math.round((accepted / requested) * 100));
  const deliveredPct = Math.min(100, Math.round((delivered / requested) * 100));

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-[#88BDA4]/20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
          Capacity Orchestration Status
        </h3>
        <span className="text-xs font-semibold text-[#52796f] tech-mono">
          Feeder Target: {formatPower(requested)}
        </span>
      </div>

      {/* Main KPI Row with Frosted Badges */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
        <div className="p-4 rounded-xl bg-white/60 border border-[#88BDA4]/25 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796f] block">
            Requested Power
          </span>
          <span className="text-2xl lg:text-3xl font-extrabold text-[#193029] tech-mono mt-1 block">
            {formatPower(requested)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">KSEB Demand</span>
        </div>

        <div className="p-4 rounded-xl bg-[#88BDA4]/20 border border-[#88BDA4]/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#345b50] block">
            Accepted Power
          </span>
          <span className="text-2xl lg:text-3xl font-extrabold text-[#659287] tech-mono mt-1 block">
            {formatPower(accepted)}
          </span>
          <span className="text-[10px] text-[#457b6d] mt-0.5 block">{acceptedPct}% of target</span>
        </div>

        <div className="p-4 rounded-xl bg-[#659287]/20 border border-[#659287]/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#193029] block">
            Delivered Power
          </span>
          <span className="text-2xl lg:text-3xl font-extrabold text-[#3a6055] tech-mono mt-1 block">
            {formatPower(delivered)}
          </span>
          <span className="text-[10px] text-[#28483f] mt-0.5 block">{deliveredPct}% active supply</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
            Remaining Gap
          </span>
          <span className="text-2xl lg:text-3xl font-extrabold text-amber-800 tech-mono mt-1 block">
            {formatPower(remaining)}
          </span>
          <span className="text-[10px] text-amber-700 mt-0.5 block">
            {remaining > 0 ? "Under allocation" : "Target Met"}
          </span>
        </div>
      </div>

      {/* Progress Bars Visualization with Frosted Glass Tracks */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between text-xs font-bold text-[#193029] mb-1 tech-mono">
            <span>Requested</span>
            <span>{formatPower(requested)} (100%)</span>
          </div>
          <div className="h-3 w-full bg-white/70 rounded-full overflow-hidden border border-[#88BDA4]/30 shadow-inner">
            <div className="h-full bg-slate-400/80 rounded-full w-full" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-[#457b6d] mb-1 tech-mono">
            <span>Accepted Commitment</span>
            <span>{formatPower(accepted)} ({acceptedPct}%)</span>
          </div>
          <div className="h-3 w-full bg-white/70 rounded-full overflow-hidden border border-[#88BDA4]/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#88BDA4] to-[#659287] rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${acceptedPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-[#193029] mb-1 tech-mono">
            <span>Delivered Infeed</span>
            <span>{formatPower(delivered)} ({deliveredPct}%)</span>
          </div>
          <div className="h-3.5 w-full bg-white/70 rounded-full overflow-hidden border border-[#88BDA4]/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#659287] to-[#3a6055] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${deliveredPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
