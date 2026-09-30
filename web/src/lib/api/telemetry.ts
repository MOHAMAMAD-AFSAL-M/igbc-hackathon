import {
  CapacityChartPoint,
  MOCK_CAPACITY_SERIES,
  ProsumerTelemetryPoint,
  MOCK_PROSUMER_TELEMETRY,
} from "@/lib/mock/telemetry";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase/client";

export async function getCapacitySeries(): Promise<CapacityChartPoint[]> {
  return MOCK_CAPACITY_SERIES;
}

export async function getProsumerTelemetry(prosumerId: string): Promise<ProsumerTelemetryPoint[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("telemetry")
          .select("timestamp, soc, solar_generation_kw, battery_power_kw")
          .eq("prosumer_id", prosumerId)
          .order("timestamp", { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          return data.reverse().map((t: any) => ({
            time: new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            soc: Number(t.soc),
            solarKw: Number(t.solar_generation_kw),
            batteryKw: Number(t.battery_power_kw),
          }));
        }
      } catch (err) {
        console.warn("Supabase telemetry fetch failed, falling back to mock", err);
      }
    }
  }
  return MOCK_PROSUMER_TELEMETRY[prosumerId] || MOCK_PROSUMER_TELEMETRY["default"];
}
