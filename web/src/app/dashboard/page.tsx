"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { GridVitalsBanner } from "@/components/dashboard/GridVitalsBanner";
import { RegionalCapacityPanel } from "@/components/dashboard/RegionalCapacityPanel";
import { HybridClustersPanel } from "@/components/dashboard/HybridClustersPanel";
import { PastEventsSummary } from "@/components/dashboard/PastEventsSummary";
import { MobileDispatchModal } from "@/components/dashboard/MobileDispatchModal";
import { getClusters } from "@/lib/api/clusters";
import { getEvents } from "@/lib/api/events";
import { mockStore } from "@/lib/mock/mockStore";
import { MOCK_GRID_VITALS, MOCK_REGIONS } from "@/lib/mock/regions";
import { Cluster, GridRegion } from "@/lib/types";
import { VPPEventHistoryItem } from "@/lib/mock/events";
import { Zap, RefreshCw } from "lucide-react";

export default function DashboardOverviewPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [events, setEvents] = useState<VPPEventHistoryItem[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetCluster, setModalTargetCluster] = useState<Cluster | null>(null);
  const [modalTargetRegion, setModalTargetRegion] = useState<GridRegion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cls, evts] = await Promise.all([getClusters(), getEvents()]);
      setClusters(cls);
      setEvents(evts);
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to reactive store for live telemetry updates
    const unsubscribe = mockStore.subscribe(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  // Filter clusters if a region is selected
  const activeRegion = MOCK_REGIONS.find((r) => r.id === selectedRegionId);
  const displayedClusters = activeRegion
    ? clusters.filter((c) => activeRegion.cluster_ids.includes(c.id))
    : clusters;

  const handleOpenRegionSupport = (region: GridRegion) => {
    setModalTargetRegion(region);
    const firstCluster = clusters.find((c) => region.cluster_ids.includes(c.id)) || clusters[0];
    setModalTargetCluster(firstCluster);
    setIsModalOpen(true);
  };

  const handleOpenClusterSupport = (cluster: Cluster) => {
    setModalTargetCluster(cluster);
    const parentRegion = MOCK_REGIONS.find((r) => r.cluster_ids.includes(cluster.id)) || null;
    setModalTargetRegion(parentRegion);
    setIsModalOpen(true);
  };

  const handleGlobalSupportClick = () => {
    // Default to the highest stress cluster (Kalamassery)
    const stressedCluster = clusters.find((c) => c.grid_status === "HIGH_STRESS") || clusters[0];
    setModalTargetCluster(stressedCluster);
    setModalTargetRegion(MOCK_REGIONS[1]); // Region 2: Central Zone
    setIsModalOpen(true);
  };

  return (
    <DashboardShell pageTitle="State Load Dispatch Command Center">
      {/* Page Header */}
      <PageHeader
        title="State Load Dispatch Command Center"
        description="Undistributed Energy Management System (UEMS) & Decentralized VPP Coordination for Kerala State Electricity Board."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md text-[#193029] hover:bg-[#88BDA4]/15 transition-all shadow-xs cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleGlobalSupportClick}
              className="btn-primary-theme inline-flex items-center gap-2 text-sm font-semibold shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              Request Grid Support
            </button>
          </div>
        }
      />

      {/* Section 1: Grid Telemetry Vitals & AI Load Prediction */}
      <GridVitalsBanner vitals={MOCK_GRID_VITALS} />

      {/* Section 2: Regional Demand vs Baseline Supply Planning (Region 1, Region 2, Region 3) */}
      <div className="mt-8">
        <RegionalCapacityPanel
          regions={MOCK_REGIONS}
          selectedRegionId={selectedRegionId}
          onSelectRegion={setSelectedRegionId}
          onRequestSupport={handleOpenRegionSupport}
        />
      </div>

      {/* Section 3: Enrolled Renewable Energy Hybrid Clusters (VPP Nodes) */}
      <div className="mt-8">
        <HybridClustersPanel
          clusters={displayedClusters}
          selectedRegionName={activeRegion?.name}
          onRequestClusterSupport={handleOpenClusterSupport}
        />
      </div>

      {/* Section 4: Past Events & Historical Usage */}
      <div className="mt-8">
        <PastEventsSummary events={events} />
      </div>

      {/* Interactive Mobile Dispatch & Central IoT Inverter Handshake Modal */}
      <MobileDispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cluster={modalTargetCluster}
        region={modalTargetRegion}
        allClusters={clusters}
        onDispatchCreated={() => loadData()}
      />
    </DashboardShell>
  );
}
