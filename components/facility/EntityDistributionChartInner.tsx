"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { EntityDistribution } from "@/lib/types";

interface Props {
  data: EntityDistribution;
}

const COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6",
  "#EF4444", "#06B6D4", "#6B7280",
];

export default function EntityDistributionChartInner({ data }: Props) {
  const barData = data.byEntityType.map((e, i) => ({
    name: e.type,
    count: e.count,
    share: e.share,
    fill: COLORS[i % COLORS.length],
  }));

  const pieData = data.byEntityType.map((e, i) => ({
    name: e.type,
    value: e.share,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">参入法人の法人格分布</h3>
        <p className="text-xs text-muted-foreground">
          {data.asOf}時点 / 全{data.total.toLocaleString()}事業所
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                tickFormatter={(v: number) => v.toLocaleString()}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, _name: string, entry: any) => [
                  `${value.toLocaleString()}事業所 (${entry?.payload?.share ?? 0}%)`,
                  "数",
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [`${value}%`, "シェア"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        民間企業（株式会社・合同会社）が全体の<span className="font-mono font-medium text-foreground">{(data.byEntityType.filter(e => e.type === "株式会社" || e.type === "合同会社").reduce((a, b) => a + b.share, 0)).toFixed(1)}%</span>を占める
      </div>
    </div>
  );
}
