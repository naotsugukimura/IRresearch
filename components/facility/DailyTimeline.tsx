"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, MessageSquare, MessageCircle, Calendar, CalendarDays, AlertTriangle } from "lucide-react";
import type { DailyScheduleItem, ConversationExample, MonthlyScheduleItem, AnnualScheduleItem } from "@/lib/types";

interface Props {
  schedule: DailyScheduleItem[];
  serviceType?: string;
  conversations?: ConversationExample[];
  monthlySchedule?: MonthlyScheduleItem[];
  annualSchedule?: AnnualScheduleItem[];
}

const TIME_COLORS: Record<string, string> = {
  "08:00": "#3B82F6",
  "08:30": "#3B82F6",
  "09:00": "#3B82F6",
  "09:30": "#8B5CF6",
  "10:00": "#8B5CF6",
  "13:00": "#F59E0B",
  "14:00": "#10B981",
  "14:30": "#10B981",
  "15:00": "#10B981",
  "16:00": "#06B6D4",
  "17:00": "#F59E0B",
  "18:00": "#EF4444",
  "18:30": "#6B7280",
  "19:00": "#6B7280",
};

const SCENE_COLORS = [
  { border: "border-l-blue-500", dot: "bg-blue-500" },
  { border: "border-l-emerald-500", dot: "bg-emerald-500" },
  { border: "border-l-amber-500", dot: "bg-amber-500" },
  { border: "border-l-purple-500", dot: "bg-purple-500" },
  { border: "border-l-rose-500", dot: "bg-rose-500" },
  { border: "border-l-cyan-500", dot: "bg-cyan-500" },
];

const IMPORTANCE_CONFIG = {
  critical: { label: "必須", cls: "bg-red-500/20 text-red-400" },
  high: { label: "重要", cls: "bg-amber-500/20 text-amber-400" },
  medium: { label: "定例", cls: "bg-blue-500/20 text-blue-400" },
} as const;

const PERIOD_LABELS: Record<string, string> = {
  month_end: "月末（25日~末日）",
  next_1_5: "翌月1日~5日",
  next_1_10: "翌月1日~10日",
  next_11: "翌月11日~",
  next_mid: "翌月中旬~月末",
  next_next_15: "翌々月15日頃",
};

const CATEGORY_CONFIG = {
  compliance: { label: "法定", cls: "bg-red-500/20 text-red-400" },
  training: { label: "研修", cls: "bg-amber-500/20 text-amber-400" },
  planning: { label: "計画", cls: "bg-blue-500/20 text-blue-400" },
  operations: { label: "運営", cls: "bg-emerald-500/20 text-emerald-400" },
  seasonal: { label: "季節", cls: "bg-purple-500/20 text-purple-400" },
} as const;

const MONTH_NAMES = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

type ViewTab = "daily" | "monthly" | "annual";

