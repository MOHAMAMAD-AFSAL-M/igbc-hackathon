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
    blue: "border-l-[#659287] before:bg-[#659287]/10",
    green: "border-l-[#88BDA4] before:bg-[#88BDA4]/15",
    amber: "border-l-amber-500 before:bg-amber-500/10",
    rose: "border-l-rose-500 before:bg-rose-500/10",
    slate: "border-l-[#52796f] before:bg-[#52796f]/10",
  };

  const iconAccent = {
    blue: "text-[#659287] bg-[#659287]/15 border-[#659287]/30",
    green: "text-[#52796f] bg-[#88BDA4]/25 border-[#88BDA4]/40",
    amber: "text-amber-700 bg-amber-100 border-amber-300",
    rose: "text-rose-700 bg-rose-100 border-rose-300",
    slate: "text-[#193029] bg-white/80 border-[#88BDA4]/30",
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5 border-l-4 transition-all duration-300 hover:shadow-xl relative overflow-hidden group",
        accentClasses[accentColor],
        className
      )}
    >
      {/* Subtle top corner glass reflection */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#3a6055]">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "p-2.5 rounded-xl border backdrop-blur-md shadow-xs transition-transform group-hover:scale-105",
              iconAccent[accentColor]
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2 relative z-10">
        <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#193029] tech-mono">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#52796f] font-medium flex items-center gap-1 relative z-10">
          {subtitle}
        </p>
      )}
    </div>
  );
}
