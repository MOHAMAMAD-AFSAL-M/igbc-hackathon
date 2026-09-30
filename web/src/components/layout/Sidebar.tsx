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
  ShieldCheck,
  ChevronRight,
  Menu,
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-white">KSEB</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-400/30 tech-mono">
                VPP
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Command Center
            </p>
          </div>
        </div>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
            </Link>
          );
        })}
      </div>

      {/* Footer System Status & Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 radar-live" />
            <span className="text-slate-300 font-medium">System Status</span>
          </div>
          <span className="text-emerald-400 font-semibold text-[11px] tech-mono">Operational</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              KO
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">KSEB Operator</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[110px]">operator@kseb.demo</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs"
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
