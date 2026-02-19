import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { RewardTracker } from "@/components/trends/RewardTracker";
import { MarketSizeChart } from "@/components/trends/MarketSizeChart";
import { PolicyTimeline } from "@/components/trends/PolicyTimeline";
import { TechTrends } from "@/components/trends/TechTrends";
import { getCompanies, getAllTrends } from "@/lib/data";

export default function TrendsPage() {
  const companies = getCompanies();
  const trends = getAllTrends();

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
                title="業界トレンド"
                description="障害福祉業界の政策・市場・テクノロジー動向"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 md:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <RewardTracker trends={trends} companies={companies} />
            <MarketSizeChart />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PolicyTimeline trends={trends} />
            <TechTrends trends={trends} companies={companies} />
          </div>
        </div>
      </main>
    </div>
  );
}
