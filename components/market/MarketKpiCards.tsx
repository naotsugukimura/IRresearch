"use client";

import Link from "next/link";
import { Users, Briefcase, Building2, TrendingUp } from "lucide-react";
import type { MarketOverviewData } from "@/lib/types";

interface MarketKpiCardsProps {
  data: MarketOverviewData;
}

/* Minimal inline SVG sparkline */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      className="absolute bottom-3 right-3 opacity-25"
      viewBox={`0 0 ${w} ${h}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketKpiCards({ data }: MarketKpiCardsProps) {
  const latestPop = data.disabilityPopulation[data.disabilityPopulation.length - 1];
  const prevPop = data.disabilityPopulation[data.disabilityPopulation.length - 2];
  const latestEmp = data.disabilityEmployment[data.disabilityEmployment.length - 1];
  const prevEmp = data.disabilityEmployment[data.disabilityEmployment.length - 2];
  const latestFacility = data.facilityCountsByType[data.facilityCountsByType.length - 1];
  const prevFacility = data.facilityCountsByType[data.facilityCountsByType.length - 2];

  const totalFacilities = Object.values(latestFacility.services).reduce((a, b) => a + b, 0);
  const prevTotalFacilities = Object.values(prevFacility.services).reduce((a, b) => a + b, 0);
  const facilityGrowth = ((totalFacilities - prevTotalFacilities) / prevTotalFacilities * 100).toFixed(1);

  const popGrowth = ((latestPop.total - prevPop.total) / prevPop.total * 100).toFixed(1);
  const empGrowth = ((latestEmp.employedCount - prevEmp.employedCount) / prevEmp.employedCount * 100).toFixed(1);

  const popSpark = data.disabilityPopulation.map((d) => d.total);
  const empSpark = data.disabilityEmployment.map((d) => d.employedCount);
  const facSpark = data.facilityCountsByType.map((d) =>
    Object.values(d.services).reduce((a, b) => a + b, 0)
  );
  const rateSpark = data.disabilityEmployment.map((d) => d.legalRate);

  const cards = [
    {
      label: "障害者数",
      value: `${(latestPop.total / 10000).toFixed(0)}万人`,
      sub: `人口の${latestPop.populationRatio}%`,
      change: `${Number(popGrowth) >= 0 ? "+" : ""}${popGrowth}%`,
      source: "内閣府 障害者白書",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      sparkValues: popSpark,
      sparkColor: "#60a5fa",
      href: undefined as string | undefined,
    },
    {
      label: "障害者雇用数",
      value: `${(latestEmp.employedCount / 10000).toFixed(1)}万人`,
      sub: `実雇用率 ${latestEmp.actualRate}%`,
      change: `${Number(empGrowth) >= 0 ? "+" : ""}${empGrowth}%`,
      source: "厚生労働省 雇用状況集計",
      icon: Briefcase,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      sparkValues: empSpark,
      sparkColor: "#34d399",
      href: undefined as string | undefined,
    },
    {
      label: "障害福祉事業所数",
      value: `${(totalFacilities / 10000).toFixed(1)}万`,
      sub: `${Object.keys(latestFacility.services).length}サービス種類`,
      change: `+${facilityGrowth}%`,
      source: "e-Stat 社会福祉施設等調査",
      icon: Building2,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      sparkValues: facSpark,
      sparkColor: "#fbbf24",
      href: "/facility",
    },
    {
      label: "法定雇用率",
      value: `${latestEmp.legalRate}%`,
      sub: `達成率 ${latestEmp.complianceRate}%`,
      change: "2026年7月→2.7%",
      source: "厚生労働省",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      sparkValues: rateSpark,
      sparkColor: "#a78bfa",
      href: undefined as string | undefined,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <div className={`rounded-md p-1.5 ${card.bgColor}`}>
                  <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
              </div>
              <p className="mt-2 font-mono text-2xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              <p className="mt-1 text-xs text-emerald-400">{card.change}</p>
              <Sparkline values={card.sparkValues} color={card.sparkColor} />
            </>
          );

          if (card.href) {
            return (
              <Link
                key={card.label}
                href={card.href}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors hover:border-amber-500/50 hover:bg-accent/30"
              >
                {inner}
                <span className="mt-1.5 block text-[9px] text-amber-400/70">
                  サービス種別の内訳を見る →
                </span>
              </Link>
            );
          }

          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
            >
              {inner}
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-right text-[9px] text-muted-foreground/60">
        出典: {data.sources?.join("、") ?? "各種公的統計"} ｜ 最終更新: {data.lastUpdated ?? "—"}
      </p>
    </div>
  );
}
