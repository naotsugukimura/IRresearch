import { Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GrowthDriverTag } from "@/components/shared/GrowthDriverTag";
import { formatRevenue } from "@/lib/utils";
import type { MidTermPlan } from "@/lib/types";

interface StrategySectionProps {
  plans: MidTermPlan[];
}

export function StrategySection({ plans }: StrategySectionProps) {
  return (
    <div className="space-y-4">
      {plans.map((plan, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm">{plan.name}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">{plan.period}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">
                定量目標
              </h4>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {plan.targets.revenue && (
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">売上高</p>
                    <p className="text-sm font-bold">
                      {formatRevenue(plan.targets.revenue)}
                    </p>
                  </div>
                )}
                {plan.targets.operatingProfit && (
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">営業利益</p>
                    <p className="text-sm font-bold">
                      {formatRevenue(plan.targets.operatingProfit)}
                    </p>
                  </div>
                )}
                {plan.targets.facilities && (
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">拠点数</p>
                    <p className="text-sm font-bold">
                      {plan.targets.facilities}拠点
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {plan.targets.description}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-medium text-muted-foreground">
                重点施策
              </h4>
              <div className="mt-2 space-y-2.5">
                {plan.keyStrategies.map((ks, j) => (
                  <div
                    key={j}
                    className="rounded-md border border-border bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{ks.title}</span>
                      <GrowthDriverTag driver={ks.growthDriver} />
                    </div>
                    <p className="mt-1 pl-5 text-[11px] text-muted-foreground">
                      {ks.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {plan.previousPlanComparison && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground">
                    前中計との比較
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.previousPlanComparison}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
