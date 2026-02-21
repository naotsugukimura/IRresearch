import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { MarketKpiCards } from "@/components/market/MarketKpiCards";
import { DisabilityPopulationChart } from "@/components/market/DisabilityPopulationChart";
import { EmploymentTrendsChart } from "@/components/market/EmploymentTrendsChart";
import { FacilityCountChart } from "@/components/market/FacilityCountChart";
import { RecruitmentBreakdown } from "@/components/market/RecruitmentBreakdown";
import { MarketNewsFeed } from "@/components/market/MarketNewsFeed";
import { getMarketOverview } from "@/lib/data";

export default function MarketPage() {
  const data = getMarketOverview();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title="総合ダッシュボード"
                description="障害福祉市場の需給全体像 — 障害者人口・雇用・事業所数の推移"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 md:p-6">
          {/* KPIサマリー */}
          <section id="summary">
            <MarketKpiCards data={data} />
          </section>

          {/* 需要側: 障害者人口 */}
          <section id="demand">
            <DisabilityPopulationChart data={data.disabilityPopulation} />
          </section>

          {/* 供給側: 雇用 + 事業所 */}
          <div className="grid gap-4 lg:grid-cols-2">
            <section id="employment">
              <EmploymentTrendsChart data={data.disabilityEmployment} />
            </section>
            <section id="recruitment">
              <RecruitmentBreakdown data={data.recruitmentMethods} />
            </section>
          </div>

          {/* 事業所数 */}
          <section id="facilities">
            <FacilityCountChart data={data.facilityCountsByType} />
          </section>

          {/* ニュース */}
          <section id="news">
            <MarketNewsFeed news={data.news} />
          </section>
        </div>
      </main>
    </div>
  );
}
