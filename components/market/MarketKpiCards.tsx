"use client";

import { Users, Briefcase, Building2, TrendingUp } from "lucide-react";
import type { MarketOverviewData } from "@/lib/types";

interface MarketKpiCardsProps {
  data: MarketOverviewData;
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

  const cards = [
    {
      label: "障害者数",
      value: `${(latestPop.total / 10000).toFixed(0)}万人`,
      sub: `人口の${latestPop.populationRatio}%`,
      change: `${Number(popGrowth) >= 0 ? "+" : ""}${popGrowth}%`,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "障害者雇用数",
      value: `${(latestEmp.employedCount / 10000).toFixed(1)}万人`,
      sub: `実雇用率 ${latestEmp.actualRate}%`,
      change: `${Number(empGrowth) >= 0 ? "+" : ""}${empGrowth}%`,
      icon: Briefcase,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "障害福祉事業所数",
      value: `${(totalFacilities / 10000).toFixed(1)}万`,
      sub: `${Object.keys(latestFacility.services).length}サービス種類`,
      change: `+${facilityGrowth}%`,
      icon: Building2,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "法定雇用率",
      value: `${latestEmp.legalRate}%`,
      sub: `達成率 ${latestEmp.complianceRate}%`,
      change: "2026年7月→2.7%",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <div className={`rounded-md p-1.5 ${card.bgColor}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold">{card.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          <p className="mt-1 text-xs text-emerald-400">{card.change}</p>
        </div>
      ))}
    </div>
  );
}
