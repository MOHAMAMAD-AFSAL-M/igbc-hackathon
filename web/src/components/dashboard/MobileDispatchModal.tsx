"use client";

import React, { useState } from "react";
import { Cluster, GridRegion } from "@/lib/types";
import { createDispatch } from "@/lib/api/dispatch";
import { formatPower } from "@/lib/utils/formatters";
import {
  X,
  Smartphone,
  Zap,
  CheckCircle2,
  Radio,
  Send,
  Loader2,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface MobileDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluster?: Cluster | null;
  region?: GridRegion | null;
  allClusters: Cluster[];
  onDispatchCreated?: (dispatchId: string) => void;
}

export function MobileDispatchModal({
  isOpen,
  onClose,
  cluster,
  region,
  allClusters,
  onDispatchCreated,
}: MobileDispatchModalProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    cluster?.id || (region?.cluster_ids[0] || (allClusters[0]?.id || "CL001"))
  );
  const [targetKw, setTargetKw] = useState<number>(cluster ? Math.min(cluster.available_capacity_kw, 50) : 50);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [step, setStep] = useState<"CONFIG" | "SENDING" | "ACCEPTED">("CONFIG");
  const [createdDispatchId, setCreatedDispatchId] = useState<string>("");
  const [acceptedCount, setAcceptedCount] = useState<number>(0);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);

  if (!isOpen) return null;

  const currentCluster = allClusters.find((c) => c.id === selectedClusterId) || cluster || allClusters[0];

  const handleSendNotification = async () => {
    setStep("SENDING");
    try {
      const newDispatch = await createDispatch({
        cluster_id: selectedClusterId,
        requested_kw: Number(targetKw),
        duration_minutes: Number(durationMinutes),
        notes: `Automated peak shaving support for ${currentCluster?.name}`,
      });

      setCreatedDispatchId(newDispatch.id);
      const total = currentCluster?.prosumer_count || 18;
      setTotalParticipants(total);

      // Simulate live prosumers accepting on their mobile phones
      setTimeout(() => {
        setAcceptedCount(Math.round(total * 0.75));
        setStep("ACCEPTED");
        if (onDispatchCreated) {
          onDispatchCreated(newDispatch.id);
        }
      }, 1800);
    } catch (err) {
      console.error("Failed to trigger mobile dispatch", err);
      setStep("CONFIG");
    }
  };

  const handleReset = () => {
    setStep("CONFIG");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        onClick={handleReset}
        className="fixed inset-0 bg-[#0f1b17]/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-7 border border-white/80 shadow-2xl bg-white/95 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#88BDA4]/25">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#193029]">
                Request Prosumer Grid Support
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast push notification to hybrid solar + battery prosumers via mobile IoT app
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "CONFIG" && (
          <div className="mt-5 space-y-4">
            {/* Cluster Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#193029] mb-1.5">
                Target Hybrid Cluster
              </label>
              <select
                value={selectedClusterId}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="w-full py-2.5 px-3 bg-white/70 backdrop-blur-md border border-[#88BDA4]/40 rounded-xl text-xs text-[#193029] font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
              >
                {allClusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.substation}) — {c.prosumer_count} Hybrid Prosumers &bull; {formatPower(c.available_capacity_kw)} Available
                  </option>
                ))}
              </select>
            </div>

            {/* Target Power & Duration */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#193029] mb-1">
                  Requested Infeed (kW)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={currentCluster?.available_capacity_kw || 100}
                    step={5}
                    value={targetKw}
                    onChange={(e) => setTargetKw(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-white/70 border border-[#88BDA4]/40 rounded-xl text-[#193029] font-bold tech-mono focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold tech-mono">kW</span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#193029] mb-1">
                  Support Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-white/70 border border-[#88BDA4]/40 rounded-xl text-[#193029] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4]"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours (Peak Shaving)</option>
                  <option value={180}>3 Hours</option>
                </select>
              </div>
            </div>

            {/* Live Mobile Notification Preview Box */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Prosumer Mobile Phone Notification Preview
              </span>
              <div className="rounded-2xl p-3.5 bg-gradient-to-r from-slate-900 to-[#193029] text-white shadow-md border border-white/20">
                <div className="flex items-center justify-between text-[10px] text-slate-300 pb-1.5 border-b border-white/10">
                  <span className="flex items-center gap-1 font-semibold text-[#88BDA4]">
                    <Smartphone className="w-3 h-3" /> KSEB VPP Prosumer App
                  </span>
                  <span>Now &bull; Push Notification</span>
                </div>
                <div className="mt-2 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#659287]/40 text-[#88BDA4] shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 fill-[#88BDA4]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Grid Support Request: {currentCluster?.name}</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      KSEB requests <strong>{formatPower(targetKw)}</strong> battery discharge to relieve substation load for{" "}
                      {durationMinutes} mins. Guaranteed incentive: <strong className="text-[#88BDA4]">₹10.00 / kWh</strong>.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 text-[10px]">
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-300 font-medium">Decline</span>
                  <span className="px-3 py-1 rounded-md bg-gradient-to-r from-[#659287] to-[#88BDA4] text-white font-bold shadow-xs">
                    Accept Support
                  </span>
                </div>
              </div>
            </div>

            {/* Dispatch Action Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary-theme text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                className="btn-primary-theme inline-flex items-center gap-2 text-xs font-bold shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Request to Prosumers
              </button>
            </div>
          </div>
        )}

        {step === "SENDING" && (
          <div className="py-10 text-center space-y-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#88BDA4]/30 animate-ping" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#659287] to-[#88BDA4] flex items-center justify-center text-white shadow-lg">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#193029]">Broadcasting to Prosumer Mobile Devices...</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Pushing demand response request to {currentCluster?.prosumer_count} registered hybrid solar & battery prosumers in {currentCluster?.name}.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-[#659287] font-semibold tech-mono bg-[#88BDA4]/15 px-3 py-1 rounded-full border border-[#88BDA4]/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting Prosumer Mobile Responses...
            </div>
          </div>
        )}

        {step === "ACCEPTED" && (
          <div className="py-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#88BDA4]/20 border border-[#88BDA4]/40">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#193029]">
                  {acceptedCount} of {totalParticipants} Prosumers Accepted via Mobile App
                </h4>
                <p className="text-xs text-[#193029]/80">
                  Target of <strong>{formatPower(targetKw)}</strong> allocated. Central IoT smart inverters are now connected and feeding power to the grid.
                </p>
              </div>
            </div>

            {/* IoT Hardware Central Access Banner */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-white/90 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#193029] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#659287]" />
                  IoT Inverter Gateway Central Access
                </span>
                <span className="text-[11px] font-bold text-[#659287] tech-mono">
                  LIVE INFEED ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                KSEB command center has established telemetry handshake with bi-directional inverters. Discharge rate locked at ₹10.00/kWh.
              </p>
            </div>

            {/* Navigation to Console */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary-theme text-xs"
              >
                Close
              </button>
              <Link
                href={`/dashboard/dispatch/${createdDispatchId}`}
                className="btn-primary-theme inline-flex items-center gap-2 text-xs font-bold shadow-md"
              >
                <span>View Live Dispatch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
