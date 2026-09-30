import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ClusterTable({ clusters }: { clusters: Cluster[] }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/40 border-b border-[#88BDA4]/30">
            <tr className="text-[#52796f] uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4 font-bold">Cluster</th>
              <th className="py-3.5 px-4 font-bold">Substation</th>
              <th className="py-3.5 px-4 font-bold">Grid Status</th>
              <th className="py-3.5 px-4 font-bold text-center">Prosumers</th>
              <th className="py-3.5 px-4 font-bold">Available kW</th>
              <th className="py-3.5 px-4 font-bold">Available Energy</th>
              <th className="py-3.5 px-4 font-bold text-center">Avg SoC</th>
              <th className="py-3.5 px-4 font-bold">Current Load</th>
              <th className="py-3.5 px-4 font-bold text-center">Active</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#88BDA4]/15">
            {clusters.map((c) => (
              <tr key={c.id} className="hover:bg-white/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#193029] text-sm">
                  <Link href={`/dashboard/clusters/${c.id}`} className="hover:text-[#659287] transition-colors">
                    {c.name}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-[#52796f]">{c.substation}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={c.grid_status} size="sm" />
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-[#193029] tech-mono">
                  {c.prosumer_count || 0}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-[#659287] tech-mono">
                  {formatPower(c.available_capacity_kw)}
                </td>
                <td className="py-3.5 px-4 font-bold text-[#457b6d] tech-mono">
                  {formatEnergy(c.available_energy_kwh)}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-[#28483f] tech-mono">
                  {formatPercent(c.average_soc)}
                </td>
                <td className="py-3.5 px-4 font-bold text-[#193029] tech-mono">
                  {formatPower(c.current_load_kw)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {c.active_dispatches_count && c.active_dispatches_count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#193029] bg-[#88BDA4]/30 px-2 py-0.5 rounded-full border border-[#88BDA4]/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#659287] animate-pulse" />
                      {c.active_dispatches_count} active
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">None</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/dashboard/clusters/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#659287] hover:text-[#52796f] transition-colors"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
