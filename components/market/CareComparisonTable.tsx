"use client";

import { ArrowLeftRight } from "lucide-react";
import type { CareComparisonItem } from "@/lib/types";

interface Props {
  data: CareComparisonItem[];
}

export function CareComparisonTable({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">障害福祉 × 介護 — 制度比較</h3>
          <p className="text-xs text-muted-foreground">
            介護保険制度は障害福祉の「先行指標」— 10年後の障害福祉を読み解く
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2.5 pr-3 text-left font-medium text-muted-foreground">比較軸</th>
              <th className="pb-2.5 pr-3 text-left font-medium text-blue-400">障害福祉</th>
              <th className="pb-2.5 pr-3 text-left font-medium text-emerald-400">介護保険</th>
              <th className="pb-2.5 text-left font-medium text-amber-400">示唆</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-muted/10">
                <td className="py-3 pr-3 font-medium text-foreground">{item.dimension}</td>
                <td className="py-3 pr-3 text-[11px] leading-relaxed text-muted-foreground">
                  {item.disability}
                </td>
                <td className="py-3 pr-3 text-[11px] leading-relaxed text-muted-foreground">
                  {item.care}
                </td>
                <td className="py-3 text-[11px] leading-relaxed text-amber-400/80">
                  {item.insight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
