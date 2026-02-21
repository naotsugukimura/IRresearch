import { Card, CardContent } from "@/components/ui/card";
import type { CompanyBusinessPlan } from "@/lib/types";
import { formatPlanCurrency, formatPercent } from "@/lib/utils";

interface SummaryCardsProps {
  plan: CompanyBusinessPlan;
}

export function SummaryCards({ plan }: SummaryCardsProps) {
  let annualRevenue = 0;
  let annualProfit = 0;
  let profitMargin = 0;
  let breakEvenMonth = "—";

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
      if (row.label.includes("営業利益") && row.isMonetary && row.isBold) {
        const idx = row.values.findIndex((v) => v > 0);
        if (idx >= 0) breakEvenMonth = `${idx + 1}月`;
      }
    }
  }

  const metrics = [
    { label: "年間売上高", value: formatPlanCurrency(annualRevenue), sub: "年間合計" },
    { label: "年間営業利益", value: formatPlanCurrency(annualProfit), sub: annualProfit >= 0 ? "黒字" : "赤字", isNegative: annualProfit < 0 },
    { label: "営業利益率", value: formatPercent(profitMargin), sub: "年間平均" },
    { label: "黒字化月", value: breakEvenMonth, sub: "営業利益>0" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.isNegative ? "text-red-400" : ""}`}>
              {m.value}
            </p>
            <p className={`text-xs mt-1 ${m.isNegative ? "text-red-400" : "text-muted-foreground"}`}>
              {m.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
