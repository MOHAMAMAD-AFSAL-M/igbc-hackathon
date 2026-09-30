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
    <header className="sticky top-3 z-20 flex h-14 w-[calc(100%-1.5rem)] mx-auto items-center justify-between glass-nav px-4 sm:px-6 rounded-2xl mt-3 border border-[#88BDA4]/20 shadow-lg">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg text-[#28483f] hover:bg-[#88BDA4]/20 transition-colors duration-200 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block font-bold text-[#193029] text-sm">
            {title}
          </span>
          <span className="hidden md:inline-block text-[#88BDA4]">|</span>
          <span className="text-xs text-[#3a6055] font-medium hidden md:inline-block">
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
            className="relative p-2 rounded-xl text-[#28483f] hover:bg-[#88BDA4]/20 transition-colors duration-200 border border-transparent hover:border-[#88BDA4]/30 cursor-pointer"
            title="Grid Alerts & Notifications"
            aria-label="Grid Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-white/80">
              <div className="flex items-center justify-between pb-3 border-b border-[#88BDA4]/20">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#193029]">Grid Notifications</h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#88BDA4]/30 text-[#193029] text-[10px] font-bold">
                    3 new
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#3a6055] hover:text-[#193029] transition-colors duration-200 cursor-pointer p-1 rounded-lg hover:bg-[#88BDA4]/15"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-[#88BDA4]/15 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#193029]">{item.title}</span>
                      <span className="text-[10px] text-[#3a6055]">{item.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#3a6055]">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-[#88BDA4]/20">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#659287] hover:text-[#52796f] transition-colors duration-200 cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#88BDA4]/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white flex items-center justify-center font-bold text-xs shadow-sm border border-white/40">
            KO
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-bold text-[#193029]">Operator 04</p>
            <p className="text-[10px] text-[#3a6055]">KSEB SLDC</p>
          </div>
        </div>
      </div>
    </header>
  );
}

