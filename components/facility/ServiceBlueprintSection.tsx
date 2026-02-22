"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, Target } from "lucide-react";
import type { ServiceBlueprint, BlueprintPhase, BlueprintTask } from "@/lib/types";

// Actor badge colors
const ACTOR_STYLES: Record<string, { bg: string; text: string }> = {
  "利用者": { bg: "bg-blue-500/15", text: "text-blue-400" },
  "家族": { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  "計画相談": { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  "自治体": { bg: "bg-purple-500/15", text: "text-purple-400" },
  "サービス提供事業所": { bg: "bg-amber-500/15", text: "text-amber-400" },
  "医療機関": { bg: "bg-rose-500/15", text: "text-rose-400" },
};

function getActorStyle(actor: string) {
  return ACTOR_STYLES[actor] ?? { bg: "bg-muted", text: "text-muted-foreground" };
}

// Phase colors
const PHASE_COLORS = [
  { border: "border-blue-500/40", accent: "text-blue-400", bg: "bg-blue-500/5" },
  { border: "border-emerald-500/40", accent: "text-emerald-400", bg: "bg-emerald-500/5" },
  { border: "border-amber-500/40", accent: "text-amber-400", bg: "bg-amber-500/5" },
  { border: "border-purple-500/40", accent: "text-purple-400", bg: "bg-purple-500/5" },
  { border: "border-rose-500/40", accent: "text-rose-400", bg: "bg-rose-500/5" },
];

function TaskCard({ task, phaseIdx }: { task: BlueprintTask; phaseIdx: number }) {
  const hasChallenge = !!task.challenge;

  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/20">
      <p className="text-xs font-bold leading-snug">{task.name}</p>

      {task.description && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* Actor badges */}
      <div className="mt-2 flex flex-wrap gap-1">
        {task.actors.map((actor) => {
          const style = getActorStyle(actor);
          return (
            <span
              key={actor}
              className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${style.bg} ${style.text}`}
            >
              {actor}
            </span>
          );
        })}
      </div>

      {/* Challenge alert */}
      {hasChallenge && (
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
  const taskCount = phase.tasks.length;
  const challengeCount = phase.tasks.filter((t) => t.challenge).length;

  return (
    <div className={`flex min-w-[280px] flex-col rounded-lg border ${color.border} ${color.bg}`}>
      {/* Phase header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] font-bold ${color.accent}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-sm font-bold">{phase.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{taskCount}件</span>
          {challengeCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5" />
              {challengeCount}
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-2 p-3">
        {phase.tasks.map((task, ti) => (
          <div key={ti}>
            <TaskCard task={task} phaseIdx={index} />
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
  blueprint: ServiceBlueprint;
  serviceType?: string;
}

export function ServiceBlueprintSection({ blueprint, serviceType }: Props) {
  const totalTasks = blueprint.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalChallenges = blueprint.phases.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.challenge).length,
    0
  );

  // Collect all unique actors
  const allActors = new Set<string>();
  for (const phase of blueprint.phases) {
    for (const task of phase.tasks) {
      for (const actor of task.actors) {
        allActors.add(actor);
      }
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-bold">
            業務プロセスマップ
          </h2>
          <span className="text-[10px] text-muted-foreground">
            {serviceType ?? ""}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Goal: <span className="font-medium text-foreground">{blueprint.goal}</span>
          </p>
          <span className="text-[10px] text-muted-foreground">
            {blueprint.phases.length}フェーズ / {totalTasks}タスク / {totalChallenges}課題
          </span>
        </div>
        {/* Actor legend */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(allActors).map((actor) => {
            const style = getActorStyle(actor);
            return (
              <span
                key={actor}
                className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${style.bg} ${style.text}`}
              >
                {actor}
              </span>
            );
          })}
        </div>
      </div>

      {/* Phases — horizontal scroll on desktop, vertical on mobile */}
      <div className="overflow-x-auto p-4">
        <div className="flex gap-3 md:gap-4" style={{ minWidth: `${blueprint.phases.length * 300}px` }}>
          {blueprint.phases.map((phase, i) => (
            <div key={phase.id} className="flex items-start gap-1">
              <PhaseColumn phase={phase} index={i} />
              {i < blueprint.phases.length - 1 && (
                <div className="hidden items-center self-center md:flex">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
