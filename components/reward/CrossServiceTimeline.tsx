"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { ServiceRevisionEntry, RewardRevision } from "@/lib/types";

interface Props {
  services: ServiceRevisionEntry[];
}

const CATEGORY_CONFIG = {
  child: { label: "障害児通所", color: "#3B82F6" },
  residential: { label: "居住支援", color: "#8B5CF6" },
  employment: { label: "訓練・就労", color: "#10B981" },
  consultation: { label: "相談支援", color: "#F59E0B" },
  visit: { label: "訪問系", color: "#EC4899" },
} as const;

const TYPE_CONFIG = {
  creation: { label: "新設", color: "#3B82F6", Icon: Plus },
  revision: { label: "改定", color: "#F59E0B", Icon: Calendar },
} as const;

interface YearGroup {
  year: number;
  entries: { service: ServiceRevisionEntry; revision: RewardRevision }[];
}

export function CrossServiceTimeline({ services }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Filter services by category
  const filtered = filter === "all" ? services : services.filter((s) => s.category === filter);

  // Group all revisions by year
  const yearMap = new Map<number, YearGroup["entries"]>();
  for (const service of filtered) {
    for (const rev of service.revisions) {
      if (!yearMap.has(rev.year)) {
        yearMap.set(rev.year, []);
      }
      yearMap.get(rev.year)!.push({ service, revision: rev });
    }
  }

  const yearGroups: YearGroup[] = Array.from(yearMap.entries())
    .map(([year, entries]) => ({ year, entries }))
    .sort((a, b) => b.year - a.year);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">全サービス横断 報酬改定タイムライン</h3>
          <p className="text-xs text-muted-foreground">
            障害福祉サービス報酬改定の歴史 — 各年にどのサービスが影響を受けたか
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
            filter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
          }`}
        >
          すべて
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              filter === key ? "text-white" : "text-muted-foreground hover:bg-accent/50"
            }`}
            style={filter === key ? { backgroundColor: cfg.color } : undefined}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative ml-3 border-l-2 border-border/50 pl-5">
        {yearGroups.map((group) => {
          const isExpanded = expandedYear === group.year;
          const creations = group.entries.filter((e) => e.revision.type === "creation");
          const revisions = group.entries.filter((e) => e.revision.type === "revision");

          return (
            <div key={group.year} className="group relative pb-4 last:pb-0">
              {/* Timeline dot */}
              <div className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-amber-500/30">
                <Calendar className="h-2.5 w-2.5 text-amber-400" />
              </div>

              {/* Year header */}
              <button
                onClick={() => setExpandedYear(isExpanded ? null : group.year)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/10"
              >
                <span className="flex h-7 w-16 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/20 font-mono text-xs font-bold text-amber-400">
                  {group.year}年
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    {creations.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
                        <Plus className="h-2.5 w-2.5" />
                        新設 {creations.length}
                      </span>
                    )}
                    {revisions.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
                        改定 {revisions.length}サービス
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {group.entries.slice(0, isExpanded ? undefined : 6).map((entry, i) => {
                      const catCfg = CATEGORY_CONFIG[entry.service.category as keyof typeof CATEGORY_CONFIG];
                      return (
                        <span
                          key={i}
                          className="rounded px-1.5 py-0.5 text-[9px]"
                          style={{ backgroundColor: `${catCfg?.color ?? "#6B7280"}15`, color: catCfg?.color ?? "#6B7280" }}
                        >
                          {entry.service.serviceType.replace(/（.*）/, "")}
                        </span>
                      );
                    })}
                    {!isExpanded && group.entries.length > 6 && (
                      <span className="text-[9px] text-muted-foreground">+{group.entries.length - 6}</span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="ml-2 mt-2 space-y-2">
                  {group.entries.map((entry, i) => {
                    const catCfg = CATEGORY_CONFIG[entry.service.category as keyof typeof CATEGORY_CONFIG];
                    const typeCfg = TYPE_CONFIG[entry.revision.type];
                    return (
                      <div key={i} className="rounded-lg border border-border/30 bg-muted/5 p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                            style={{ backgroundColor: `${typeCfg.color}20`, color: typeCfg.color }}
                          >
                            {typeCfg.label}
                          </span>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px]"
                            style={{ backgroundColor: `${catCfg?.color ?? "#6B7280"}15`, color: catCfg?.color ?? "#6B7280" }}
                          >
                            {catCfg?.label ?? "その他"}
                          </span>
                          <span className="text-xs font-medium">{entry.service.serviceType}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] font-medium">{entry.revision.title}</p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                          {entry.revision.description}
                        </p>
                        {entry.revision.baseReward && (
                          <p className="mt-1 text-[10px] font-mono text-emerald-400">
                            基本報酬: {entry.revision.baseReward}
                          </p>
                        )}
                        {entry.revision.impact && (
                          <div className="mt-1.5 rounded-md bg-blue-500/10 p-2">
                            <p className="text-[10px] leading-relaxed text-blue-300/80">
                              {entry.revision.impact}
                            </p>
                          </div>
                        )}
                        {entry.revision.keyChanges && entry.revision.keyChanges.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {entry.revision.keyChanges.map((change, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
