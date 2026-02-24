"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRevenue, formatPercent } from "@/lib/utils";
import type { CompanyFinancials } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  borderRadius: "8px",
  fontSize: "15px",
  color: "#E5E7EB",
};

interface Props {
  financials: CompanyFinancials;
  companyColor: string;
}

type TabId = "pl" | "bs" | "cf";

const TABS: { id: TabId; label: string }[] = [
  { id: "pl", label: "損益計算書" },
  { id: "bs", label: "貸借対照表" },
  { id: "cf", label: "キャッシュフロー" },
];

function PLCharts({ data, companyColor }: { data: Record<string, unknown>[]; companyColor: string }) {
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
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRevenue(value), undefined]} />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
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
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => formatPercent(v)} />
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

function BSCharts({ data, companyColor }: { data: Record<string, unknown>[]; companyColor: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">総資産・純資産推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRevenue(value), undefined]} />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
                <Bar dataKey="総資産" fill={companyColor} opacity={0.4} radius={[4, 4, 0, 0]} />
                <Bar dataKey="純資産" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">自己資本比率・流動比率推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 60]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => `${v}%`} domain={[100, 250]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
                <Bar yAxisId="left" dataKey="自己資本比率" fill={companyColor} opacity={0.6} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="流動比率" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CFCharts({ data, companyColor }: { data: Record<string, unknown>[]; companyColor: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">キャッシュフロー推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRevenue(value), undefined]} />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
                <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                <Bar dataKey="営業CF" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="投資CF" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="財務CF" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">フリーCF・現金同等物推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#D1D5DB" }} axisLine={false} tickFormatter={(v: number) => formatRevenue(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRevenue(value), undefined]} />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#D1D5DB" }} />
                <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                <Bar dataKey="フリーCF" fill={companyColor} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="現金同等物" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinancialChartsInner({ financials, companyColor }: Props) {
  const hasBSData = financials.fiscalYears.some((fy) => fy.totalAssets != null);
  const hasCFData = financials.fiscalYears.some((fy) => fy.operatingCF != null);

  const availableTabs = TABS.filter((tab) => {
    if (tab.id === "bs") return hasBSData;
    if (tab.id === "cf") return hasCFData;
    return true;
  });

  const [activeTab, setActiveTab] = useState<TabId>("pl");

  const plData = financials.fiscalYears.map((fy) => ({
    name: fy.year.replace("年3月期", ""),
    売上高: fy.revenue,
    営業利益: fy.operatingProfit,
    当期純利益: fy.netIncome,
    営業利益率: fy.operatingMargin,
  }));

  const bsData = financials.fiscalYears.map((fy) => ({
    name: fy.year.replace("年3月期", ""),
    総資産: fy.totalAssets ?? 0,
    純資産: fy.netAssets ?? 0,
    自己資本比率: fy.equityRatio ?? 0,
    流動比率: fy.currentRatio ?? 0,
  }));

  const cfData = financials.fiscalYears.map((fy) => ({
    name: fy.year.replace("年3月期", ""),
    営業CF: fy.operatingCF ?? 0,
    投資CF: fy.investingCF ?? 0,
    財務CF: fy.financingCF ?? 0,
    フリーCF: fy.freeCF ?? 0,
    現金同等物: fy.cashAndEquivalents ?? 0,
  }));

  return (
    <div>
      {/* Tab navigation */}
      {availableTabs.length > 1 && (
        <div className="mb-3 flex gap-1.5">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      {activeTab === "pl" && <PLCharts data={plData} companyColor={companyColor} />}
      {activeTab === "bs" && hasBSData && <BSCharts data={bsData} companyColor={companyColor} />}
      {activeTab === "cf" && hasCFData && <CFCharts data={cfData} companyColor={companyColor} />}
    </div>
  );
}
