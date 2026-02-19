import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { CompanyBadge } from "@/components/shared/CompanyBadge";
import { formatDate } from "@/lib/utils";
import type { IndustryTrend, Company } from "@/lib/types";

interface RewardTrackerProps {
  trends: IndustryTrend[];
  companies: Company[];
}

export function RewardTracker({ trends, companies }: RewardTrackerProps) {
  const policyTrends = trends.filter(
    (t) => t.category === "policy" || t.category === "regulation"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-red-400" />
          <CardTitle className="text-sm">報酬改定・制度変更トラッカー</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {policyTrends.map((trend) => (
          <div
            key={trend.id}
            className="rounded-lg border border-border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-medium">{trend.title}</h4>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatDate(trend.date)}
                </p>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {trend.summary}
            </p>
            {trend.impactByCompany.length > 0 && (
              <div className="mt-2 space-y-1">
                {trend.impactByCompany.map((impact) => {
                  const company = companies.find(
                    (c) => c.id === impact.companyId
                  );
                  if (!company) return null;
                  return (
                    <div
                      key={impact.companyId}
                      className="flex items-center gap-2"
                    >
                      <CompanyBadge
                        companyId={company.id}
                        name={company.name}
                      />
                      <ImpactBadge impact={impact.impact} />
                      <span className="text-[10px] text-muted-foreground">
                        {impact.note}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {policyTrends.length === 0 && (
          <p className="text-xs text-muted-foreground">
            政策・制度関連のトレンドはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
