import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PerformanceCards } from "@/components/dashboard/PerformanceCards";
import { KeywordCloud } from "@/components/dashboard/KeywordCloud";
import { UpdateTimeline } from "@/components/dashboard/UpdateTimeline";
import { KpiComparisonChart } from "@/components/dashboard/KpiComparisonChart";
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
            title="ダッシュボード"
            description="競合企業IR分析の全体サマリー"
          />
        </div>
        <div className="space-y-4 p-4 md:p-6">
          <PerformanceCards companies={companies} financials={financials} />
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
