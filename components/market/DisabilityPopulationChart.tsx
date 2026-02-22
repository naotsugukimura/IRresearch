"use client";

import dynamic from "next/dynamic";
import type { DisabilityPopulationYear, ContextAnnotation } from "@/lib/types";

const DisabilityPopulationChartInner = dynamic(
  () => import("./DisabilityPopulationChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: DisabilityPopulationYear[];
  annotations?: ContextAnnotation[];
}

export function DisabilityPopulationChart(props: Props) {
  return <DisabilityPopulationChartInner {...props} />;
}
