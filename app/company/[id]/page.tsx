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

              <section id="strategy">
                {strategy ? (
                  <StrategySection plans={strategy.plans} />
                ) : (
                  <EmptyState title="戦略データなし" />
                )}
              </section>

              <section id="financials">
                {financials ? (
                  <FinancialCharts
                    financials={financials}
                    companyColor={company.brandColor}
                  />
                ) : (
                  <EmptyState title="財務データなし" />
                )}
                {businessPlan && (
                  <div className="mt-4">
                    <BusinessPlanSection
                      plan={businessPlan}
                      allPlans={allBusinessPlans}
                      companyColor={company.brandColor}
                    />
                  </div>
                )}
              </section>

              {earningsInsights && (
                <section id="earnings">
                  <EarningsInsightsSection
                    data={earningsInsights}
                    companyName={company.name}
                  />
                </section>
              )}

              <section id="advantage">
                {advantage ? (
                  <CompetitiveAdvantage data={advantage} />
                ) : (
                  <EmptyState title="競争優位性データなし" />
                )}
              </section>

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
