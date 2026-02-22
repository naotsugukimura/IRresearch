import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDisabilityKnowledge } from "@/lib/data";
import { DisabilityKnowledgePage } from "@/components/learn/DisabilityKnowledgePage";

export default function DisabilityPage() {
  const data = getDisabilityKnowledge();

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
                title="障害理解"
                description="障害特性と必要なサポート ── 支援者・同僚として知っておくべきこと"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <DisabilityKnowledgePage data={data} />
        </div>
      </main>
    </div>
  );
}
