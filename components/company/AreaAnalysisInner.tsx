"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompanyAreaAnalysis, AreaServiceData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface AreaAnalysisInnerProps {
  data: CompanyAreaAnalysis;
  companyColor: string;
}

interface PrefChartRow {
  prefecture: string;
  litalicoFacilities: number;
  otherFacilities: number;
  marketShare: number;
  total: number;
}

// ============================================================
// Service color mapping
// ============================================================

const SERVICE_COLORS: Record<string, string> = {
  "就労移行支援": "#3B82F6",
  "児童発達支援": "#F59E0B",
  "放課後等デイサービス": "#10B981",
};

// ============================================================
// Summary Cards
// ============================================================

function SummaryCards({
  data,
  companyColor,
}: {
  data: CompanyAreaAnalysis;
  companyColor: string;
}) {
  const services = Object.values(data.services);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total */}
      <Card className="border-l-4" style={{ borderLeftColor: companyColor }}>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">全サービス合計</p>
          <p className="font-mono text-2xl font-bold" style={{ color: companyColor }}>
            {formatNumber(data.summary.totalLitalicoFacilities)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.summary.prefecturesWithPresence}都道府県に展開
          </p>
        </CardContent>
      </Card>
      {/* Per service */}
      {services.map((svc) => (
        <Card key={svc.serviceName} className="border-l-4" style={{ borderLeftColor: SERVICE_COLORS[svc.serviceName] || "#6B7280" }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{svc.serviceName}</p>
            <p className="font-mono text-2xl font-bold">
              {formatNumber(svc.litalicoFacilities)}
            </p>
            <p className="text-xs text-muted-foreground">
              全{formatNumber(svc.totalFacilities)}事業所中 ={" "}
              <span className="font-mono font-semibold text-foreground">
                {svc.marketShare}%
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// Prefecture Bar Chart
// ============================================================

function PrefectureChart({
  services,
  companyColor,
}: {
  services: Record<string, AreaServiceData>;
  companyColor: string;
}) {
  const [selectedService, setSelectedService] = useState<string>("all");

  // Aggregate prefecture data
  const prefMap = new Map<string, { litalico: number; other: number; total: number }>();

  const serviceEntries = Object.entries(services);

  for (const [, svc] of serviceEntries) {
    if (selectedService !== "all" && svc.serviceName !== selectedService) continue;
    for (const p of svc.byPrefecture) {
      const existing = prefMap.get(p.prefecture) || { litalico: 0, other: 0, total: 0 };
      existing.litalico += p.litalicoFacilities;
      existing.other += p.totalFacilities - p.litalicoFacilities;
      existing.total += p.totalFacilities;
      prefMap.set(p.prefecture, existing);
    }
  }

  const chartData: PrefChartRow[] = Array.from(prefMap.entries())
    .filter(([, v]) => v.litalico > 0)
    .map(([prefecture, v]) => ({
      prefecture,
      litalicoFacilities: v.litalico,
      otherFacilities: v.other,
      marketShare: v.total > 0 ? Math.round((v.litalico / v.total) * 1000) / 10 : 0,
      total: v.total,
    }))
    .sort((a, b) => b.litalicoFacilities - a.litalicoFacilities);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">都道府県別 LITALICO事業所数 & 市場シェア</CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedService("all")}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                selectedService === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              全サービス
            </button>
            {serviceEntries.map(([, svc]) => (
              <button
                key={svc.serviceName}
                onClick={() => setSelectedService(svc.serviceName)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  selectedService === svc.serviceName
                    ? "text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={
                  selectedService === svc.serviceName
                    ? { backgroundColor: SERVICE_COLORS[svc.serviceName] || "#6B7280" }
                    : undefined
                }
              >
                {svc.serviceName}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 32)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 14, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              type="category"
              dataKey="prefecture"
              width={70}
              tick={{ fontSize: 14, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === "litalicoFacilities" ? "LITALICO" : "その他",
              ]}
              labelFormatter={(label: string) => {
                const row = chartData.find((r) => r.prefecture === label);
                return row ? `${label}（シェア ${row.marketShare}%）` : label;
              }}
              contentStyle={{ fontSize: 15, backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "#E5E7EB" }}
            />
            <Legend
              formatter={(value: string) =>
                value === "litalicoFacilities" ? "LITALICO" : "その他"
              }
            />
            <Bar dataKey="litalicoFacilities" stackId="a" fill={companyColor} radius={[0, 0, 0, 0]} />
            <Bar dataKey="otherFacilities" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.prefecture} fill="hsl(var(--muted))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Share ranking below */}
        <div className="mt-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {chartData.slice(0, 12).map((row, i) => (
            <div
              key={row.prefecture}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs"
            >
              <span className="font-mono font-bold text-muted-foreground">
                {i + 1}.
              </span>
              <span>{row.prefecture}</span>
              <span className="ml-auto font-mono font-semibold" style={{ color: companyColor }}>
                {row.litalicoFacilities}
              </span>
              <span className="font-mono text-muted-foreground">
                / {formatNumber(row.total)}
              </span>
              <span className="font-mono font-semibold">
                {row.marketShare}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Service Breakdown Stacked Bar
// ============================================================

function ServiceBreakdownChart({
  services,
}: {
  services: Record<string, AreaServiceData>;
}) {
  // Build per-prefecture data with service breakdown
  const prefMap = new Map<string, Record<string, number>>();

  for (const [, svc] of Object.entries(services)) {
    for (const p of svc.byPrefecture) {
      if (p.litalicoFacilities === 0) continue;
      const existing = prefMap.get(p.prefecture) || {};
      existing[svc.serviceName] = p.litalicoFacilities;
      prefMap.set(p.prefecture, existing);
    }
  }

  const chartData = Array.from(prefMap.entries())
    .map(([prefecture, byService]) => {
      const total = Object.values(byService).reduce((s, v) => s + v, 0);
      return { prefecture, ...byService, total };
    })
    .sort((a, b) => b.total - a.total);

  const serviceNames = Object.keys(services);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">サービス別内訳（都道府県別）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(350, chartData.length * 28)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 14, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              type="category"
              dataKey="prefecture"
              width={70}
              tick={{ fontSize: 14, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{ fontSize: 15, backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "#E5E7EB" }}
            />
            <Legend />
            {serviceNames.map((name) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="a"
                fill={SERVICE_COLORS[name] || "#6B7280"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Facility List Table
// ============================================================

function FacilityTable({
  services,
}: {
  services: Record<string, AreaServiceData>;
}) {
  const [filterService, setFilterService] = useState<string>("all");
  const [filterPref, setFilterPref] = useState<string>("all");

  // Collect all facilities with service label
  const allFacilities = Object.entries(services).flatMap(([, svc]) =>
    svc.litalicoFacilityList.map((f) => ({
      ...f,
      service: svc.serviceName,
    }))
  );

  const filtered = allFacilities.filter((f) => {
    if (filterService !== "all" && f.service !== filterService) return false;
    if (filterPref !== "all" && f.prefecture !== filterPref) return false;
    return true;
  });

  const prefectures = [...new Set(allFacilities.map((f) => f.prefecture))].sort();
  const serviceNames = [...new Set(allFacilities.map((f) => f.service))];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            事業所一覧（{formatNumber(filtered.length)}件）
          </CardTitle>
          <div className="flex gap-2">
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="all">全サービス</option>
              {serviceNames.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterPref}
              onChange={(e) => setFilterPref(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="all">全都道府県</option>
              {prefectures.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-2">サービス</th>
                <th className="pb-2 pr-2">事業所名</th>
                <th className="pb-2 pr-2">都道府県</th>
                <th className="pb-2">住所</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={`${f.name}-${i}`} className="border-b border-border/50">
                  <td className="py-1.5 pr-2">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: SERVICE_COLORS[f.service] || "#6B7280" }}
                    >
                      {f.service === "放課後等デイサービス" ? "放デイ" : f.service}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 font-medium">{f.name}</td>
                  <td className="py-1.5 pr-2">{f.prefecture}</td>
                  <td className="py-1.5 text-muted-foreground">{f.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function AreaAnalysisInner({
  data,
  companyColor,
}: AreaAnalysisInnerProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            エリア分析
            <span className="text-xs font-normal text-muted-foreground">
              {data.source}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SummaryCards data={data} companyColor={companyColor} />
          <PrefectureChart services={data.services} companyColor={companyColor} />
          <ServiceBreakdownChart services={data.services} />
          <FacilityTable services={data.services} />
        </CardContent>
      </Card>
    </div>
  );
}
