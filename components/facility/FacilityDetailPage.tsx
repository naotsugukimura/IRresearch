"use client";

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
import { FACILITY_SECTION_GROUPS } from "@/lib/constants";
import type { FacilityAnalysisData } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

// Tab icon/label config
const TAB_ICONS: Record<string, string> = {
  market: "\u{1F4CA}",
  history: "\u{1F4DC}",
  management: "\u{1F4B0}",
  operations: "\u{1F527}",
};
const TAB_SHORT: Record<string, string> = {
  market: "\u5E02\u5834",
  history: "\u6CBF\u9769",
  management: "\u7D4C\u55B6",
  operations: "\u696D\u52D9",
};

export function FacilityDetailPage({ data, title }: Props) {
  // Filter groups/sections based on available data
  const activeGroups = FACILITY_SECTION_GROUPS
    .map((group) => ({
      ...group,
      sections: group.sections.filter((s) => {
        const check = OPTIONAL_SECTION_CHECKS[s.id];
        return check ? check(data) : true;
      }),
    }))
    .filter((group) => group.sections.length > 0);

  const [activeTab, setActiveTab] = useState(activeGroups[0]?.groupId ?? "market");
  const currentGroup = activeGroups.find((g) => g.groupId === activeTab);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b-0 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title={title}
                description="\u4E8B\u696D\u6240\u5206\u6790 \u2014 \u53C2\u5165\u6CD5\u4EBA\u30FB\u904B\u55B6\u5B9F\u614B\u30FB\u53CE\u652F\u69CB\u9020\u306E\u6DF1\u6398\u308A"
              />
            </div>
          </div>
        </div>

        {/* ===== Category Tab Bar ===== */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex">
            {activeGroups.map((group) => {
              const isActive = activeTab === group.groupId;
              return (
                <button
                  key={group.groupId}
                  onClick={() => setActiveTab(group.groupId)}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  )}
                >
                  <span className="text-sm">{TAB_ICONS[group.groupId]}</span>
                  <span className="hidden sm:inline">{group.groupLabel}</span>
                  <span className="sm:hidden">{TAB_SHORT[group.groupId]}</span>
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                    {group.sections.length}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: group.groupColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Section Nav (within active tab) ===== */}
        {currentGroup && currentGroup.sections.length > 1 && (
          <SectionNav sections={currentGroup.sections} />
        )}

        {/* ===== Tab Content ===== */}
        <div className="space-y-4 p-4 md:p-6">

          {/* ===== Market ===== */}
          {activeTab === "market" && (
            <>
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
            </>
          )}

          {/* ===== History ===== */}
          {activeTab === "history" && data.rewardRevisions && data.rewardRevisions.length > 0 && (
            <section id="rewardHistory">
              <RewardHistorySection
                revisions={data.rewardRevisions}
                serviceType={data.serviceType}
              />
            </section>
          )}

          {/* ===== Management ===== */}
          {activeTab === "management" && (
            <>
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

              {data.bonusAcquisitionFlow && (
                <section id="bonusFlow">
                  <BonusFlowChart flow={data.bonusAcquisitionFlow} />
                </section>
              )}

              <section id="bonuses">
                <BonusTable bonuses={data.bonusCatalog} />
              </section>
            </>
          )}

          {/* ===== Operations ===== */}
          {activeTab === "operations" && (
            <>
              {data.userJourney && (
                <section id="userJourney">
                  <UserJourneyFlow userJourney={data.userJourney} serviceType={data.serviceType} />
                </section>
              )}

              {data.serviceBlueprint && (
                <section id="blueprint">
                  <ServiceBlueprintSection
                    blueprint={data.serviceBlueprint}
                    serviceType={data.serviceType}
                  />
                </section>
              )}

              <section id="operations">
                <DailyTimeline
                  schedule={data.operationsStory.dailySchedule}
                  serviceType={data.serviceType}
                />
              </section>

              <section id="roles">
                <RoleDiagram
                  roles={data.operationsStory.roles}
                  serviceType={data.serviceType}
                />
              </section>

              {data.operationsStory.stakeholders && data.operationsStory.stakeholders.length > 0 && (
                <section id="stakeholders">
                  <StakeholderMap stakeholders={data.operationsStory.stakeholders} />
                </section>
              )}

              <section id="conversations">
                <ConversationCards conversations={data.operationsStory.typicalConversations} />
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
