"use client";

import dynamic from "next/dynamic";

const ServiceFlowChartInner = dynamic(
  () =>
    import("./ServiceFlowChart").then((mod) => ({
      default: mod.ServiceFlowChart,
    })),
  { ssr: false, loading: () => <div className="h-[600px] rounded-lg border border-border bg-muted/5 animate-pulse" /> }
);

export function ServiceFlowChartSection() {
  return <ServiceFlowChartInner />;
}
