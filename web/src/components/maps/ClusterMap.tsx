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
      <div className="w-full h-[420px] rounded-xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm font-medium">Loading Kerala VPP Grid Map...</span>
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
