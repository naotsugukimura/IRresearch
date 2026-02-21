"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import type { MarketNews, NewsCategory } from "@/lib/types";
import { TREND_CATEGORY_CONFIG } from "@/lib/constants";

interface Props {
  news: MarketNews[];
}

const CATEGORY_OPTIONS: { key: NewsCategory | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "policy", label: "政策" },
  { key: "market", label: "市場" },
  { key: "regulation", label: "法規制" },
  { key: "technology", label: "テクノロジー" },
];

export function MarketNewsFeed({ news }: Props) {
  const [filter, setFilter] = useState<NewsCategory | "all">("all");
  const filtered = filter === "all" ? news : news.filter((n) => n.category === filter);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">ニュース・トピック</h3>
          <p className="text-xs text-muted-foreground">障害福祉業界の最新動向</p>
        </div>
        <Newspaper className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mb-3 flex gap-1.5">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              filter === opt.key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((item) => {
          const config = TREND_CATEGORY_CONFIG[item.category as keyof typeof TREND_CATEGORY_CONFIG];
          return (
            <div key={item.id} className="border-l-2 pl-3 py-1" style={{ borderColor: config?.color ?? "#6B7280" }}>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                  style={{
                    backgroundColor: `${config?.color ?? "#6B7280"}20`,
                    color: config?.color ?? "#6B7280",
                  }}
                >
                  {config?.label ?? item.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
              <p className="mt-1 text-xs font-medium">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
