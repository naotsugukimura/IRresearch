"use client";

import { TrendingUp, TrendingDown, Building2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRevenue, formatPercent, calcYoY } from "@/lib/utils";
import type { Company, CompanyFinancials } from "@/lib/types";

interface PerformanceCardsProps {
  companies: Company[];
  financials: CompanyFinancials[];
}

export function PerformanceCards({ companies, financials }: PerformanceCardsProps) {
  const fullDataCompanies = companies.filter((c) => c.hasFullData);

  const avgGrowth = (() => {
    let total = 0;
    let count = 0;
    financials.forEach((f) => {
      const years = f.fiscalYears;
      if (years.length >= 2) {
        const yoy = calcYoY(
          years[years.length - 1].revenue,
          years[years.length - 2].revenue
        );
        if (yoy !== null) {
          total += yoy;
          count++;
        }
      }
    });
    return count > 0 ? total / count : 0;
  })();

  const highThreatCount = companies.filter((c) => c.threatLevel >= 4).length;

  const latestRevenue = (() => {
    let maxRevenue = 0;
    let companyName = "";
    financials.forEach((f) => {
      const years = f.fiscalYears;
      if (years.length > 0) {
        const latest = years[years.length - 1].revenue;
        if (latest > maxRevenue) {
          maxRevenue = latest;
          companyName =
            companies.find((c) => c.id === f.companyId)?.name ?? "";
        }
      }
    });
    return { maxRevenue, companyName };
  })();

  const cards = [
    {
      label: "監視対象企業",
      value: `${companies.length}社`,
      sub: `うちフルデータ ${fullDataCompanies.length}社`,
      icon: Building2,
      color: "#3B82F6",
    },
    {
      label: "平均売上成長率",
      value: formatPercent(avgGrowth),
      sub: "直近YoY（データ保有社）",
      icon: avgGrowth >= 0 ? TrendingUp : TrendingDown,
      color: avgGrowth >= 0 ? "#10B981" : "#EF4444",
    },
    {
      label: "高脅威企業",
      value: `${highThreatCount}社`,
      sub: "脅威レベル4-5",
      icon: AlertTriangle,
      color: "#EF4444",
    },
    {
      label: "最大売上企業",
      value: formatRevenue(latestRevenue.maxRevenue),
      sub: latestRevenue.companyName,
      icon: Clock,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon
                className="h-4 w-4"
                style={{ color: card.color }}
              />
            </div>
            <p className="mt-1 text-xl font-bold">{card.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
