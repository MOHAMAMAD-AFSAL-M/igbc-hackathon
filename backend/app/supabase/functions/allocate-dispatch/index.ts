// supabase/functions/allocate-dispatch/index.ts
// Runs the VPP eligibility check and allocation algorithm.
// Creates dispatch_participants records.

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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { dispatch_id } = await req.json();
    if (!dispatch_id) {
      return new Response(JSON.stringify({ error: "dispatch_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch dispatch
    const { data: dispatch, error: dErr } = await supabaseAdmin
      .from("dispatch_requests")
      .select("*")
      .eq("id", dispatch_id)
      .single();

    if (dErr || !dispatch) {
      return new Response(JSON.stringify({ error: "Dispatch not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (dispatch.status !== "CREATED") {
      return new Response(JSON.stringify({ error: `Dispatch is in ${dispatch.status} state, expected CREATED` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetKw = parseFloat(dispatch.requested_kw);
    const durationHours = dispatch.duration_minutes / 60.0;

    // Mark as ALLOCATING
    await supabaseAdmin.from("dispatch_requests").update({ status: "ALLOCATING" }).eq("id", dispatch_id);

    // Fetch eligible prosumers in this cluster
    const { data: candidates } = await supabaseAdmin
      .from("prosumers")
      .select("id, current_soc, minimum_reserve_soc, max_discharge_kw, battery_capacity_kwh")
      .eq("cluster_id", dispatch.cluster_id)
      .eq("availability_status", "AVAILABLE")
      .gt("max_discharge_kw", 0);

    // Filter: SoC must be above minimum_reserve_soc
    const eligible = (candidates ?? []).filter(
      (p) => parseFloat(p.current_soc) > parseFloat(p.minimum_reserve_soc)
    );

    // Sort: highest SoC first, then highest discharge capacity
    eligible.sort((a, b) => {
      const socDiff = parseFloat(b.current_soc) - parseFloat(a.current_soc);
      if (socDiff !== 0) return socDiff;
      return parseFloat(b.max_discharge_kw) - parseFloat(a.max_discharge_kw);
    });

    // Allocate
    const participants = [];
    let remainingKw = targetKw;

    for (const p of eligible) {
      if (remainingKw <= 0) break;

      const availableKwh = ((parseFloat(p.current_soc) - parseFloat(p.minimum_reserve_soc)) / 100.0) * parseFloat(p.battery_capacity_kwh);
      const availableDischargeKw = Math.min(
        parseFloat(p.max_discharge_kw),
        durationHours > 0 ? availableKwh / durationHours : parseFloat(p.max_discharge_kw)
      );

      const allocatedKw = Math.min(availableDischargeKw, remainingKw);
      if (allocatedKw <= 0) continue;

      remainingKw -= allocatedKw;
      participants.push({
        dispatch_id,
        prosumer_id: p.id,
        requested_kw: Math.round(allocatedKw * 100) / 100,
        accepted_kw: 0,
        delivered_kw: 0,
        energy_delivered_kwh: 0,
        status: "PENDING",
      });
    }

    // Insert participants
    if (participants.length > 0) {
      const { error: insertErr } = await supabaseAdmin.from("dispatch_participants").insert(participants);
      if (insertErr) throw insertErr;
    }

    // Update dispatch status
    await supabaseAdmin
      .from("dispatch_requests")
      .update({ status: "AWAITING_RESPONSES" })
      .eq("id", dispatch_id);

    return new Response(
      JSON.stringify({
        dispatch_id,
        target_kw: targetKw,
        allocated_kw: Math.round((targetKw - remainingKw) * 100) / 100,
        remaining_kw: Math.round(remainingKw * 100) / 100,
        participants_count: participants.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
