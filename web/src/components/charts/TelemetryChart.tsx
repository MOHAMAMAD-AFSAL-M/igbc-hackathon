"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ProsumerTelemetryPoint } from "@/lib/mock/telemetry";

export function TelemetryChart({ data }: { data: ProsumerTelemetryPoint[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#88bda4" strokeOpacity={0.15} vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#52796f"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "rgba(136, 189, 164, 0.3)" }}
          />
          <YAxis
            stroke="#52796f"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(136, 189, 164, 0.4)",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 32px 0 rgba(101, 146, 135, 0.15)",
              fontSize: "12px",
              color: "#193029",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#3a6055" }}
          />

          <Line
            type="monotone"
            dataKey="soc"
            name="State of Charge (%)"
            stroke="#659287"
            strokeWidth={3}
            dot={{ r: 3, fill: "#659287" }}
          />
          <Line
            type="monotone"
            dataKey="solarKw"
            name="Solar Generation (kW)"
            stroke="#d97706"
            strokeWidth={2}
            dot={{ r: 3, fill: "#d97706" }}
          />
          <Line
            type="monotone"
            dataKey="batteryKw"
            name="Battery Power (kW)"
            stroke="#88BDA4"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#88BDA4" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
