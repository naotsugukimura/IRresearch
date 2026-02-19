import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyList } from "@/components/company/CompanyList";
import { getCompanies } from "@/lib/data";

export default function CompanyIndexPage() {
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
                title="企業分析"
                description="監視対象28社の一覧 - カテゴリA〜F"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <CompanyList companies={companies} />
        </div>
      </main>
    </div>
  );
}
