"use client";

import dynamic from "next/dynamic";
import type { CompanyBusinessPlan } from "@/lib/types";

const ProfitStructureInner = dynamic(
  () => import("./ProfitStructureInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface ProfitStructureSectionProps {
  plan: CompanyBusinessPlan;
  allPlans: CompanyBusinessPlan[];
  companyColor: string;
}

export function ProfitStructureSection(props: ProfitStructureSectionProps) {
  return <ProfitStructureInner {...props} />;
}