export function DailyTimeline({ schedule, serviceType, conversations, monthlySchedule, annualSchedule }: Props) {
  const [activeView, setActiveView] = useState<ViewTab>("daily");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedConv, setExpandedConv] = useState<number | null>(null);

  const hasMonthly = monthlySchedule && monthlySchedule.length > 0;
  const hasAnnual = annualSchedule && annualSchedule.length > 0;

  const subtitle = serviceType
    ? `${serviceType}の典型的なスケジュール`
    : "典型的なスケジュール";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-bold">事業所の業務フロー</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {(hasMonthly || hasAnnual) && (
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setActiveView("daily")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                activeView === "daily" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <Clock className="h-3 w-3" />
              一日
            </button>
            {hasMonthly && (
              <button
                onClick={() => setActiveView("monthly")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  activeView === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <Calendar className="h-3 w-3" />
                月次
              </button>
            )}
            {hasAnnual && (
              <button
                onClick={() => setActiveView("annual")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  activeView === "annual" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                年間
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== Daily View ===== */}
      {activeView === "daily" && (
        <>
          <div className="relative space-y-0">
            {schedule.map((item, i) => {
              const color = TIME_COLORS[item.time] ?? "#6B7280";
              const isLast = i === schedule.length - 1;
              const isExpanded = expandedIdx === i;
              const hasConversation = !!item.conversation;

              return (
                <div key={item.time} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full border-2"
                      style={{ borderColor: color, backgroundColor: `${color}40` }}
                    />
                    {!isLast && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color }}>
                        {item.time}
                      </span>
                      <span className="text-xs font-medium">{item.activity}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        {item.who}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                    {item.mood && (
                      <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                        — {item.mood}
                      </p>
                    )}
                    {hasConversation && (
                      <div className="mt-1.5">
                        <button
                          onClick={() => setExpandedIdx(isExpanded ? null : i)}
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                        >
                          <MessageSquare className="h-3 w-3" />
                          現場の会話を見る
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-1.5 rounded-md border border-border/50 bg-muted/10 p-3">
                            {item.conversation!.split("\n").map((line, li) => {
                              const colonIdx = line.indexOf(":");
                              if (colonIdx > 0 && colonIdx < 20) {
                                const speaker = line.slice(0, colonIdx);
                                const text = line.slice(colonIdx + 1);
                                return (
                                  <p key={li} className="text-[10px] leading-relaxed text-muted-foreground">
                                    <span className="font-medium text-foreground">{speaker}:</span>
                                    {text}
                                  </p>
                                );
                              }
                              return (
                                <p key={li} className="text-[10px] leading-relaxed text-muted-foreground">{line}</p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversation Scenes */}
          {conversations && conversations.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h4 className="text-sm font-bold">現場の声・会話シーン</h4>
                  <p className="text-xs text-muted-foreground">事業所で日常的に交わされる会話のテーマ</p>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {conversations.map((conv, i) => {
                  const color = SCENE_COLORS[i % SCENE_COLORS.length];
                  const isOpen = expandedConv === i;
                  const hasDialog = conv.dialogSample && conv.dialogSample.length > 0;
                  return (
                    <div key={conv.scene} className={`rounded-lg border border-border ${color.border} border-l-4 p-4`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${color.dot}`} />
                        <h4 className="text-xs font-bold">{conv.scene}</h4>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{conv.context}</p>
                      <div className="mt-2">
                        <p className="text-[10px] font-medium text-muted-foreground">主な話題:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {conv.topics.map((topic) => (
                            <span key={topic} className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px]">{topic}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 rounded-md bg-muted/20 p-2">
                        <p className="text-[10px] text-muted-foreground">
                          <span className="font-medium text-foreground">Insight: </span>
                          {conv.insight}
                        </p>
                      </div>
                      {hasDialog && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedConv(isOpen ? null : i)}
                            className="flex items-center gap-1 text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300"
                          >
                            <MessageCircle className="h-3 w-3" />
                            会話の例を見る
                            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                          {isOpen && (
                            <div className="mt-1.5 rounded-md border border-border/50 bg-muted/10 p-3 space-y-0.5">
                              {conv.dialogSample!.map((line, li) => {
                                const colonIdx = line.indexOf(":");
                                if (colonIdx > 0 && colonIdx < 20 && !line.startsWith("\u3010")) {
                                  const speaker = line.slice(0, colonIdx);
                                  const text = line.slice(colonIdx + 1);
                                  return (
                                    <p key={li} className="text-[10px] leading-relaxed text-muted-foreground">
                                      <span className="font-medium text-foreground">{speaker}:</span>{text}
                                    </p>
                                  );
                                }
                                return (
                                  <p key={li} className={`text-[10px] leading-relaxed ${line.startsWith("\u3010") ? "mt-1 font-medium text-foreground" : "text-muted-foreground"}`}>{line}</p>
                                );
                              })}
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
        </>
      )}

      {/* ===== Monthly View ===== */}
      {activeView === "monthly" && monthlySchedule && (
        <div>
          <p className="mb-3 text-[11px] text-muted-foreground">
            サービス提供月を起点とした請求・入金サイクル。国保連への請求は翌月10日が期限（厳守）、入金は翌々月15日頃。
          </p>
          <div className="relative space-y-0">
            {monthlySchedule.map((item, i) => {
              const imp = IMPORTANCE_CONFIG[item.importance];
              const isLast = i === monthlySchedule.length - 1;
              const periodLabel = PERIOD_LABELS[item.period] ?? item.period;
              const dotColor = item.importance === "critical" ? "#EF4444" : item.importance === "high" ? "#F59E0B" : "#3B82F6";

              return (
                <div key={`${item.period}-${item.activity}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full border-2"
                      style={{ borderColor: dotColor, backgroundColor: `${dotColor}40` }}
                    />
                    {!isLast && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold" style={{ color: dotColor }}>
                        {periodLabel}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${imp.cls}`}>
                        {imp.label}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs font-medium">{item.activity}</span>
                      <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        {item.who}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                    {item.deadline && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        期限: {item.deadline}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Annual View ===== */}
      {activeView === "annual" && annualSchedule && (
        <div>
          <p className="mb-3 text-[11px] text-muted-foreground">
            4月始まりの年間サイクル。法定研修・届出の期限を逃すと減算や加算返還のリスクがあるため計画的な実施が必要。
          </p>
          <div className="space-y-3">
            {/* Sort: 4月始まり */}
            {[...annualSchedule]
              .sort((a, b) => {
                const orderA = a.month >= 4 ? a.month - 4 : a.month + 8;
                const orderB = b.month >= 4 ? b.month - 4 : b.month + 8;
                return orderA - orderB;
              })
              .map((monthData) => (
                <div key={monthData.month} className="rounded-lg border border-border/50 bg-muted/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-10 flex-shrink-0 items-center justify-center rounded-md bg-accent font-mono text-[11px] font-bold text-accent-foreground">
                      {MONTH_NAMES[monthData.month]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {monthData.events.length}件のイベント
                    </span>
                  </div>
                  <div className="space-y-2">
                    {monthData.events.map((evt) => {
                      const cat = CATEGORY_CONFIG[evt.category];
                      return (
                        <div key={evt.title} className="flex items-start gap-2">
                          <span className={`mt-0.5 flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${cat.cls}`}>
                            {cat.label}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-medium">{evt.title}</span>
                            <p className="text-[10px] leading-relaxed text-muted-foreground">{evt.detail}</p>
                            {evt.deadline && (
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-amber-400">
                                期限: {evt.deadline}
                              </p>
                            )}
                            {evt.penalty && (
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-red-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {evt.penalty}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
