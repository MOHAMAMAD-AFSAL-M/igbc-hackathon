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
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Request Grid Support
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="tech-panel rounded-xl p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Dispatch ID or Cluster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {["ALL", "ACTIVE", "AWAITING_RESPONSES", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors shrink-0 tech-mono ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="tech-panel rounded-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 tech-mono">
                    <Link href={`/dashboard/dispatch/${d.id}`} className="hover:text-blue-600">
                      {d.id}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{d.cluster_name}</td>
                  <td className="py-3.5 px-4 tech-mono text-slate-700">{formatPower(d.requested_kw)}</td>
                  <td className="py-3.5 px-4 tech-mono font-bold text-blue-600">
                    {formatPower(d.accepted_kw)}
                  </td>
                  <td className="py-3.5 px-4 tech-mono font-bold text-emerald-600">
                    {formatPower(d.delivered_kw)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{formatDuration(d.duration_minutes)}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 tech-mono">
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
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
