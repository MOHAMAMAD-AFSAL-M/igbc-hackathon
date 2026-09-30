"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClusterTable } from "@/components/clusters/ClusterTable";
import { ClusterCard } from "@/components/clusters/ClusterCard";
import { ClusterMap } from "@/components/maps/ClusterMap";
import { getClusters } from "@/lib/api/clusters";
import { Cluster } from "@/lib/types";
import { LayoutGrid, List, MapPin, Search, Filter, Zap } from "lucide-react";
import Link from "next/link";

export default function ClustersPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards" | "map">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getClusters();
      setClusters(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredClusters = clusters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.substation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.grid_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell pageTitle="Grid Clusters">
      <PageHeader
        title="Grid Clusters"
        description="Monitor distributed battery capacity, substation feeder loads, and stress indicators across regional electrical clusters."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Map
              </button>
            </div>

            <Link
              href="/dashboard/dispatch/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Request Support
            </Link>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="tech-panel rounded-xl p-4 border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by cluster name, substation or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {["ALL", "NORMAL", "WARNING", "HIGH_STRESS", "CRITICAL"].map((status) => (
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

      {/* Views */}
      {viewMode === "table" && <ClusterTable clusters={filteredClusters} />}

      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}

      {viewMode === "map" && (
        <div className="tech-panel rounded-xl p-5 border border-slate-200">
          <ClusterMap clusters={filteredClusters} height="520px" />
        </div>
      )}
    </DashboardShell>
  );
}
