import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { FacilityKpiCards } from "@/components/facility/FacilityKpiCards";
import { EntityDistributionChart } from "@/components/facility/EntityDistributionChart";
import { OperatorScaleChart } from "@/components/facility/OperatorScaleChart";
import { FacilityGrowthChart } from "@/components/facility/FacilityGrowthChart";
import { DailyTimeline } from "@/components/facility/DailyTimeline";
import { RoleDiagram } from "@/components/facility/RoleDiagram";
import { ConversationCards } from "@/components/facility/ConversationCards";
import { PLWaterfall } from "@/components/facility/PLWaterfall";
import { BonusTable } from "@/components/facility/BonusTable";
import { MonthlyPLTable } from "@/components/facility/MonthlyPLTable";
import type { FacilityAnalysisData } from "@/lib/types";

interface Props {
  data: FacilityAnalysisData;
  title: string;
}

export function FacilityDetailPage({ data, title }: Props) {
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
                title={title}
                description="事業所分析 — 参入法人・運営実態・収支構造の深掘り"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 md:p-6">
          <section id="overview">
            <FacilityKpiCards data={data} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section id="entities">
              <EntityDistributionChart data={data.entityDistribution} />
            </section>
            <section id="scale">
              <OperatorScaleChart data={data.operatorScale} />
            </section>
          </div>

          <section id="timeseries">
            <FacilityGrowthChart
              facilityData={data.facilityTimeSeries}
              userData={data.userTimeSeries}
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section id="operations">
              <DailyTimeline schedule={data.operationsStory.dailySchedule} />
            </section>
            <section id="roles">
              <RoleDiagram roles={data.operationsStory.roles} />
            </section>
          </div>

          <section id="conversations">
            <ConversationCards conversations={data.operationsStory.typicalConversations} />
          </section>

          <section id="pl">
            <PLWaterfall data={data.facilityPL} />
          </section>

          {data.monthlyPL && (
            <section id="monthlyPL">
              <MonthlyPLTable data={data.monthlyPL} />
            </section>
          )}

          <section id="bonuses">
            <BonusTable bonuses={data.bonusCatalog} />
          </section>
        </div>
      </main>
    </div>
  );
}
