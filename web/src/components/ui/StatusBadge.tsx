import React from "react";
import { cn } from "@/lib/utils/cn";
import { GridStatus, DispatchStatus, AvailabilityStatus, ParticipantStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: GridStatus | DispatchStatus | AvailabilityStatus | ParticipantStatus | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";
  let label = status.replace(/_/g, " ");

  switch (status) {
    // Grid Status
    case "NORMAL":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      label = "NORMAL";
      break;
    case "WARNING":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
      label = "WARNING";
      break;
    case "HIGH_STRESS":
      badgeStyle = "bg-orange-50 text-orange-700 border-orange-300 font-semibold";
      dotColor = "bg-orange-500";
      label = "HIGH STRESS";
      break;
    case "CRITICAL":
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-300 font-bold";
      dotColor = "bg-rose-600 animate-pulse";
      label = "CRITICAL";
      break;

    // Dispatch Status
    case "ACTIVE":
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-300 font-semibold";
      dotColor = "bg-blue-600 radar-live";
      label = "ACTIVE";
      break;
    case "AWAITING_RESPONSES":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-300";
      dotColor = "bg-amber-500 animate-pulse";
      label = "AWAITING RESPONSES";
      break;
    case "ALLOCATING":
      badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
      dotColor = "bg-indigo-500 animate-pulse";
      label = "ALLOCATING";
      break;
    case "CREATED":
      badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
      dotColor = "bg-slate-500";
      label = "CREATED";
      break;
    case "COMPLETED":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium";
      dotColor = "bg-emerald-500";
      label = "COMPLETED";
      break;
    case "PARTIAL":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-300";
      dotColor = "bg-amber-500";
      label = "PARTIAL";
      break;
    case "CANCELLED":
      badgeStyle = "bg-slate-100 text-slate-500 border-slate-200 line-through";
      dotColor = "bg-slate-400";
      label = "CANCELLED";
      break;

    // Availability & Participant Status
    case "AVAILABLE":
    case "ACCEPTED":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;
    case "PENDING":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
      break;
    case "DECLINED":
    case "UNAVAILABLE":
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
      break;
    case "OFFLINE":
    case "EXCLUDED":
      badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
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
        "inline-flex items-center rounded-full border transition-colors tech-mono",
        badgeStyle,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      {label}
    </span>
  );
}
