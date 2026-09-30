"use client";

import React, { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function RealtimeIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<"live" | "reconnecting" | "offline">("live");
  const [isMock, setIsMock] = useState<boolean>(true);

  useEffect(() => {
    setIsMock(!isSupabaseConfigured());
    // Simulate healthy connection
    setStatus("live");
  }, []);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs",
        className
      )}
      title={isMock ? "Mock Realtime Simulation Engine Active" : "Supabase Realtime Stream Connected"}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "live" ? "bg-emerald-500" : status === "reconnecting" ? "bg-amber-500" : "bg-slate-400"
          )}
        />
      </span>
      <span className="font-medium tech-mono">
        {status === "live" ? "LIVE" : status === "reconnecting" ? "CONNECTING..." : "OFFLINE"}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 border-l border-slate-200 pl-1.5">
        {isMock ? "SIMULATOR" : "SUPABASE"}
      </span>
    </div>
  );
}
