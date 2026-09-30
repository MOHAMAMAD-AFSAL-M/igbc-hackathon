import React from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { DashboardKPIData } from "@/lib/types";
import { Users, CheckCircle, Zap, Activity } from "lucide-react";
import { formatPower } from "@/lib/utils/formatters";

export function KPICards({ data }: { data: DashboardKPIData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Prosumers"
        value={data.totalProsumers}
        subtitle={data.totalProsumersChange}
        icon={Users}
        accentColor="slate"
      />
      <MetricCard
        title="Available Now"
        value={data.availableNow}
        subtitle={data.availablePercent}
        icon={CheckCircle}
        accentColor="green"
      />
      <MetricCard
        title="Available Capacity"
        value={formatPower(data.availableCapacityKw)}
        subtitle={data.capacityChange}
        icon={Zap}
        accentColor="blue"
      />
      <MetricCard
        title="Active Support"
        value={formatPower(data.activeSupportKw)}
        subtitle={`${data.activeRequestsCount} active dispatch events`}
        icon={Activity}
        accentColor="amber"
      />
    </div>
  );
}
