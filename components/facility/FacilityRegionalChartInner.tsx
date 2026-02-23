"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FacilityRegionalData } from "@/lib/types";

interface Props {
  data: FacilityRegionalData;
  serviceType: string;
}

const REGION_COLORS = [
  "#3B82F6", // Hokkaido/Tohoku - blue
  "#EF4444", // Kanto - red
  "#F59E0B", // Chubu - amber
  "#8B5CF6", // Kinki - purple
  "#10B981", // Chugoku/Shikoku - emerald
  "#EC4899", // Kyushu/Okinawa - pink
];

type ViewMode = "bar" | "region" | "table";

export default function FacilityRegionalChartInner({ data, serviceType }: Props) {
  const [view, setView] = useState<ViewMode>("bar");

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              都道府県別 事業所分布
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {serviceType} | 全国 {data.totalFacilities.toLocaleString()} 事業所 / {data.prefectureCount} 都道府県
            </p>
          </div>
          <div className="flex gap-1">
            {(["bar", "region", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  view === v
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {v === "bar" ? "Top10" : v === "region" ? "地域別" : "一覧"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Concentration KPI Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-md bg-accent/30 px-3 py-2 text-center">
            <div className="text-[9px] text-muted-foreground">Top 3 集中度</div>
            <div className="text-lg font-bold font-mono text-foreground">{data.concentration.top3Share}%</div>
          </div>
          <div className="rounded-md bg-accent/30 px-3 py-2 text-center">
            <div className="text-[9px] text-muted-foreground">Top 5 集中度</div>
            <div className="text-lg font-bold font-mono text-foreground">{data.concentration.top5Share}%</div>
          </div>
          <div className="rounded-md bg-accent/30 px-3 py-2 text-center">
            <div className="text-[9px] text-muted-foreground">Top 10 集中度</div>
            <div className="text-lg font-bold font-mono text-foreground">{data.concentration.top10Share}%</div>
          </div>
        </div>

        {/* Bar Chart: Top 10 Prefectures */}
        {view === "bar" && (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top10}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} 事業所`,
                    "",
                  ]}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.top10.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx < 3 ? "#3B82F6" : idx < 5 ? "#60A5FA" : "#93C5FD"}
                      fillOpacity={1 - idx * 0.06}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart: By Region */}
        {view === "region" && (
          <div className="flex items-center gap-4">
            <div className="h-[300px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byRegion}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    label={({ name, share, x, y }: { name: string; share: number; x: number; y: number }) => (
                      <text x={x} y={y} fill="hsl(var(--foreground))" fontSize={11} textAnchor="middle">
                        {`${name} ${share}%`}
                      </text>
                    )}
                    labelLine={false}
                  >
                    {data.byRegion.map((_, idx) => (
                      <Cell key={idx} fill={REGION_COLORS[idx % REGION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} 事業所`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 shrink-0">
              {data.byRegion.map((r, idx) => (
                <div key={r.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: REGION_COLORS[idx % REGION_COLORS.length] }}
                  />
                  <span className="text-muted-foreground w-24">{r.name}</span>
                  <span className="font-mono font-bold text-foreground">{r.count.toLocaleString()}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {r.share}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table: All Prefectures */}
        {view === "table" && (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-1.5 px-2 font-medium">#</th>
                  <th className="text-left py-1.5 px-2 font-medium">都道府県</th>
                  <th className="text-right py-1.5 px-2 font-medium">事業所数</th>
                  <th className="text-right py-1.5 px-2 font-medium">シェア</th>
                  <th className="text-left py-1.5 px-2 font-medium w-32">分布</th>
                </tr>
              </thead>
              <tbody>
                {[...data.byPrefecture]
                  .sort((a, b) => b.count - a.count)
                  .map((pref, idx) => {
                    const maxCount = data.top10[0]?.count ?? 1;
                    const barWidth = Math.max(2, (pref.count / maxCount) * 100);
                    return (
                      <tr
                        key={pref.code}
                        className={cn(
                          "border-b border-border/30",
                          idx < 3 && "bg-blue-500/5"
                        )}
                      >
                        <td className="py-1.5 px-2 text-muted-foreground font-mono">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-medium text-foreground">{pref.name}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{pref.count.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-muted-foreground">{pref.share}%</td>
                        <td className="py-1.5 px-2">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${barWidth}%`, opacity: 0.7 + (1 - idx / 47) * 0.3 }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Source */}
        <div className="mt-3 text-[9px] text-muted-foreground text-right">
          {data.source}
        </div>
      </CardContent>
    </Card>
  );
}
