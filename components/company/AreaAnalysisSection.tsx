"use client";

import dynamic from "next/dynamic";
import type { CompanyAreaAnalysis } from "@/lib/types";

const AreaAnalysisInner = dynamic(() => import("./AreaAnalysisInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
  ),
});

interface AreaAnalysisSectionProps {
  data: CompanyAreaAnalysis;
  companyColor: string;
}

export function AreaAnalysisSection(props: AreaAnalysisSectionProps) {
  return <AreaAnalysisInner {...props} />;
}
