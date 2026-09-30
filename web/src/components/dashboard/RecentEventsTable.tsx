import React from "react";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { formatPower, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";

export function RecentEventsTable({ events }: { events: VPPEventHistoryItem[] }) {
  const recentList = events.slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <History className="w-4 h-4 text-[#659287]" />
            Recent Dispatch Events
          </h3>
          <p className="text-xs text-[#52796f] mt-0.5">
            Log of completed and executed grid-support engagements
          </p>
        </div>
        <Link
          href="/dashboard/events"
          className="text-xs font-bold text-[#659287] hover:text-[#52796f] flex items-center gap-1 transition-colors"
        >
          View All Events <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#88BDA4]/25 text-[#52796f] uppercase tracking-wider font-bold">
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
          <tbody className="divide-y divide-[#88BDA4]/15">
            {recentList.map((ev) => (
              <tr key={ev.id} className="hover:bg-white/60 transition-colors">
                <td className="py-3 font-bold text-[#193029] tech-mono">{ev.id}</td>
                <td className="py-3 font-bold text-[#28483f]">{ev.cluster_name}</td>
                <td className="py-3 tech-mono text-[#3a6055]">{formatPower(ev.requested_kw)}</td>
                <td className="py-3 tech-mono font-extrabold text-[#457b6d]">
                  {formatPower(ev.delivered_kw)}
                </td>
                <td className="py-3 text-[#52796f] font-medium">{formatDuration(ev.duration_minutes)}</td>
                <td className="py-3 tech-mono font-bold text-[#193029]">{ev.participants_count}</td>
                <td className="py-3">
                  <StatusBadge status={ev.status} size="sm" />
                </td>
                <td className="py-3 text-slate-500 text-right tech-mono">
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
