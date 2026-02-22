"use client";

import { useState } from "react";
import { Receipt, ChevronDown } from "lucide-react";
import type { RewardUnitTableData } from "@/lib/types";

interface Props {
  data: RewardUnitTableData;
}

const TABS = ["基本報酬", "主要加算"] as const;
type Tab = (typeof TABS)[number];

export function RewardUnitTable({ data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("基本報酬");
  const [showArea, setShowArea] = useState(false);

  // Group base rewards by category for better display
  const categories = [...new Set(data.baseRewards.map((r) => r.category))];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">報酬単位表</h3>
          <p className="text-xs text-muted-foreground">
            令和{data.revisionYear - 2018}年度改定（{data.revisionYear}年4月〜）
            ・1単位＝{data.unitPrice}円（その他地域）
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Base Rewards Table */}
      {activeTab === "基本報酬" && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">類型・区分</th>
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">定員</th>
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">利用時間</th>
                <th className="px-2 py-2 text-right font-semibold text-muted-foreground">単位数</th>
                <th className="px-2 py-2 text-right font-semibold text-muted-foreground">概算金額</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const rows = data.baseRewards.filter((r) => r.category === cat);
                return rows.map((row, i) => (
                  <tr
                    key={`${cat}-${i}`}
                    className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    {i === 0 ? (
                      <td
                        className="px-2 py-1.5 font-medium"
                        rowSpan={rows.length}
                      >
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          cat.includes("区分1")
                            ? "bg-blue-500/15 text-blue-400"
                            : cat.includes("区分2")
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-muted/30 text-muted-foreground"
                        }`}>
                          {cat}
                        </span>
                      </td>
                    ) : null}
                    <td className="px-2 py-1.5 text-muted-foreground">{row.capacity}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{row.duration ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold">{row.units}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">
                      {(row.units * data.unitPrice).toLocaleString()}円
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Main Bonuses Table */}
      {activeTab === "主要加算" && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">加算名</th>
                <th className="px-2 py-2 text-right font-semibold text-muted-foreground">単位数</th>
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">算定単位</th>
                <th className="px-2 py-2 text-left font-semibold text-muted-foreground">主な要件</th>
              </tr>
            </thead>
            <tbody>
              {data.mainBonuses.map((bonus, i) => (
                <tr
                  key={i}
                  className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-2 py-1.5 font-medium">{bonus.name}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-bold whitespace-nowrap">
                    {bonus.units}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{bonus.target}</td>
                  <td className="px-2 py-1.5 text-muted-foreground max-w-[300px]">{bonus.requirement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Area Multipliers (collapsible) */}
      <div className="mt-3 rounded-md border border-border/30">
        <button
          onClick={() => setShowArea(!showArea)}
          className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>地域区分別単価</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showArea ? "rotate-180" : ""}`} />
        </button>
        {showArea && (
          <div className="border-t border-border/30 px-3 pb-3">
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.areaMultipliers.map((am) => (
                <div key={am.area} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{am.area}</span>
                  <span className="font-mono font-bold">{am.multiplier.toFixed(2)}円</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {data.notes.length > 0 && (
        <div className="mt-3 space-y-1">
          {data.notes.map((note, i) => (
            <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <span className="mt-0.5 font-mono text-[9px] text-muted-foreground/60">※{i + 1}</span>
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
