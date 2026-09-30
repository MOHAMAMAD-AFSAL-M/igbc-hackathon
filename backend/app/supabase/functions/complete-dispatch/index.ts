// supabase/functions/complete-dispatch/index.ts
// Finalises a dispatch: calculates energy delivered and creates incentive records.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INCENTIVE_RATE_PER_KWH = parseFloat(Deno.env.get("INCENTIVE_RATE_PER_KWH") ?? "10");

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

    const durationHours = dispatch.duration_minutes / 60.0;

    // Get accepted/active participants
    const { data: participants } = await supabaseAdmin
      .from("dispatch_participants")
      .select("*")
      .eq("dispatch_id", dispatch_id)
      .in("status", ["ACCEPTED", "ACTIVE"]);

    const incentiveRecords = [];
    const now = new Date().toISOString();

    for (const p of participants ?? []) {
      const deliveredKw = parseFloat(p.accepted_kw ?? 0);
      const energyKwh = Math.round(deliveredKw * durationHours * 10000) / 10000;
      const amount = Math.round(energyKwh * INCENTIVE_RATE_PER_KWH * 100) / 100;

      // Update participant
      await supabaseAdmin
        .from("dispatch_participants")
        .update({ delivered_kw: deliveredKw, energy_delivered_kwh: energyKwh, status: "COMPLETED" })
        .eq("id", p.id);

      incentiveRecords.push({
        prosumer_id: p.prosumer_id,
        dispatch_id,
        energy_kwh: energyKwh,
        rate_per_kwh: INCENTIVE_RATE_PER_KWH,
        amount,
        status: "CALCULATED",
        created_at: now,
      });
    }

    // Upsert incentive records
    if (incentiveRecords.length > 0) {
      await supabaseAdmin.from("incentives").upsert(incentiveRecords, { onConflict: "prosumer_id,dispatch_id" });
    }

    // Mark dispatch complete
    await supabaseAdmin
      .from("dispatch_requests")
      .update({ status: "COMPLETED", completed_at: now })
      .eq("id", dispatch_id);

    const totalEnergy = incentiveRecords.reduce((s, r) => s + r.energy_kwh, 0);
    const totalIncentive = incentiveRecords.reduce((s, r) => s + r.amount, 0);

    return new Response(
      JSON.stringify({
        dispatch_id,
        participants_completed: incentiveRecords.length,
        total_energy_kwh: Math.round(totalEnergy * 10000) / 10000,
        total_incentive_inr: Math.round(totalIncentive * 100) / 100,
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
