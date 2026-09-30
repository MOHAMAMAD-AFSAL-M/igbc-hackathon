import {
  DispatchRequest,
  DispatchParticipant,
  DispatchTimelineEvent,
  DashboardKPIData,
} from "@/lib/types";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";
import { mockStore } from "@/lib/mock/mockStore";

export async function getDashboardKPIs(): Promise<DashboardKPIData> {
  return mockStore.getKPIData();
}

export async function getDispatches(): Promise<DispatchRequest[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_requests")
          .select("*, clusters(name)")
          .order("created_at", { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            ...d,
            cluster_name: d.clusters?.name,
          })) as DispatchRequest[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getDispatches();
}

export async function getDispatch(id: string): Promise<DispatchRequest | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_requests")
          .select("*, clusters(name)")
          .eq("id", id)
          .single();
        if (!error && data) {
          return {
            ...data,
            cluster_name: data.clusters?.name,
          } as DispatchRequest;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getDispatch(id);
}

export async function getDispatchParticipants(dispatchId: string): Promise<DispatchParticipant[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_participants")
          .select("*, prosumers(prosumer_code, current_soc, max_discharge_kw, profiles(name))")
          .eq("dispatch_id", dispatchId);
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            prosumer_code: item.prosumers?.prosumer_code,
            prosumer_name: item.prosumers?.profiles?.name,
            soc: item.prosumers?.current_soc,
            max_discharge_kw: item.prosumers?.max_discharge_kw,
          })) as DispatchParticipant[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getParticipants(dispatchId);
}

export async function getDispatchTimeline(dispatchId: string): Promise<DispatchTimelineEvent[]> {
  return mockStore.getTimeline(dispatchId);
}

export async function createDispatch(input: {
  cluster_id: string;
  requested_kw: number;
  duration_minutes: number;
  notes?: string;
}): Promise<DispatchRequest> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_requests")
          .insert({
            cluster_id: input.cluster_id,
            requested_kw: input.requested_kw,
            duration_minutes: input.duration_minutes,
            status: "CREATED",
          })
          .select()
          .single();
        if (!error && data) {
          return data as DispatchRequest;
        }
      } catch (err) {
        console.warn("Supabase create failed, falling back to mock", err);
      }
    }
  }
  return mockStore.createDispatch(input);
}

export async function completeDispatch(dispatchId: string): Promise<DispatchRequest | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_requests")
          .update({
            status: "COMPLETED",
            completed_at: new Date().toISOString(),
          })
          .eq("id", dispatchId)
          .select()
          .single();
        if (!error && data) {
          return data as DispatchRequest;
        }
      } catch (err) {
        console.warn("Supabase complete failed, falling back to mock", err);
      }
    }
  }
  return mockStore.completeDispatch(dispatchId);
}

export async function cancelDispatch(dispatchId: string): Promise<DispatchRequest | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("dispatch_requests")
          .update({
            status: "CANCELLED",
            completed_at: new Date().toISOString(),
          })
          .eq("id", dispatchId)
          .select()
          .single();
        if (!error && data) {
          return data as DispatchRequest;
        }
      } catch (err) {
        console.warn("Supabase cancel failed, falling back to mock", err);
      }
    }
  }
  return mockStore.cancelDispatch(dispatchId);
}
