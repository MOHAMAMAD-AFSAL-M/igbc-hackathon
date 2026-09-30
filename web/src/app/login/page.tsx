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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#12221d] via-[#193029] to-[#0f1b17]">
      {/* Decorative ambient glass light orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#88BDA4]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#659287]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#88BDA4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#88BDA4] to-[#659287] flex items-center justify-center text-white shadow-xl shadow-[#659287]/30 border border-white/40 backdrop-blur-md">
            <Zap className="w-9 h-9 fill-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
          KSEB <span className="text-[#88BDA4]">VPP</span>
        </h2>
        <p className="mt-1 text-center text-xs font-semibold tracking-widest uppercase text-[#88BDA4]/90">
          State Load Dispatch Command Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-start gap-2.5 text-xs text-rose-200 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#88BDA4]/70">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4] focus:border-transparent transition-all backdrop-blur-md"
                  placeholder="operator@kseb.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#88BDA4]/70">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4] focus:border-transparent transition-all backdrop-blur-md"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/30 bg-white/10 text-[#659287] focus:ring-[#88BDA4]"
                />
                Remember workstation
              </label>
              <button
                type="button"
                onClick={() => alert("For this hackathon prototype, use demo credentials: operator@kseb.demo / kseb@vpp2026")}
                className="text-[#88BDA4] hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-[#659287]/30 text-sm font-bold text-white bg-gradient-to-r from-[#659287] to-[#88BDA4] hover:brightness-105 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-[#88BDA4] border border-white/30 transition-all cursor-pointer"
            >
              {isLoading ? "Authenticating..." : "Access Command Center"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-white/15 text-center">
            <p className="text-xs text-white/60 mb-2.5 font-medium">Hackathon Demo Mode</p>
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
              className="w-full py-2.5 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#88BDA4]" />
              Sign in as Demo Operator
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Kerala State Electricity Board Limited &copy; 2026 &bull; Decentralized VPP Prototype
        </p>
      </div>
    </div>
  );
}
