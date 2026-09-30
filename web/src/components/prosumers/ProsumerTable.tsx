import React from "react";
import { Prosumer } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight, BatteryCharging, Zap } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ProsumerTable({ prosumers }: { prosumers: Prosumer[] }) {
  return (
    <div className="tech-panel rounded-xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 font-bold">Prosumer ID</th>
              <th className="py-3 px-4 font-bold">Client Name</th>
              <th className="py-3 px-4 font-bold">Cluster</th>
              <th className="py-3 px-4 font-bold text-center">SoC</th>
              <th className="py-3 px-4 font-bold">Battery Cap</th>
              <th className="py-3 px-4 font-bold">Max Discharge</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold text-center">Mode</th>
              <th className="py-3 px-4 font-bold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {prosumers.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 tech-mono">
                  <Link href={`/dashboard/prosumers/${p.id}`} className="hover:text-blue-600">
                    {p.prosumer_code}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.cluster_name}</td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold tech-mono text-xs ${
                      p.current_soc >= 75
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : p.current_soc >= 40
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {formatPercent(p.current_soc)}
                  </span>
                </td>
                <td className="py-3.5 px-4 tech-mono text-slate-700">
                  {formatEnergy(p.battery_capacity_kwh)}
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-600 tech-mono">
                  {formatPower(p.max_discharge_kw)}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={p.availability_status} size="sm" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {p.participation_mode}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/dashboard/prosumers/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
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
