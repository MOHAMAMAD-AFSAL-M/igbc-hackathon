"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("operator@kseb.demo");
  const [password, setPassword] = useState("kseb@vpp2026");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (authError) {
            throw authError;
          }
        }
      }

      // Store local session marker
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "vpp_operator_auth",
          JSON.stringify({
            email,
            role: "KSEB_OPERATOR",
            loginTime: new Date().toISOString(),
          })
        );
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      // For demo fallback, if Supabase auth fails with demo credentials, still allow operator demo access
      if (email === "operator@kseb.demo") {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "vpp_operator_auth",
            JSON.stringify({
              email,
              role: "KSEB_OPERATOR",
              loginTime: new Date().toISOString(),
            })
          );
        }
        router.push("/dashboard");
        return;
      }
      setError(err?.message || "Invalid operator credentials. Please verify your login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative technical grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Zap className="w-8 h-8 fill-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          KSEB <span className="text-blue-500">VPP</span>
        </h2>
        <p className="mt-1 text-center text-sm font-medium tracking-wider uppercase text-slate-400">
          State Load Dispatch Command Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="operator@kseb.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                Remember workstation
              </label>
              <button
                type="button"
                onClick={() => alert("For this hackathon prototype, use demo credentials: operator@kseb.demo / kseb@vpp2026")}
                className="text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              {isLoading ? "Authenticating..." : "Access Command Center"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-700/80 text-center">
            <p className="text-xs text-slate-400 mb-2 font-medium">Hackathon Demo Mode</p>
            <button
              type="button"
              onClick={() => {
                setEmail("operator@kseb.demo");
                setPassword("kseb@vpp2026");
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "vpp_operator_auth",
                    JSON.stringify({
                      email: "operator@kseb.demo",
                      role: "KSEB_OPERATOR",
                      loginTime: new Date().toISOString(),
                    })
                  );
                }
                router.push("/dashboard");
              }}
              className="w-full py-2 px-3 rounded-lg border border-slate-600 bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sign in as Demo Operator
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Kerala State Electricity Board Limited &copy; 2026 &bull; Decentralized VPP Prototype
        </p>
      </div>
    </div>
  );
}
