"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Users,
  Send,
  History,
  Settings,
  Zap,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clusters", href: "/dashboard/clusters", icon: Network },
  { label: "Prosumer Network", href: "/dashboard/prosumers", icon: Users },
  { label: "Dispatch", href: "/dashboard/dispatch", icon: Send },
  { label: "Event History", href: "/dashboard/events", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vpp_operator_auth");
    }
    router.push("/login");
  };

  const navContent = (
    <div className="flex flex-col h-full glass-sidebar text-slate-100">
      {/* Brand Header with Frosted Gleam */}
      <div className="p-5 border-b border-[#88BDA4]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#88BDA4] to-[#659287] flex items-center justify-center text-white shadow-lg shadow-[#659287]/30 border border-white/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-white">KSEB</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#88BDA4]/25 text-[#88BDA4] border border-[#88BDA4]/40 tech-mono">
                VPP
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#88BDA4]/80 tracking-wider uppercase">
              Command Center
            </p>
          </div>
        </div>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#88BDA4]/60">
          Grid Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-[#659287] to-[#88BDA4]/90 text-white font-semibold shadow-lg shadow-[#659287]/30 border border-white/20 backdrop-blur-md"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-white" : "text-[#88BDA4]/70 group-hover:text-[#88BDA4]"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
            </Link>
          );
        })}
      </div>

      {/* Footer System Status & Profile */}
      <div className="p-4 border-t border-[#88BDA4]/20 space-y-3 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-[#88BDA4]/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#88BDA4] radar-live" />
            <span className="text-slate-300 font-medium">System Status</span>
          </div>
          <span className="text-[#88BDA4] font-semibold text-[11px] tech-mono">Operational</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#659287] to-[#193029] border border-[#88BDA4]/30 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              KO
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white">KSEB Operator</p>
              <p className="text-[11px] text-[#88BDA4]/70 truncate max-w-[110px]">operator@kseb.demo</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
