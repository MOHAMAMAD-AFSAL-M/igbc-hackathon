"use client";

import React, { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function RealtimeIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<"live" | "reconnecting" | "offline">("live");
  const [isMock, setIsMock] = useState<boolean>(true);

  useEffect(() => {
    setIsMock(!isSupabaseConfigured());
    setStatus("live");
  }, []);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#88BDA4]/40 bg-white/75 backdrop-blur-md px-3 py-1 text-xs text-[#193029] shadow-xs",
        className
      )}
      title={isMock ? "Mock Realtime Simulation Engine Active" : "Supabase Realtime Stream Connected"}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#88BDA4] opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            status === "live" ? "bg-[#659287]" : status === "reconnecting" ? "bg-amber-500" : "bg-slate-400"
          )}
        />
      </span>
      <span className="font-bold tech-mono text-[11px] tracking-wide">
        {status === "live" ? "LIVE" : status === "reconnecting" ? "CONNECTING..." : "OFFLINE"}
      </span>
      <span className="text-[10px] uppercase font-bold tracking-wider text-[#52796f] border-l border-[#88BDA4]/30 pl-2">
        {isMock ? "SIMULATOR" : "SUPABASE"}
      </span>
    </div>
  );
}
