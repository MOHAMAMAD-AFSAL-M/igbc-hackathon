import React from "react";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { formatPower, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";

export function RecentEventsTable({ events }: { events: VPPEventHistoryItem[] }) {
  const recentList = events.slice(0, 5);

  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            Recent Dispatch Events
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of completed and executed grid-support engagements
          </p>
        </div>
        <Link
          href="/dashboard/events"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View All Events <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="pb-2.5 font-bold">Event</th>
              <th className="pb-2.5 font-bold">Cluster</th>
              <th className="pb-2.5 font-bold">Requested</th>
              <th className="pb-2.5 font-bold">Delivered</th>
              <th className="pb-2.5 font-bold">Duration</th>
              <th className="pb-2.5 font-bold">Prosumers</th>
              <th className="pb-2.5 font-bold">Status</th>
              <th className="pb-2.5 font-bold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentList.map((ev) => (
              <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-bold text-slate-900 tech-mono">{ev.id}</td>
                <td className="py-3 font-semibold text-slate-800">{ev.cluster_name}</td>
                <td className="py-3 tech-mono text-slate-700">{formatPower(ev.requested_kw)}</td>
                <td className="py-3 tech-mono font-bold text-emerald-600">
                  {formatPower(ev.delivered_kw)}
                </td>
                <td className="py-3 text-slate-600">{formatDuration(ev.duration_minutes)}</td>
                <td className="py-3 tech-mono text-slate-800">{ev.participants_count}</td>
                <td className="py-3">
                  <StatusBadge status={ev.status} size="sm" />
                </td>
                <td className="py-3 text-slate-400 text-right tech-mono">
                  {formatRelativeTime(ev.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
