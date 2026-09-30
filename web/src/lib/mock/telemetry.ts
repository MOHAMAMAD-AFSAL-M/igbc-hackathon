export interface CapacityChartPoint {
  time: string;
  availablePower: number;
  requestedPower: number;
  deliveredPower: number;
}

export const MOCK_CAPACITY_SERIES: CapacityChartPoint[] = [
  { time: "11:00", availablePower: 580, requestedPower: 0, deliveredPower: 0 },
  { time: "12:00", availablePower: 610, requestedPower: 35, deliveredPower: 34 },
  { time: "13:00", availablePower: 645, requestedPower: 50, deliveredPower: 48 },
  { time: "14:00", availablePower: 620, requestedPower: 50, deliveredPower: 47 },
  { time: "15:00", availablePower: 642, requestedPower: 110, deliveredPower: 93 },
  { time: "16:00", availablePower: 658, requestedPower: 150, deliveredPower: 118 },
  { time: "17:00", availablePower: 642, requestedPower: 150, deliveredPower: 118 },
];

export interface ProsumerTelemetryPoint {
  time: string;
  soc: number;
  solarKw: number;
  batteryKw: number;
}

export const MOCK_PROSUMER_TELEMETRY: Record<string, ProsumerTelemetryPoint[]> = {
  default: [
    { time: "08:00", soc: 55, solarKw: 1.2, batteryKw: 0 },
    { time: "10:00", soc: 68, solarKw: 4.8, batteryKw: 2.1 },
    { time: "12:00", soc: 89, solarKw: 6.2, batteryKw: 1.5 },
    { time: "14:00", soc: 92, solarKw: 5.5, batteryKw: 0.5 },
    { time: "16:00", soc: 85, solarKw: 2.8, batteryKw: -4.8 }, // Discharging
    { time: "17:00", soc: 78, solarKw: 1.1, batteryKw: -4.5 },
  ],
};
