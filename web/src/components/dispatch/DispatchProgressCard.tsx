import React from "react";
import { DispatchRequest } from "@/lib/types";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function DispatchProgressCard({ dispatch }: { dispatch: DispatchRequest }) {
  const requested = dispatch.requested_kw || 1;
  const accepted = dispatch.accepted_kw || 0;
  const delivered = dispatch.delivered_kw || 0;
  const remaining = Math.max(0, requested - accepted);

  const acceptedPct = Math.min(100, Math.round((accepted / requested) * 100));
  const deliveredPct = Math.min(100, Math.round((delivered / requested) * 100));

  return (
    <div className="tech-panel rounded-xl p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Capacity Orchestration Status
        </h3>
        <span className="text-xs text-slate-500 tech-mono">
          Feeder Target: {formatPower(requested)}
        </span>
      </div>

      {/* Main KPI Row */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Requested Power
          </span>
          <span className="text-2xl lg:text-3xl font-bold text-slate-900 tech-mono mt-1 block">
            {formatPower(requested)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">KSEB SLDC Demand</span>
        </div>

        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
            Accepted Power
          </span>
          <span className="text-2xl lg:text-3xl font-bold text-blue-600 tech-mono mt-1 block">
            {formatPower(accepted)}
          </span>
          <span className="text-[10px] text-blue-500 mt-0.5 block">{acceptedPct}% of target</span>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Delivered Power
          </span>
          <span className="text-2xl lg:text-3xl font-bold text-emerald-600 tech-mono mt-1 block">
            {formatPower(delivered)}
          </span>
          <span className="text-[10px] text-emerald-500 mt-0.5 block">{deliveredPct}% active supply</span>
        </div>

        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
            Remaining Gap
          </span>
          <span className="text-2xl lg:text-3xl font-bold text-amber-600 tech-mono mt-1 block">
            {formatPower(remaining)}
          </span>
          <span className="text-[10px] text-amber-500 mt-0.5 block">
            {remaining > 0 ? "Under allocation" : "Target Met"}
          </span>
        </div>
      </div>

      {/* Progress Bars Visualization */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1 tech-mono">
            <span>Requested</span>
            <span>{formatPower(requested)} (100%)</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-slate-400 rounded-full w-full" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-blue-700 mb-1 tech-mono">
            <span>Accepted Commitment</span>
            <span>{formatPower(accepted)} ({acceptedPct}%)</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${acceptedPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-emerald-700 mb-1 tech-mono">
            <span>Delivered Infeed</span>
            <span>{formatPower(delivered)} ({deliveredPct}%)</span>
          </div>
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${deliveredPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
