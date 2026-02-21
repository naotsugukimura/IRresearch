import { notFound } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SectionNav } from "@/components/layout/SectionNav";
import { CompanyOverview } from "@/components/company/CompanyOverview";
import { SegmentPieChart } from "@/components/company/SegmentPieChart";
import { HistoryTimeline } from "@/components/company/HistoryTimeline";
import { StrategySection } from "@/components/company/StrategySection";
import { FinancialCharts } from "@/components/company/FinancialCharts";
import { BusinessPlanSection } from "@/components/company/BusinessPlanSection";
import { CompetitiveAdvantage } from "@/components/company/CompetitiveAdvantage";
import { SmsInsights } from "@/components/company/SmsInsights";
import { EarningsInsightsSection } from "@/components/company/EarningsInsightsSection";
import { ProfitStructureSection } from "@/components/company/ProfitStructureSection";
import { AreaAnalysisSection } from "@/components/company/AreaAnalysisSection";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getCompanies,
  getCompanyById,
  getFinancialsByCompanyId,
  getHistoryByCompanyId,
  getStrategyByCompanyId,
  getAdvantageByCompanyId,
  getBusinessPlanByCompanyId,
  getBusinessPlansByCompanyId,
  getEarningsInsightsByCompanyId,
  getAreaAnalysisByCompanyId,
} from "@/lib/data";

export function generateStaticParams() {
  return getCompanies().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);
  return {
    title: company
      ? `${company.name} - 競合IR分析`
      : "企業が見つかりません",
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);

  if (!company) {
    notFound();
  }

  const financials = getFinancialsByCompanyId(id);
  const history = getHistoryByCompanyId(id);
  const strategy = getStrategyByCompanyId(id);
  const advantage = getAdvantageByCompanyId(id);
  const businessPlan = getBusinessPlanByCompanyId(id);
  const allBusinessPlans = getBusinessPlansByCompanyId(id);
  const earningsInsights = getEarningsInsightsByCompanyId(id);
  const areaAnalysis = getAreaAnalysisByCompanyId(id);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <Breadcrumb />
          </div>
        </div>

        {!company.hasFullData ? (
          <div className="p-4 md:p-6 space-y-4">
            <CompanyOverview company={company} />
            <EmptyState
              title="詳細データ未整備"
              description={`${company.name}の詳細IR分析データはまだ整備されていません。data/ディレクトリの各JSONファイルにcompanyId: "${company.id}" のデータを追加してください。`}
            />
          </div>
        ) : (
          <>
            <SectionNav />
            <div className="space-y-6 p-4 md:p-6">
              {/* ===== 概要 ===== */}
              <section id="overview">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <CompanyOverview company={company} />
                  </div>
                  {company.segments && company.segments.length > 0 && (
                    <SegmentPieChart segments={company.segments} />
                  )}
                </div>
              </section>

              {/* ===== 沿革 ===== */}
              <section id="history">
                {history ? (
                  <HistoryTimeline
                    events={history.events}
                    companyColor={company.brandColor}
                  />
                ) : (
                  <EmptyState title="沿革データなし" />
                )}
              </section>

              {/* ===== 事業戦略 ===== */}
              <section id="strategy">
                {strategy ? (
                  <StrategySection plans={strategy.plans} />
                ) : (
                  <EmptyState title="戦略データなし" />
                )}
              </section>

              {/* ===== 財務分析（安全性・収益性・CF） ===== */}
              <section id="financial">
                {financials ? (
                  <FinancialCharts
                    financials={financials}
                    companyColor={company.brandColor}
                  />
                ) : (
                  <EmptyState title="財務データなし" />
                )}
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <EmptyState
                    title="安全性分析"
                    description="自己資本比率・流動比率・固定比率等の安全性指標 — データ準備中"
                  />
                  <EmptyState
                    title="キャッシュフロー分析"
                    description="営業CF・投資CF・財務CF・フリーCFの推移 — データ準備中"
                  />
                </div>
              </section>

              {/* ===== 経営分析（PL・CF・FCF） ===== */}
              <section id="management">
                {businessPlan && (
                  <BusinessPlanSection
                    plan={businessPlan}
                    allPlans={allBusinessPlans}
                    companyColor={company.brandColor}
                  />
                )}
                {businessPlan && (
                  <div className="mt-4">
                    <ProfitStructureSection
                      plan={businessPlan}
                      allPlans={allBusinessPlans}
                      companyColor={company.brandColor}
                    />
                  </div>
                )}
                {!businessPlan && (
                  <EmptyState title="事業計画データなし" />
                )}
                <div className="mt-4">
                  <EmptyState
                    title="CF・FCF分析"
                    description="キャッシュフロー計算書に基づく経営分析 — データ準備中"
                  />
                </div>
              </section>

              {/* ===== 事業分析（決算インサイト・エリア・競争優位性） ===== */}
              <section id="business">
                {earningsInsights && (
                  <EarningsInsightsSection
                    data={earningsInsights}
                    companyName={company.name}
                  />
                )}
                {areaAnalysis && (
                  <div className="mt-4">
                    <AreaAnalysisSection
                      data={areaAnalysis}
                      companyColor={company.brandColor}
                    />
                  </div>
                )}
                <div className="mt-4">
                  {advantage ? (
                    <CompetitiveAdvantage data={advantage} />
                  ) : (
                    <EmptyState title="競争優位性データなし" />
                  )}
                </div>
              </section>

              {/* ===== SMSへの示唆 ===== */}
              <section id="insights">
                {advantage ? (
                  <SmsInsights
                    insights={advantage.smsInsights}
                    companyName={company.name}
                  />
                ) : (
                  <EmptyState title="SMSへの示唆データなし" />
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
