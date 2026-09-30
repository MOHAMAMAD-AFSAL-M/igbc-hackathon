import React from "react";
import { DispatchRequest } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Zap, ArrowRight, Clock } from "lucide-react";
import { formatPower, formatDuration } from "@/lib/utils/formatters";

export function ActiveDispatchPanel({ dispatches }: { dispatches: DispatchRequest[] }) {
  const activeList = dispatches.filter(
    (d) => d.status === "ACTIVE" || d.status === "AWAITING_RESPONSES" || d.status === "ALLOCATING"
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#659287] fill-[#659287]" />
            Active Grid Support Dispatches
          </h3>
          <p className="text-xs text-[#52796f] mt-0.5">
            Realtime load mitigation events executing across feeders
          </p>
        </div>
        <Link
          href="/dashboard/dispatch"
          className="text-xs font-bold text-[#659287] hover:text-[#52796f] flex items-center gap-1 transition-colors"
        >
          Dispatch Console <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeList.length === 0 ? (
        <div className="py-8 text-center text-[#52796f] text-sm">
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
                className="p-4 rounded-xl border border-white/80 bg-white/60 backdrop-blur-md hover:bg-white/80 transition-all shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-[#193029] tech-mono">{d.id}</span>
                    <span className="text-xs font-bold text-[#28483f] bg-[#88BDA4]/20 border border-[#88BDA4]/30 px-2 py-0.5 rounded-md">
                      {d.cluster_name}
                    </span>
                  </div>
                  <StatusBadge status={d.status} size="sm" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div className="bg-white/70 p-2 rounded-lg border border-[#88BDA4]/20">
                    <span className="text-[10px] uppercase text-[#52796f] font-bold block">
                      Requested
                    </span>
                    <span className="font-bold text-[#193029] tech-mono text-sm">
                      {formatPower(d.requested_kw)}
                    </span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg border border-[#88BDA4]/20">
                    <span className="text-[10px] uppercase text-[#52796f] font-bold block">
                      Accepted
                    </span>
                    <span className="font-bold text-[#659287] tech-mono text-sm">
                      {formatPower(d.accepted_kw)}
                    </span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg border border-[#88BDA4]/20">
                    <span className="text-[10px] uppercase text-[#52796f] font-bold block">
                      Delivered
                    </span>
                    <span className="font-bold text-[#457b6d] tech-mono text-sm">
                      {formatPower(d.delivered_kw)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold text-[#3a6055] mb-1 tech-mono">
                    <span>Delivery Fulfillment</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/80 rounded-full overflow-hidden border border-[#88BDA4]/30 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#88BDA4] to-[#659287] rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#88BDA4]/20 flex items-center justify-between text-xs">
                  <span className="text-[#52796f] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#659287]" />
                    Duration: {formatDuration(d.duration_minutes)}
                  </span>
                  <Link
                    href={`/dashboard/dispatch/${d.id}`}
                    className="font-bold text-[#659287] hover:text-[#52796f] flex items-center gap-1 transition-colors"
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
