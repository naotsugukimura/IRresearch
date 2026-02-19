"use client";

import dynamic from "next/dynamic";
import type { Company, CompanyFinancials } from "@/lib/types";

const KpiComparisonChartInner = dynamic(
  () => import("./KpiComparisonChartInner"),
  { ssr: false, loading: () => <div className="h-[340px] animate-pulse rounded-lg bg-muted" /> }
);

interface KpiComparisonChartProps {
  companies: Company[];
  financials: CompanyFinancials[];
}

export function KpiComparisonChart(props: KpiComparisonChartProps) {
  return <KpiComparisonChartInner {...props} />;
}
