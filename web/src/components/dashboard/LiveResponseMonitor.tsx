import React from "react";
import { DispatchParticipant } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Radio, BatteryCharging } from "lucide-react";
import { formatPower } from "@/lib/utils/formatters";

export function LiveResponseMonitor({ participants }: { participants: DispatchParticipant[] }) {
  const displayList = participants.slice(0, 7);

  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 radar-live" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Live Prosumer Handshake
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 tech-mono">
          DSP-1001 Stream
        </span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {displayList.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-1 rounded transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 tech-mono w-10">
                {item.prosumer_code}
              </span>
              <span className="text-slate-600 truncate max-w-[110px] hidden sm:inline">
                {item.prosumer_name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} size="sm" />
              <span className="font-bold tech-mono text-slate-800 w-16 text-right">
                {item.status === "PENDING"
                  ? "—"
                  : formatPower(item.accepted_kw || item.requested_kw)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Automatic telemetry stream</span>
        <span className="tech-mono">Latency: 24ms</span>
      </div>
    </div>
  );
}
