"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyColor, formatRevenue } from "@/lib/utils";
import type { Company, CompanyFinancials } from "@/lib/types";

interface Props {
  companies: Company[];
  financials: CompanyFinancials[];
}

export default function KpiComparisonChartInner({ companies, financials }: Props) {
  const fullCompanies = companies.filter((c) => c.hasFullData && c.id !== "sms");

  const revenueData = fullCompanies.map((c) => {
    const f = financials.find((f) => f.companyId === c.id);
    const latestYear = f?.fiscalYears[f.fiscalYears.length - 1];
    return {
      name: c.name,
      売上高: latestYear?.revenue ?? 0,
      営業利益: latestYear?.operatingProfit ?? 0,
      fill: getCompanyColor(c.id),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">競合KPI比較（直近期）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", fontSize: "15px", color: "#E5E7EB" }}
                formatter={(value: number) => [`${formatRevenue(value)}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
              <Bar dataKey="売上高" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="営業利益" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
