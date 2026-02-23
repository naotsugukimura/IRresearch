"use client";

import dynamic from "next/dynamic";
import type { FacilityRegionalData } from "@/lib/types";

const Inner = dynamic(() => import("./FacilityRegionalChartInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] animate-pulse rounded-lg bg-muted" />
  ),
});

interface Props {
  data: FacilityRegionalData;
  serviceType: string;
}

export function FacilityRegionalChart({ data, serviceType }: Props) {
  return <Inner data={data} serviceType={serviceType} />;
}
