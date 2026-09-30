import { Cluster, Prosumer } from "@/lib/types";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";
import { mockStore } from "@/lib/mock/mockStore";

export async function getClusters(): Promise<Cluster[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("clusters").select("*").order("name");
        if (!error && data) {
          return data as Cluster[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getClusters();
}

export async function getCluster(id: string): Promise<Cluster | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("clusters").select("*").eq("id", id).single();
        if (!error && data) {
          return data as Cluster;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
      }
    }
  }
  return mockStore.getCluster(id);
}

export async function getClusterProsumers(clusterId: string): Promise<Prosumer[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("prosumers")
          .select("*, profiles(name)")
          .eq("cluster_id", clusterId);
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
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
