import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, Zap, BatteryCharging, Users, Activity } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ClusterCard({ cluster }: { cluster: Cluster }) {
  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              {cluster.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{cluster.substation}</p>
          </div>
          <StatusBadge status={cluster.grid_status} size="sm" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Prosumers
            </span>
            <span className="text-base font-bold text-slate-900 tech-mono mt-1 block">
              {cluster.prosumer_count || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-500" /> Avail Power
            </span>
            <span className="text-base font-bold text-blue-600 tech-mono mt-1 block">
              {formatPower(cluster.available_capacity_kw)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-500" /> Avail Energy
            </span>
            <span className="text-base font-bold text-emerald-600 tech-mono mt-1 block">
              {formatEnergy(cluster.available_energy_kwh)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" /> Avg SoC
            </span>
            <span className="text-base font-bold text-slate-800 tech-mono mt-1 block">
              {formatPercent(cluster.average_soc)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/dashboard/dispatch/new?cluster=${cluster.id}`}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors flex items-center gap-1"
        >
          <Zap className="w-3 h-3 fill-white" /> Request Support
        </Link>
        <Link
          href={`/dashboard/clusters/${cluster.id}`}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
