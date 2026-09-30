"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDispatches } from "@/lib/api/dispatch";
import { DispatchRequest } from "@/lib/types";
import { formatPower, formatDuration, formatRelativeTime } from "@/lib/utils/formatters";
import { mockStore } from "@/lib/mock/mockStore";
import Link from "next/link";
import { Zap, Plus, ArrowRight, Filter, Search } from "lucide-react";

export default function DispatchListPage() {
  const [dispatches, setDispatches] = useState<DispatchRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const list = await getDispatches();
    setDispatches(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = mockStore.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const filtered = dispatches.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.cluster_name && d.cluster_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell pageTitle="Dispatch Control">
      <PageHeader
        title="Dispatch Control"
        description="Initiate and monitor VPP demand-response events, live load curtailment, and prosumer battery discharges."
        actions={
          <Link
            href="/dashboard/dispatch/new"
            className="btn-primary-theme inline-flex items-center gap-2 text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" /> Request Grid Support
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#659287] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Dispatch ID or Cluster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-[#193029] focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#659287] shrink-0" />
          {["ALL", "ACTIVE", "AWAITING_RESPONSES", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 tech-mono ${
                statusFilter === status
                  ? "bg-[#659287] text-white shadow-xs"
                  : "bg-white/60 text-[#193029]/80 border border-[#88BDA4]/30 hover:bg-[#88BDA4]/20"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#659287]/10 backdrop-blur-md border-b border-[#88BDA4]/25">
              <tr className="text-[#193029]/70 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-bold">Dispatch ID</th>
                <th className="py-3 px-4 font-bold">Cluster</th>
                <th className="py-3 px-4 font-bold">Requested</th>
                <th className="py-3 px-4 font-bold">Accepted</th>
                <th className="py-3 px-4 font-bold">Delivered</th>
                <th className="py-3 px-4 font-bold">Duration</th>
                <th className="py-3 px-4 font-bold text-center">Prosumers</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Created</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#88BDA4]/15 bg-white/60 backdrop-blur-sm">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#88BDA4]/10 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#193029] tech-mono">
                    <Link href={`/dashboard/dispatch/${d.id}`} className="hover:text-[#659287]">
                      {d.id}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#193029]">{d.cluster_name}</td>
                  <td className="py-3.5 px-4 tech-mono text-slate-700">{formatPower(d.requested_kw)}</td>
                  <td className="py-3.5 px-4 tech-mono font-bold text-[#659287]">
                    {formatPower(d.accepted_kw)}
                  </td>
                  <td className="py-3.5 px-4 tech-mono font-bold text-[#659287]">
                    {formatPower(d.delivered_kw)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{formatDuration(d.duration_minutes)}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#193029] tech-mono">
                    {d.participants_count || 0}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-right tech-mono">
                    {formatRelativeTime(d.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/dispatch/${d.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#659287] hover:text-[#193029]"
                    >
                      Console <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
