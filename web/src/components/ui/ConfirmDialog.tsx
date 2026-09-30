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
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-full shrink-0 ${
              variant === "danger"
                ? "bg-rose-100 text-rose-600"
                : variant === "success"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {variant === "danger" ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${btnStyle}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
