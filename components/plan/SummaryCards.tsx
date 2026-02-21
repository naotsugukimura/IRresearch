"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { CompanyBusinessPlan } from "@/lib/types";
import { formatPlanCurrency, formatPercent } from "@/lib/utils";

interface SummaryCardsProps {
  plan: CompanyBusinessPlan;
}

const METRIC_TIPS: Record<string, string> = {
  "年間売上高": "1年間で得られる総収入。事業の規模を示す最も基本的な指標です",
  "年間営業利益": "本業で稼いだ純粋な利益。この数字がプラスなら事業は健全です",
  "営業利益率": "売上のうち何%が利益になるか。5%以上が健全水準の目安です",
  "黒字化月": "営業利益がプラスに転じる月。早いほどキャッシュフローが安定します",
};

export function SummaryCards({ plan }: SummaryCardsProps) {
  let annualRevenue = 0;
  let annualProfit = 0;
  let profitMargin = 0;
  let breakEvenMonth = "—";
  let breakEvenIdx = -1;

  for (const section of plan.sections) {
    for (const row of section.rows) {
      if (row.label.includes("売上高") && row.isMonetary && row.isBold && row.annual && annualRevenue === 0) {
        annualRevenue = row.annual;
      }
      if (row.label.includes("営業利益") && row.isMonetary && row.isBold && row.annual !== null) {
        annualProfit = row.annual;
      }
      if (row.label.includes("営業利益率") && row.isPercent && row.annual !== null) {
        profitMargin = row.annual;
      }
      if (row.label.includes("営業利益") && row.isMonetary && row.isBold && breakEvenIdx < 0) {
        const idx = row.values.findIndex((v) => v > 0);
        if (idx >= 0) {
          breakEvenIdx = idx;
          breakEvenMonth = `${idx + 1}月`;
        }
      }
    }
  }

  const metrics = [
    { label: "年間売上高", value: formatPlanCurrency(annualRevenue), sub: "年間合計", colorClass: "" },
    { label: "年間営業利益", value: formatPlanCurrency(annualProfit), sub: annualProfit >= 0 ? "黒字" : "赤字", colorClass: annualProfit >= 0 ? "text-profit" : "text-cost" },
    { label: "営業利益率", value: formatPercent(profitMargin), sub: "年間平均", colorClass: profitMargin >= 5 ? "text-profit" : profitMargin >= 0 ? "" : "text-cost" },
    { label: "黒字化月", value: breakEvenMonth, sub: "営業利益>0", colorClass: "text-bep" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-xs">
                  {METRIC_TIPS[m.label]}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className={`text-2xl font-bold font-mono mt-1 ${m.colorClass}`}>
              {m.value}
            </p>
            <p className={`text-xs mt-1 ${m.colorClass || "text-muted-foreground"}`}>
              {m.sub}
            </p>
            {m.label === "黒字化月" && breakEvenIdx >= 0 && (
              <div className="mt-2">
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-bep transition-all"
                    style={{ width: `${((breakEvenIdx + 1) / 12) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                  {breakEvenIdx + 1} / 12ヶ月
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
