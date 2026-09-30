"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CapacityChartPoint } from "@/lib/mock/telemetry";

export function CapacityChart({ data }: { data: CapacityChartPoint[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="availPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#659287" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#659287" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="delivPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#88BDA4" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#88BDA4" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="reqPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
            </linearGradient>
          </defs>

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
            tickFormatter={(value) => `${value} kW`}
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
            formatter={(val: any, name: any) => [`${val} kW`, name]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#3a6055" }}
          />

          <Area
            type="monotone"
            dataKey="availablePower"
            name="Available Power"
            stroke="#659287"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#availPower)"
          />
          <Area
            type="monotone"
            dataKey="requestedPower"
            name="Requested Power"
            stroke="#d97706"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#reqPower)"
          />
          <Area
            type="monotone"
            dataKey="deliveredPower"
            name="Delivered Power"
            stroke="#457b6d"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#delivPower)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
