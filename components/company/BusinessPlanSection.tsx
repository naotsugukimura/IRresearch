"use client";

import { useState } from "react";
import type { CompanyBusinessPlan } from "@/lib/types";
import { SummaryCards } from "@/components/plan/SummaryCards";
import { PlChart } from "@/components/plan/PlChart";
import { MonthlyTable } from "@/components/plan/MonthlyTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessPlanSectionProps {
  plan: CompanyBusinessPlan;
  allPlans?: CompanyBusinessPlan[];
  companyColor: string;
}

export function BusinessPlanSection({ plan, allPlans, companyColor }: BusinessPlanSectionProps) {
  const segmentPlans = allPlans?.filter((p) => p.segmentId) ?? [];
  const hasSegments = segmentPlans.length > 0;

  // タブ: "all" = 全社合算, それ以外 = segmentId
  const [activeTab, setActiveTab] = useState<string>("all");

  const activePlan = activeTab === "all"
    ? plan
    : segmentPlans.find((p) => p.segmentId === activeTab) ?? plan;

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: companyColor }}
            />
            事業計画PL（月次シミュレーション）
          </CardTitle>
          {hasSegments && (
            <div className="flex gap-1 mt-2 flex-wrap">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                全社合算
              </button>
              {segmentPlans.map((sp) => (
                <button
                  key={sp.segmentId}
                  onClick={() => setActiveTab(sp.segmentId!)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    activeTab === sp.segmentId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sp.segmentName}
                </button>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      <SummaryCards plan={activePlan} />
      <PlChart plan={activePlan} companyColor={companyColor} />

      {activePlan.sections.map((section) => (
        <MonthlyTable
          key={`${activeTab}-${section.title}`}
          section={section}
          color={companyColor}
        />
      ))}
    </div>
  );
}
