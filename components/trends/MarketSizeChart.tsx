"use client";

import dynamic from "next/dynamic";

const MarketSizeChartInner = dynamic(
  () => import("./MarketSizeChartInner"),
  { ssr: false, loading: () => <div className="h-[340px] animate-pulse rounded-lg bg-muted" /> }
);

export function MarketSizeChart() {
  return <MarketSizeChartInner />;
}
