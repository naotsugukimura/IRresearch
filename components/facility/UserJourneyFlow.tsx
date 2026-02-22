"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserJourney } from "@/lib/types";

const FLOW_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
  "#06B6D4", "#EC4899", "#14B8A6",
];

function FlowDiagram({
  steps,
  title,
}: {
  steps: { label: string; description: string; duration?: string; keyActions?: string[]; who?: string }[];
  title: string;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h4>
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => {
            const color = FLOW_COLORS[idx % FLOW_COLORS.length];
            const isOpen = expanded === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  className="relative flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/50"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.label}</span>
                      {step.duration && (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {step.duration}
                        </span>
                      )}
                      {step.who && (
                        <span className="text-[10px] text-muted-foreground">
                          {step.who}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {step.keyActions && step.keyActions.length > 0 && (
                    <svg
                      className={cn(
                        "mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-90"
                      )}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
                {isOpen && step.keyActions && step.keyActions.length > 0 && (
                  <div className="ml-11 mt-1 mb-1 rounded-md border border-border bg-accent/30 p-3">
                    <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
                      主なアクション
                    </p>
                    <ul className="space-y-1">
                      {step.keyActions.map((action, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[11px] text-muted-foreground"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface UserJourneyFlowProps {
  userJourney: UserJourney;
  serviceType?: string;
}

export function UserJourneyFlow({ userJourney, serviceType }: UserJourneyFlowProps) {
  const [tab, setTab] = useState<"daily" | "lifecycle">("daily");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          利用者の流れ
          {serviceType && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {serviceType}
            </span>
          )}
        </CardTitle>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("daily")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              tab === "daily"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            日次フロー
          </button>
          <button
            onClick={() => setTab("lifecycle")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              tab === "lifecycle"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            ライフサイクル
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {tab === "daily" ? (
          <FlowDiagram
            steps={userJourney.dailyFlow}
            title="来所から送迎までの一日"
          />
        ) : (
          <FlowDiagram
            steps={userJourney.lifecycleFlow}
            title="初回相談から卒業までの道のり"
          />
        )}
      </CardContent>
    </Card>
  );
}
