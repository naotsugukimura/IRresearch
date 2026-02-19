import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import type { Company } from "@/lib/types";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/company/${company.id}`}>
      <Card className="group transition-colors hover:border-foreground/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: company.brandColor }}
            >
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate">{company.name}</h3>
                {company.stockCode && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {company.stockCode}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <CategoryBadge category={company.category} />
                <ThreatBadge level={company.threatLevel} />
                <Badge variant="secondary" className="text-[10px]">
                  {company.market}
                </Badge>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                {company.description}
              </p>
              {!company.hasFullData && (
                <Badge variant="outline" className="mt-1.5 text-[10px] text-muted-foreground">
                  データ未整備
                </Badge>
              )}
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
