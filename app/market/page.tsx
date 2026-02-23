"use client";

import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { MarketKpiCards } from "@/components/market/MarketKpiCards";
import { DisabilityPopulationChart } from "@/components/market/DisabilityPopulationChart";
import { EmploymentTrendsChart } from "@/components/market/EmploymentTrendsChart";
import { FacilityCountChart } from "@/components/market/FacilityCountChart";
import { RecruitmentBreakdown } from "@/components/market/RecruitmentBreakdown";
import { MarketNewsFeed } from "@/components/market/MarketNewsFeed";
import { WelfareHistoryTimeline } from "@/components/market/WelfareHistoryTimeline";
import { CareComparisonTable } from "@/components/market/CareComparisonTable";
import { EmploymentPolicySection } from "@/components/market/EmploymentPolicySection";
import { IndustryTrendsSection } from "@/components/market/IndustryTrendsSection";
import { SectionNav } from "@/components/layout/SectionNav";
import { MARKET_SECTION_GROUPS } from "@/lib/constants";
import { getMarketOverview, getCompanies, getAllTrends } from "@/lib/data";
import { cn } from "@/lib/utils";

const TAB_ICONS: Record<string, string> = {
  overview: "\u{1F4CA}",
  employment: "\u{1F465}",
  system: "\u{1F4DC}",
  trends: "\u{1F4F0}",
};
const TAB_SHORT: Record<string, string> = {
  overview: "\u5E02\u5834",
  employment: "\u96C7\u7528",
  system: "\u5236\u5EA6",
  trends: "\u52D5\u5411",
};

export default function MarketPage() {
  const data = getMarketOverview();
  const companies = getCompanies();
  const trends = getAllTrends();

  const [activeTab, setActiveTab] = useState(MARKET_SECTION_GROUPS[0]?.groupId ?? "overview");
  const currentGroup = MARKET_SECTION_GROUPS.find((g) => g.groupId === activeTab);

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
                title="総合ダッシュボード"
                description="障害福祉市場の需給全体像 — 障害者人口・雇用・事業所数・制度の推移"
              />
            </div>
          </div>
        </div>

        {/* ===== Category Tab Bar ===== */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex">
            {MARKET_SECTION_GROUPS.map((group) => {
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

          {/* ===== Market Overview ===== */}
          {activeTab === "overview" && (
            <>
              <section id="summary">
                <MarketKpiCards data={data} />
              </section>

              <section id="demand">
                <DisabilityPopulationChart
                  data={data.disabilityPopulation}
                  annotations={data.contextAnnotations?.filter((a) => a.chartId === "population")}
                />
              </section>

              <section id="facilities">
                <FacilityCountChart
                  data={data.facilityCountsByType}
                  annotations={data.contextAnnotations?.filter((a) => a.chartId === "facilities")}
                />
              </section>
            </>
          )}

          {/* ===== Employment ===== */}
          {activeTab === "employment" && (
            <>
              <section id="employment">
                <EmploymentTrendsChart
                  data={data.disabilityEmployment}
                  annotations={data.contextAnnotations?.filter((a) => a.chartId === "employment")}
                />
              </section>

              <section id="recruitment">
                <RecruitmentBreakdown data={data.recruitmentMethods} />
              </section>

              {data.employmentRateHistory && data.recentPolicyChanges && (
                <section id="employment-policy">
                  <EmploymentPolicySection
                    employmentHistory={data.employmentRateHistory}
                    policyChanges={data.recentPolicyChanges}
                  />
                </section>
              )}
            </>
          )}

          {/* ===== System ===== */}
          {activeTab === "system" && (
            <>
              {data.welfareHistory && (
                <section id="history">
                  <WelfareHistoryTimeline data={data.welfareHistory} />
                </section>
              )}

              {data.careComparison && (
                <section id="care-comparison">
                  <CareComparisonTable data={data.careComparison} />
                </section>
              )}

            </>
          )}

          {/* ===== Trends ===== */}
          {activeTab === "trends" && (
            <>
              <section id="news">
                <MarketNewsFeed news={data.news} />
              </section>

              <section id="industry-trends">
                <IndustryTrendsSection
                  trends={trends}
                  companies={companies}
                />
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
