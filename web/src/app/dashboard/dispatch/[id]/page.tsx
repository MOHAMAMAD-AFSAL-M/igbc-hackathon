"use client";

import React, { useEffect, useState, use } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DispatchProgressCard } from "@/components/dispatch/DispatchProgressCard";
import { ParticipantTable } from "@/components/dispatch/ParticipantTable";
import { DispatchTimeline } from "@/components/dispatch/DispatchTimeline";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getDispatch,
  getDispatchParticipants,
  getDispatchTimeline,
  completeDispatch,
  cancelDispatch,
} from "@/lib/api/dispatch";
import { mockStore } from "@/lib/mock/mockStore";
import { DispatchRequest, DispatchParticipant, DispatchTimelineEvent } from "@/lib/types";
import { formatPower, formatDuration, formatEnergy, formatCurrency, formatRelativeTime } from "@/lib/utils/formatters";
import Link from "next/link";
import { Zap, CheckCircle2, XCircle, ArrowLeft, History, BatteryCharging } from "lucide-react";

export default function DispatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dispatchId = resolvedParams.id;

  const [dispatch, setDispatch] = useState<DispatchRequest | null>(null);
  const [participants, setParticipants] = useState<DispatchParticipant[]>([]);
  const [timeline, setTimeline] = useState<DispatchTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    const d = await getDispatch(dispatchId);
    if (d) {
      setDispatch(d);
      const parts = await getDispatchParticipants(dispatchId);
      setParticipants(parts);
      const tl = await getDispatchTimeline(dispatchId);
      setTimeline(tl);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to reactive store for live prosumer response simulation
    const unsub = mockStore.subscribe(() => {
      loadData();
    });

    return () => unsub();
  }, [dispatchId]);

  const handleCompleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await completeDispatch(dispatchId);
      await loadData();
      setIsCompleteOpen(false);
    } catch (err) {
      console.error("Complete dispatch failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsProcessing(true);
    try {
      await cancelDispatch(dispatchId);
      await loadData();
      setIsCancelOpen(false);
    } catch (err) {
      console.error("Cancel dispatch failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!dispatch && !isLoading) {
    return (
      <DashboardShell pageTitle="Dispatch Not Found">
        <div className="text-center py-12">
          <p className="text-slate-600">Dispatch {dispatchId} could not be found.</p>
          <Link href="/dashboard/dispatch" className="text-[#659287] font-semibold mt-2 inline-block">
            Back to Dispatches
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const isTerminal = dispatch?.status === "COMPLETED" || dispatch?.status === "CANCELLED";

  return (
    <DashboardShell pageTitle={`Dispatch ${dispatchId}`}>
      <PageHeader
        title={`Dispatch ${dispatchId}`}
        description={`Cluster: ${dispatch?.cluster_name} • Duration: ${formatDuration(dispatch?.duration_minutes || 0)} • Created ${formatRelativeTime(dispatch?.created_at || "")}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Dispatch", href: "/dashboard/dispatch" },
          { label: dispatchId },
        ]}
        badge={dispatch && <StatusBadge status={dispatch.status} size="lg" />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/dispatch"
              className="btn-secondary-theme inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Dispatches
            </Link>

            {!isTerminal && (
              <>
                <button
                  onClick={() => setIsCancelOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/60 bg-white/70 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50/80 transition-all cursor-pointer shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Dispatch
                </button>
                <button
                  onClick={() => setIsCompleteOpen(true)}
                  className="btn-primary-theme inline-flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete Dispatch
                </button>
              </>
            )}

            {dispatch?.status === "COMPLETED" && (
              <Link
                href="/dashboard/events"
                className="btn-primary-theme inline-flex items-center gap-1.5 text-xs font-bold"
              >
                <History className="w-3.5 h-3.5" /> View Settlement in History
              </Link>
            )}
          </div>
        }
      />

      {/* Completion Summary Banner if COMPLETED */}
      {dispatch?.status === "COMPLETED" && (
        <div className="mb-6 p-4 rounded-2xl glass-panel border border-[#88BDA4]/40 bg-gradient-to-r from-[#88BDA4]/20 to-[#659287]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#659287] to-[#88BDA4] text-white shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#193029]">
                Grid Support Completed & Verified
              </h4>
              <p className="text-xs text-[#193029]/80">
                Delivered <strong>{formatPower(dispatch.delivered_kw)}</strong> over{" "}
                {formatDuration(dispatch.duration_minutes)} with total energy infeed of{" "}
                <strong>{formatEnergy(dispatch.energy_delivered_kwh)}</strong>.
              </p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/90 text-right shrink-0 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#193029]/60 block">
              Total Calculated Incentive
            </span>
            <span className="text-xl font-bold text-[#659287] tech-mono">
              {formatCurrency(dispatch.total_incentive)}
            </span>
          </div>
        </div>
      )}

      {/* Main KPI and Progress Card */}
      {dispatch && <DispatchProgressCard dispatch={dispatch} />}

      {/* Two Column Layout: Participants & Timeline */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ParticipantTable participants={participants} />
        </div>
        <div className="lg:col-span-4">
          <DispatchTimeline timeline={timeline} />
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isCompleteOpen}
        title="Complete Dispatch Request?"
        description={`This will finalize the load mitigation session for ${dispatch?.cluster_name}. Actual delivered energy (${formatPower(dispatch?.delivered_kw)}) will be settled and prosumer incentives calculated.`}
        confirmText="Finalize & Complete"
        variant="success"
        isLoading={isProcessing}
        onConfirm={handleCompleteConfirm}
        onCancel={() => setIsCompleteOpen(false)}
      />

      <ConfirmDialog
        isOpen={isCancelOpen}
        title="Cancel Dispatch Request?"
        description={`This will immediately suspend the support request for ${dispatch?.cluster_name}. Prosumer battery infeed will be safely disconnected.`}
        confirmText="Cancel Dispatch"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleCancelConfirm}
        onCancel={() => setIsCancelOpen(false)}
      />
    </DashboardShell>
  );
}
