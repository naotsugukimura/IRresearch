"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { YearCount, RewardRevision } from "@/lib/types";

interface Props {
  facilityData: YearCount[];
  userData: YearCount[];
  rewardRevisions?: RewardRevision[];
  serviceType?: string;
}

const ENTITY_COLORS: Record<string, string> = {
  "株式会社": "#3B82F6",
  "合同会社": "#8B5CF6",
  "NPO法人": "#10B981",
  "一般社団法人": "#F59E0B",
  "社会福祉法人": "#EF4444",
  "医療法人": "#EC4899",
  "その他": "#6B7280",
};

const ENTITY_KEYS = ["株式会社", "合同会社", "NPO法人", "一般社団法人", "社会福祉法人", "医療法人", "その他"];

/* ── Custom Tooltip with law reform context ── */
function ReformTooltip({
  active,
  payload,
  label,
  revisionMap,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  revisionMap: Record<string, RewardRevision>;
  mode: "stacked" | "line";
}) {
  if (!active || !payload || payload.length === 0) return null;

  const rev = label ? revisionMap[label] : null;

  return (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 12,
        color: "hsl(var(--foreground))",
        maxWidth: 360,
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}年</p>

      {/* Data values */}
      {payload.map((entry, i) => {
        let displayVal: string;
        if (mode === "line" && entry.name === "利用者数") {
          displayVal = `${(entry.value / 10000).toFixed(1)}万人`;
        } else {
          displayVal = entry.value.toLocaleString();
        }
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: entry.color, flexShrink: 0 }} />
            <span style={{ color: "hsl(var(--muted-foreground))" }}>{entry.name}:</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600 }}>{displayVal}</span>
          </div>
        );
      })}

      {/* Law reform context */}
      {rev && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                display: "inline-block",
                padding: "1px 6px",
                borderRadius: 4,
                backgroundColor: "rgba(245,158,11,0.2)",
                color: "#F59E0B",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {rev.type === "creation" ? "制度化" : "報酬改定"}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{rev.title}</span>
          </div>
          <p style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, marginBottom: 4 }}>
            {rev.baseReward}
          </p>
          <p style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
            {rev.description}
          </p>
          <div
            style={{
              marginTop: 6,
              padding: "4px 8px",
              borderRadius: 4,
              backgroundColor: "rgba(59,130,246,0.1)",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: "#60A5FA", marginBottom: 2 }}>
              市場への影響
            </p>
            <p style={{ fontSize: 10, color: "#93C5FD", lineHeight: 1.5 }}>{rev.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilityGrowthChartInner({ facilityData, userData, rewardRevisions, serviceType }: Props) {
  const [view, setView] = useState<"stacked" | "line">("stacked");
  const hasEntityData = facilityData.some((f) => f.byEntity);

  const stackedData = facilityData.map((f) => {
    const userEntry = userData.find((u) => u.year === f.year);
    return {
      year: `${f.year}`,
      total: f.count,
      users: userEntry?.count ?? 0,
      ...(f.byEntity ?? {}),
    };
  });

  const lineData = facilityData.map((f) => {
    const userEntry = userData.find((u) => u.year === f.year);
    return {
      year: `${f.year}`,
      facilities: f.count,
      users: userEntry?.count ?? 0,
    };
  });

  const revisionYears = rewardRevisions?.map((r) => r.year) ?? [];

  // Build year→revision lookup for custom tooltip
  const revisionMap: Record<string, RewardRevision> = {};
  for (const rev of rewardRevisions ?? []) {
    revisionMap[`${rev.year}`] = rev;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">事業所数・利用者数の推移</h3>
          <p className="text-xs text-muted-foreground">
            {serviceType ?? "放課後等デイサービス"}の時系列推移（{facilityData[0]?.year ?? ""}年〜）{rewardRevisions && rewardRevisions.length > 0 ? " — 改定年にカーソルを合わせると法改正の詳細を表示" : ""}
          </p>
        </div>
        {hasEntityData && (
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("stacked")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                view === "stacked" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              法人格別
            </button>
            <button
              onClick={() => setView("line")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                view === "line" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              事業所数×利用者数
            </button>
          </div>
        )}
      </div>

      {view === "stacked" && hasEntityData ? (
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={stackedData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              content={<ReformTooltip revisionMap={revisionMap} mode="stacked" />}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {ENTITY_KEYS.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                fill={ENTITY_COLORS[key]}
                fillOpacity={0.7}
                stroke={ENTITY_COLORS[key]}
                strokeWidth={0}
              />
            ))}
            {revisionYears.map((yr) => (
              <ReferenceLine
                key={yr}
                x={`${yr}`}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `改定`,
                  position: "top",
                  fill: "#F59E0B",
                  fontSize: 9,
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
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
              content={<ReformTooltip revisionMap={revisionMap} mode="line" />}
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
            {revisionYears.map((yr) => (
              <ReferenceLine
                key={yr}
                x={`${yr}`}
                yAxisId="facilities"
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {facilityData.length >= 2 && (() => {
          const first = facilityData[0];
          const last = facilityData[facilityData.length - 1];
          const ratio = last.count / (first.count || 1);
          return (
            <span>{first.year}年→{last.year}年: 事業所数 <span className="font-mono font-medium text-foreground">約{ratio.toFixed(1)}倍</span></span>
          );
        })()}
        {userData.length >= 2 && (() => {
          const first = userData[0];
          const last = userData[userData.length - 1];
          const ratio = last.count / (first.count || 1);
          return (
            <span>利用者数 <span className="font-mono font-medium text-foreground">約{ratio.toFixed(1)}倍</span></span>
          );
        })()}
        {hasEntityData && (() => {
          const first = facilityData[0];
          const last = facilityData[facilityData.length - 1];
          if (!first?.byEntity?.["株式会社"] || !last?.byEntity?.["株式会社"]) return null;
          const firstShare = Math.round((first.byEntity["株式会社"] / first.count) * 100);
          const lastShare = Math.round((last.byEntity["株式会社"] / last.count) * 100);
          return (
            <span>株式会社シェア <span className="font-mono font-medium text-foreground">{firstShare}%→{lastShare}%</span></span>
          );
        })()}
      </div>

      {/* 報酬改定タイムライン — 常時展開 */}
      {rewardRevisions && rewardRevisions.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="mb-3 text-xs font-bold text-muted-foreground">報酬改定の歴史と市場への影響</h4>
          <div className="space-y-3">
            {rewardRevisions.map((rev) => (
              <div
                key={rev.year}
                className="rounded-lg border border-border/50 bg-muted/10 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-14 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/20 font-mono text-[11px] font-bold text-amber-400">
                    {rev.year}
                  </span>
                  <div>
                    <span className="text-xs font-medium">{rev.title}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">{rev.baseReward}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{rev.description}</p>
                <div className="mt-2 rounded-md bg-blue-500/10 p-2">
                  <p className="text-[10px] font-medium text-blue-400">市場への影響</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-blue-300/80">{rev.impact}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] font-medium text-muted-foreground">主な変更点</p>
                  <ul className="mt-1 space-y-0.5">
                    {rev.keyChanges.map((change, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
