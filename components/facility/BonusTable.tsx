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
            報酬加算の取得要件と収益寄与度
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

      <div className="space-y-2">
        {filtered.map((bonus) => (
          <div key={bonus.name} className="rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{bonus.name}</span>
                  <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px]">
                    {bonus.category}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{bonus.requirement}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{bonus.units}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    (DIFFICULTY_CONFIG[bonus.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.medium).bgClass
                  }`}
                >
                  難{(DIFFICULTY_CONFIG[bonus.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.medium).label}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    (IMPACT_CONFIG[bonus.revenueImpact as keyof typeof IMPACT_CONFIG] ?? IMPACT_CONFIG.medium).bgClass
                  }`}
                >
                  寄与{(IMPACT_CONFIG[bonus.revenueImpact as keyof typeof IMPACT_CONFIG] ?? IMPACT_CONFIG.medium).label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
