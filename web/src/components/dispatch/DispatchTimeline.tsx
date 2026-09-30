import React from "react";
import { DispatchTimelineEvent } from "@/lib/types";
import { CheckCircle2, Clock, AlertCircle, Radio } from "lucide-react";

export function DispatchTimeline({ timeline }: { timeline: DispatchTimelineEvent[] }) {
  return (
    <div className="tech-panel rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          Live Event Timeline
        </h3>
        <span className="text-[11px] text-slate-400 tech-mono">SLDC Dispatch Log</span>
      </div>

      <div className="mt-5 relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((item) => {
          let dot = "bg-blue-500 border-white text-white";
          if (item.type === "success") dot = "bg-emerald-500 border-white text-white";
          if (item.type === "active") dot = "bg-blue-600 border-white text-white radar-live";
          if (item.type === "warning") dot = "bg-amber-500 border-white text-white";

          return (
            <div key={item.id} className="relative group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-xs ${dot}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                  <span className="text-[11px] text-slate-400 tech-mono">{item.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
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
