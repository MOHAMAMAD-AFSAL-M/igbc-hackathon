"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { isSupabaseConfigured, ensureOperatorAuth } from "@/lib/supabase/client";

export function DashboardShell({
  children,
  pageTitle = "KSEB VPP Command Center",
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (isSupabaseConfigured()) {
      ensureOperatorAuth().then(() => setAuthReady(true));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <TopNav title={pageTitle} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {authReady ? children : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#88BDA4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500">Connecting to KSEB VPP backend...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
