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
  ReferenceArea,
  Label,
} from "recharts";

interface PlChartInnerProps {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

/** 営業利益データからフェーズ境界を算出 */
function computePhases(opValues: number[]) {
  let lastNegIdx = -1;
  for (let i = 0; i < opValues.length; i++) {
    if (opValues[i] <= 0) lastNegIdx = i;
  }

  let lastGrowthIdx = lastNegIdx;
  if (lastNegIdx < opValues.length - 1) {
    for (let i = lastNegIdx + 2; i < opValues.length; i++) {
      const prev = opValues[i - 1];
      const curr = opValues[i];
      if (prev > 0 && Math.abs((curr - prev) / prev) > 0.1) {
        lastGrowthIdx = i;
      }
    }
  }

  return { investEnd: lastNegIdx, growthEnd: lastGrowthIdx };
}

const PROFIT_COLOR = "#34d399";
const BEP_COLOR = "#d4a847";
const PHASE_INVEST = "rgba(96, 130, 200, 0.12)";
const PHASE_GROWTH = "rgba(52, 211, 153, 0.10)";
const PHASE_STABLE = "rgba(212, 168, 71, 0.08)";

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

  const { investEnd, growthEnd } = computePhases(operatingProfitValues);
  const bepIdx = operatingProfitValues.findIndex((v) => v > 0);
  const bepMonth = bepIdx >= 0 ? MONTHS[bepIdx] : null;

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
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id={`rev-${plan.companyId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={companyColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={companyColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`gp-${plan.companyId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PROFIT_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PROFIT_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Phase background areas */}
              {investEnd >= 0 && (
                <ReferenceArea
                  x1={MONTHS[0]}
                  x2={MONTHS[investEnd]}
                  fill={PHASE_INVEST}
                  fillOpacity={1}
                  label={{ value: "初期投資期", position: "insideTopLeft", fontSize: 13, fill: "#7890b0" }}
                />
              )}
              {growthEnd > investEnd && (
                <ReferenceArea
                  x1={MONTHS[Math.max(0, investEnd + 1)]}
                  x2={MONTHS[growthEnd]}
                  fill={PHASE_GROWTH}
                  fillOpacity={1}
                  label={{ value: "成長加速期", position: "insideTopLeft", fontSize: 13, fill: "#6ec5a0" }}
                />
              )}
              {growthEnd < 11 && (
                <ReferenceArea
                  x1={MONTHS[growthEnd + 1]}
                  x2={MONTHS[11]}
                  fill={PHASE_STABLE}
                  fillOpacity={1}
                  label={{ value: "安定期", position: "insideTopLeft", fontSize: 13, fill: "#b8a050" }}
                />
              )}

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="month" tick={{ fontSize: 14, fill: "#9CA3AF", fontFamily: "var(--font-jetbrains-mono)" }} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 14, fill: "#9CA3AF", fontFamily: "var(--font-jetbrains-mono)" }} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Legend wrapperStyle={{ fontSize: "15px" }} />

              {/* BEP Line */}
              <ReferenceLine y={0} stroke={BEP_COLOR} strokeWidth={2} strokeDasharray="6 3">
                <Label value="損益分岐点" position="right" fontSize={10} fill={BEP_COLOR} />
              </ReferenceLine>

              {/* Win Condition label at BEP breakthrough */}
              {bepMonth && (
                <ReferenceLine x={bepMonth} stroke={BEP_COLOR} strokeWidth={1} strokeDasharray="3 3">
                  <Label value="Win Condition 達成" position="top" fontSize={10} fill={BEP_COLOR} offset={5} />
                </ReferenceLine>
              )}

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
                stroke={PROFIT_COLOR}
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
