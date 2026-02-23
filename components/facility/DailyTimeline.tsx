"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, MessageSquare, MessageCircle } from "lucide-react";
import type { DailyScheduleItem, ConversationExample } from "@/lib/types";

interface Props {
  schedule: DailyScheduleItem[];
  serviceType?: string;
  conversations?: ConversationExample[];
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

export function DailyTimeline({ schedule, serviceType, conversations }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedConv, setExpandedConv] = useState<number | null>(null);

  const subtitle = serviceType
    ? `${serviceType}の典型的なタイムスケジュール`
    : "典型的なタイムスケジュール";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">事業所の一日の流れ</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="relative space-y-0">
        {schedule.map((item, i) => {
          const color = TIME_COLORS[item.time] ?? "#6B7280";
          const isLast = i === schedule.length - 1;
          const isExpanded = expandedIdx === i;
          const hasConversation = !!item.conversation;

          return (
            <div key={item.time} className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="h-3 w-3 shrink-0 rounded-full border-2"
                  style={{ borderColor: color, backgroundColor: `${color}40` }}
                />
                {!isLast && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              {/* Content */}
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

                {/* Mood */}
                {item.mood && (
                  <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                    — {item.mood}
                  </p>
                )}

                {/* Conversation toggle */}
                {hasConversation && (
                  <div className="mt-1.5">
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : i)}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                    >
                      <MessageSquare className="h-3 w-3" />
                      現場の会話を見る
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
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
                            <p key={li} className="text-[10px] leading-relaxed text-muted-foreground">
                              {line}
                            </p>
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

      {/* === Integrated Conversation Scenes === */}
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
                <div
                  key={conv.scene}
                  className={`rounded-lg border border-border ${color.border} border-l-4 p-4`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${color.dot}`} />
                    <h4 className="text-xs font-bold">{conv.scene}</h4>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{conv.context}</p>
                  <div className="mt-2">
                    <p className="text-[10px] font-medium text-muted-foreground">主な話題:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conv.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 rounded-md bg-muted/20 p-2">
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground">Insight: </span>
                      {conv.insight}
                    </p>
                  </div>

                  {/* Dialog sample toggle */}
                  {hasDialog && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedConv(isOpen ? null : i)}
                        className="flex items-center gap-1 text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300"
                      >
                        <MessageCircle className="h-3 w-3" />
                        会話の例を見る
                        {isOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
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
                                  <span className="font-medium text-foreground">{speaker}:</span>
                                  {text}
                                </p>
                              );
                            }
                            return (
                              <p key={li} className={`text-[10px] leading-relaxed ${line.startsWith("\u3010") ? "mt-1 font-medium text-foreground" : "text-muted-foreground"}`}>
                                {line}
                              </p>
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
    </div>
  );
}
