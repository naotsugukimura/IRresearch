"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyBusinessPlan, PlanRow } from "@/lib/types";
import { formatPlanCurrency } from "@/lib/utils";

// ============================================================
// PLメトリクス抽出
// ============================================================

interface PLMetrics {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  personnel: number;
  advertising: number;
  otherSGA: number;
  totalSGA: number;
  operatingProfit: number;
  operatingMargin: number;
}

function findRow(
  plan: CompanyBusinessPlan,
  match: (r: PlanRow) => boolean
): PlanRow | undefined {
  for (const section of plan.sections) {
    for (const row of section.rows) {
      if (match(row)) return row;
    }
  }
  return undefined;
}

function annual(row: PlanRow | undefined): number {
  if (!row) return 0;
  if (row.annual != null) return row.annual;
  return row.values.reduce((a, b) => a + b, 0);
}

function extractPLMetrics(plan: CompanyBusinessPlan): PLMetrics {
  const revenue = annual(
    findRow(plan, (r) => r.label.includes("売上高") && !!r.isMonetary && !!r.isBold)
  );
  const cogs = annual(findRow(plan, (r) => r.label === "売上原価" && !!r.isMonetary));
  const grossProfit = annual(
    findRow(plan, (r) => r.label === "粗利" && !!r.isMonetary)
  );
  const grossMarginRow = findRow(
    plan,
    (r) => r.label === "粗利率" && !!r.isPercent
  );
  const grossMargin = grossMarginRow?.annual ?? (revenue ? (grossProfit / revenue) * 100 : 0);

  const personnel = annual(findRow(plan, (r) => r.label === "人件費" && !!r.isMonetary));
  const advertising = annual(
    findRow(plan, (r) => r.label === "広告宣伝費" && !!r.isMonetary)
  );
  const otherSGA = annual(
    findRow(
      plan,
      (r) =>
        (r.label === "その他管理費" || r.label === "システム開発費") &&
        !!r.isMonetary
    )
  );
  const totalSGA = annual(
    findRow(plan, (r) => r.label === "販管費合計" && !!r.isMonetary)
  );
  const operatingProfit = annual(
    findRow(
      plan,
      (r) => r.label.includes("営業利益") && !!r.isMonetary && !!r.isBold
    )
  );
  const operatingMarginRow = findRow(
    plan,
    (r) => r.label.includes("営業利益率") && !!r.isPercent
  );
  const operatingMargin =
    operatingMarginRow?.annual ?? (revenue ? (operatingProfit / revenue) * 100 : 0);

  return {
    revenue,
    cogs,
    grossProfit,
    grossMargin,
    personnel,
    advertising,
    otherSGA,
    totalSGA,
    operatingProfit,
    operatingMargin,
  };
}

// ============================================================
// KPIドライバー抽出
// ============================================================

interface RevenueDriver {
  kpiName: string;
  kpiAvg: number;
  monthlyRevenue: number;
  unitPrice: number;
}

function extractRevenueDrivers(plan: CompanyBusinessPlan): RevenueDriver[] {
  const revenueRow = findRow(
    plan,
    (r) => r.label.includes("売上高") && !!r.isMonetary && !!r.isBold
  );
  if (!revenueRow) return [];

  const monthlyRevAvg =
    revenueRow.values.reduce((a, b) => a + b, 0) / 12;

  // KPIセクション（最初のセクション — "集客KPI" or "事業KPI"）
  const kpiSection = plan.sections[0];
  if (!kpiSection || kpiSection.title.includes("損益")) return [];

  const drivers: RevenueDriver[] = [];
  for (const row of kpiSection.rows) {
    if (row.isMonetary || row.isPercent) continue;
    const avg = row.values.reduce((a, b) => a + b, 0) / 12;
    if (avg <= 0) continue;
    const unitPrice = monthlyRevAvg / avg;
    drivers.push({
      kpiName: row.label,
      kpiAvg: Math.round(avg),
      monthlyRevenue: Math.round(monthlyRevAvg),
      unitPrice: Math.round(unitPrice),
    });
  }
  return drivers;
}

// ============================================================
// 1. ウォーターフォールチャート
// ============================================================

const WATERFALL_COLORS: Record<string, string> = {
  売上高: "#3B82F6",
  売上原価: "#EF4444",
  粗利: "#10B981",
  人件費: "#F87171",
  広告宣伝費: "#FB923C",
  その他販管費: "#FBBF24",
  営業利益: "#34D399",
};

