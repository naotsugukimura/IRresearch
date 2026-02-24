"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, Receipt, ClipboardCheck, Bus, Users, Shield, AlertOctagon } from "lucide-react";
import type { DetailedProcessMap, BlueprintPhase, BlueprintTask } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Receipt, ClipboardCheck, Bus, Users, Shield, AlertTriangle: AlertOctagon,
};

const RISK_CONFIG = {
  high: { bg: "bg-red-500/10", text: "text-red-400", label: "高リスク" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", label: "中リスク" },
  low: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "低リスク" },
};

const ACTOR_STYLES: Record<string, { bg: string; text: string }> = {
  "管理者": { bg: "bg-blue-500/15", text: "text-blue-400" },
  "児発管": { bg: "bg-purple-500/15", text: "text-purple-400" },
  "児童発達支援管理責任者": { bg: "bg-purple-500/15", text: "text-purple-400" },
  "児童指導員": { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  "保育士": { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  "送迎ドライバー": { bg: "bg-amber-500/15", text: "text-amber-400" },
  "事務担当": { bg: "bg-rose-500/15", text: "text-rose-400" },
  "保護者": { bg: "bg-pink-500/15", text: "text-pink-400" },
  "全スタッフ": { bg: "bg-indigo-500/15", text: "text-indigo-400" },
  "先輩スタッフ": { bg: "bg-teal-500/15", text: "text-teal-400" },
  "自治体職員": { bg: "bg-orange-500/15", text: "text-orange-400" },
};

function getActorStyle(actor: string) {
  for (const [key, style] of Object.entries(ACTOR_STYLES)) {
    if (actor.includes(key)) return style;
  }
  return { bg: "bg-muted", text: "text-muted-foreground" };
}

const PHASE_COLORS = [
  { border: "border-blue-500/40", accent: "text-blue-400", bg: "bg-blue-500/5" },
  { border: "border-emerald-500/40", accent: "text-emerald-400", bg: "bg-emerald-500/5" },
  { border: "border-amber-500/40", accent: "text-amber-400", bg: "bg-amber-500/5" },
  { border: "border-purple-500/40", accent: "text-purple-400", bg: "bg-purple-500/5" },
  { border: "border-rose-500/40", accent: "text-rose-400", bg: "bg-rose-500/5" },
];

function TaskCard({ task }: { task: BlueprintTask }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/20">
      <p className="text-xs font-bold leading-snug">{task.name}</p>
      {task.description && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {task.actors.map((actor) => {
          const style = getActorStyle(actor);
          return (
            <span key={actor} className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${style.bg} ${style.text}`}>
              {actor}
            </span>
          );
        })}
      </div>
      {task.challenge && (
        <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
            <p className="text-[10px] leading-relaxed text-amber-300">{task.challenge}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseColumn({ phase, index }: { phase: BlueprintPhase; index: number }) {
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  const challengeCount = phase.tasks.filter((t) => t.challenge).length;

  return (
    <div className={`flex min-w-[280px] flex-col rounded-lg border ${color.border} ${color.bg}`}>
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] font-bold ${color.accent}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-sm font-bold">{phase.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{phase.tasks.length}件</span>
          {challengeCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5" />
              {challengeCount}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {phase.tasks.map((task, ti) => (
          <div key={ti}>
            <TaskCard task={task} />
            {ti < phase.tasks.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronRight className="h-3 w-3 rotate-90 text-muted-foreground/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  processMaps: DetailedProcessMap[];
  serviceType?: string;
}

export function DetailedProcessMapSection({ processMaps, serviceType }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const activeMap = processMaps[activeTab];
  if (!activeMap) return null;

  const risk = RISK_CONFIG[activeMap.riskLevel];
  const IconComponent = ICON_MAP[activeMap.icon] ?? Receipt;
  const totalTasks = activeMap.phases.reduce((s, p) => s + p.tasks.length, 0);
  const totalChallenges = activeMap.phases.reduce((s, p) => s + p.tasks.filter((t) => t.challenge).length, 0);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Section header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">詳細業務プロセスマップ</h2>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {serviceType}の主要な業務プロセスを6つのカテゴリで詳細に解説。各フェーズのタスク・担当者・課題・ペナルティを可視化
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
        {processMaps.map((pm, i) => {
          const TabIcon = ICON_MAP[pm.icon] ?? Receipt;
          const isActive = i === activeTab;
          const riskStyle = RISK_CONFIG[pm.riskLevel];
          return (
            <button
              key={pm.id}
              onClick={() => setActiveTab(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{pm.name}</span>
              <span className="sm:hidden">{pm.name.slice(0, 4)}</span>
              <span className={`ml-0.5 inline-block h-1.5 w-1.5 rounded-full ${riskStyle.bg.replace('/10', '/60')}`} />
            </button>
          );
        })}
      </div>

      {/* Active map content */}
      <div className="p-4">
        {/* Map header */}
        <div className="mb-4 rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/30 p-2">
              <IconComponent className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{activeMap.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${risk.bg} ${risk.text}`}>
                  {risk.label}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {activeMap.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                <span>頻度: <strong className="text-foreground">{activeMap.frequency}</strong></span>
                <span>主担当: <strong className="text-foreground">{activeMap.keyPerson}</strong></span>
                <span>{activeMap.phases.length}フェーズ / {totalTasks}タスク / {totalChallenges}課題</span>
              </div>
              {activeMap.penaltyIfFailed && (
                <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-1.5">
                  <p className="text-[10px] leading-relaxed text-red-400">
                    <strong>ペナルティ:</strong> {activeMap.penaltyIfFailed}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="overflow-x-auto">
          <div className="flex gap-3 md:gap-4" style={{ minWidth: `${activeMap.phases.length * 300}px` }}>
            {activeMap.phases.map((phase, i) => (
              <div key={phase.id} className="flex items-start gap-1">
                <PhaseColumn phase={phase} index={i} />
                {i < activeMap.phases.length - 1 && (
                  <div className="hidden items-center self-center md:flex">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
