import React from "react";
import { DispatchParticipant } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPower, formatEnergy, formatCurrency } from "@/lib/utils/formatters";

export function ParticipantTable({ participants }: { participants: DispatchParticipant[] }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
            Selected Prosumer Participants ({participants.length})
          </h3>
          <p className="text-xs text-[#52796f] mt-0.5">
            Individual battery dispatch allocations and response telemetry
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#88BDA4]/25 text-[#52796f] uppercase tracking-wider font-bold">
              <th className="pb-2.5 font-bold">Prosumer</th>
              <th className="pb-2.5 font-bold">Requested</th>
              <th className="pb-2.5 font-bold">Status</th>
              <th className="pb-2.5 font-bold">Accepted</th>
              <th className="pb-2.5 font-bold">Delivered</th>
              <th className="pb-2.5 font-bold">Est. Energy</th>
              <th className="pb-2.5 font-bold">Incentive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#88BDA4]/15">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-white/60 transition-colors">
                <td className="py-3">
                  <div className="font-bold text-[#193029] tech-mono">{p.prosumer_code}</div>
                  <div className="text-[11px] text-[#52796f] font-medium">{p.prosumer_name}</div>
                </td>
                <td className="py-3 tech-mono text-[#3a6055]">{formatPower(p.requested_kw)}</td>
                <td className="py-3">
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td className="py-3 tech-mono font-bold text-[#659287]">
                  {p.status === "PENDING" ? "—" : formatPower(p.accepted_kw)}
                </td>
                <td className="py-3 tech-mono font-extrabold text-[#457b6d]">
                  {p.status === "ACTIVE" || p.status === "COMPLETED"
                    ? formatPower(p.delivered_kw)
                    : "—"}
                </td>
                <td className="py-3 text-[#28483f] font-medium tech-mono">
                  {formatEnergy(p.energy_delivered_kwh)}
                </td>
                <td className="py-3 font-bold text-[#193029] tech-mono">
                  {formatCurrency(p.estimated_incentive)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
