"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Q3IndustryForce } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  data: Q3IndustryForce[];
}

const INDUSTRY_COLORS: Record<string, string> = {
  "介護": "#10B981",
  "医療": "#3B82F6",
  "SaaS": "#8B5CF6",
  "HR・メディア": "#F59E0B",
};

const STRUCTURE_LABEL: Record<string, string> = {
  "寡占型": "少数の大手企業が支配",
  "分散型": "多数のプレイヤーが共存",
  "新興成長型": "急成長中の新興市場",
};

const CONFIDENCE_STYLE = {
  high: { color: "#10B981", label: "高" },
  medium: { color: "#F59E0B", label: "中" },
  low: { color: "#6B7280", label: "低" },
};

export function Q3IndustryMap({ data }: Props) {
  const [activeIndustry, setActiveIndustry] = useState<string>(data[0]?.industry ?? "");

  const active = data.find((d) => d.industry === activeIndustry);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <h3 className="text-xs font-bold text-foreground">業界別勢力図</h3>
      </div>

      {/* Industry tabs */}
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => {
          const isActive = activeIndustry === d.industry;
          const color = INDUSTRY_COLORS[d.industry] ?? "#6B7280";
          return (
            <button
              key={d.industry}
              onClick={() => setActiveIndustry(d.industry)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors border",
                isActive
                  ? "text-foreground border-border bg-accent"
                  : "text-muted-foreground border-transparent hover:bg-accent/50"
              )}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
              {d.industry}
            </button>
          );
        })}
      </div>

      {active && (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-4">
            {/* Market Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md bg-accent/20 px-3 py-2">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">市場規模</div>
                <div className="text-base font-bold text-foreground">{active.marketSize}</div>
                <div className="text-[9px] text-muted-foreground">{active.marketSizeYear}年</div>
              </div>
              <div className="rounded-md bg-accent/20 px-3 py-2">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">成長率</div>
                <div className="text-base font-bold text-foreground">{active.growthRate}</div>
              </div>
              <div className="rounded-md bg-accent/20 px-3 py-2">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">業界構造</div>
                <div className="text-xs font-bold text-foreground">{active.structure}</div>
                <div className="text-[9px] text-muted-foreground">{STRUCTURE_LABEL[active.structure] ?? active.structureNote}</div>
              </div>
              <div className="rounded-md bg-accent/20 px-3 py-2">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">信頼度</div>
                <Badge variant="outline" className="text-[9px] py-0 px-1 mt-1" style={{ borderColor: `${CONFIDENCE_STYLE[active.confidence].color}40`, color: CONFIDENCE_STYLE[active.confidence].color }}>
                  {CONFIDENCE_STYLE[active.confidence].label}
                </Badge>
              </div>
            </div>

            {/* Key Players */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                主要プレイヤー（{active.keyPlayers.length}社）
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-accent/30">
                      <th className="text-left py-1.5 px-3 font-bold text-muted-foreground">#</th>
                      <th className="text-left py-1.5 px-3 font-bold text-muted-foreground">企業名</th>
                      <th className="text-right py-1.5 px-3 font-bold text-muted-foreground">売上</th>
                      <th className="text-right py-1.5 px-3 font-bold text-muted-foreground">シェア</th>
                      <th className="text-left py-1.5 px-3 font-bold text-muted-foreground">ポジション</th>
                      <th className="text-left py-1.5 px-3 font-bold text-muted-foreground">特徴</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.keyPlayers.map((player, idx) => (
                      <tr key={player.name} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                        <td className="py-1.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-1.5 px-3">
                          {player.companyId ? (
                            <Link href={`/company/${player.companyId}`} className="font-medium text-foreground hover:underline">
                              {player.name}
                            </Link>
                          ) : (
                            <span className="text-foreground">{player.name}</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-foreground">{player.revenue}</td>
                        <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{player.marketShare ?? "—"}</td>
                        <td className="py-1.5 px-3">
                          <Badge variant="outline" className="text-[9px] py-0 px-1">
                            {player.position}
                          </Badge>
                        </td>
                        <td className="py-1.5 px-3 text-muted-foreground">{player.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Relevance */}
            <div className="rounded-md bg-accent/20 px-3 py-2">
              <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">障害福祉への学び</div>
              <p className="text-[11px] text-muted-foreground">{active.relevanceToWelfare}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
