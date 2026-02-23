"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { CompanyBadge } from "@/components/shared/CompanyBadge";
import { TREND_CATEGORY_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { IndustryTrend, Company } from "@/lib/types";

interface Props {
  trends: IndustryTrend[];
  companies: Company[];
}

type TrendFilter = "all" | "policy" | "regulation" | "technology" | "market";

export function IndustryTrendsSection({ trends, companies }: Props) {
  const [filter, setFilter] = useState<TrendFilter>("all");

  const filtered = filter === "all"
    ? trends
    : trends.filter((t) => t.category === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filters: { key: TrendFilter; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "policy", label: "政策" },
    { key: "regulation", label: "規制" },
    { key: "technology", label: "技術" },
    { key: "market", label: "市場" },
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            業界トレンド
          </CardTitle>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                  filter === f.key
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          障害福祉業界の政策・市場・テクノロジー動向 | {trends.length}件
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Timeline */}
        <div className="relative ml-3 space-y-4 border-l-2 border-border pl-6">
          {sorted.map((trend) => {
            const catConfig = TREND_CATEGORY_CONFIG[trend.category];
            return (
              <div key={trend.id} className="relative">
                <div
                  className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: catConfig.color }}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(trend.date)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0"
                    style={{
                      color: catConfig.color,
                      borderColor: catConfig.color + "40",
                    }}
                  >
                    {catConfig.label}
                  </Badge>
                </div>
                <h4 className="mt-1 text-xs font-medium text-foreground">{trend.title}</h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                  {trend.summary}
                </p>
                {trend.impactByCompany.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trend.impactByCompany.map((impact) => {
                      const company = companies.find(
                        (c) => c.id === impact.companyId
                      );
                      if (!company) return null;
                      return (
                        <div
                          key={impact.companyId}
                          className="flex items-center gap-1"
                        >
                          <CompanyBadge
                            companyId={company.id}
                            name={company.name}
                          />
                          <ImpactBadge impact={impact.impact} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            該当するトレンドはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
