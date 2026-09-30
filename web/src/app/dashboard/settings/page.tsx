"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RealtimeIndicator } from "@/components/ui/RealtimeIndicator";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { User, Settings, Database, Server, Shield, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const [incentiveRate, setIncentiveRate] = useState("10.00");
  const [minReserveSoc, setMinReserveSoc] = useState("20");
  const [defaultDuration, setDefaultDuration] = useState("120");
  const [saved, setSaved] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardShell pageTitle="System Settings">
      <PageHeader
        title="Settings & Operational Parameters"
        description="Configure VPP dispatch rules, incentive rates, reserve safety thresholds, and monitor backend integration parameters."
      />

      <div className="space-y-6 max-w-4xl">
        {/* Section 1: Operator Profile */}
        <div className="glass-panel rounded-2xl p-6 border border-white/80 shadow-md">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#88BDA4]/20 mb-5">
            <User className="w-5 h-5 text-[#659287]" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
                Operator Station Profile
              </h3>
              <p className="text-xs text-slate-500">Authorized SLDC operator identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#193029]/70 uppercase font-semibold mb-1">Operator Name</label>
              <input
                type="text"
                readOnly
                value="KSEB Operator 04"
                className="w-full py-2 px-3 bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 rounded-xl text-[#193029] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#193029]/70 uppercase font-semibold mb-1">Email Address</label>
              <input
                type="text"
                readOnly
                value="operator@kseb.demo"
                className="w-full py-2 px-3 bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 rounded-xl text-[#193029] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#193029]/70 uppercase font-semibold mb-1">Role & Authority</label>
              <input
                type="text"
                readOnly
                value="KSEB_OPERATOR (Load Dispatch Authority)"
                className="w-full py-2 px-3 bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 rounded-xl text-[#193029] font-bold tech-mono"
              />
            </div>
            <div>
              <label className="block text-[#193029]/70 uppercase font-semibold mb-1">Station Jurisdiction</label>
              <input
                type="text"
                readOnly
                value="Kerala State Load Dispatch Center (Kalamassery)"
                className="w-full py-2 px-3 bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 rounded-xl text-[#193029] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: VPP Configuration */}
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-6 border border-white/80 shadow-md">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#88BDA4]/20 mb-5">
            <Settings className="w-5 h-5 text-[#659287]" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
                VPP Grid Support Policy Parameters
              </h3>
              <p className="text-xs text-slate-500">Economic incentive rates and battery safety reserve policies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#193029] font-bold mb-1">
                Incentive Rate (₹ / kWh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#659287] font-bold">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={incentiveRate}
                  onChange={(e) => setIncentiveRate(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-[#193029] font-bold tech-mono focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Paid to prosumers for battery discharge</p>
            </div>

            <div>
              <label className="block text-[#193029] font-bold mb-1">
                Minimum Reserve Policy (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={minReserveSoc}
                  onChange={(e) => setMinReserveSoc(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-[#193029] font-bold tech-mono focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
                />
                <span className="absolute right-3 top-2 text-[#659287] font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Safeguards home battery emergency buffer</p>
            </div>

            <div>
              <label className="block text-[#193029] font-bold mb-1">
                Default Dispatch Duration (mins)
              </label>
              <input
                type="number"
                step="15"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-3 py-2 bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-[#193029] font-bold tech-mono focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
              />
              <p className="text-[11px] text-slate-500 mt-1">Pre-filled dispatch window</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#88BDA4]/20 flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-semibold text-[#659287] flex items-center gap-1">
                <Check className="w-4 h-4" /> Parameters saved successfully
              </span>
            ) : (
              <span className="text-xs text-slate-400">Values apply to newly generated dispatches</span>
            )}

            <button
              type="submit"
              className="btn-primary-theme inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Parameters
            </button>
          </div>
        </form>

        {/* Section 3: Supabase & Telemetry Engine Status */}
        <div className="glass-panel rounded-2xl p-6 border border-white/80 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-[#88BDA4]/20 mb-5">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#659287]" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#193029]">
                  Backend & Realtime Connection
                </h3>
                <p className="text-xs text-slate-500">Supabase PostgreSQL and simulation engine status</p>
              </div>
            </div>
            <RealtimeIndicator />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#193029] block">Active Data Access Layer:</span>
                <span className="text-slate-500">
                  {isConfigured
                    ? "Connected to live Supabase project"
                    : "Standalone Mock Engine with reactive simulation loop"}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold tech-mono border ${
                  isConfigured ? "bg-[#88BDA4]/20 text-[#659287] border-[#88BDA4]/40" : "bg-[#659287]/15 text-[#193029] border-[#659287]/30"
                }`}
              >
                {isConfigured ? "SUPABASE LIVE" : "MOCK ENGINE ACTIVE"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#193029] block">Supabase Client:</span>
                <span className="text-slate-500">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || "Configured via .env.local"}
                </span>
              </div>
              <span className="text-slate-500 tech-mono text-[11px]">v2.117.2</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/60 backdrop-blur-md border border-[#88BDA4]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#193029] block">Telemetry Sync:</span>
                <span className="text-slate-500">Heartbeat check every 5 seconds</span>
              </div>
              <span className="text-[#659287] font-semibold tech-mono text-[11px]">Synced (0 errors)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
