import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, HelpCircle, Eye, Layers } from "lucide-react";
import type { Company, Quadrant, ThreatLevel, FiscalYear } from "@/lib/types";
import type { QuadrantConfig } from "@/lib/constants";
import { THREAT_LEVEL_CONFIG, PRIORITY_RANK_CONFIG } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface Props {
  quadrant: Quadrant;
  config: QuadrantConfig;
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
}

// ─── 象限コンテキストカード ───────────────────────
function QuadrantContext({ config }: { config: QuadrantConfig }) {
  return (
    <Card
      className="border-border/50"
      style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Badge
            className="text-[10px]"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
              border: `1px solid ${config.color}40`,
            }}
          >
            {config.industryAxis} / {config.valueAxis}
          </Badge>
        </div>

        {/* Purpose */}
        <div>
          <p className="text-xs text-muted-foreground">{config.purpose}</p>
        </div>

        {/* 知りたいこと */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              この象限で知りたいこと
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.knowItems.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="text-[10px] py-0.5 px-2"
                style={{ borderColor: `${config.color}30`, color: config.color }}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* サブカテゴリ */}
        {config.subCategories.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                サービスカテゴリ
              </span>
            </div>
            <div className="grid gap-1.5">
              {config.subCategories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-start gap-2 rounded-md bg-accent/20 px-2.5 py-1.5"
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] py-0 px-1.5 shrink-0 mt-0.5"
                    style={{ borderColor: `${config.color}40`, color: config.color }}
                  >
                    {cat.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground leading-relaxed">
                    {cat.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Questions */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              問い
            </span>
          </div>
          <ul className="space-y-1">
            {config.keyQuestions.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
              >
                <span style={{ color: config.color }} className="mt-0.5 shrink-0">
                  ▸
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ランキング表 ───────────────────────────────
function RankingTable({
  companies,
  financialsMap,
  config,
}: {
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
  config: QuadrantConfig;
}) {
  // 売上の大きい順にソート（データなし企業は後ろ）
  const ranked = [...companies].sort((a, b) => {
    const fa = financialsMap[a.id];
    const fb = financialsMap[b.id];
    if (fa && fb) return fb.revenue - fa.revenue;
    if (fa) return -1;
    if (fb) return 1;
    return (b.threatLevel as number) - (a.threatLevel as number);
  });

  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="text-left py-2 px-3 font-bold text-muted-foreground w-8">
                  #
                </th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">
                  企業名
                </th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground hidden sm:table-cell">
                  主要サービス
                </th>
                <th className="text-right py-2 px-3 font-bold text-muted-foreground">
                  売上
                </th>
                <th className="text-right py-2 px-3 font-bold text-muted-foreground">
                  営業利益率
                </th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">
                  脅威
                </th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">
                  優先
                </th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c, idx) => {
                const fiscal = financialsMap[c.id];
                const threat = THREAT_LEVEL_CONFIG[c.threatLevel as ThreatLevel];
                const priorityConfig = PRIORITY_RANK_CONFIG[c.priorityRank];

                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/30 hover:bg-accent/20 transition-colors"
                  >
                    <td className="py-2 px-3 font-mono text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/company/${c.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {c.name}
                      </Link>
                      {c.stockCode && (
                        <span className="text-[9px] text-muted-foreground font-mono ml-1.5">
                          {c.stockCode}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(c.mainServices ?? []).slice(0, 2).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[8px] py-0 px-1"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {fiscal ? (
                        <span className="text-foreground">
                          {formatCurrency(fiscal.revenue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {fiscal ? (
                        <span
                          className={
                            fiscal.operatingMargin >= 10
                              ? "text-emerald-400"
                              : fiscal.operatingMargin >= 0
                                ? "text-foreground"
                                : "text-red-400"
                          }
                        >
                          {fiscal.operatingMargin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                i <= (c.threatLevel as number)
                                  ? threat.color
                                  : "#374151",
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 px-1"
                        style={{
                          color: priorityConfig.color,
                          borderColor: `${priorityConfig.color}40`,
                        }}
                      >
                        {c.priorityRank}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 企業カード ────────────────────────────────
function CompanyCard({
  company,
  fiscal,
}: {
  company: Company;
  fiscal: FiscalYear | null;
}) {
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
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
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
                  style={{
                    color: priorityConfig.color,
                    borderColor: `${priorityConfig.color}40`,
                  }}
                >
                  {company.priorityRank}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {company.description}
              </p>

              {/* Financial quick stats */}
              {fiscal && (
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                  <span className="text-muted-foreground">
                    売上{" "}
                    <span className="text-foreground font-medium">
                      {formatCurrency(fiscal.revenue)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    営利{" "}
                    <span
                      className={
                        fiscal.operatingMargin >= 10
                          ? "text-emerald-400 font-medium"
                          : "text-foreground font-medium"
                      }
                    >
                      {fiscal.operatingMargin.toFixed(1)}%
                    </span>
                  </span>
                  {fiscal.employees && (
                    <span className="text-muted-foreground">
                      人員{" "}
                      <span className="text-foreground font-medium">
                        {fiscal.employees.toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {(company.mainServices ?? []).slice(0, 3).map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-[9px] py-0 px-1.5"
                  >
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

// ─── メインページ ──────────────────────────────
export function QuadrantDetailPage({
  quadrant,
  config,
  companies,
  financialsMap,
}: Props) {
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
          {/* 象限コンテキスト */}
          <QuadrantContext config={config} />

          {/* ランキング表 */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              企業ランキング（{companies.length}社）
            </h2>
            <RankingTable
              companies={companies}
              financialsMap={financialsMap}
              config={config}
            />
          </div>

          {/* 企業カード一覧 */}
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              企業詳細カード
            </h2>
            {sorted.length > 0 ? (
              <div className="space-y-2">
                {sorted.map((c) => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    fiscal={financialsMap[c.id]}
                  />
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
