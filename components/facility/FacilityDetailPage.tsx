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
// ConversationCards removed — conversations integrated into DailyTimeline
import { PLWaterfall } from "@/components/facility/PLWaterfall";
import { BonusTable } from "@/components/facility/BonusTable";
import { MonthlyPLTable } from "@/components/facility/MonthlyPLTable";
import { UserJourneyFlow } from "@/components/facility/UserJourneyFlow";
import { StartupFlow } from "@/components/facility/StartupFlow";
import { BusinessLifecycle } from "@/components/facility/BusinessLifecycle";
import { ServiceBlueprintSection } from "@/components/facility/ServiceBlueprintSection";
import { DetailedProcessMapSection } from "@/components/facility/DetailedProcessMapSection";
import { RewardUnitTable } from "@/components/facility/RewardUnitTable";
import { FacilityRegionalChart } from "@/components/facility/FacilityRegionalChart";
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
  detailedProcess: (d) => (d.detailedProcessMaps?.length ?? 0) > 0,
  stakeholders: (d) => (d.operationsStory.stakeholders?.length ?? 0) > 0,
  rewardTable: (d) => !!d.rewardUnitTable,
  monthlyPL: (d) => !!d.monthlyPL,
  rewardHistory: (d) => (d.rewardRevisions?.length ?? 0) > 0,
  regional: (d) => !!d.regionalData,
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

              {data.regionalData && (
                <section id="regional">
                  <FacilityRegionalChart
                    data={data.regionalData}
                    serviceType={data.serviceType}
                  />
                </section>
              )}
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

          {/* ===== Management (PL→月次→ライフサイクル→報酬単位→加算) ===== */}
          {activeTab === "management" && (
            <>
              <section id="pl">
                <PLWaterfall data={data.facilityPL} />
              </section>

              {data.monthlyPL && (
                <section id="monthlyPL">
                  <MonthlyPLTable data={data.monthlyPL} />
                </section>
              )}

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

              {data.rewardUnitTable && (
                <section id="rewardTable">
                  <RewardUnitTable data={data.rewardUnitTable} />
                </section>
              )}

              <section id="bonuses">
                <BonusTable bonuses={data.bonusCatalog} />
              </section>
            </>
          )}

          {/* ===== Operations (登場人物→一日の流れ→業務プロセス→利用者→関係者) ===== */}
          {activeTab === "operations" && (
            <>
              <section id="roles">
                <RoleDiagram
                  roles={data.operationsStory.roles}
                  serviceType={data.serviceType}
                />
              </section>

              <section id="dailyFlow">
                <DailyTimeline
                  schedule={data.operationsStory.dailySchedule}
                  serviceType={data.serviceType}
                  conversations={data.operationsStory.typicalConversations}
                  monthlySchedule={data.operationsStory.monthlySchedule}
                  annualSchedule={data.operationsStory.annualSchedule}
                />
              </section>

              {data.serviceBlueprint && (
                <section id="blueprint">
                  <ServiceBlueprintSection
                    blueprint={data.serviceBlueprint}
                    serviceType={data.serviceType}
                  />
                </section>
              )}

              {data.detailedProcessMaps && data.detailedProcessMaps.length > 0 && (
                <section id="detailedProcess">
                  <DetailedProcessMapSection
                    processMaps={data.detailedProcessMaps}
                    serviceType={data.serviceType}
                  />
                </section>
              )}

              {data.userJourney && (
                <section id="userJourney">
                  <UserJourneyFlow userJourney={data.userJourney} serviceType={data.serviceType} />
                </section>
              )}

              {data.operationsStory.stakeholders && data.operationsStory.stakeholders.length > 0 && (
                <section id="stakeholders">
                  <StakeholderMap stakeholders={data.operationsStory.stakeholders} />
                </section>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
