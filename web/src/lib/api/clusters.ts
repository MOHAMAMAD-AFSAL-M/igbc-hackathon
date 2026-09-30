import { Cluster, Prosumer } from "@/lib/types";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";
import { mockStore } from "@/lib/mock/mockStore";

export async function getClusters(): Promise<Cluster[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Query the aggregate cluster capacity view created in Supabase
        const { data, error } = await supabase
          .from("cluster_capacity_view")
          .select("*")
          .order("cluster_name");

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.cluster_id,
            name: d.cluster_name,
            substation: d.substation,
            latitude: d.latitude,
            longitude: d.longitude,
            grid_status: d.grid_status,
            current_load_kw: Number(d.current_load_kw || 0),
            available_capacity_kw: Number(d.available_capacity_kw || d.available_power_kw || 0),
            created_at: new Date().toISOString(),
            prosumer_count: Number(d.total_prosumers || 0),
            available_energy_kwh: Number(d.available_energy_kwh || 0),
            average_soc: Number(d.average_soc || 0),
            active_dispatches_count: 0,
          })) as Cluster[];
        }
      } catch (err) {
        console.warn("Supabase cluster_capacity_view fetch failed, falling back to mock", err);
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
        const { data, error } = await supabase
          .from("cluster_capacity_view")
          .select("*")
          .eq("cluster_id", id)
          .single();

        if (!error && data) {
          return {
            id: data.cluster_id,
            name: data.cluster_name,
            substation: data.substation,
            latitude: data.latitude,
            longitude: data.longitude,
            grid_status: data.grid_status,
            current_load_kw: Number(data.current_load_kw || 0),
            available_capacity_kw: Number(data.available_capacity_kw || data.available_power_kw || 0),
            created_at: new Date().toISOString(),
            prosumer_count: Number(data.total_prosumers || 0),
            available_energy_kwh: Number(data.available_energy_kwh || 0),
            average_soc: Number(data.average_soc || 0),
            active_dispatches_count: 0,
          } as Cluster;
        }
      } catch (err) {
        console.warn("Supabase cluster fetch failed, falling back to mock", err);
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

        if (!error && data && data.length > 0) {
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
