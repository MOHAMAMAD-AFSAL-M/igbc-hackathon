"use client";

import React, { useState } from "react";
import { Bell, Menu, Shield, Zap, X, AlertCircle } from "lucide-react";
import { RealtimeIndicator } from "@/components/ui/RealtimeIndicator";

export function TopNav({
  title = "KSEB VPP Command Center",
  onOpenMobile,
}: {
  title?: string;
  onOpenMobile?: () => void;
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "n1",
      title: "Kalamassery High Grid Stress",
      desc: "Load exceeded 800 kW on Kalamassery 220kV feeder line.",
      time: "5m ago",
      type: "warning",
    },
    {
      id: "n2",
      title: "DSP-1001 Delivery Update",
      desc: "41.0 kW delivered by prosumers with 82% target fulfillment.",
      time: "12m ago",
      type: "info",
    },
    {
      id: "n3",
      title: "New Prosumer Online",
      desc: "P015 joined Thrissur East cluster with 14 kWh reserve.",
      time: "25m ago",
      type: "success",
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block font-semibold text-slate-800 text-sm">
            {title}
          </span>
          <span className="hidden md:inline-block text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium hidden md:inline-block">
            State Load Dispatch Center (SLDC)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <RealtimeIndicator />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Grid Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Grid Notifications</h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    3 new
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            KO
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-semibold text-slate-800">Operator 04</p>
            <p className="text-[10px] text-slate-500">KSEB SLDC</p>
          </div>
        </div>
      </div>
    </header>
  );
}
