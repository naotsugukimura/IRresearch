"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPlanCurrency } from "@/lib/utils";
import type { CompanyBusinessPlan, PlanRow } from "@/lib/types";

// ============================================================
// Helpers
// ============================================================

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

interface SimParam {
  id: string;
  label: string;
  baseValue: number;
  min: number;
  max: number;
  step: number;
  isRevenue?: boolean; // true = affects revenue side
}

// ============================================================
// PLSimulatorInner
// ============================================================

interface Props {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

export default function PLSimulatorInner({ plan, companyColor }: Props) {
  // Extract base values
  const baseRevenue = annual(findRow(plan, (r) => r.label.includes("売上高") && !!r.isMonetary && !!r.isBold));
  const baseCogs = annual(findRow(plan, (r) => r.label === "売上原価" && !!r.isMonetary));
  const basePersonnel = annual(findRow(plan, (r) => r.label === "人件費" && !!r.isMonetary));
  const baseAdvertising = annual(findRow(plan, (r) => r.label === "広告宣伝費" && !!r.isMonetary));
  const baseOtherSGA = annual(
    findRow(plan, (r) => (r.label === "その他管理費" || r.label === "システム開発費") && !!r.isMonetary)
  );

  if (baseRevenue === 0) return null;

  const params: SimParam[] = [
    { id: "revenue", label: "売上高", baseValue: baseRevenue, min: -30, max: 30, step: 1, isRevenue: true },
    { id: "cogs", label: "売上原価", baseValue: baseCogs, min: -30, max: 30, step: 1 },
    { id: "personnel", label: "人件費", baseValue: basePersonnel, min: -30, max: 30, step: 1 },
    { id: "advertising", label: "広告宣伝費", baseValue: baseAdvertising, min: -50, max: 50, step: 5 },
    { id: "otherSGA", label: "その他販管費", baseValue: baseOtherSGA, min: -30, max: 30, step: 1 },
  ].filter((p) => p.baseValue > 0);

  return <SimulatorUI params={params} companyColor={companyColor} />;
}

// ============================================================
// SimulatorUI (inner stateful component)
// ============================================================

function SimulatorUI({ params, companyColor }: { params: SimParam[]; companyColor: string }) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of params) init[p.id] = 0;
    return init;
  });

  const handleChange = useCallback((id: string, value: number) => {
    setAdjustments((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetAll = useCallback(() => {
    const init: Record<string, number> = {};
    for (const p of params) init[p.id] = 0;
    setAdjustments(init);
  }, [params]);

  // Presets
  const applyPreset = useCallback((type: "optimistic" | "pessimistic") => {
    const init: Record<string, number> = {};
    for (const p of params) {
      if (type === "optimistic") {
        init[p.id] = p.isRevenue ? 10 : -5;
      } else {
        init[p.id] = p.isRevenue ? -10 : 10;
      }
    }
    setAdjustments(init);
  }, [params]);

  const computed = useMemo(() => {
    const adj = (id: string, base: number) => {
      const pct = adjustments[id] ?? 0;
      return base * (1 + pct / 100);
    };

    const revenue = adj("revenue", params.find((p) => p.id === "revenue")?.baseValue ?? 0);
    const cogs = adj("cogs", params.find((p) => p.id === "cogs")?.baseValue ?? 0);
    const grossProfit = revenue - cogs;
    const personnel = adj("personnel", params.find((p) => p.id === "personnel")?.baseValue ?? 0);
    const advertising = adj("advertising", params.find((p) => p.id === "advertising")?.baseValue ?? 0);
    const otherSGA = adj("otherSGA", params.find((p) => p.id === "otherSGA")?.baseValue ?? 0);
    const totalSGA = personnel + advertising + otherSGA;
    const operatingProfit = grossProfit - totalSGA;
    const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

    // Base case
    const baseRevenue = params.find((p) => p.id === "revenue")?.baseValue ?? 0;
    const baseCogs = params.find((p) => p.id === "cogs")?.baseValue ?? 0;
    const basePersonnel = params.find((p) => p.id === "personnel")?.baseValue ?? 0;
    const baseAd = params.find((p) => p.id === "advertising")?.baseValue ?? 0;
    const baseOther = params.find((p) => p.id === "otherSGA")?.baseValue ?? 0;
    const baseOp = baseRevenue - baseCogs - basePersonnel - baseAd - baseOther;
    const baseMargin = baseRevenue > 0 ? (baseOp / baseRevenue) * 100 : 0;

    return {
      revenue,
      operatingProfit,
      operatingMargin,
      baseOperatingProfit: baseOp,
      baseOperatingMargin: baseMargin,
      delta: operatingProfit - baseOp,
    };
  }, [adjustments, params]);

  // Sensitivity data
  const sensitivityData = useMemo(() => {
    return params.map((p) => {
      const pctChange = 10;
      const newVal = p.baseValue * (1 + (p.isRevenue ? pctChange : pctChange) / 100);
      const baseRevenue = params.find((pp) => pp.id === "revenue")?.baseValue ?? 0;
      const baseCogs = params.find((pp) => pp.id === "cogs")?.baseValue ?? 0;
      const basePersonnel = params.find((pp) => pp.id === "personnel")?.baseValue ?? 0;
      const baseAd = params.find((pp) => pp.id === "advertising")?.baseValue ?? 0;
      const baseOther = params.find((pp) => pp.id === "otherSGA")?.baseValue ?? 0;
      const baseOp = baseRevenue - baseCogs - basePersonnel - baseAd - baseOther;

      // Calculate new operating profit if this param changes by +10%
      let newOp = baseOp;
      if (p.id === "revenue") newOp += (newVal - p.baseValue); // revenue up => profit up
      else newOp -= (newVal - p.baseValue); // cost up => profit down

      return {
        name: p.label,
        影響額: newOp - baseOp,
      };
    }).sort((a, b) => Math.abs(b["影響額"]) - Math.abs(a["影響額"]));
  }, [params]);

  const isChanged = Object.values(adjustments).some((v) => v !== 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">PLシミュレーション</CardTitle>
            <div className="flex gap-1.5">
              <button
                onClick={() => applyPreset("optimistic")}
                className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/30"
              >
                楽観
              </button>
              <button
                onClick={() => applyPreset("pessimistic")}
                className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400 hover:bg-red-500/30"
              >
                悲観
              </button>
              {isChanged && (
                <button
                  onClick={resetAll}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                >
                  リセット
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {params.map((p) => {
              const pct = adjustments[p.id] ?? 0;
              const adjValue = p.baseValue * (1 + pct / 100);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatPlanCurrency(p.baseValue)}</span>
                      <span className="font-mono">→</span>
                      <span className={pct === 0 ? "text-muted-foreground" : pct > 0 && p.isRevenue ? "text-emerald-400" : pct < 0 && !p.isRevenue ? "text-emerald-400" : "text-red-400"}>
                        {formatPlanCurrency(adjValue)}
                      </span>
                      <span className={`font-mono text-[9px] ${pct === 0 ? "text-muted-foreground" : pct > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pct >= 0 ? "+" : ""}{pct}%
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={pct}
                    onChange={(e) => handleChange(p.id, Number(e.target.value))}
                    className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--accent)]"
                  />
                </div>
              );
            })}
          </div>

          {/* Result summary */}
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/10 p-3">
            <div>
              <p className="text-[9px] text-muted-foreground">売上高</p>
              <p className="text-sm font-bold">{formatPlanCurrency(computed.revenue)}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">営業利益</p>
              <p className={`text-sm font-bold ${computed.operatingProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatPlanCurrency(computed.operatingProfit)}
              </p>
              {computed.delta !== 0 && (
                <p className={`text-[9px] font-mono ${computed.delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {computed.delta > 0 ? "+" : ""}{formatPlanCurrency(computed.delta)}
                </p>
              )}
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">営業利益率</p>
              <p className={`text-sm font-bold ${computed.operatingMargin >= computed.baseOperatingMargin ? "text-emerald-400" : "text-red-400"}`}>
                {computed.operatingMargin.toFixed(1)}%
              </p>
              <p className="text-[9px] text-muted-foreground">
                基準: {computed.baseOperatingMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">感度分析（各項目+10%時の営業利益変動）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityData} layout="vertical" margin={{ top: 5, right: 5, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickFormatter={(v: number) => formatPlanCurrency(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} width={75} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [formatPlanCurrency(value), "影響額"]}
                />
                <ReferenceLine x={0} stroke="#6B7280" strokeDasharray="3 3" />
                <Bar dataKey="影響額" radius={[0, 4, 4, 0]}>
                  {sensitivityData.map((entry, index) => (
                    <Cell key={index} fill={entry["影響額"] >= 0 ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
