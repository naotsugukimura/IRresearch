"use client";

import dynamic from "next/dynamic";
import type { CompanySegment } from "@/lib/types";

const SegmentPieChartInner = dynamic(
  () => import("./SegmentPieChartInner"),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-muted" /> }
);

interface SegmentPieChartProps {
  segments: CompanySegment[];
}

export function SegmentPieChart(props: SegmentPieChartProps) {
  if (!props.segments || props.segments.length === 0) return null;
  return <SegmentPieChartInner {...props} />;
}
