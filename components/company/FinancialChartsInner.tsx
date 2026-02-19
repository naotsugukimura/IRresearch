"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRevenue, formatPercent } from "@/lib/utils";
import type { CompanyFinancials } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  fontSize: "12px",
};

interface Props {
  financials: CompanyFinancials;
  companyColor: string;
}

export default function FinancialChartsInner({ financials, companyColor }: Props) {
  const data = financials.fiscalYears.map((fy) => ({
    name: fy.year.replace("年3月期", ""),
    売上高: fy.revenue,
    営業利益: fy.operatingProfit,
    当期純利益: fy.netIncome,
    営業利益率: fy.operatingMargin,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">業績推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRevenue(value), undefined]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="売上高" stroke={companyColor} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="営業利益" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="当期純利益" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">営業利益率推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickFormatter={(v: number) => formatPercent(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatPercent(value), undefined]} />
                <Area type="monotone" dataKey="営業利益率" stroke={companyColor} fill={companyColor} fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
