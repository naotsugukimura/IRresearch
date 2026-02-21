"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import type { BonusCatalogItem } from "@/lib/types";

interface Props {
  bonuses: BonusCatalogItem[];
}

const DIFFICULTY_CONFIG = {
  low: { label: "易", bgClass: "bg-emerald-500/20 text-emerald-400" },
  medium: { label: "中", bgClass: "bg-amber-500/20 text-amber-400" },
  high: { label: "難", bgClass: "bg-red-500/20 text-red-400" },
} as const;

const IMPACT_CONFIG = {
  low: { label: "小", bgClass: "bg-emerald-500/20 text-emerald-400" },
  medium: { label: "中", bgClass: "bg-amber-500/20 text-amber-400" },
  high: { label: "大", bgClass: "bg-red-500/20 text-red-400" },
} as const;

const CATEGORIES = ["すべて", "人員配置", "処遇改善", "サービス", "連携"] as const;

export function BonusTable({ bonuses }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>("すべて");

  const filtered =
    categoryFilter === "すべて"
      ? bonuses
      : bonuses.filter((b) => b.category === categoryFilter);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">主要加算一覧</h3>
          <p className="text-xs text-muted-foreground">
            放課後等デイサービスの報酬加算と売上への寄与度
          </p>
        </div>
      </div>

      <div className="mb-3 flex gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">加算名</th>
              <th className="pb-2 pr-3 font-medium">カテゴリ</th>
              <th className="pb-2 pr-3 font-medium">単位</th>
              <th className="pb-2 pr-3 font-medium">取得難易度</th>
              <th className="pb-2 font-medium">売上寄与</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((bonus) => (
              <tr key={bonus.name} className="border-b border-border/50 hover:bg-muted/20">
                <td className="py-2.5 pr-3">
                  <div>
                    <span className="font-medium">{bonus.name}</span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                      {bonus.requirement}
                    </p>
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[10px]">
                    {bonus.category}
                  </span>
                </td>
                <td className="py-2.5 pr-3 font-mono text-[10px]">{bonus.units}</td>
                <td className="py-2.5 pr-3">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      DIFFICULTY_CONFIG[bonus.difficulty].bgClass
                    }`}
                  >
                    {DIFFICULTY_CONFIG[bonus.difficulty].label}
                  </span>
                </td>
                <td className="py-2.5">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      IMPACT_CONFIG[bonus.revenueImpact].bgClass
                    }`}
                  >
                    {IMPACT_CONFIG[bonus.revenueImpact].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
