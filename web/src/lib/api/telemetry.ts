import {
  CapacityChartPoint,
  MOCK_CAPACITY_SERIES,
  ProsumerTelemetryPoint,
  MOCK_PROSUMER_TELEMETRY,
} from "@/lib/mock/telemetry";

export async function getCapacitySeries(): Promise<CapacityChartPoint[]> {
  return MOCK_CAPACITY_SERIES;
}

export async function getProsumerTelemetry(prosumerId: string): Promise<ProsumerTelemetryPoint[]> {
  return MOCK_PROSUMER_TELEMETRY[prosumerId] || MOCK_PROSUMER_TELEMETRY["default"];
}
