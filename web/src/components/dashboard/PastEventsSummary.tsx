"use client";

import React from "react";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { formatPower, formatEnergy, formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { History, ArrowRight, Zap, Award, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PastEventsSummaryProps {
  events: VPPEventHistoryItem[];
}

export function PastEventsSummary({ events }: PastEventsSummaryProps) {
  const totalEnergy = events.reduce((sum, e) => sum + (e.energy_delivered_kwh || 0), 0);
  const totalIncentive = events.reduce((sum, e) => sum + (e.total_incentive || 0), 0);
  const completedEvents = events.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="space-y-4">
      {/* Header and Aggregate Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
            <History className="w-4 h-4 text-[#659287]" />
            Past VPP Support Events & Historical Usage
          </h2>
          <p className="text-xs text-slate-500">
            Archive of past demand response sessions showing dispatched energy and prosumer incentives.
          </p>
        </div>

        <Link
          href="/dashboard/events"
          className="text-xs font-semibold text-[#659287] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          View Complete History <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#88BDA4]/20 text-[#659287]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Past Events Used</span>
            <span className="text-base font-bold text-[#193029] tech-mono">{events.length} Sessions Executed</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#659287]/20 text-[#659287]">
            <Zap className="w-4 h-4 fill-[#659287]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative Battery Infeed</span>
            <span className="text-base font-bold text-[#659287] tech-mono">{formatEnergy(totalEnergy)} Delivered</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#88BDA4]/20 text-[#659287]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Prosumer Rewards</span>
            <span className="text-base font-bold text-[#193029] tech-mono">{formatCurrency(totalIncentive)} Settled</span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#659287]/10 backdrop-blur-md border-b border-[#88BDA4]/25">
              <tr className="text-[#193029]/70 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-bold">Event ID</th>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Target Cluster</th>
                <th className="py-3 px-4 font-bold">Requested</th>
                <th className="py-3 px-4 font-bold">Delivered Infeed</th>
                <th className="py-3 px-4 font-bold">Duration</th>
                <th className="py-3 px-4 font-bold text-center">Hybrid Prosumers</th>
                <th className="py-3 px-4 font-bold">Total Incentive</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#88BDA4]/15 bg-white/60 backdrop-blur-sm">
              {events.slice(0, 5).map((ev) => (
                <tr key={ev.id} className="hover:bg-[#88BDA4]/10 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#193029] tech-mono">
                    {ev.id}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-medium text-[#193029]">
                      {new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="text-[10px] text-slate-400">{formatRelativeTime(ev.date)}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#193029]">{ev.cluster_name}</td>
                  <td className="py-3 px-4 tech-mono text-slate-700">{formatPower(ev.requested_kw)}</td>
                  <td className="py-3 px-4 tech-mono font-bold text-[#659287]">
                    {formatPower(ev.delivered_kw)} ({formatEnergy(ev.energy_delivered_kwh)})
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatDuration(ev.duration_minutes)}</td>
                  <td className="py-3 px-4 text-center font-bold text-[#193029] tech-mono">
                    {ev.participants_count} Homes
                  </td>
                  <td className="py-3 px-4 font-bold text-[#659287] tech-mono">
                    {formatCurrency(ev.total_incentive)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ev.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
