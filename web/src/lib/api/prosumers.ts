import { Prosumer } from "@/lib/types";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";
import { mockStore } from "@/lib/mock/mockStore";

export async function getProsumers(clusterId?: string): Promise<Prosumer[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from("prosumers").select("*, clusters(name), profiles(name)");
        if (clusterId) {
          query = query.eq("cluster_id", clusterId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            cluster_name: item.clusters?.name,
            name: item.profiles?.name || item.prosumer_code,
          })) as Prosumer[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getProsumers(clusterId);
}

export async function getProsumer(id: string): Promise<Prosumer | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("prosumers")
          .select("*, clusters(name), profiles(name)")
          .or(`id.eq.${id},prosumer_code.eq.${id}`)
          .single();
        if (!error && data) {
          return {
            ...data,
            cluster_name: data.clusters?.name,
            name: data.profiles?.name || data.prosumer_code,
          } as Prosumer;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getProsumer(id);
}
