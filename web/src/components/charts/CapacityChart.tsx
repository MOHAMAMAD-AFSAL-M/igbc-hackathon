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
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="reqPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="delivPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} kW`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "12px",
            }}
            formatter={(val: any, name: any) => [`${val} kW`, name]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />

          <Area
            type="monotone"
            dataKey="availablePower"
            name="Available Power"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#availPower)"
          />
          <Area
            type="monotone"
            dataKey="requestedPower"
            name="Requested Power"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#reqPower)"
          />
          <Area
            type="monotone"
            dataKey="deliveredPower"
            name="Delivered Power"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#delivPower)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
