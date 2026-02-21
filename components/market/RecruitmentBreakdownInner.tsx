"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import type { RecruitmentMethod } from "@/lib/types";

interface Props {
  data: RecruitmentMethod[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];

const TREND_ICON = {
  increasing: ArrowUp,
  stable: ArrowRight,
  decreasing: ArrowDown,
} as const;

const TREND_COLOR = {
  increasing: "text-emerald-400",
  stable: "text-muted-foreground",
  decreasing: "text-red-400",
};

export default function RecruitmentBreakdownInner({ data }: Props) {
  const chartData = data.map((d, i) => ({
    name: d.abbreviation,
    value: d.share,
    fullName: d.method,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">障害者の採用方法</h3>
        <p className="text-xs text-muted-foreground">
          企業が障害者を採用する主なチャネルとそのシェア
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, "シェア"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((method, i) => {
            const TrendIcon = TREND_ICON[method.trend];
            return (
              <div
                key={method.abbreviation}
                className="flex items-start gap-3 rounded-md border border-border p-2.5"
              >
                <div
                  className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{method.method}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {method.share}%
                    </span>
                    <TrendIcon
                      className={`h-3 w-3 ${TREND_COLOR[method.trend]}`}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
