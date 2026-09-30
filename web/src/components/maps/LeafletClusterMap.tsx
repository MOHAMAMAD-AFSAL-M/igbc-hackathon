"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Zap, ArrowRight, BatteryCharging, Users } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

interface LeafletClusterMapProps {
  clusters: Cluster[];
  selectedClusterId?: string;
  onSelectCluster?: (cluster: Cluster) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Recolor markers according to theme + grid stress
function getMarkerColors(status: string) {
  switch (status) {
    case "CRITICAL":
      return { fill: "#e11d48", stroke: "#9f1239" };
    case "HIGH_STRESS":
      return { fill: "#ea580c", stroke: "#c2410c" };
    case "WARNING":
      return { fill: "#d97706", stroke: "#b45309" };
    case "NORMAL":
    default:
      return { fill: "#88BDA4", stroke: "#659287" };
  }
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LeafletClusterMap({
  clusters,
  selectedClusterId,
  onSelectCluster,
  height = "420px",
  zoom = 8,
  center = [10.2, 76.4],
}: LeafletClusterMapProps) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-[#88BDA4]/30 relative shadow-md"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapViewController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => {
          const colors = getMarkerColors(cluster.grid_status);
          const isSelected = cluster.id === selectedClusterId;
          const radius = isSelected ? 16 : 12;

          return (
            <CircleMarker
              key={cluster.id}
              center={[cluster.latitude, cluster.longitude]}
              pathOptions={{
                fillColor: colors.fill,
                fillOpacity: 0.9,
                color: colors.stroke,
                weight: isSelected ? 3 : 2,
              }}
              radius={radius}
              eventHandlers={{
                click: () => onSelectCluster && onSelectCluster(cluster),
              }}
            >
              <Popup className="tech-popup">
                <div className="p-1 min-w-[220px] text-[#193029]">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#88BDA4]/30 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#193029] leading-tight">
                        {cluster.name}
                      </h4>
                      <p className="text-[10px] text-[#52796f]">{cluster.substation}</p>
                    </div>
                    <StatusBadge status={cluster.grid_status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1">
                    <div className="p-1.5 rounded-lg bg-white/80 border border-[#88BDA4]/25">
                      <span className="text-[10px] uppercase text-[#52796f] flex items-center gap-1 font-semibold">
                        <Users className="w-3 h-3 text-[#659287]" /> Prosumers
                      </span>
                      <p className="font-bold text-[#193029] text-sm tech-mono">
                        {cluster.prosumer_count || 0}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 border border-[#88BDA4]/25">
                      <span className="text-[10px] uppercase text-[#52796f] flex items-center gap-1 font-semibold">
                        <Zap className="w-3 h-3 text-[#659287]" /> Avail Power
                      </span>
                      <p className="font-bold text-[#659287] text-sm tech-mono">
                        {formatPower(cluster.available_capacity_kw)}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 border border-[#88BDA4]/25">
                      <span className="text-[10px] uppercase text-[#52796f] flex items-center gap-1 font-semibold">
                        <BatteryCharging className="w-3 h-3 text-[#88BDA4]" /> Avail Energy
                      </span>
                      <p className="font-bold text-[#52796f] text-sm tech-mono">
                        {formatEnergy(cluster.available_energy_kwh)}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 border border-[#88BDA4]/25">
                      <span className="text-[10px] uppercase text-[#52796f] font-semibold">
                        Avg SoC
                      </span>
                      <p className="font-bold text-[#193029] text-sm tech-mono">
                        {formatPercent(cluster.average_soc)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#88BDA4]/20 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 tech-mono">ID: {cluster.id}</span>
                    <Link
                      href={`/dashboard/clusters/${cluster.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#659287] hover:text-[#52796f] transition-colors"
                    >
                      View Cluster <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend Overlay with Glassmorphism */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-[#88BDA4]/40 shadow-lg text-xs">
        <span className="font-bold text-[#193029] block mb-1.5 text-[10px] uppercase tracking-wider">
          Grid Stress Level
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#88BDA4]" />
            <span className="text-[11px] text-[#28483f]">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] text-[#28483f]">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-[11px] text-[#28483f]">High Stress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-[11px] text-[#28483f]">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
