"use client";

import dynamic from "next/dynamic";
import type { EntityDistribution } from "@/lib/types";

const EntityDistributionChartInner = dynamic(
  () => import("./EntityDistributionChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: EntityDistribution;
}

export function EntityDistributionChart(props: Props) {
  return <EntityDistributionChartInner {...props} />;
}
