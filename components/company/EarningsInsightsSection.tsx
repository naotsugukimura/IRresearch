"use client";

import { useState } from "react";
import {
  FileText,
  TrendingUp,
  Globe,
  Target,
  Handshake,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CompanyEarningsInsights,
  EarningsDocument,
  EarningsFieldValue,
} from "@/lib/types";

// ============================================================
// ヘルパー: AI抽出の多様な値をstring表示用に変換
// ============================================================

function formatFieldValue(val: EarningsFieldValue): string | null {
  if (val == null) return null;
  if (typeof val === "number") return val.toLocaleString();
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    // { value, unit, description } 形式
    if ("value" in val && val.value != null) {
      const v =
        typeof val.value === "number"
          ? val.value.toLocaleString()
          : String(val.value);
      const unit = val.unit ? ` ${val.unit}` : "";
      return `${v}${unit}`;
    }
    // { key: value } 形式（facility_countなど）
    const entries = Object.entries(val).filter(
      ([k]) => !["unit", "notes", "description", "period"].includes(k)
    );
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `${k}: ${typeof v === "number" ? v.toLocaleString() : v}`)
        .join(", ");
    }
    if ("description" in val) return String(val.description);
    if ("notes" in val) return String(val.notes);
  }
  return String(val);
}

function formatOtherKpi(kpi: EarningsFieldValue): string | null {
  if (typeof kpi === "string") return kpi;
  if (kpi && typeof kpi === "object") {
    const name = kpi.name || kpi.description || "";
    const value =
      kpi.value != null
        ? typeof kpi.value === "number"
          ? kpi.value.toLocaleString()
          : kpi.value
        : "";
    const unit = kpi.unit || "";
    return name ? `${name}: ${value}${unit ? ` ${unit}` : ""}` : `${value} ${unit}`;
  }
  return null;
}

// ============================================================
// KPIカード
// ============================================================

interface KpiItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function KpiItem({ label, value, icon }: KpiItemProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium font-mono">{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// ドキュメントカード
// ============================================================

function DocumentCard({
  doc,
  isExpanded,
  onToggle,
}: {
  doc: EarningsDocument;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { business_kpis, market_sizing, ma_info, midterm_plan } = doc;

  // 主要KPIを収集
  const kpis: { label: string; value: string; icon: React.ReactNode }[] = [];

  const kpiFields = [
    { key: "facility_count", label: "施設数", icon: <Building2 className="h-3 w-3" /> },
    { key: "employee_count", label: "従業員数", icon: <Users className="h-3 w-3" /> },
    { key: "user_count", label: "ユーザー数", icon: <Users className="h-3 w-3" /> },
    { key: "arr", label: "ARR", icon: <BarChart3 className="h-3 w-3" /> },
    { key: "arpu", label: "ARPU", icon: <BarChart3 className="h-3 w-3" /> },
    { key: "churn_rate", label: "解約率", icon: <TrendingUp className="h-3 w-3" /> },
  ] as const;

  for (const { key, label, icon } of kpiFields) {
    const v = formatFieldValue(
      business_kpis[key as keyof typeof business_kpis]
    );
    if (v) kpis.push({ label, value: v, icon });
  }

  // other_kpis
  const otherKpis = (business_kpis.other_kpis || [])
    .map(formatOtherKpi)
    .filter((v): v is string => v != null);

  // M&A
  const maItems = (ma_info || []).filter((m) => m.target);

  // 中期計画の戦略
  const strategies = midterm_plan?.key_strategies || [];

  // マーケット情報
  const marketNotes = market_sizing?.market_notes;
  const growthRate = formatFieldValue(market_sizing?.market_growth_rate);

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      {/* ヘッダー（常に表示） */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-blue-400" />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">
              {doc.fiscal_period}
            </p>
          </div>
        </div>
        <div className="shrink-0 ml-2 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* サマリー（常に表示） */}
      <div className="px-4 pb-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {doc.summary}
        </p>
      </div>

      {/* 展開部分 */}
      {isExpanded && (
        <div className="border-t border-border/30 px-4 py-3 space-y-4">
          {/* KPIグリッド */}
          {kpis.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                主要KPI
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {kpis.map((kpi, i) => (
                  <KpiItem key={i} {...kpi} />
                ))}
              </div>
            </div>
          )}

          {/* その他KPI */}
          {otherKpis.length > 0 && (
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                その他指標
              </h4>
              <ul className="space-y-1">
                {otherKpis.map((kpi, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-muted-foreground pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-blue-400/60"
                  >
                    {kpi}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* マーケット */}
          {(marketNotes || growthRate) && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Globe className="h-3 w-3 text-emerald-400" />
                <h4 className="text-[10px] font-medium text-emerald-400">
                  市場環境
                </h4>
              </div>
              {growthRate && (
                <p className="text-[11px] text-emerald-300/80 font-mono mb-1">
                  成長率: {growthRate}
                </p>
              )}
              {marketNotes && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {marketNotes}
                </p>
              )}
            </div>
          )}

          {/* M&A */}
          {maItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Handshake className="h-3 w-3 text-amber-400" />
                <h4 className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                  M&A
                </h4>
              </div>
              <div className="space-y-2">
                {maItems.map((ma, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{ma.target}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          ma.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : ma.status === "announced"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ma.status === "completed"
                          ? "完了"
                          : ma.status === "announced"
                          ? "発表"
                          : "予定"}
                      </span>
                    </div>
                    {ma.date && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {ma.date}
                        {ma.amount ? ` / ${formatFieldValue(ma.amount)}` : ""}
                      </p>
                    )}
                    {ma.synergy && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {ma.synergy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 中期計画戦略 */}
          {strategies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-3 w-3 text-blue-400" />
                <h4 className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">
                  {midterm_plan?.name || "戦略方針"}
                  {midterm_plan?.period
                    ? ` (${midterm_plan.period})`
                    : ""}
                </h4>
              </div>
              <ul className="space-y-1">
                {strategies.map((s, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-muted-foreground pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-blue-400/60"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

interface EarningsInsightsSectionProps {
  data: CompanyEarningsInsights;
  companyName: string;
}

export function EarningsInsightsSection({
  data,
  companyName,
}: EarningsInsightsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <Card className="border-purple-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">決算資料インサイト</CardTitle>
          <span className="text-[10px] text-muted-foreground">
            {data.documents.length}件の資料を分析
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {companyName}の決算説明資料からAIが抽出したKPI・市場情報・M&A・戦略方針
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.documents.map((doc, i) => (
          <DocumentCard
            key={i}
            doc={doc}
            isExpanded={expandedIndex === i}
            onToggle={() =>
              setExpandedIndex(expandedIndex === i ? -1 : i)
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}
