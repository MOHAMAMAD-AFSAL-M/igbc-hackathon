import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, Zap, BatteryCharging, Users, Activity } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ClusterCard({ cluster }: { cluster: Cluster }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 hover:shadow-xl transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base text-[#193029] leading-tight group-hover:text-[#659287] transition-colors">
              {cluster.name}
            </h3>
            <p className="text-xs text-[#52796f] mt-0.5">{cluster.substation}</p>
          </div>
          <StatusBadge status={cluster.grid_status} size="sm" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#88BDA4]/20 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#52796f] flex items-center gap-1">
              <Users className="w-3 h-3 text-[#659287]" /> Prosumers
            </span>
            <span className="text-base font-extrabold text-[#193029] tech-mono mt-1 block">
              {cluster.prosumer_count || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#88BDA4]/15 border border-[#88BDA4]/30 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#345b50] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#659287]" /> Avail Power
            </span>
            <span className="text-base font-extrabold text-[#659287] tech-mono mt-1 block">
              {formatPower(cluster.available_capacity_kw)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#659287]/15 border border-[#659287]/30 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#28483f] flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-[#52796f]" /> Avail Energy
            </span>
            <span className="text-base font-extrabold text-[#457b6d] tech-mono mt-1 block">
              {formatEnergy(cluster.available_energy_kwh)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 border border-[#88BDA4]/20 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#52796f] flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#659287]" /> Avg SoC
            </span>
            <span className="text-base font-extrabold text-[#193029] tech-mono mt-1 block">
              {formatPercent(cluster.average_soc)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#88BDA4]/20 flex items-center justify-between">
        <Link
          href={`/dashboard/dispatch/new?cluster=${cluster.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg btn-primary-theme flex items-center gap-1"
        >
          <Zap className="w-3 h-3 fill-white" /> Request Support
        </Link>
        <Link
          href={`/dashboard/clusters/${cluster.id}`}
          className="text-xs font-bold text-[#659287] hover:text-[#52796f] flex items-center gap-1 transition-colors"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
