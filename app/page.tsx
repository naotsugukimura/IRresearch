import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { NavigationGuide } from "@/components/dashboard/NavigationGuide";
import { HomeDigest } from "@/components/dashboard/HomeDigest";
import {
  getCompanies,
  getAllFinancials,
  getMarketOverview,
} from "@/lib/data";

export default function DashboardPage() {
  const companies = getCompanies();
  const financials = getAllFinancials();
  const market = getMarketOverview();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <MobileNav />
          <PageHeader
            title="ホーム"
            description="IRリサーチ - 企業分析・マクロ環境"
          />
        </div>
        <div className="space-y-6 p-4 md:p-6">
          {/* マクロ→ミクロの導線ガイド */}
          <NavigationGuide />

          {/* ダイジェスト: マーケット・注目企業・ニュース */}
          <HomeDigest
            companies={companies}
            financials={financials}
            market={market}
          />
        </div>
      </main>
    </div>
  );
}
