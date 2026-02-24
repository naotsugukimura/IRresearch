"use client";

import { useState } from "react";
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
import { Briefcase, Scale, ArrowRight } from "lucide-react";
import type { EmploymentRateHistory, RecentPolicyChange } from "@/lib/types";

interface Props {
  employmentHistory: EmploymentRateHistory[];
  policyChanges: RecentPolicyChange[];
}

const POLICY_CATEGORY_CONFIG = {
  employment: { label: "雇用", color: "#3B82F6", Icon: Briefcase },
  reward: { label: "報酬", color: "#8B5CF6", Icon: Scale },
  system: { label: "制度", color: "#10B981", Icon: ArrowRight },
} as const;

export default function EmploymentPolicySectionInner({ employmentHistory, policyChanges }: Props) {
  const [tab, setTab] = useState<"chart" | "policy">("chart");

  const chartData = employmentHistory.map((e) => ({
    year: `${e.year}`,
    legalRate: e.legalRate,
    actualRate: e.actualRate,
    gap: e.actualRate ? +(e.legalRate - e.actualRate).toFixed(2) : null,
    event: e.event,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-bold">法定雇用率と近年の制度改正</h3>
            <p className="text-xs text-muted-foreground">
              1976年〜2026年の法定雇用率推移と直近の政策変更
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setTab("chart")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              tab === "chart" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            雇用率推移
          </button>
          <button
            onClick={() => setTab("policy")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              tab === "policy" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            政策タイムライン
          </button>
        </div>
      </div>

      {tab === "chart" ? (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 14, fill: "#9CA3AF" }}
              />
              <YAxis
                domain={[0, 3]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 14, fill: "#9CA3AF" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  fontSize: 15, color: "#E5E7EB" }}
                formatter={(value, name) => {
                  if (value === null || value === undefined) return ["未達成", String(name)];
                  return [`${value}%`, String(name)];
                }}
                labelFormatter={(label) => `${label}年`}
              />
              <Legend wrapperStyle={{ fontSize: 15, color: "#D1D5DB" }} />
              <Bar
                dataKey="legalRate"
                name="法定雇用率"
                fill="#3B82F6"
                fillOpacity={0.3}
                stroke="#3B82F6"
                strokeWidth={1}
                barSize={20}
              />
              <Line
                type="monotone"
                dataKey="actualRate"
                name="実雇用率"
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#EF4444" }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Event labels */}
          <div className="mt-3 space-y-1.5">
            {employmentHistory
              .filter((e) => e.event)
              .map((e) => (
                <div key={e.year} className="flex items-start gap-2 text-[10px]">
                  <span className="flex-shrink-0 font-mono font-bold text-blue-400">{e.year}</span>
                  <span className="text-muted-foreground">{e.event}</span>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {policyChanges.map((change, i) => {
            const cfg = POLICY_CATEGORY_CONFIG[change.category];
            const Icon = cfg.Icon;
            return (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium"
                    style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {change.year}{change.month ? `/${String(change.month).padStart(2, "0")}` : ""}
                  </span>
                </div>
                <h4 className="mt-1.5 text-xs font-medium">{change.title}</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {change.description}
                </p>
                <div className="mt-1.5 rounded-md bg-blue-500/10 p-2">
                  <p className="text-[10px] leading-relaxed text-blue-300/80">
                    <span className="font-medium text-blue-400">影響: </span>
                    {change.impact}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
