"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "success" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const btnStyle = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30",
    success: "bg-gradient-to-r from-[#659287] to-[#88BDA4] hover:from-[#52796f] hover:to-[#71a58d] text-white shadow-md shadow-[#659287]/30",
    primary: "bg-gradient-to-r from-[#659287] to-[#52796f] hover:from-[#52796f] hover:to-[#3e5f57] text-white shadow-md shadow-[#659287]/30",
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#193029]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl glass-panel p-6 shadow-2xl border border-white/90">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 backdrop-blur-md ${
              variant === "danger"
                ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                : variant === "success"
                ? "bg-[#88BDA4]/25 text-[#193029] border border-[#88BDA4]/40"
                : "bg-[#659287]/20 text-[#193029] border border-[#659287]/30"
            }`}
          >
            {variant === "danger" ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-[#659287]" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#193029]">{title}</h3>
            <p className="mt-1 text-sm text-[#3a6055]">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#88BDA4]/20">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-semibold text-[#28483f] hover:bg-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all cursor-pointer ${btnStyle}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
