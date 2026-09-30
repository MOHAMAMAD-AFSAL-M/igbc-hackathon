"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

// Helper to recolor markers by Grid Status
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
      return { fill: "#10b981", stroke: "#047857" };
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
  center = [10.2, 76.4], // Center on central Kerala (Ernakulam/Thrissur)
}: LeafletClusterMapProps) {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapViewController center={center} zoom={zoom} />

        {/* Clean OpenStreetMap CartoDB Positron style tiles for technical command center look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                fillOpacity: 0.85,
                color: colors.stroke,
                weight: isSelected ? 3 : 2,
              }}
              radius={radius}
              eventHandlers={{
                click: () => onSelectCluster && onSelectCluster(cluster),
              }}
            >
              <Popup className="tech-popup">
                <div className="p-1 min-w-[210px] text-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {cluster.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{cluster.substation}</p>
                    </div>
                    <StatusBadge status={cluster.grid_status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1">
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-semibold">
                        <Users className="w-3 h-3 text-slate-400" /> Prosumers
                      </span>
                      <p className="font-bold text-slate-900 text-sm tech-mono">
                        {cluster.prosumer_count || 0}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-semibold">
                        <Zap className="w-3 h-3 text-blue-500" /> Avail Power
                      </span>
                      <p className="font-bold text-blue-600 text-sm tech-mono">
                        {formatPower(cluster.available_capacity_kw)}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1 font-semibold">
                        <BatteryCharging className="w-3 h-3 text-emerald-500" /> Avail Energy
                      </span>
                      <p className="font-bold text-emerald-600 text-sm tech-mono">
                        {formatEnergy(cluster.available_energy_kwh)}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">
                        Avg SoC
                      </span>
                      <p className="font-bold text-slate-900 text-sm tech-mono">
                        {formatPercent(cluster.average_soc)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 tech-mono">ID: {cluster.id}</span>
                    <Link
                      href={`/dashboard/clusters/${cluster.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
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

      {/* Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-sm text-xs">
        <span className="font-semibold text-slate-700 block mb-1.5 text-[10px] uppercase tracking-wider">
          Grid Stress Level
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-600">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] text-slate-600">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-[11px] text-slate-600">High Stress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-[11px] text-slate-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
