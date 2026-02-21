"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyBusinessPlan } from "@/lib/types";
import { MONTHS } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PlChartInnerProps {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

export default function PlChartInner({ plan, companyColor }: PlChartInnerProps) {
  let revenueValues: number[] = [];
  let grossProfitValues: number[] = [];
  let operatingProfitValues: number[] = [];

  for (const section of plan.sections) {
    for (const row of section.rows) {
      if (
        row.label.includes("売上高") &&
        row.isMonetary &&
        row.isBold &&
        revenueValues.length === 0
      ) {
        revenueValues = row.values;
      }
      if (row.label === "粗利" && row.isMonetary) {
        grossProfitValues = row.values;
      }
      if (row.label.includes("営業利益") && row.isMonetary && row.isBold) {
        operatingProfitValues = row.values;
      }
    }
  }

  const data = MONTHS.map((month, i) => ({
    month,
    売上高: revenueValues[i] || 0,
    粗利: grossProfitValues[i] || 0,
    営業利益: operatingProfitValues[i] || 0,
  }));

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(1)}億`;
    if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(0)}万`;
    return value.toString();
  };

  const formatTooltip = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: companyColor }}
          />
          月次PL推移（売上高・粗利・営業利益）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id={`rev-${plan.companyId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={companyColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={companyColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`gp-${plan.companyId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="売上高"
                stroke={companyColor}
                fill={`url(#rev-${plan.companyId})`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="粗利"
                stroke="#10B981"
                fill={`url(#gp-${plan.companyId})`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="営業利益"
                stroke="#EF4444"
                fill="none"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
