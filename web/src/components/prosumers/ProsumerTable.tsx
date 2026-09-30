import React from "react";
import { Prosumer } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPower, formatEnergy, formatPercent } from "@/lib/utils/formatters";

export function ProsumerTable({ prosumers }: { prosumers: Prosumer[] }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/40 border-b border-[#88BDA4]/30">
            <tr className="text-[#52796f] uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4 font-bold">Prosumer ID</th>
              <th className="py-3.5 px-4 font-bold">Client Name</th>
              <th className="py-3.5 px-4 font-bold">Cluster</th>
              <th className="py-3.5 px-4 font-bold text-center">SoC</th>
              <th className="py-3.5 px-4 font-bold">Battery Cap</th>
              <th className="py-3.5 px-4 font-bold">Max Discharge</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-center">Mode</th>
              <th className="py-3.5 px-4 font-bold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#88BDA4]/15">
            {prosumers.map((p) => (
              <tr key={p.id} className="hover:bg-white/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#193029] tech-mono">
                  <Link href={`/dashboard/prosumers/${p.id}`} className="hover:text-[#659287] transition-colors">
                    {p.prosumer_code}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#28483f]">{p.name}</td>
                <td className="py-3.5 px-4 text-[#52796f]">{p.cluster_name}</td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold tech-mono text-xs shadow-2xs backdrop-blur-md ${
                      p.current_soc >= 75
                        ? "bg-[#88BDA4]/30 text-[#193029] border border-[#88BDA4]/50"
                        : p.current_soc >= 40
                        ? "bg-amber-500/15 text-amber-900 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-900 border border-rose-500/30"
                    }`}
                  >
                    {formatPercent(p.current_soc)}
                  </span>
                </td>
                <td className="py-3.5 px-4 tech-mono font-medium text-[#28483f]">
                  {formatEnergy(p.battery_capacity_kwh)}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-[#659287] tech-mono">
                  {formatPower(p.max_discharge_kw)}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={p.availability_status} size="sm" />
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#28483f] bg-[#88BDA4]/20 border border-[#88BDA4]/35 px-2 py-0.5 rounded-md">
                    {p.participation_mode}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/dashboard/prosumers/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#659287] hover:text-[#52796f] transition-colors"
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
