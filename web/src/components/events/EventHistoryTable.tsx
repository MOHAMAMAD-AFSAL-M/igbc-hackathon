import React from "react";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPower, formatEnergy, formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";

export function EventHistoryTable({ events }: { events: VPPEventHistoryItem[] }) {
  return (
    <div className="tech-panel rounded-xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 uppercase tracking-wider font-semibold">
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
          <tbody className="divide-y divide-slate-100 bg-white">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 tech-mono">
                  {ev.id}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div>{new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="text-[10px] text-slate-400">{formatRelativeTime(ev.date)}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{ev.cluster_name}</td>
                <td className="py-3.5 px-4 tech-mono text-slate-700">{formatPower(ev.requested_kw)}</td>
                <td className="py-3.5 px-4 tech-mono font-bold text-emerald-600">
                  {formatPower(ev.delivered_kw)}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{formatDuration(ev.duration_minutes)}</td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800 tech-mono">
                  {ev.participants_count}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900 tech-mono">
                  {formatEnergy(ev.energy_delivered_kwh)}
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-700 tech-mono">
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
