"use client";

import dynamic from "next/dynamic";
import type { CompanyBusinessPlan } from "@/lib/types";

const PLSimulatorInner = dynamic(() => import("./PLSimulatorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      PLシミュレーション読み込み中...
    </div>
  ),
});

interface Props {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

export function PLSimulator({ plan, companyColor }: Props) {
  return <PLSimulatorInner plan={plan} companyColor={companyColor} />;
}
