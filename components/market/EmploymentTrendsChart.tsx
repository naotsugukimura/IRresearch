"use client";

import dynamic from "next/dynamic";
import type { DisabilityEmploymentYear } from "@/lib/types";

const EmploymentTrendsChartInner = dynamic(
  () => import("./EmploymentTrendsChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: DisabilityEmploymentYear[];
}

export function EmploymentTrendsChart(props: Props) {
  return <EmploymentTrendsChartInner {...props} />;
}
