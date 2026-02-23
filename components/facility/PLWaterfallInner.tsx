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
  PieChart,
  Pie,
} from "recharts";
import type { FacilityPL } from "@/lib/types";

interface Props {
  data: FacilityPL;
}

function formatYen(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
  return `${value.toLocaleString()}円`;
}

const COST_COLORS = [
  "#EF4444", "#F59E0B", "#3B82F6", "#10B981",
  "#8B5CF6", "#06B6D4", "#EC4899", "#6B7280",
];

export default function PLWaterfallInner({ data }: Props) {
  // Revenue waterfall data
  const revenueItems = [
    {
      name: "基本報酬",
      value: data.revenue.baseReward.monthlyAmount,
      color: "#3B82F6",
    },
    ...data.revenue.bonuses.map((b) => ({
      name: b.name.replace(/（.*）/, "").replace(/加算$/, ""),
      value: b.monthlyAmount,
      color: "#10B981",
    })),
    {
      name: "月間売上合計",
      value: data.revenue.totalMonthly,
      color: "#F59E0B",
    },
  ];

  // Cost pie data
  const costData = data.costs.items.map((c, i) => ({
    name: c.category,
    value: c.share,
    amount: c.monthlyAmount,
    color: COST_COLORS[i % COST_COLORS.length],
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">事業所の収支構造（PL）</h3>
        <p className="text-xs text-muted-foreground">
          {data.assumptions} / 利益率 {data.profitMargin}%
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue breakdown */}
        <div>
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">月間売上の内訳</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueItems} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(v: number) => formatYen(v)}
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
                formatter={(value: number) => [`¥${value.toLocaleString()}/月`, "金額"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {revenueItems.map((item, i) => (
                  <Cell key={i} fill={item.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">年間売上</span>
            <span className="font-mono font-bold text-foreground">
              ¥{data.revenue.totalAnnual.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cost structure */}
        <div>
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">コスト構造</h4>
          <div className="flex items-start gap-4">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {costData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 15,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: number, _name: string, entry: any) => [
                    `${value}% (¥${(entry?.payload?.amount ?? 0).toLocaleString()}/月)`,
                    "シェア",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 pt-4">
              {costData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[10px]">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-muted-foreground">{item.name}</span>
                  <span className="font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">年間コスト</span>
            <span className="font-mono font-bold text-foreground">
              ¥{data.costs.totalAnnual.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
        {data.note}
      </div>
    </div>
  );
}
