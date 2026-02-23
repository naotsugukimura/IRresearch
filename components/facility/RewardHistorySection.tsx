"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RewardRevision } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  revisions: RewardRevision[];
  serviceType: string;
}

export function RewardHistorySection({ revisions, serviceType }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!revisions || revisions.length === 0) return null;

  const sorted = [...revisions].sort((a, b) => a.year - b.year);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "#F59E0B" }}
          />
          報酬改定の歴史と市場への影響
          <span className="text-muted-foreground font-normal text-xs ml-auto">
            {serviceType}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {sorted.map((rev, idx) => {
              const isExpanded = expandedIdx === idx;
              const isCreation = rev.type === "creation";

              return (
                <div key={idx} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-4 top-3 w-4 h-4 rounded-full border-2 z-10",
                      isCreation
                        ? "bg-amber-500 border-amber-400"
                        : "bg-background border-amber-500/60"
                    )}
                  />

                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
                      isExpanded
                        ? "bg-accent/50"
                        : "hover:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          isCreation
                            ? "border-amber-500/50 text-amber-400"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {rev.year}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">
                        {rev.title}
                      </span>
                      {isCreation && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] px-1 py-0">
                          制度創設
                        </Badge>
                      )}
                      <span className="ml-auto text-muted-foreground text-[10px]">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {rev.description}
                    </p>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-1 duration-200">
                      {/* Base Reward */}
                      <div className="rounded-md bg-accent/30 px-3 py-2">
                        <div className="text-[10px] font-bold text-muted-foreground mb-1">
                          基本報酬
                        </div>
                        <div className="text-xs font-mono text-foreground">
                          {rev.baseReward}
                        </div>
                      </div>

                      {/* Key Changes */}
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground mb-1.5">
                          主な変更点
                        </div>
                        <ul className="space-y-1">
                          {rev.keyChanges.map((change, ci) => (
                            <li
                              key={ci}
                              className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                            >
                              <span className="text-amber-500 mt-0.5 shrink-0">
                                &#9656;
                              </span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Market Impact */}
                      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        <div className="text-[10px] font-bold text-amber-400 mb-1">
                          市場への影響
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {rev.impact}
                        </p>
                      </div>
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
