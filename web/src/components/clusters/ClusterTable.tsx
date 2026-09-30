import React from "react";
import { Cluster } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ClusterTable({ clusters }: { clusters: Cluster[] }) {
  return (
    <div className="tech-panel rounded-xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 font-bold">Cluster</th>
              <th className="py-3 px-4 font-bold">Substation</th>
              <th className="py-3 px-4 font-bold">Grid Status</th>
              <th className="py-3 px-4 font-bold text-center">Prosumers</th>
              <th className="py-3 px-4 font-bold">Available kW</th>
              <th className="py-3 px-4 font-bold">Available Energy</th>
              <th className="py-3 px-4 font-bold text-center">Avg SoC</th>
              <th className="py-3 px-4 font-bold">Current Load</th>
              <th className="py-3 px-4 font-bold text-center">Active</th>
              <th className="py-3 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {clusters.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                  <Link href={`/dashboard/clusters/${c.id}`} className="hover:text-blue-600">
                    {c.name}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{c.substation}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={c.grid_status} size="sm" />
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-800 tech-mono">
                  {c.prosumer_count || 0}
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-600 tech-mono">
                  {formatPower(c.available_capacity_kw)}
                </td>
                <td className="py-3.5 px-4 text-emerald-600 tech-mono">
                  {formatEnergy(c.available_energy_kwh)}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-700 tech-mono">
                  {formatPercent(c.average_soc)}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 tech-mono">
                  {formatPower(c.current_load_kw)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {c.active_dispatches_count && c.active_dispatches_count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      {c.active_dispatches_count} active
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">None</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/dashboard/clusters/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
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
