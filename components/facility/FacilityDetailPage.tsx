import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { FacilityKpiCards } from "@/components/facility/FacilityKpiCards";
import { EntityDistributionChart } from "@/components/facility/EntityDistributionChart";
import { OperatorScaleChart } from "@/components/facility/OperatorScaleChart";
import { FacilityGrowthChart } from "@/components/facility/FacilityGrowthChart";
import { RewardHistorySection } from "@/components/facility/RewardHistorySection";
import { DailyTimeline } from "@/components/facility/DailyTimeline";
import { RoleDiagram } from "@/components/facility/RoleDiagram";
import { StakeholderMap } from "@/components/facility/StakeholderMap";
import { ConversationCards } from "@/components/facility/ConversationCards";
import { PLWaterfall } from "@/components/facility/PLWaterfall";
import { BonusTable } from "@/components/facility/BonusTable";
import { MonthlyPLTable } from "@/components/facility/MonthlyPLTable";
import { UserJourneyFlow } from "@/components/facility/UserJourneyFlow";
import { StartupFlow } from "@/components/facility/StartupFlow";
import { BusinessLifecycle } from "@/components/facility/BusinessLifecycle";
import { BonusFlowChart } from "@/components/facility/BonusFlowChart";
import { ServiceBlueprintSection } from "@/components/facility/ServiceBlueprintSection";
import { RewardUnitTable } from "@/components/facility/RewardUnitTable";
import { SectionNav } from "@/components/layout/SectionNav";
import { FACILITY_SECTION_GROUPS, type FacilitySectionGroup } from "@/lib/constants";
import type { FacilityAnalysisData } from "@/lib/types";

interface Props {
  data: FacilityAnalysisData;
  title: string;
}

// Checks for optional sections — if check returns false, section is hidden
const OPTIONAL_SECTION_CHECKS: Record<string, (d: FacilityAnalysisData) => boolean> = {
  userJourney: (d) => !!d.userJourney,
  lifecycle: (d) => !!d.businessLifecycle || !!d.startupGuide,
  blueprint: (d) => !!d.serviceBlueprint,
  stakeholders: (d) => (d.operationsStory.stakeholders?.length ?? 0) > 0,
  rewardTable: (d) => !!d.rewardUnitTable,
  monthlyPL: (d) => !!d.monthlyPL,
  bonusFlow: (d) => !!d.bonusAcquisitionFlow,
  rewardHistory: (d) => (d.rewardRevisions?.length ?? 0) > 0,
};

function CategoryHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-6 pb-2">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-sm font-bold text-foreground tracking-wide">{label}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function FacilityDetailPage({ data, title }: Props) {
  // Filter out groups/sections where data doesn't exist
  const activeGroups: FacilitySectionGroup[] = FACILITY_SECTION_GROUPS
    .map((group) => ({
      ...group,
      sections: group.sections.filter((s) => {
        const check = OPTIONAL_SECTION_CHECKS[s.id];
        return check ? check(data) : true;
      }),
    }))
    .filter((group) => group.sections.length > 0);

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
                title={title}
                description="事業所分析 — 参入法人・運営実態・収支構造の深掘り"
              />
            </div>
          </div>
        </div>
        <SectionNav groups={activeGroups} />
        <div className="space-y-4 p-4 md:p-6">

          {/* ========================================== */}
          {/* 市場系                                      */}
          {/* ========================================== */}
          <CategoryHeader label="市場系" color="#3B82F6" />

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
              rewardRevisions={data.rewardRevisions}
              serviceType={data.serviceType}
            />
          </section>

          {/* ========================================== */}
          {/* 沿革系                                      */}
          {/* ========================================== */}
          {data.rewardRevisions && data.rewardRevisions.length > 0 && (
            <>
              <CategoryHeader label="沿革系" color="#F59E0B" />
              <section id="rewardHistory">
                <RewardHistorySection
                  revisions={data.rewardRevisions}
                  serviceType={data.serviceType}
                />
              </section>
            </>
          )}

          {/* ========================================== */}
          {/* 経営系                                      */}
          {/* ========================================== */}
          <CategoryHeader label="経営系" color="#10B981" />

          {/* Business Lifecycle / Startup Flow */}
          {data.businessLifecycle ? (
            <section id="lifecycle">
              <BusinessLifecycle
                lifecycle={data.businessLifecycle}
                startupGuide={data.startupGuide}
                serviceType={data.serviceType}
              />
            </section>
          ) : data.startupGuide ? (
            <section id="lifecycle">
              <StartupFlow startupGuide={data.startupGuide} serviceType={data.serviceType} />
            </section>
          ) : null}

          <section id="pl">
            <PLWaterfall data={data.facilityPL} />
          </section>

          {data.rewardUnitTable && (
            <section id="rewardTable">
              <RewardUnitTable data={data.rewardUnitTable} />
            </section>
          )}

          {data.monthlyPL && (
            <section id="monthlyPL">
              <MonthlyPLTable data={data.monthlyPL} />
            </section>
          )}

          {/* Bonus Acquisition Flow */}
          {data.bonusAcquisitionFlow && (
            <section id="bonusFlow">
              <BonusFlowChart flow={data.bonusAcquisitionFlow} />
            </section>
          )}

          <section id="bonuses">
            <BonusTable bonuses={data.bonusCatalog} />
          </section>

          {/* ========================================== */}
          {/* 業務プロセス理解                              */}
          {/* ========================================== */}
          <CategoryHeader label="業務プロセス理解" color="#8B5CF6" />

          {/* User Journey Flow */}
          {data.userJourney && (
            <section id="userJourney">
              <UserJourneyFlow userJourney={data.userJourney} serviceType={data.serviceType} />
            </section>
          )}

          {/* Service Blueprint */}
          {data.serviceBlueprint && (
            <section id="blueprint">
              <ServiceBlueprintSection
                blueprint={data.serviceBlueprint}
                serviceType={data.serviceType}
              />
            </section>
          )}

          {/* Operations: Daily timeline */}
          <section id="operations">
            <DailyTimeline
              schedule={data.operationsStory.dailySchedule}
              serviceType={data.serviceType}
            />
          </section>

          {/* Roles */}
          <section id="roles">
            <RoleDiagram
              roles={data.operationsStory.roles}
              serviceType={data.serviceType}
            />
          </section>

          {/* Stakeholders */}
          {data.operationsStory.stakeholders && data.operationsStory.stakeholders.length > 0 && (
            <section id="stakeholders">
              <StakeholderMap stakeholders={data.operationsStory.stakeholders} />
            </section>
          )}

          <section id="conversations">
            <ConversationCards conversations={data.operationsStory.typicalConversations} />
          </section>

        </div>
      </main>
    </div>
  );
}
