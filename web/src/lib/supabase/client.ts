import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true" &&
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("placeholder")
  );
};

let supabaseInstance: SupabaseClient | null = null;
let authInitialized = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    // Server-side
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    return null;
  }

  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}

/**
 * Ensure the operator is signed in for the KSEB web dashboard.
 * This auto-signs-in with the demo operator credentials if no session exists.
 * Call this once from the dashboard shell or layout before data fetches.
 */
export async function ensureOperatorAuth(): Promise<boolean> {
  if (authInitialized) return true;
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      authInitialized = true;
      return true;
    }
    
    // Auto sign-in with demo operator credentials
    const { error } = await supabase.auth.signInWithPassword({
      email: "operator@kseb.demo",
      password: "kseb@vpp2026",
    });
    
    if (!error) {
      authInitialized = true;
      return true;
    }
    
    console.warn("Auto operator sign-in failed:", error.message);
    return false;
  } catch (err) {
    console.warn("Auth check failed:", err);
    return false;
  }
}
