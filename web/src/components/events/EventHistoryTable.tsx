import React from "react";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPower, formatEnergy, formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";

export function EventHistoryTable({ events }: { events: VPPEventHistoryItem[] }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#659287]/10 backdrop-blur-md border-b border-[#88BDA4]/25">
            <tr className="text-[#193029]/70 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 font-bold">Event ID</th>
              <th className="py-3 px-4 font-bold">Date & Time</th>
              <th className="py-3 px-4 font-bold">Cluster</th>
              <th className="py-3 px-4 font-bold">Requested</th>
              <th className="py-3 px-4 font-bold">Delivered</th>
              <th className="py-3 px-4 font-bold">Duration</th>
              <th className="py-3 px-4 font-bold text-center">Prosumers</th>
              <th className="py-3 px-4 font-bold">Energy Infeed</th>
              <th className="py-3 px-4 font-bold">Total Incentive</th>
              <th className="py-3 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#88BDA4]/15 bg-white/60 backdrop-blur-sm">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#88BDA4]/10 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#193029] tech-mono">
                  {ev.id}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  <div className="font-medium text-[#193029]">{new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="text-[10px] text-slate-400">{formatRelativeTime(ev.date)}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#193029]">{ev.cluster_name}</td>
                <td className="py-3.5 px-4 tech-mono text-slate-700">{formatPower(ev.requested_kw)}</td>
                <td className="py-3.5 px-4 tech-mono font-bold text-[#659287]">
                  {formatPower(ev.delivered_kw)}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{formatDuration(ev.duration_minutes)}</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#193029] tech-mono">
                  {ev.participants_count}
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#193029] tech-mono">
                  {formatEnergy(ev.energy_delivered_kwh)}
                </td>
                <td className="py-3.5 px-4 font-bold text-[#659287] tech-mono">
                  {formatCurrency(ev.total_incentive)}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={ev.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
