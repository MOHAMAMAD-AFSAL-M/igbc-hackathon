import React from "react";
import { cn } from "@/lib/utils/cn";
import { GridStatus, DispatchStatus, AvailabilityStatus, ParticipantStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: GridStatus | DispatchStatus | AvailabilityStatus | ParticipantStatus | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  let badgeStyle = "bg-white/60 text-slate-700 border-white/60";
  let dotColor = "bg-slate-400";
  let label = status.replace(/_/g, " ");

  switch (status) {
    // Grid Status
    case "NORMAL":
      badgeStyle = "bg-[#88BDA4]/20 text-[#193029] border-[#88BDA4]/40";
      dotColor = "bg-[#659287]";
      label = "NORMAL";
      break;
    case "WARNING":
      badgeStyle = "bg-amber-500/15 text-amber-900 border-amber-500/30";
      dotColor = "bg-amber-500";
      label = "WARNING";
      break;
    case "HIGH_STRESS":
      badgeStyle = "bg-orange-500/15 text-orange-950 border-orange-500/40 font-semibold";
      dotColor = "bg-orange-500";
      label = "HIGH STRESS";
      break;
    case "CRITICAL":
      badgeStyle = "bg-rose-500/15 text-rose-950 border-rose-500/40 font-bold";
      dotColor = "bg-rose-600 animate-pulse";
      label = "CRITICAL";
      break;

    // Dispatch Status
    case "ACTIVE":
      badgeStyle = "bg-[#659287]/20 text-[#193029] border-[#659287]/40 font-semibold shadow-xs";
      dotColor = "bg-[#659287] radar-live";
      label = "ACTIVE";
      break;
    case "AWAITING_RESPONSES":
      badgeStyle = "bg-amber-500/15 text-amber-900 border-amber-500/35";
      dotColor = "bg-amber-500 animate-pulse";
      label = "AWAITING RESPONSES";
      break;
    case "ALLOCATING":
      badgeStyle = "bg-[#88BDA4]/25 text-[#193029] border-[#88BDA4]/50";
      dotColor = "bg-[#659287] animate-pulse";
      label = "ALLOCATING";
      break;
    case "CREATED":
      badgeStyle = "bg-slate-500/10 text-slate-700 border-slate-300/60";
      dotColor = "bg-slate-500";
      label = "CREATED";
      break;
    case "COMPLETED":
      badgeStyle = "bg-[#88BDA4]/30 text-[#193029] border-[#659287]/40 font-semibold";
      dotColor = "bg-[#659287]";
      label = "COMPLETED";
      break;
    case "PARTIAL":
      badgeStyle = "bg-amber-500/15 text-amber-900 border-amber-500/35";
      dotColor = "bg-amber-500";
      label = "PARTIAL";
      break;
    case "CANCELLED":
      badgeStyle = "bg-slate-500/10 text-slate-500 border-slate-300/40 line-through";
      dotColor = "bg-slate-400";
      label = "CANCELLED";
      break;

    // Availability & Participant Status
    case "AVAILABLE":
    case "ACCEPTED":
      badgeStyle = "bg-[#88BDA4]/25 text-[#193029] border-[#88BDA4]/40";
      dotColor = "bg-[#659287]";
      break;
    case "PENDING":
      badgeStyle = "bg-amber-500/15 text-amber-900 border-amber-500/30";
      dotColor = "bg-amber-500";
      break;
    case "DECLINED":
    case "UNAVAILABLE":
      badgeStyle = "bg-rose-500/15 text-rose-900 border-rose-500/30";
      dotColor = "bg-rose-500";
      break;
    case "OFFLINE":
    case "EXCLUDED":
      badgeStyle = "bg-slate-500/10 text-slate-500 border-slate-300/40";
      dotColor = "bg-slate-400";
      break;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border backdrop-blur-md transition-colors tech-mono",
        badgeStyle,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      {label}
    </span>
  );
}
