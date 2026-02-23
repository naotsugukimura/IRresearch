import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Company, Quadrant, ThreatLevel } from "@/lib/types";
import type { QuadrantConfig } from "@/lib/constants";
import { THREAT_LEVEL_CONFIG, PRIORITY_RANK_CONFIG } from "@/lib/constants";

interface Props {
  quadrant: Quadrant;
  config: QuadrantConfig;
  companies: Company[];
}

function CompanyCard({ company }: { company: Company }) {
  const threat = THREAT_LEVEL_CONFIG[company.threatLevel as ThreatLevel];
  const priorityConfig = PRIORITY_RANK_CONFIG[company.priorityRank];
  const faviconUrl = company.officialUrl
    ? `https://www.google.com/s2/favicons?domain=${new URL(company.officialUrl).hostname}&sz=32`
    : null;

  return (
    <Link href={`/company/${company.id}`} className="block group">
      <Card className="border-border/50 transition-all hover:shadow-md hover:border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Favicon */}
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: `${company.brandColor}20` }}
            >
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
              ) : (
                <span
                  className="text-xs font-bold"
                  style={{ color: company.brandColor }}
                >
                  {company.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground group-hover:underline truncate">
                  {company.name}
                </h3>
                {company.stockCode && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {company.stockCode}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="text-[9px] py-0 px-1 shrink-0"
                  style={{ color: priorityConfig.color, borderColor: `${priorityConfig.color}40` }}
                >
                  {company.priorityRank}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {company.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {(company.mainServices ?? []).slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[9px] py-0 px-1.5">
                    {s}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                  {company.market}
                </Badge>
              </div>
            </div>

            {/* Threat + Arrow */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        i <= (company.threatLevel as number)
                          ? threat.color
                          : "#374151",
                    }}
                  />
                ))}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function QuadrantDetailPage({ quadrant, config, companies }: Props) {
  const sorted = [...companies].sort(
    (a, b) => (b.threatLevel as number) - (a.threatLevel as number)
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b-0 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title={config.label}
                description={config.description}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 md:p-6">
          {/* Quadrant Info */}
          <Card
            className="border-border/50"
            style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  className="text-[10px]"
                  style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}
                >
                  {config.industryAxis} / {config.valueAxis}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {quadrant}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {companies.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {config.purpose}
              </p>
            </CardContent>
          </Card>

          {/* Companies */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {companies.length} 企業
            </h2>
            {sorted.length > 0 ? (
              <div className="space-y-2">
                {sorted.map((c) => (
                  <CompanyCard key={c.id} company={c} />
                ))}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    この象限にはまだ企業が分類されていません
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    今後追加予定です
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Back link */}
          <div className="pt-2">
            <Link
              href="/company/chaos-map"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; カオスマップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
