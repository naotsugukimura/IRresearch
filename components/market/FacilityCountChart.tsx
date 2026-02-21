"use client";

import dynamic from "next/dynamic";
import type { ServiceFacilityCount } from "@/lib/types";

const FacilityCountChartInner = dynamic(
  () => import("./FacilityCountChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: ServiceFacilityCount[];
}

export function FacilityCountChart(props: Props) {
  return <FacilityCountChartInner {...props} />;
}
