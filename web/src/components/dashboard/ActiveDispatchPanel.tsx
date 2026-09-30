import React from "react";
import { DispatchRequest } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Zap, ArrowRight, Clock, BatteryCharging } from "lucide-react";
import { formatPower, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";

export function ActiveDispatchPanel({ dispatches }: { dispatches: DispatchRequest[] }) {
  const activeList = dispatches.filter(
    (d) => d.status === "ACTIVE" || d.status === "AWAITING_RESPONSES" || d.status === "ALLOCATING"
  );

  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
            Active Grid Support Dispatches
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Realtime load mitigation events currently executing across feeders
          </p>
        </div>
        <Link
          href="/dashboard/dispatch"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Dispatch Console <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeList.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No active dispatch events at the moment.
        </div>
      ) : (
        <div className="mt-4 space-y-3.5">
          {activeList.map((d) => {
            const delivered = d.delivered_kw || 0;
            const requested = d.requested_kw || 1;
            const progressPct = Math.min(100, Math.round((delivered / requested) * 100));

            return (
              <div
                key={d.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 tech-mono">{d.id}</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {d.cluster_name}
                    </span>
                  </div>
                  <StatusBadge status={d.status} size="sm" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Requested
                    </span>
                    <span className="font-bold text-slate-800 tech-mono text-sm">
                      {formatPower(d.requested_kw)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Accepted
                    </span>
                    <span className="font-bold text-blue-600 tech-mono text-sm">
                      {formatPower(d.accepted_kw)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Delivered
                    </span>
                    <span className="font-bold text-emerald-600 tech-mono text-sm">
                      {formatPower(d.delivered_kw)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1 tech-mono">
                    <span>Delivery Fulfillment</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Duration: {formatDuration(d.duration_minutes)}
                  </span>
                  <Link
                    href={`/dashboard/dispatch/${d.id}`}
                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
