"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StartupFlow } from "./StartupFlow";
import {
  GraduationCap,
  UserPlus,
  Megaphone,
  Briefcase,
  Monitor,
  Target,
  Receipt,
  Heart,
  Package,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
} from "lucide-react";
import type {
  BusinessLifecycle as BusinessLifecycleType,
  StartupGuide,
  LifecyclePhase,
  LifecycleChallenge,
  SuccessFailureScenario,
  ExternalServiceNeed,
  ExternalServiceCategory,
  EntityTypeConsideration,
  FranchiseConsideration,
} from "@/lib/types";
import type { ComponentType } from "react";

// === Phase colors ===
const PHASE_COLORS: Record<string, string> = {
  "pre-opening": "#3B82F6",
  "year-1": "#F59E0B",
  "year-2-3": "#8B5CF6",
  growth: "#10B981",
};

// === Severity config ===
const SEVERITY_CONFIG = {
  high: { label: "高", className: "border-red-500/40 bg-red-500/10 text-red-400" },
  medium: { label: "中", className: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  low: { label: "低", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
};

// === Relevance config ===
const RELEVANCE_CONFIG = {
  essential: { label: "必須", className: "border-red-500/40 bg-red-500/10 text-red-400" },
  recommended: { label: "推奨", className: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  optional: { label: "任意", className: "border-border bg-accent/30 text-muted-foreground" },
};

// === Service category config ===
const SERVICE_CATEGORY_CONFIG: Record<
  ExternalServiceCategory,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  training: { label: "研修サービス", icon: GraduationCap, color: "#3B82F6" },
  staffing: { label: "人材紹介", icon: UserPlus, color: "#8B5CF6" },
  job_listing: { label: "求人媒体", icon: Megaphone, color: "#F59E0B" },
  consulting: { label: "コンサル", icon: Briefcase, color: "#EF4444" },
  software: { label: "ソフト", icon: Monitor, color: "#06B6D4" },
  marketing: { label: "集客メディア", icon: Target, color: "#10B981" },
  billing: { label: "請求代行", icon: Receipt, color: "#D97706" },
  retention: { label: "定着支援", icon: Heart, color: "#EC4899" },
  other: { label: "その他", icon: Package, color: "#6366F1" },
};

// === Sub-components ===

function ChallengesSection({ challenges }: { challenges: LifecycleChallenge[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
        主な課題
      </h4>
      <div className="flex flex-col gap-1">
        {challenges.map((c, idx) => {
          const sev = SEVERITY_CONFIG[c.severity];
          const isOpen = expanded === idx;
          return (
            <div key={idx}>
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded border px-1 py-0.5 text-[9px] font-bold",
                    sev.className
                  )}
                >
                  {sev.label}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{c.title}</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-90"
                  )}
                />
              </button>
              {isOpen && c.tips && c.tips.length > 0 && (
                <div className="ml-10 mt-1 mb-2 rounded-md border border-border bg-accent/30 p-3">
                  <p className="mb-1 text-[10px] font-semibold text-emerald-400">
                    対策・ポイント
                  </p>
                  <ul className="space-y-0.5">
                    {c.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuccessFailureSection({ scenarios }: { scenarios: SuccessFailureScenario[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
        成功 vs 失敗の分岐
      </h4>
      <div className="flex flex-col gap-3">
        {scenarios.map((s, idx) => (
          <div key={idx} className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-semibold">{s.dimension}</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-emerald-400"><TrendingUp className="h-3.5 w-3.5" /></span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    成功パターン
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {s.successPattern}
                </p>
              </div>
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-red-400"><TrendingDown className="h-3.5 w-3.5" /></span>
                  <span className="text-[10px] font-bold text-red-400">
                    失敗パターン
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {s.failurePattern}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-accent/40 px-2.5 py-2">
              <span className="text-amber-400"><ArrowRightLeft className="mt-0.5 h-3.5 w-3.5" /></span>
              <div>
                <p className="text-[10px] font-bold text-amber-400">分岐の決め手</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {s.divergencePoint}
                </p>
              </div>
            </div>
            {s.insight && (
              <p className="mt-2 text-[11px] italic leading-relaxed text-blue-400/80">
                {s.insight}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesGrid({ services }: { services: ExternalServiceNeed[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
        このフェーズで必要な外部サービス
      </h4>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {services.map((svc, idx) => {
          const cat = SERVICE_CATEGORY_CONFIG[svc.category] ?? SERVICE_CATEGORY_CONFIG.other;
          const rel = RELEVANCE_CONFIG[svc.relevance] ?? RELEVANCE_CONFIG.recommended;
          const Icon = cat.icon;
          const isOpen = expanded === idx;

          return (
            <button
              key={idx}
              onClick={() => setExpanded(isOpen ? null : idx)}
              className="rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start gap-2">
                <span style={{ color: cat.color }}>
                  <Icon className="mt-0.5 h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{svc.name}</span>
                    <span
                      className={cn(
                        "rounded border px-1 py-0.5 text-[8px] font-bold",
                        rel.className
                      )}
                    >
                      {rel.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    {svc.description}
                  </p>
                  {svc.timing && (
                    <p className="mt-0.5 text-[9px] text-blue-400/70">
                      {svc.timing}
                    </p>
                  )}
                  {isOpen && svc.examples && svc.examples.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {svc.examples.map((ex, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-border bg-accent/50 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EntityTypeSection({ entityTypes }: { entityTypes: EntityTypeConsideration[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
        法人格による違い
      </h4>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {entityTypes.map((et, idx) => {
          const isPrivate = et.entityType === "民間";
          const accentColor = isPrivate ? "#3B82F6" : "#8B5CF6";
          return (
            <div
              key={idx}
              className="rounded-lg border border-border p-3"
              style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
            >
              <p className="mb-1 text-xs font-bold" style={{ color: accentColor }}>
                {et.entityType === "民間" ? "民間（株式会社/合同会社）" : "社会福祉法人"}
              </p>
              <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                {et.description}
              </p>
              <div className="space-y-1">
                {et.advantages.map((a, i) => (
                  <div key={`a${i}`} className="flex items-start gap-1.5 text-[10px]">
                    <span className="mt-0.5 text-emerald-400">+</span>
                    <span className="text-muted-foreground">{a}</span>
                  </div>
                ))}
                {et.disadvantages.map((d, i) => (
                  <div key={`d${i}`} className="flex items-start gap-1.5 text-[10px]">
                    <span className="mt-0.5 text-red-400">-</span>
                    <span className="text-muted-foreground">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FranchiseSection({ franchise }: { franchise: FranchiseConsideration }) {
  if (!franchise.applicable) return null;

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
        FC（フランチャイズ）
      </h4>
      <div className="rounded-lg border border-border p-3">
        {franchise.description && (
          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
            {franchise.description}
          </p>
        )}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {franchise.pros && franchise.pros.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-semibold text-emerald-400">
                メリット
              </p>
              <ul className="space-y-0.5">
                {franchise.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {franchise.cons && franchise.cons.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-semibold text-red-400">
                デメリット
              </p>
              <ul className="space-y-0.5">
                {franchise.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {franchise.notes && franchise.notes.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            {franchise.notes.map((n, i) => (
              <p key={i} className="text-[10px] leading-relaxed text-muted-foreground">
                {n}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseContent({
  phase,
  startupGuide,
  serviceType,
}: {
  phase: LifecyclePhase;
  startupGuide?: StartupGuide;
  serviceType?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-lg bg-accent/30 p-3">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: PHASE_COLORS[phase.id] || "#6366F1" }}
          >
            {phase.period}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {phase.summary}
        </p>
      </div>

      {/* Challenges */}
      {phase.challenges.length > 0 && (
        <ChallengesSection challenges={phase.challenges} />
      )}

      {/* Success vs Failure */}
      {phase.successFailure && phase.successFailure.length > 0 && (
        <SuccessFailureSection scenarios={phase.successFailure} />
      )}

      {/* External Services */}
      {phase.externalServices.length > 0 && (
        <ServicesGrid services={phase.externalServices} />
      )}

      {/* Entity Types */}
      {phase.entityTypes && phase.entityTypes.length > 0 && (
        <EntityTypeSection entityTypes={phase.entityTypes} />
      )}

      {/* Franchise */}
      {phase.franchise && <FranchiseSection franchise={phase.franchise} />}

      {/* Phase 0: Embed existing StartupFlow */}
      {phase.id === "pre-opening" && startupGuide && (
        <div className="mt-2">
          <StartupFlow startupGuide={startupGuide} serviceType={serviceType} />
        </div>
      )}
    </div>
  );
}

// === Main component ===

interface BusinessLifecycleProps {
  lifecycle: BusinessLifecycleType;
  startupGuide?: StartupGuide;
  serviceType?: string;
}

export function BusinessLifecycle({
  lifecycle,
  startupGuide,
  serviceType,
}: BusinessLifecycleProps) {
  const [activePhase, setActivePhase] = useState<string>(
    lifecycle.phases[0]?.id || "pre-opening"
  );

  const currentPhase = lifecycle.phases.find((p) => p.id === activePhase);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          事業ライフサイクル
          {serviceType && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {serviceType}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Phase tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-accent/50 p-1">
          {lifecycle.phases.map((phase) => {
            const isActive = activePhase === phase.id;
            const color = PHASE_COLORS[phase.id] || "#6366F1";
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                )}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {phase.label}
              </button>
            );
          })}
        </div>

        {/* Phase progress bar */}
        <div className="mb-4 flex gap-0.5">
          {lifecycle.phases.map((phase) => {
            const color = PHASE_COLORS[phase.id] || "#6366F1";
            const isReached =
              lifecycle.phases.findIndex((p) => p.id === activePhase) >=
              lifecycle.phases.findIndex((p) => p.id === phase.id);
            return (
              <div
                key={phase.id}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor: color,
                  opacity: isReached ? 1 : 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Active phase content */}
        {currentPhase && (
          <PhaseContent
            phase={currentPhase}
            startupGuide={startupGuide}
            serviceType={serviceType}
          />
        )}
      </CardContent>
    </Card>
  );
}
