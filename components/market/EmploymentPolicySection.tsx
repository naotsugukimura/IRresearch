"use client";

import dynamic from "next/dynamic";
import type { EmploymentRateHistory, RecentPolicyChange } from "@/lib/types";

const EmploymentPolicySectionInner = dynamic(
  () => import("./EmploymentPolicySectionInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  employmentHistory: EmploymentRateHistory[];
  policyChanges: RecentPolicyChange[];
}

export function EmploymentPolicySection(props: Props) {
  return <EmploymentPolicySectionInner {...props} />;
}
