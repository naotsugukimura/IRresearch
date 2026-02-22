"use client";

import dynamic from "next/dynamic";
import type { YearCount, RewardRevision } from "@/lib/types";

const FacilityGrowthChartInner = dynamic(
  () => import("./FacilityGrowthChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  facilityData: YearCount[];
  userData: YearCount[];
  rewardRevisions?: RewardRevision[];
  serviceType?: string;
}

export function FacilityGrowthChart(props: Props) {
  return <FacilityGrowthChartInner {...props} />;
}
