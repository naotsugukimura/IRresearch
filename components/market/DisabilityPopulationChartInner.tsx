"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DisabilityPopulationYear } from "@/lib/types";

interface Props {
  data: DisabilityPopulationYear[];
}

const LINES = [
  { key: "physical", name: "身体障害", color: "#3B82F6" },
  { key: "intellectual", name: "知的障害", color: "#F59E0B" },
  { key: "mental", name: "精神障害", color: "#8B5CF6" },
] as const;

function formatManNin(value: number) {
  return `${(value / 10000).toFixed(0)}万`;
}

export default function DisabilityPopulationChartInner({ data }: Props) {
  const chartData = data.map((d) => ({
    year: `${d.year}`,
    physical: d.physical,
    intellectual: d.intellectual,
    mental: d.mental,
    total: d.total,
    ratio: d.populationRatio,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">障害者人口の推移（需要側）</h3>
        <p className="text-xs text-muted-foreground">
          身体・知的・精神障害者の手帳所持者数（内閣府 障害者白書より）
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickFormatter={formatManNin}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [formatManNin(value), name]}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          最新: <span className="font-mono font-medium text-foreground">{formatManNin(data[data.length - 1].total)}</span>人
        </span>
        <span>
          人口比: <span className="font-mono font-medium text-foreground">{data[data.length - 1].populationRatio}%</span>
        </span>
      </div>
    </div>
  );
}