function WaterfallChart({
  metrics,
  companyColor,
}: {
  metrics: PLMetrics;
  companyColor: string;
}) {
  const items = [
    { name: "売上高", value: metrics.revenue },
    { name: "売上原価", value: -metrics.cogs },
    { name: "粗利", value: metrics.grossProfit },
    { name: "人件費", value: -metrics.personnel },
    { name: "広告宣伝費", value: -metrics.advertising },
    { name: "その他販管費", value: -(metrics.otherSGA || (metrics.totalSGA - metrics.personnel - metrics.advertising)) },
    { name: "営業利益", value: metrics.operatingProfit },
  ].filter((item) => item.value !== 0);

  // ウォーターフォール: 各バーの底辺位置を計算
  const data = items.map((item) => ({
    name: item.name,
    value: Math.abs(item.value),
    rawValue: item.value,
    isNegative: item.value < 0,
    isResult: item.name === "粗利" || item.name === "営業利益",
  }));

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100000000)
      return `${(value / 100000000).toFixed(1)}億`;
    if (Math.abs(value) >= 10000)
      return `${Math.round(value / 10000).toLocaleString()}万`;
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: companyColor }}
          />
          コスト構造（年間PL内訳）
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          売上から各コストを差し引いた利益構造
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{
                  fontSize: 10,
                  fill: "#9CA3AF",
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(_value: number, _name: string, props: any) => [
                  formatPlanCurrency(props?.payload?.rawValue ?? _value),
                  "",
                ]}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.name === "売上高"
                        ? companyColor
                        : WATERFALL_COLORS[entry.name] || "#6B7280"
                    }
                    opacity={entry.isNegative ? 0.85 : 1}
                  />
                ))}
                <LabelList
                  dataKey="rawValue"
                  position="top"
                  formatter={(v: number) => formatPlanCurrency(v)}
                  style={{
                    fontSize: 9,
                    fill: "#9CA3AF",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 2. セグメント比較チャート
// ============================================================

const SEGMENT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

function SegmentComparisonChart({
  segmentPlans,
}: {
  segmentPlans: CompanyBusinessPlan[];
}) {
  if (segmentPlans.length === 0) return null;

  const data = segmentPlans.map((plan) => {
    const m = extractPLMetrics(plan);
    return {
      name: plan.segmentName || plan.segmentId || "不明",
      売上高: m.revenue,
      粗利率: Math.round(m.grossMargin * 10) / 10,
      営業利益率: Math.round(m.operatingMargin * 10) / 10,
    };
  });

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100000000)
      return `${(value / 100000000).toFixed(1)}億`;
    if (Math.abs(value) >= 10000)
      return `${Math.round(value / 10000).toLocaleString()}万`;
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">セグメント収益性比較</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          セグメント別の売上規模と利益率を横比較
        </p>
      </CardHeader>
      <CardContent>
        {/* 売上高比較 */}
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
            年間売上高
          </p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.07)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={formatYAxis}
                  tick={{
                    fontSize: 10,
                    fill: "#9CA3AF",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#D1D5DB" }}
                  width={120}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatPlanCurrency(value),
                    "売上高",
                  ]}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="売上高" radius={[0, 4, 4, 0]}>
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="売上高"
                    position="right"
                    formatter={(v: number) => formatPlanCurrency(v)}
                    style={{
                      fontSize: 10,
                      fill: "#9CA3AF",
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 利益率比較 */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
            粗利率 / 営業利益率
          </p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.07)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{
                    fontSize: 10,
                    fill: "#9CA3AF",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  unit="%"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#D1D5DB" }}
                  width={120}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="粗利率" fill="#10B981" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="粗利率"
                    position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{
                      fontSize: 10,
                      fill: "#6EE7B7",
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                  />
                </Bar>
                <Bar dataKey="営業利益率" radius={[0, 4, 4, 0]}>
                  {data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.営業利益率 >= 0 ? "#34D399" : "#EF4444"}
                    />
                  ))}
                  <LabelList
                    dataKey="営業利益率"
                    position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{
                      fontSize: 10,
                      fill: "#9CA3AF",
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 3. 収益ドライバーテーブル
// ============================================================

function RevenueDriverTable({ drivers }: { drivers: RevenueDriver[] }) {
  if (drivers.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">収益ドライバー分析</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          売上 = 数量(KPI) × 単価 の構造を可視化
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">
                  KPI
                </th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                  月平均値
                </th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                  月間売上
                </th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                  単価（売上÷KPI）
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr
                  key={d.kpiName}
                  className="border-b border-border/30 hover:bg-muted/20"
                >
                  <td className="py-2 px-2 text-foreground">{d.kpiName}</td>
                  <td className="py-2 px-2 text-right font-mono">
                    {d.kpiAvg.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    {formatPlanCurrency(d.monthlyRevenue)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-profit">
                    {formatPlanCurrency(d.unitPrice)}
                  </td>
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
// メインコンポーネント
// ============================================================

interface Props {
  plan: CompanyBusinessPlan;
  allPlans: CompanyBusinessPlan[];
  companyColor: string;
}

export default function ProfitStructureInner({
  plan,
  allPlans,
  companyColor,
}: Props) {
  const metrics = extractPLMetrics(plan);
  const segmentPlans = allPlans.filter((p) => p.segmentId);
  const drivers = extractRevenueDrivers(plan);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">収益構造分析</h2>

      <WaterfallChart metrics={metrics} companyColor={companyColor} />

      {segmentPlans.length > 0 && (
        <SegmentComparisonChart segmentPlans={segmentPlans} />
      )}

      <RevenueDriverTable drivers={drivers} />
    </div>
  );
}
