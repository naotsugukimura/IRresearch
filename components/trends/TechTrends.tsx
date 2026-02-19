import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { CompanyBadge } from "@/components/shared/CompanyBadge";
import { formatDate } from "@/lib/utils";
import type { IndustryTrend, Company } from "@/lib/types";

interface TechTrendsProps {
  trends: IndustryTrend[];
  companies: Company[];
}

export function TechTrends({ trends, companies }: TechTrendsProps) {
  const techTrends = trends.filter(
    (t) => t.category === "technology"
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <CardTitle className="text-sm">テクノロジートレンド</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {techTrends.map((trend) => (
          <div
            key={trend.id}
            className="rounded-lg border border-border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-medium">{trend.title}</h4>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {formatDate(trend.date)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {trend.summary}
            </p>
            {trend.impactByCompany.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {trend.impactByCompany.map((impact) => {
                  const company = companies.find(
                    (c) => c.id === impact.companyId
                  );
                  if (!company) return null;
                  return (
                    <div
                      key={impact.companyId}
                      className="flex items-center gap-1"
                    >
                      <CompanyBadge
                        companyId={company.id}
                        name={company.name}
                      />
                      <ImpactBadge impact={impact.impact} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {techTrends.length === 0 && (
          <p className="text-xs text-muted-foreground">
            テクノロジー関連のトレンドはありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
