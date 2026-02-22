"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StartupGuide } from "@/lib/types";

const STEP_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B",
  "#10B981", "#06B6D4", "#14B8A6", "#D97706", "#6366F1",
];

interface StartupFlowProps {
  startupGuide: StartupGuide;
  serviceType?: string;
}

export function StartupFlow({ startupGuide, serviceType }: StartupFlowProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">
            開業の流れ
            {serviceType && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {serviceType}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-3 text-right">
            <div>
              <p className="text-[10px] text-muted-foreground">総費用目安</p>
              <p className="text-sm font-bold text-amber-400">{startupGuide.totalCost}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">総期間目安</p>
              <p className="text-sm font-bold text-blue-400">{startupGuide.totalDuration}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4 flex gap-0.5">
          {startupGuide.steps.map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor: STEP_COLORS[idx % STEP_COLORS.length],
                opacity: expanded !== null && expanded >= idx ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

          <div className="flex flex-col gap-1">
            {startupGuide.steps.map((step, idx) => {
              const color = STEP_COLORS[idx % STEP_COLORS.length];
              const isOpen = expanded === idx;

              return (
                <div key={idx}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : idx)}
                    className="relative flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/50"
                  >
                    <div
                      className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{step.label}</span>
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {step.duration}
                        </span>
                        {step.cost && (
                          <span className="text-[10px] text-amber-400">
                            {step.cost}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
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
                  </button>
                  {isOpen && (
                    <div className="ml-11 mt-1 mb-2 space-y-2 rounded-md border border-border bg-accent/30 p-3">
                      {step.documents && step.documents.length > 0 && (
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-muted-foreground">
                            必要書類
                          </p>
                          <ul className="space-y-0.5">
                            {step.documents.map((doc, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.tips && step.tips.length > 0 && (
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-emerald-400">
                            ポイント
                          </p>
                          <ul className="space-y-0.5">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.warnings && step.warnings.length > 0 && (
                        <div>
                          <p className="mb-1 text-[10px] font-semibold text-red-400">
                            注意点
                          </p>
                          <ul className="space-y-0.5">
                            {step.warnings.map((warn, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11px] text-red-400/80">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                                {warn}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
