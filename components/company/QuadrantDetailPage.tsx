"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, HelpCircle, Eye, Layers } from "lucide-react";
import type { Company, Quadrant, ThreatLevel, FiscalYear, Q1OpsData, Q2BusinessModel, Q3IndustryForce, BpmnModel } from "@/lib/types";
import type { QuadrantConfig } from "@/lib/constants";
import { THREAT_LEVEL_CONFIG, PRIORITY_RANK_CONFIG } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Q1OpsTable } from "./Q1OpsTable";
import { Q2BusinessCards } from "./Q2BusinessCards";
import { Q3IndustryMap } from "./Q3IndustryMap";
import { BpmnDiagram } from "./BpmnDiagram";

interface Props {
  quadrant: Quadrant;
  config: QuadrantConfig;
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
  q1OpsData?: Q1OpsData[];
  q2BizData?: Q2BusinessModel[];
  q3IndustryData?: Q3IndustryForce[];
  q1BpmnData?: BpmnModel[];
}

// ─── 象限コンテキストカード ───────────────────────
function QuadrantContext({ config }: { config: QuadrantConfig }) {
  return (
    <Card
      className="border-border/50"
      style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
    >
      <CardContent className="p-4 space-y-3">
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

        <p className="text-xs text-muted-foreground">{config.purpose}</p>

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
}: {
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
}) {
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
                <th className="text-left py-2 px-3 font-bold text-muted-foreground w-8">#</th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">企業名</th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground hidden sm:table-cell">主要サービス</th>
                <th className="text-right py-2 px-3 font-bold text-muted-foreground">売上</th>
                <th className="text-right py-2 px-3 font-bold text-muted-foreground">営業利益率</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">脅威</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">優先</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c, idx) => {
                const fiscal = financialsMap[c.id];
                const threat = THREAT_LEVEL_CONFIG[c.threatLevel as ThreatLevel];
                const priorityConfig = PRIORITY_RANK_CONFIG[c.priorityRank];
                return (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="py-2 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <Link href={`/company/${c.id}`} className="font-medium text-foreground hover:underline">
                        {c.name}
                      </Link>
                      {c.stockCode && (
                        <span className="text-[9px] text-muted-foreground font-mono ml-1.5">{c.stockCode}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(c.mainServices ?? []).slice(0, 2).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[8px] py-0 px-1">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {fiscal ? <span className="text-foreground">{formatCurrency(fiscal.revenue)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {fiscal ? (
                        <span className={fiscal.operatingMargin >= 10 ? "text-emerald-400" : fiscal.operatingMargin >= 0 ? "text-foreground" : "text-red-400"}>
                          {fiscal.operatingMargin.toFixed(1)}%
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i <= (c.threatLevel as number) ? threat.color : "#374151" }} />
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className="text-[9px] py-0 px-1" style={{ color: priorityConfig.color, borderColor: `${priorityConfig.color}40` }}>
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
function CompanyCard({ company, fiscal }: { company: Company; fiscal: FiscalYear | null }) {
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
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: `${company.brandColor}20` }}>
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="" width={20} height={20} className="rounded-sm" />
              ) : (
                <span className="text-xs font-bold" style={{ color: company.brandColor }}>{company.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground group-hover:underline truncate">{company.name}</h3>
                {company.stockCode && <span className="text-[10px] text-muted-foreground font-mono">{company.stockCode}</span>}
                <Badge variant="outline" className="text-[9px] py-0 px-1 shrink-0" style={{ color: priorityConfig.color, borderColor: `${priorityConfig.color}40` }}>
                  {company.priorityRank}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
              {fiscal && (
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                  <span className="text-muted-foreground">売上 <span className="text-foreground font-medium">{formatCurrency(fiscal.revenue)}</span></span>
                  <span className="text-muted-foreground">営利 <span className={fiscal.operatingMargin >= 10 ? "text-emerald-400 font-medium" : "text-foreground font-medium"}>{fiscal.operatingMargin.toFixed(1)}%</span></span>
                  {fiscal.employees && <span className="text-muted-foreground">人員 <span className="text-foreground font-medium">{fiscal.employees.toLocaleString()}</span></span>}
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {(company.mainServices ?? []).slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[9px] py-0 px-1.5">{s}</Badge>
                ))}
                <Badge variant="outline" className="text-[9px] py-0 px-1.5">{company.market}</Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i <= (company.threatLevel as number) ? threat.color : "#374151" }} />
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

