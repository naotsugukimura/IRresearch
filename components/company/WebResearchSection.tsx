"use client";

import { useState } from "react";
import {
  Globe,
  Building2,
  Banknote,
  Newspaper,
  Swords,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { WebResearchData, WebResearchEntry } from "@/lib/types";

interface Props {
  data: WebResearchData;
}

const TAB_CONFIG: Record<
  string,
  { label: string; icon: typeof Globe; color: string }
> = {
  business_overview: {
    label: "事業概要",
    icon: Building2,
    color: "text-blue-400",
  },
  funding: { label: "資金調達", icon: Banknote, color: "text-emerald-400" },
  news: { label: "ニュース", icon: Newspaper, color: "text-amber-400" },
  competitive: { label: "競合分析", icon: Swords, color: "text-purple-400" },
};

function ConfidenceBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; cls: string; Icon: typeof Shield }> = {
    high: { label: "信頼度: 高", cls: "bg-emerald-500/20 text-emerald-400", Icon: ShieldCheck },
    medium: { label: "信頼度: 中", cls: "bg-amber-500/20 text-amber-400", Icon: Shield },
    low: { label: "信頼度: 低", cls: "bg-red-500/20 text-red-400", Icon: ShieldAlert },
  };
  const c = config[level] ?? config.low;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.cls}`}>
      <c.Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function BusinessOverview({ data }: { data: Record<string, unknown> }) {
  const overview = (data.business_overview ?? {}) as Record<string, unknown>;
  const items: { label: string; value: string | null }[] = [
    { label: "設立", value: overview.founded ? String(overview.founded) : null },
    { label: "本社", value: overview.headquarters ? String(overview.headquarters) : null },
    { label: "従業員数", value: overview.employees ? String(overview.employees) : null },
    { label: "事業概要", value: overview.description ? String(overview.description) : null },
  ];
  const services = (overview.main_services ?? []) as string[];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {items
          .filter((item) => item.value != null)
          .map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-card/50 p-3">
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-sm">{item.value}</p>
            </div>
          ))}
      </div>
      {services.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">主力サービス</p>
          <div className="flex flex-wrap gap-1.5">
            {services.map((s) => (
              <span key={s} className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] text-blue-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FundingInfo({ data }: { data: Record<string, unknown> }) {
  const funding = (data.funding ?? {}) as Record<string, unknown>;
  const totalRaised = funding.total_raised ? String(funding.total_raised) : null;
  const latestRound = funding.latest_round ? String(funding.latest_round) : null;
  const valuationEstimate = funding.valuation_estimate ? String(funding.valuation_estimate) : null;
  const investors = (funding.investors ?? []) as string[];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {totalRaised && (
          <div className="rounded-md border border-border bg-card/50 p-3">
            <p className="text-[10px] text-muted-foreground">累計調達額</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-emerald-400">
              {totalRaised}
            </p>
          </div>
        )}
        {latestRound && (
          <div className="rounded-md border border-border bg-card/50 p-3">
            <p className="text-[10px] text-muted-foreground">直近ラウンド</p>
            <p className="mt-0.5 text-sm font-bold">{latestRound}</p>
          </div>
        )}
        {valuationEstimate && (
          <div className="rounded-md border border-border bg-card/50 p-3">
            <p className="text-[10px] text-muted-foreground">推定評価額</p>
            <p className="mt-0.5 text-sm font-bold">{valuationEstimate}</p>
          </div>
        )}
      </div>
      {investors.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">投資家</p>
          <div className="flex flex-wrap gap-1.5">
            {investors.map((inv) => (
              <span key={inv} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400">
                {inv}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewsList({ data }: { data: Record<string, unknown> }) {
  const news = (data.recent_news ?? []) as Array<Record<string, unknown>>;
  if (news.length === 0) {
    return <p className="text-sm text-muted-foreground">ニュース情報なし</p>;
  }

  return (
    <div className="space-y-2">
      {news.map((item, i) => {
        const title = String(item.title ?? "");
        const summary = item.summary ? String(item.summary) : null;
        const date = item.date ? String(item.date) : null;
        const sourceUrl = item.source_url ? String(item.source_url) : null;
        return (
          <div key={i} className="rounded-md border border-border bg-card/50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{title}</p>
                {summary && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{summary}</p>
                )}
              </div>
              {date && (
                <span className="shrink-0 text-[10px] text-muted-foreground">{date}</span>
              )}
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                元記事
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CompetitiveAnalysis({ data }: { data: Record<string, unknown> }) {
  const comp = (data.competitive_position ?? {}) as Record<string, unknown>;
  const strengths = (comp.strengths ?? []) as string[];
  const marketPosition = comp.market_position ? String(comp.market_position) : null;
  const threatToSms = comp.threat_to_sms ? String(comp.threat_to_sms) : null;

  return (
    <div className="space-y-3">
      {marketPosition && (
        <div className="rounded-md border border-border bg-card/50 p-3">
          <p className="text-[10px] text-muted-foreground">市場ポジション</p>
          <p className="mt-0.5 text-sm">{marketPosition}</p>
        </div>
      )}
      {strengths.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">強み</p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {threatToSms && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
          <p className="text-[10px] text-red-400">SMSへの脅威評価</p>
          <p className="mt-0.5 text-sm">{threatToSms}</p>
        </div>
      )}
    </div>
  );
}

const RENDERERS: Record<string, React.FC<{ data: Record<string, unknown> }>> = {
  business_overview: BusinessOverview,
  funding: FundingInfo,
  news: NewsList,
  competitive: CompetitiveAnalysis,
};

export function WebResearchSection({ data }: Props) {
  const availableTypes = data.research.map((r) => r.type);
  const [activeTab, setActiveTab] = useState(availableTypes[0] ?? "business_overview");

  const activeEntry: WebResearchEntry | undefined = data.research.find(
    (r) => r.type === activeTab
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Globe className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-bold">Webリサーチ</h3>
        <span className="text-[10px] text-muted-foreground">Tavily Search API + Claude分析</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-1.5">
        {availableTypes.map((type) => {
          const cfg = TAB_CONFIG[type];
          if (!cfg) return null;
          const isActive = type === activeTab;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <cfg.icon className={`h-3.5 w-3.5 ${isActive ? cfg.color : ""}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeEntry ? (
          <div className="space-y-3">
            {/* Meta row */}
            <div className="flex items-center gap-3">
              <ConfidenceBadge level={String(activeEntry.data.confidence ?? "low")} />
              {activeEntry.data.data_freshness != null && (
                <span className="text-[10px] text-muted-foreground">
                  データ鮮度: {String(activeEntry.data.data_freshness)}
                </span>
              )}
              {activeEntry.searchedAt && (
                <span className="text-[10px] text-muted-foreground">
                  検索日: {activeEntry.searchedAt.split("T")[0]}
                </span>
              )}
            </div>

            {/* Dynamic content */}
            {(() => {
              const Renderer = RENDERERS[activeTab];
              return Renderer ? <Renderer data={activeEntry.data} /> : null;
            })()}

            {/* Source URLs */}
            {activeEntry.sourceUrls.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">
                  ソースURL（{activeEntry.sourceUrls.length}件）
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {activeEntry.sourceUrls.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {url.length > 60 ? url.slice(0, 60) + "..." : url}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            このカテゴリのリサーチデータはまだありません。
          </p>
        )}
      </div>
    </div>
  );
}
