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
            <div className="flex items-center rounded-xl border border-white/80 bg-white/70 backdrop-blur-md p-1 shadow-xs">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "table"
                    ? "bg-[#659287] text-white shadow-xs"
                    : "text-[#28483f] hover:bg-[#88BDA4]/15"
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "cards"
                    ? "bg-[#659287] text-white shadow-xs"
                    : "text-[#28483f] hover:bg-[#88BDA4]/15"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "map"
                    ? "bg-[#659287] text-white shadow-xs"
                    : "text-[#28483f] hover:bg-[#88BDA4]/15"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Map
              </button>
            </div>

            <Link
              href="/dashboard/dispatch/new"
              className="btn-primary-theme inline-flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-white" /> Request Support
            </Link>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/80 shadow-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#659287] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by cluster name, substation or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-[#193029] focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#659287] shrink-0" />
          {["ALL", "NORMAL", "WARNING", "HIGH_STRESS", "CRITICAL"].map((status) => (
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
        <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-md">
          <ClusterMap clusters={filteredClusters} height="520px" />
        </div>
      )}
    </DashboardShell>
  );
}
