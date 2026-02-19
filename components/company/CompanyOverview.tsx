import { ExternalLink, MapPin, Calendar, Users, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatNumber } from "@/lib/utils";
import { PRIORITY_RANK_CONFIG } from "@/lib/constants";
import type { Company } from "@/lib/types";

interface CompanyOverviewProps {
  company: Company;
}

export function CompanyOverview({ company }: CompanyOverviewProps) {
  const rankConfig = PRIORITY_RANK_CONFIG[company.priorityRank];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: company.brandColor }}
            >
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{company.name}</h2>
                {company.stockCode && (
                  <span className="text-xs text-muted-foreground">
                    ({company.stockCode})
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={company.category} />
                <ThreatBadge level={company.threatLevel} />
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{ color: rankConfig.color, borderColor: rankConfig.color + "40" }}
                >
                  ランク{rankConfig.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {company.market}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {company.irUrl && (
              <a
                href={company.irUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                IR情報
              </a>
            )}
            {company.officialUrl && (
              <a
                href={company.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-3 w-3" />
                公式サイト
              </a>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <p className="text-sm text-muted-foreground">{company.description}</p>

        {company.mission && (
          <p className="mt-2 text-xs italic text-muted-foreground/70">
            &ldquo;{company.mission}&rdquo;
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {company.headquarters && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {company.headquarters}
            </div>
          )}
          {company.founded && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {company.founded}
            </div>
          )}
          {company.employeeCount && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatNumber(company.employeeCount)}名
            </div>
          )}
        </div>

        {company.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {company.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
