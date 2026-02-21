"use client";

import dynamic from "next/dynamic";
import type { OperatorScale } from "@/lib/types";

const OperatorScaleChartInner = dynamic(
  () => import("./OperatorScaleChartInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: OperatorScale;
}

export function OperatorScaleChart(props: Props) {
  return <OperatorScaleChartInner {...props} />;
}
