"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { ServiceRevisionEntry } from "@/lib/types";

interface Props {
  services: ServiceRevisionEntry[];
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  child: { label: "障害児通所", color: "#3B82F6" },
  residential: { label: "居住支援", color: "#8B5CF6" },
  employment: { label: "訓練・就労", color: "#10B981" },
  consultation: { label: "相談支援", color: "#F59E0B" },
  visit: { label: "訪問系", color: "#EC4899" },
};

const CATEGORY_ORDER = ["child", "residential", "employment", "consultation", "visit"];

export function ServiceRevisionDetail({ services }: Props) {
  const [activeSlug, setActiveSlug] = useState(services[0]?.serviceSlug ?? "");
  const [expandedRevision, setExpandedRevision] = useState<number | null>(null);

  const activeService = services.find((s) => s.serviceSlug === activeSlug);

  // Group services by category for tab display
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    config: CATEGORY_CONFIG[cat],
    services: services.filter((s) => s.category === cat),
  })).filter((g) => g.services.length > 0);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">サービス別 報酬改定詳細</h3>
          <p className="text-xs text-muted-foreground">
            各サービスの報酬改定履歴 — 基本報酬の推移・主な変更点・市場への影響
          </p>
        </div>
      </div>

      {/* Service tabs grouped by category */}
      <div className="mb-4 space-y-2">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="mb-1 text-[9px] font-medium uppercase tracking-wider" style={{ color: group.config.color }}>
              {group.config.label}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.services.map((svc) => (
                <button
                  key={svc.serviceSlug}
                  onClick={() => {
                    setActiveSlug(svc.serviceSlug);
                    setExpandedRevision(null);
                  }}
                  className={`rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                    activeSlug === svc.serviceSlug
                      ? "text-white"
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                  style={
                    activeSlug === svc.serviceSlug
                      ? { backgroundColor: group.config.color }
                      : undefined
                  }
                >
                  {svc.serviceType.replace(/（.*）/, "")}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected service detail */}
      {activeService && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-xs font-bold">{activeService.serviceType}</h4>
            <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {activeService.revisions.length}回の改定
            </span>
          </div>

          {/* Revision timeline */}
          <div className="relative ml-3 border-l-2 border-border/50 pl-5">
            {activeService.revisions
              .sort((a, b) => b.year - a.year)
              .map((rev, i) => {
                const isExpanded = expandedRevision === rev.year;
                const isCreation = rev.type === "creation";

                return (
                  <div key={rev.year} className="relative pb-4 last:pb-0">
                    {/* Dot */}
                    <div
                      className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background ${
                        isCreation ? "bg-blue-500/30" : "bg-amber-500/30"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isCreation ? "bg-blue-400" : "bg-amber-400"}`} />
                    </div>

                    {/* Content */}
                    <button
                      onClick={() => setExpandedRevision(isExpanded ? null : rev.year)}
                      className="w-full rounded-lg p-3 text-left transition-colors hover:bg-muted/10"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-14 flex-shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                            isCreation
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {rev.year}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                                isCreation
                                  ? "bg-blue-500/15 text-blue-400"
                                  : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {isCreation ? "制度創設" : "報酬改定"}
                            </span>
                            <span className="text-xs font-medium">{rev.title}</span>
                          </div>
                          {rev.baseReward && (
                            <p className="mt-0.5 font-mono text-[10px] text-emerald-400">
                              {rev.baseReward}
                            </p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="ml-16 mt-1 space-y-2">
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          {rev.description}
                        </p>

                        {rev.impact && (
                          <div className="rounded-md bg-blue-500/10 p-2">
                            <p className="text-[10px] font-medium text-blue-400">市場への影響</p>
                            <p className="mt-0.5 text-[10px] leading-relaxed text-blue-300/80">
                              {rev.impact}
                            </p>
                          </div>
                        )}

                        {rev.keyChanges && rev.keyChanges.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium text-foreground">主な変更点</p>
                            <ul className="mt-1 space-y-0.5">
                              {rev.keyChanges.map((change, j) => (
                                <li key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                                  {change}
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
      )}
    </div>
  );
}
