import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChaosMap } from "@/components/company/ChaosMap";
import { getCompanies } from "@/lib/data";

export default function ChaosMapPage() {
  const companies = getCompanies();

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
                title="業界カオスマップ"
                description="障害福祉・ヘルスケア業界の競合企業を6カテゴリで俯瞰"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <ChaosMap companies={companies} />
        </div>
      </main>
    </div>
  );
}
