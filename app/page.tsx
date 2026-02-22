import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PerformanceCards } from "@/components/dashboard/PerformanceCards";
import { KeywordCloud } from "@/components/dashboard/KeywordCloud";
import { UpdateTimeline } from "@/components/dashboard/UpdateTimeline";
import { KpiComparisonChart } from "@/components/dashboard/KpiComparisonChart";
import { NavigationGuide } from "@/components/dashboard/NavigationGuide";
import {
  getCompanies,
  getAllFinancials,
  getAllStrategies,
} from "@/lib/data";

export default function DashboardPage() {
  const companies = getCompanies();
  const financials = getAllFinancials();
  const strategies = getAllStrategies();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <MobileNav />
          <PageHeader
            title="ホーム"
            description="障害福祉支援部 競合IR分析ダッシュボード"
          />
        </div>
        <div className="space-y-6 p-4 md:p-6">
          {/* マクロ→ミクロの導線ガイド */}
          <NavigationGuide />

          {/* 企業KPIサマリー */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              企業モニタリング概況
            </h2>
            <PerformanceCards companies={companies} financials={financials} />
          </div>

          {/* チャート + サイドバー */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <KpiComparisonChart
                companies={companies}
                financials={financials}
              />
            </div>
            <div className="space-y-4">
              <KeywordCloud strategies={strategies} />
              <UpdateTimeline companies={companies} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
