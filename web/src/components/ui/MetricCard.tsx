import React from "react";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accentColor?: "blue" | "green" | "amber" | "rose" | "slate";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "blue",
  className,
}: MetricCardProps) {
  const accentClasses = {
    blue: "border-l-blue-600 text-blue-600 bg-blue-50/50",
    green: "border-l-emerald-600 text-emerald-600 bg-emerald-50/50",
    amber: "border-l-amber-500 text-amber-600 bg-amber-50/50",
    rose: "border-l-rose-600 text-rose-600 bg-rose-50/50",
    slate: "border-l-slate-600 text-slate-600 bg-slate-50/50",
  };

  return (
    <div
      className={cn(
        "tech-panel rounded-lg p-5 border-l-4 transition-all duration-200 hover:shadow-md",
        accentClasses[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-md bg-white border border-slate-200 shadow-2xs">
            <Icon className="w-4 h-4 text-slate-700" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tech-mono">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
