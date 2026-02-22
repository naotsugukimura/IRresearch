"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ServiceFacilityCount, ContextAnnotation } from "@/lib/types";
import { ContextAnnotations } from "./ContextAnnotations";

interface Props {
  data: ServiceFacilityCount[];
  annotations?: ContextAnnotation[];
}

const SERVICE_COLORS: Record<string, string> = {
  "放課後等デイサービス": "#3B82F6",
  "児童発達支援": "#8B5CF6",
  "就労継続支援B型": "#10B981",
  "就労継続支援A型": "#06B6D4",
  "就労移行支援": "#F59E0B",
  "生活介護": "#EF4444",
  "共同生活援助": "#EC4899",
  "計画相談支援": "#6B7280",
  "居宅介護": "#78716C",
};

export default function FacilityCountChartInner({ data, annotations }: Props) {
  const services = Object.keys(data[0]?.services ?? {});
  const [activeServices, setActiveServices] = useState<Set<string>>(new Set(services));

  const chartData = data.map((d) => {
    const entry: Record<string, string | number> = { year: `${d.year}` };
    for (const svc of services) {
      if (activeServices.has(svc)) {
        entry[svc] = d.services[svc] ?? 0;
      }
    }
    return entry;
  });

  const toggleService = (svc: string) => {
    setActiveServices((prev) => {
      const next = new Set(prev);
      if (next.has(svc)) {
        if (next.size > 1) next.delete(svc);
      } else {
        next.add(svc);
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">障害福祉サービス事業所数の推移（供給側）</h3>
        <p className="text-xs text-muted-foreground">
          サービス種類別の事業所数（e-Stat 社会福祉施設等調査）
        </p>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {services.map((svc) => (
          <button
            key={svc}
            onClick={() => toggleService(svc)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              activeServices.has(svc)
                ? "text-white"
                : "bg-muted/30 text-muted-foreground"
            }`}
            style={
              activeServices.has(svc)
                ? { backgroundColor: SERVICE_COLORS[svc] ?? "#6B7280" }
                : undefined
            }
          >
            {svc}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(value: number, name: string) => [
              value.toLocaleString() + "事業所",
              name,
            ]}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {services
            .filter((svc) => activeServices.has(svc))
            .map((svc) => (
              <Bar
                key={svc}
                dataKey={svc}
                stackId="a"
                fill={SERVICE_COLORS[svc] ?? "#6B7280"}
                fillOpacity={0.85}
              />
            ))}
        </BarChart>
      </ResponsiveContainer>
      {annotations && annotations.length > 0 && (
        <ContextAnnotations annotations={annotations} />
      )}
    </div>
  );
}
