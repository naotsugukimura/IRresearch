"use client";

import { useState } from "react";
import { History, ChevronDown, ChevronUp, Scale, Landmark, Globe, Settings } from "lucide-react";
import type { WelfareHistoryEvent } from "@/lib/types";

interface Props {
  data: WelfareHistoryEvent[];
}

const CATEGORY_CONFIG = {
  law: { label: "法制定", color: "#3B82F6", Icon: Scale },
  system: { label: "制度改革", color: "#8B5CF6", Icon: Settings },
  milestone: { label: "転換点", color: "#F59E0B", Icon: Landmark },
  international: { label: "国際", color: "#10B981", Icon: Globe },
} as const;

export function WelfareHistoryTimeline({ data }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? data : data.filter((e) => e.category === filter);
  const displayData = expanded ? filtered : filtered.slice(0, 8);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">障害福祉の歴史</h3>
          <p className="text-xs text-muted-foreground">
            1946年〜現在 — 措置から契約へ、施設から地域へ
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
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
              filter === key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="relative ml-3 border-l-2 border-border/50 pl-5">
        {displayData.map((event, i) => {
          const cfg = CATEGORY_CONFIG[event.category];
          const Icon = cfg.Icon;
          return (
            <div key={`${event.year}-${i}`} className="group relative pb-5 last:pb-0">
              {/* Timeline dot */}
              <div
                className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background"
                style={{ backgroundColor: `${cfg.color}30` }}
              >
                <Icon className="h-2.5 w-2.5" style={{ color: cfg.color }} />
              </div>

              {/* Content */}
              <div className="rounded-lg border border-transparent p-2 transition-colors group-hover:border-border/50 group-hover:bg-muted/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>
                    {event.year}
                  </span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                    style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-medium">{event.title}</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
                {event.impact && (
                  <p className="mt-1 text-[10px] italic text-blue-400/80">
                    → {event.impact}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-md py-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted/20"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              閉じる
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              すべて表示（{filtered.length}件）
            </>
          )}
        </button>
      )}
    </div>
  );
}
