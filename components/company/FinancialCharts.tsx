"use client";

import dynamic from "next/dynamic";
import type { CompanyFinancials } from "@/lib/types";

const FinancialChartsInner = dynamic(
  () => import("./FinancialChartsInner"),
  { ssr: false, loading: () => <div className="grid gap-4 lg:grid-cols-2"><div className="h-[320px] animate-pulse rounded-lg bg-muted" /><div className="h-[320px] animate-pulse rounded-lg bg-muted" /></div> }
);

interface FinancialChartsProps {
  financials: CompanyFinancials;
  companyColor: string;
}

export function FinancialCharts(props: FinancialChartsProps) {
  return <FinancialChartsInner {...props} />;
}
