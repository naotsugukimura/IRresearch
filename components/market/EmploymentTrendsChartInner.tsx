"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DisabilityEmploymentYear, ContextAnnotation } from "@/lib/types";
import { ContextAnnotations } from "./ContextAnnotations";

interface Props {
  data: DisabilityEmploymentYear[];
  annotations?: ContextAnnotation[];
}

function formatManNin(value: number) {
  return `${(value / 10000).toFixed(0)}万`;
}

export default function EmploymentTrendsChartInner({ data, annotations }: Props) {
  const chartData = data.map((d) => ({
    year: `${d.year}`,
    employedCount: d.employedCount,
    actualRate: d.actualRate,
    legalRate: d.legalRate,
    complianceRate: d.complianceRate,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">障害者雇用の推移（供給側・企業）</h3>
        <p className="text-xs text-muted-foreground">
          民間企業における障害者雇用数・実雇用率・法定雇用率（厚生労働省）
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 14, fill: "#9CA3AF" }}
          />
          <YAxis
            yAxisId="count"
            tickFormatter={formatManNin}
            tick={{ fontSize: 14, fill: "#9CA3AF" }}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            tickFormatter={(v: number) => `${v}%`}
            domain={[1.5, 3.0]}
            tick={{ fontSize: 14, fill: "#9CA3AF" }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: 8,
              fontSize: 15, color: "#E5E7EB" }}
            formatter={(value: number, name: string) => {
              if (name === "雇用者数") return [formatManNin(value), name];
              return [`${value}%`, name];
            }}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: 15, color: "#D1D5DB" }} />
          <Bar
            yAxisId="count"
            dataKey="employedCount"
            name="雇用者数"
            fill="#10B981"
            fillOpacity={0.7}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="actualRate"
            name="実雇用率"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3B82F6" }}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="legalRate"
            name="法定雇用率"
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#EF4444" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          最新雇用数: <span className="font-mono font-medium text-foreground">{formatManNin(data[data.length - 1].employedCount)}</span>人
        </span>
        <span>
          達成企業率: <span className="font-mono font-medium text-foreground">{data[data.length - 1].complianceRate}%</span>
        </span>
      </div>
      {annotations && annotations.length > 0 && (
        <ContextAnnotations annotations={annotations} />
      )}
    </div>
  );
}
