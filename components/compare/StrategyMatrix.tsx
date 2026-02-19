import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthDriverTag } from "@/components/shared/GrowthDriverTag";
import type { Company, CompanyStrategy } from "@/lib/types";

interface StrategyMatrixProps {
  companies: Company[];
  strategies: CompanyStrategy[];
}

export function StrategyMatrix({ companies, strategies }: StrategyMatrixProps) {
  if (companies.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">戦略方針比較</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((c) => {
            const strategy = strategies.find((s) => s.companyId === c.id);
            const latestPlan = strategy?.plans[strategy.plans.length - 1];
            if (!latestPlan) return null;

            return (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.brandColor }}
                  />
                  <span className="text-xs font-medium">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {latestPlan.name}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {latestPlan.keyStrategies.map((ks, i) => (
                    <GrowthDriverTag key={i} driver={ks.growthDriver} />
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  {latestPlan.keyStrategies.map((ks, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground">
                      ・{ks.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
