"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Cluster } from "@/lib/types";
import { Loader2 } from "lucide-react";

const LeafletClusterMap = dynamic(
  () => import("./LeafletClusterMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] rounded-2xl border border-white/80 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#659287] mb-2" />
        <span className="text-sm font-medium text-[#193029]">Loading Kerala VPP Grid Map...</span>
      </div>
    ),
  }
);

interface ClusterMapProps {
  clusters: Cluster[];
  selectedClusterId?: string;
  onSelectCluster?: (cluster: Cluster) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

export function ClusterMap(props: ClusterMapProps) {
  return <LeafletClusterMap {...props} />;
}
