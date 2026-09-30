import React from "react";
import { DispatchParticipant } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPower } from "@/lib/utils/formatters";

export function LiveResponseMonitor({ participants }: { participants: DispatchParticipant[] }) {
  const displayList = participants.slice(0, 7);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#88BDA4] radar-live" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
            Live Prosumer Handshake
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#52796f] tech-mono">
          DSP-1001 Stream
        </span>
      </div>

      <div className="mt-3 divide-y divide-[#88BDA4]/15">
        {displayList.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between text-xs hover:bg-white/60 px-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[#193029] tech-mono w-10">
                {item.prosumer_code}
              </span>
              <span className="text-[#3a6055] font-medium truncate max-w-[110px] hidden sm:inline">
                {item.prosumer_name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} size="sm" />
              <span className="font-bold tech-mono text-[#193029] w-16 text-right">
                {item.status === "PENDING"
                  ? "—"
                  : formatPower(item.accepted_kw || item.requested_kw)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#88BDA4]/20 flex items-center justify-between text-[11px] text-[#52796f]">
        <span>Automatic telemetry stream</span>
        <span className="tech-mono">Latency: 24ms</span>
      </div>
    </div>
  );
}
