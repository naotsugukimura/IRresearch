import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionNav } from "@/components/layout/SectionNav";
import { CrossServiceTimeline } from "@/components/reward/CrossServiceTimeline";
import { ServiceRevisionDetail } from "@/components/reward/ServiceRevisionDetail";
import { getRewardRevisions } from "@/lib/data";

const SECTIONS = [
  { id: "cross-timeline", label: "横断タイムライン" },
  { id: "service-detail", label: "サービス別詳細" },
] as const;

export default function RewardRevisionPage() {
  const data = getRewardRevisions();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b-0 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title="報酬改定タイムライン"
                description="障害福祉サービス報酬改定の歴史 — 引き上げ・引き下げ・制度創設の全体像"
              />
            </div>
          </div>
        </div>
        <SectionNav sections={SECTIONS} />
        <div className="space-y-4 p-4 md:p-6">
          <section id="cross-timeline">
            <CrossServiceTimeline services={data.services} />
          </section>

          <section id="service-detail">
            <ServiceRevisionDetail services={data.services} />
          </section>
        </div>
      </main>
    </div>
  );
}
