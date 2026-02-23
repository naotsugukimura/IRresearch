"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { OperatorScale } from "@/lib/types";

interface Props {
  data: OperatorScale;
}

export default function OperatorScaleChartInner({ data }: Props) {
  const chartData = data.buckets.map((b) => ({
    name: b.label,
    count: b.count,
    share: b.share,
    color: b.color,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">事業者の展開規模</h3>
        <p className="text-xs text-muted-foreground">
          1法人あたりの事業所数分布（{data.asOf}時点）
        </p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickFormatter={(v: number) => v.toLocaleString()}
            tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 15,
              color: "hsl(var(--foreground))",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: number, _name: string, entry: any) => [
              `${value.toLocaleString()}法人 (${entry?.payload?.share ?? 0}%)`,
              "数",
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 text-xs text-muted-foreground">
        単体事業所が<span className="font-mono font-medium text-foreground">{data.buckets[0]?.share}%</span>と圧倒的多数。多店舗展開は参入障壁が高い。
      </div>
    </div>
  );
}
