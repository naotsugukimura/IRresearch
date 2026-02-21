"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { YearCount } from "@/lib/types";

interface Props {
  facilityData: YearCount[];
  userData: YearCount[];
}

export default function FacilityGrowthChartInner({ facilityData, userData }: Props) {
  const chartData = facilityData.map((f) => {
    const userEntry = userData.find((u) => u.year === f.year);
    return {
      year: `${f.year}`,
      facilities: f.count,
      users: userEntry?.count ?? 0,
    };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">事業所数・利用者数の推移</h3>
        <p className="text-xs text-muted-foreground">
          放課後等デイサービスの時系列推移（2012年〜）
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            yAxisId="facilities"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            yAxisId="users"
            orientation="right"
            tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => {
              if (name === "事業所数") return [value.toLocaleString(), name];
              return [`${(value / 10000).toFixed(1)}万人`, name];
            }}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            yAxisId="users"
            type="monotone"
            dataKey="users"
            name="利用者数"
            fill="#8B5CF6"
            fillOpacity={0.15}
            stroke="#8B5CF6"
            strokeWidth={2}
          />
          <Line
            yAxisId="facilities"
            type="monotone"
            dataKey="facilities"
            name="事業所数"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#3B82F6" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>2012年→2025年: 事業所数 <span className="font-mono font-medium text-foreground">約9倍</span></span>
        <span>利用者数 <span className="font-mono font-medium text-foreground">約7.3倍</span></span>
      </div>
    </div>
  );
}