// ─── サブカテゴリ別タブビュー ────────────────────────
function SubCategoryTabs({
  companies,
  financialsMap,
  config,
}: {
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
  config: QuadrantConfig;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("全て");

  // company.subCategory からカテゴリ一覧を生成
  const categorySet = new Set<string>();
  for (const c of companies) {
    categorySet.add(c.subCategory ?? "その他");
  }
  const categories = [...categorySet];

  // カテゴリ別カウント
  const categoryCounts: Record<string, number> = { "全て": companies.length };
  for (const cat of categories) {
    categoryCounts[cat] = companies.filter((c) => (c.subCategory ?? "その他") === cat).length;
  }

  const allCategories = ["全て", ...categories];

  const filtered =
    activeCategory === "全て"
      ? companies
      : companies.filter((c) => (c.subCategory ?? "その他") === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    const fa = financialsMap[a.id];
    const fb = financialsMap[b.id];
    if (fa && fb) return fb.revenue - fa.revenue;
    if (fa) return -1;
    if (fb) return 1;
    return (b.threatLevel as number) - (a.threatLevel as number);
  });

  return (
    <div className="space-y-3">
      {/* カテゴリフィルタ */}
      <div className="flex flex-wrap gap-1.5">
        {allCategories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
                isActive
                  ? "text-foreground border-border bg-accent"
                  : "text-muted-foreground border-transparent hover:bg-accent/50"
              )}
            >
              {cat}
              <span className="ml-1 text-[9px] font-mono text-muted-foreground">
                {categoryCounts[cat] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* カテゴリ別ランキング */}
      <RankingTable companies={sorted} financialsMap={financialsMap} />

      {/* カテゴリ別カード */}
      <div className="space-y-2">
        {sorted.map((c) => (
          <div key={c.id} className="relative">
            {activeCategory === "全て" && (
              <Badge
                variant="outline"
                className="absolute -top-1 -left-1 z-10 text-[8px] py-0 px-1"
                style={{ borderColor: `${config.color}40`, color: config.color, backgroundColor: "var(--background)" }}
              >
                {c.subCategory ?? "その他"}
              </Badge>
            )}
            <CompanyCard company={c} fiscal={financialsMap[c.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Q2: ビジネスモデル概要カード ─────────────────────
function Q2BusinessModelHint({ companies }: { companies: Company[] }) {
  return (
    <Card className="border-border/50 border-l-3" style={{ borderLeftColor: "#F59E0B", borderLeftWidth: "3px" }}>
      <CardContent className="p-4 space-y-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          市場探索の着眼点
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-amber-400 mb-0.5">ニーズ</div>
            <p className="text-[10px] text-muted-foreground">誰の・何のペインに刺しているか？自社のアセットで解決可能か？</p>
          </div>
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-amber-400 mb-0.5">市場規模</div>
            <p className="text-[10px] text-muted-foreground">TAM/SAM/SOMの推定値。障害福祉の準市場としての特性を考慮</p>
          </div>
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-amber-400 mb-0.5">ビジネスモデル</div>
            <p className="text-[10px] text-muted-foreground">課金モデル/顧客セグメント/チャネル。SaaSか/成果報酬か/手数料か</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          ※ 各企業の詳細ページにビジネスモデル情報を追加予定。現在は企業概要ベースの情報を表示しています。
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Q4: 技術キャッチアップ着眼点 ─────────────────────
function Q4TechHint() {
  return (
    <Card className="border-border/50" style={{ borderLeftColor: "#8B5CF6", borderLeftWidth: "3px" }}>
      <CardContent className="p-4 space-y-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          技術キャッチアップの着眼点
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-purple-400 mb-0.5">採用技術</div>
            <p className="text-[10px] text-muted-foreground">どのAI/DX技術を中核に据えているか（LLM/OCR/RPA/SaaS基盤）</p>
          </div>
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-purple-400 mb-0.5">事業化手法</div>
            <p className="text-[10px] text-muted-foreground">技術をどうビジネスに変えているか（プロダクト/API/BPO組み込み）</p>
          </div>
          <div className="rounded-md bg-accent/20 px-3 py-2">
            <div className="text-[10px] font-bold text-purple-400 mb-0.5">適用可能性</div>
            <p className="text-[10px] text-muted-foreground">AIBPO/障害福祉の文脈でどう活用できるか？ROIの見込みは？</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── メインページ ──────────────────────────────
export function QuadrantDetailPage({
  quadrant,
  config,
  companies,
  financialsMap,
  q1OpsData,
  q2BizData,
  q3IndustryData,
  q1BpmnData,
}: Props) {
  const sorted = [...companies].sort(
    (a, b) => (b.threatLevel as number) - (a.threatLevel as number)
  );

  // 全象限でサブカテゴリタブを使用（company.subCategory がある企業は全てタブ表示）
  const hasSubCategoryTabs = companies.some((c) => c.subCategory);

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

          {/* Q1固有: OPS比較表 + BPMNビジネスモデル図 */}
          {quadrant === "Q1" && q1OpsData && q1OpsData.length > 0 && (
            <Q1OpsTable data={q1OpsData} />
          )}
          {quadrant === "Q1" && q1BpmnData && q1BpmnData.length > 0 && (
            <BpmnDiagram data={q1BpmnData} />
          )}

          {/* Q2固有: ビジネスモデル着眼点 + ビジネスモデルカード */}
          {quadrant === "Q2" && <Q2BusinessModelHint companies={companies} />}
          {quadrant === "Q2" && q2BizData && q2BizData.length > 0 && (
            <Q2BusinessCards data={q2BizData} />
          )}

          {/* Q3固有: 業界別勢力図 */}
          {quadrant === "Q3" && q3IndustryData && q3IndustryData.length > 0 && (
            <Q3IndustryMap data={q3IndustryData} />
          )}

          {/* Q4固有: 技術キャッチアップ着眼点 */}
          {quadrant === "Q4" && <Q4TechHint />}

          {/* サブカテゴリ別タブ（Q1/Q3）or 通常ランキング+カード */}
          {hasSubCategoryTabs ? (
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                サービスカテゴリ別（{companies.length}社）
              </h2>
              <SubCategoryTabs
                companies={companies}
                financialsMap={financialsMap}
                config={config}
              />
            </div>
          ) : (
            <>
              {/* ランキング表 */}
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  企業ランキング（{companies.length}社）
                </h2>
                <RankingTable companies={companies} financialsMap={financialsMap} />
              </div>

              {/* 企業カード一覧 */}
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  企業詳細カード
                </h2>
                {sorted.length > 0 ? (
                  <div className="space-y-2">
                    {sorted.map((c) => (
                      <CompanyCard key={c.id} company={c} fiscal={financialsMap[c.id]} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        この象限にはまだ企業が分類されていません
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

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
