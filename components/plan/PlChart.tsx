"use client";

import dynamic from "next/dynamic";
import type { CompanyBusinessPlan } from "@/lib/types";

const PlChartInner = dynamic(() => import("./PlChartInner"), { ssr: false });

interface PlChartProps {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

export function PlChart({ plan, companyColor }: PlChartProps) {
  return <PlChartInner plan={plan} companyColor={companyColor} />;
}
