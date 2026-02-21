import type { CompanyBusinessPlan } from "@/lib/types";
import { SummaryCards } from "@/components/plan/SummaryCards";
import { PlChart } from "@/components/plan/PlChart";
import { MonthlyTable } from "@/components/plan/MonthlyTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessPlanSectionProps {
  plan: CompanyBusinessPlan;
  companyColor: string;
}

export function BusinessPlanSection({ plan, companyColor }: BusinessPlanSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: companyColor }}
            />
            事業計画PL（月次シミュレーション）
          </CardTitle>
        </CardHeader>
      </Card>

      <SummaryCards plan={plan} />
      <PlChart plan={plan} companyColor={companyColor} />

      {plan.sections.map((section) => (
        <MonthlyTable
          key={section.title}
          section={section}
          color={companyColor}
        />
      ))}
    </div>
  );
}
