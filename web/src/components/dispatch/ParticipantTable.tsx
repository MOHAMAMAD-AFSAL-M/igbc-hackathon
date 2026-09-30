import React from "react";
import { DispatchParticipant } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPower, formatEnergy, formatCurrency } from "@/lib/utils/formatters";

export function ParticipantTable({ participants }: { participants: DispatchParticipant[] }) {
  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Selected Prosumer Participants ({participants.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual battery dispatch allocations and response telemetry
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="pb-2.5 font-bold">Prosumer</th>
              <th className="pb-2.5 font-bold">Requested</th>
              <th className="pb-2.5 font-bold">Status</th>
              <th className="pb-2.5 font-bold">Accepted</th>
              <th className="pb-2.5 font-bold">Delivered</th>
              <th className="pb-2.5 font-bold">Est. Energy</th>
              <th className="pb-2.5 font-bold">Incentive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3">
                  <div className="font-bold text-slate-900 tech-mono">{p.prosumer_code}</div>
                  <div className="text-[11px] text-slate-500">{p.prosumer_name}</div>
                </td>
                <td className="py-3 tech-mono text-slate-700">{formatPower(p.requested_kw)}</td>
                <td className="py-3">
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td className="py-3 tech-mono font-bold text-blue-600">
                  {p.status === "PENDING" ? "—" : formatPower(p.accepted_kw)}
                </td>
                <td className="py-3 tech-mono font-bold text-emerald-600">
                  {p.status === "ACTIVE" || p.status === "COMPLETED"
                    ? formatPower(p.delivered_kw)
                    : "—"}
                </td>
                <td className="py-3 text-slate-700 tech-mono">
                  {formatEnergy(p.energy_delivered_kwh)}
                </td>
                <td className="py-3 font-semibold text-slate-900 tech-mono">
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
