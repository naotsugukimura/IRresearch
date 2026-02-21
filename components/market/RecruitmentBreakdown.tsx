"use client";

import dynamic from "next/dynamic";
import type { RecruitmentMethod } from "@/lib/types";

const RecruitmentBreakdownInner = dynamic(
  () => import("./RecruitmentBreakdownInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] animate-pulse rounded-lg bg-muted" />
    ),
  }
);

interface Props {
  data: RecruitmentMethod[];
}

export function RecruitmentBreakdown(props: Props) {
  return <RecruitmentBreakdownInner {...props} />;
}
