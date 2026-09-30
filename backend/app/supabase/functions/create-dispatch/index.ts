// supabase/functions/create-dispatch/index.ts
// Creates a new dispatch request and immediately runs allocation.
// Called by KSEB operator from the dashboard.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create admin client (service role — bypasses RLS for allocation)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the calling user's identity
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify role
    const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["KSEB_OPERATOR", "ADMIN"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden: KSEB_OPERATOR role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { cluster_id, requested_kw, duration_minutes } = await req.json();
    if (!cluster_id || !requested_kw || !duration_minutes) {
      return new Response(JSON.stringify({ error: "cluster_id, requested_kw, duration_minutes are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create dispatch record
    const { data: dispatch, error: dispatchError } = await supabaseAdmin
      .from("dispatch_requests")
      .insert({
        cluster_id,
        requested_kw,
        duration_minutes,
        status: "CREATED",
        created_by: user.id,
      })
      .select()
      .single();

    if (dispatchError) throw dispatchError;

    return new Response(JSON.stringify({ dispatch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
