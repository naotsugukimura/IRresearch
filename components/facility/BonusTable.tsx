"use client";

import { useState } from "react";
import { Award, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
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
  const [expandedBonus, setExpandedBonus] = useState<string | null>(null);

  const filtered =
    categoryFilter === "すべて"
      ? bonuses
      : bonuses.filter((b) => b.category === categoryFilter);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">主要加算一覧と取得要件ガイド</h3>
          <p className="text-xs text-muted-foreground">
            報酬加算の取得要件・手順・よくあるミスまで
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
        {filtered.map((bonus) => {
          const isExpanded = expandedBonus === bonus.name;
          const hasGuide = !!bonus.requirementGuide;

          return (
            <div key={bonus.name} className="rounded-lg border border-border/50 transition-colors hover:bg-muted/10">
              {/* Header row */}
              <button
                onClick={() => hasGuide && setExpandedBonus(isExpanded ? null : bonus.name)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
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
                      DIFFICULTY_CONFIG[bonus.difficulty].bgClass
                    }`}
                  >
                    難{DIFFICULTY_CONFIG[bonus.difficulty].label}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      IMPACT_CONFIG[bonus.revenueImpact].bgClass
                    }`}
                  >
                    寄与{IMPACT_CONFIG[bonus.revenueImpact].label}
                  </span>
                  {hasGuide && (
                    isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )
                  )}
                </div>
              </button>

              {/* Expanded guide */}
              {isExpanded && bonus.requirementGuide && (
                <div className="border-t border-border/30 p-4">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {bonus.requirementGuide.overview}
                  </p>

                  {/* Steps */}
                  <div className="mt-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      取得手順
                    </p>
                    <div className="mt-2 space-y-2">
                      {bonus.requirementGuide.steps.map((step, i) => (
                        <div key={i} className="rounded-md bg-muted/10 p-2">
                          <p className="text-[10px] font-medium text-foreground">{step.step}</p>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{step.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mt-3">
                    <p className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                      <Lightbulb className="h-3 w-3 text-amber-400" />
                      ポイント
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {bonus.requirementGuide.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Mistakes */}
                  {bonus.requirementGuide.commonMistakes && bonus.requirementGuide.commonMistakes.length > 0 && (
                    <div className="mt-3">
                      <p className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        よくあるミス
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {bonus.requirementGuide.commonMistakes.map((mistake, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[10px] text-red-400/80">
                            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
