"use client";

import { Building2, TrendingUp, Users, Percent } from "lucide-react";
import type { FacilityAnalysisData } from "@/lib/types";

interface Props {
  data: FacilityAnalysisData;
}

/* Minimal inline SVG sparkline */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 3) return null;
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

export function FacilityKpiCards({ data }: Props) {
  const latestFacility = data.facilityTimeSeries[data.facilityTimeSeries.length - 1];
  const prevFacility = data.facilityTimeSeries[data.facilityTimeSeries.length - 2];
  const latestUser = data.userTimeSeries[data.userTimeSeries.length - 1];

  const facilityGrowth = (
    ((latestFacility.count - prevFacility.count) / prevFacility.count) *
    100
  ).toFixed(1);

  const facSpark = data.facilityTimeSeries.map((d) => d.count);
  const userSpark = data.userTimeSeries.map((d) => d.count);

  const cards = [
    {
      label: "総事業所数",
      value: latestFacility.count.toLocaleString(),
      sub: `${latestFacility.year}年時点`,
      icon: Building2,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      sparkValues: facSpark,
      sparkColor: "#60a5fa",
    },
    {
      label: "前年比成長率",
      value: `+${facilityGrowth}%`,
      sub: `${prevFacility.count.toLocaleString()} → ${latestFacility.count.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      sparkValues: facSpark,
      sparkColor: "#34d399",
    },
    {
      label: "利用者数",
      value: `${(latestUser.count / 10000).toFixed(1)}万人`,
      sub: `${latestUser.year}年時点`,
      icon: Users,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      sparkValues: userSpark,
      sparkColor: "#fbbf24",
    },
    {
      label: "民間企業比率",
      value: `${data.entityDistribution.byEntityType[0]?.share ?? 0}%`,
      sub: `${data.entityDistribution.byEntityType[0]?.type ?? ""}が最多`,
      icon: Percent,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      sparkValues: [] as number[],
      sparkColor: "#a78bfa",
    },
  ];

  const source = data.source ?? "WAMNET Open Data・WAM経営分析参考指標";
  const lastUpdated = data.lastUpdated ?? "—";

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <div className={`rounded-md p-1.5 ${card.bgColor}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            <Sparkline values={card.sparkValues} color={card.sparkColor} />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-right text-[9px] text-muted-foreground/60">
        出典: {source} ｜ 最終更新: {lastUpdated}
      </p>
    </div>
  );
}
