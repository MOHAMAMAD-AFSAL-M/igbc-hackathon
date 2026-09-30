import React from "react";
import { DispatchTimelineEvent } from "@/lib/types";
import { Clock } from "lucide-react";

export function DispatchTimeline({ timeline }: { timeline: DispatchTimelineEvent[] }) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#659287]" />
          Live Event Timeline
        </h3>
        <span className="text-[11px] text-[#52796f] font-semibold tech-mono">SLDC Dispatch Log</span>
      </div>

      <div className="mt-5 relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#88BDA4]/30">
        {timeline.map((item) => {
          let dot = "bg-[#659287] border-white text-white";
          if (item.type === "success") dot = "bg-[#88BDA4] border-white text-white shadow-xs";
          if (item.type === "active") dot = "bg-[#659287] border-white text-white radar-live shadow-md";
          if (item.type === "warning") dot = "bg-amber-500 border-white text-white";

          return (
            <div key={item.id} className="relative group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${dot}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[#193029]">{item.title}</span>
                  <span className="text-[11px] text-[#52796f] tech-mono">{item.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#3a6055] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
