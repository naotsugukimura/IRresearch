"use client";

import { useState } from "react";
import {
  Crown,
  ClipboardCheck,
  Users,
  Heart,
  Car,
  ChevronDown,
  ChevronUp,
  Banknote,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { RoleInfo } from "@/lib/types";

interface Props {
  roles: RoleInfo[];
  serviceType?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  ClipboardCheck,
  Users,
  Heart,
  Car,
};

const ROLE_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", accent: "#3B82F6" },
  { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", accent: "#8B5CF6" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", accent: "#10B981" },
  { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", accent: "#F59E0B" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", accent: "#06B6D4" },
];

export function RoleDiagram({ roles, serviceType }: Props) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const subtitle = serviceType
    ? `${serviceType}の主な職種と役割`
    : "主な職種と役割";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">事業所の登場人物</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {roles.map((role, i) => {
          const Icon = ICON_MAP[role.icon] ?? Users;
          const color = ROLE_COLORS[i % ROLE_COLORS.length];
          const isExpanded = expandedRole === role.title;
          const hasDetail = !!(role.annualSalary || role.careerPath || role.motivation || (role.challenges && role.challenges.length > 0));

          return (
            <div
              key={role.title}
              className={`rounded-lg border ${color.border} ${color.bg} transition-colors`}
            >
              {/* Header */}
              <button
                onClick={() => hasDetail && setExpandedRole(isExpanded ? null : role.title)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">{role.title}</h4>
                    {role.required && (
                      <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] text-red-400">
                        必置
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                    <span><span className="text-muted-foreground">配置: </span><span className="font-medium">{role.count}</span></span>
                    <span><span className="text-muted-foreground">資格: </span><span className="font-medium">{role.qualification}</span></span>
                  </div>
                </div>
                {hasDetail && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                )}
              </button>

              {/* Expanded detail */}
              {isExpanded && hasDetail && (
                <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-3">
                  {/* Salary & Stats row */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {role.annualSalary && (
                      <div className="flex items-start gap-1.5">
                        <Banknote className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">想定年収</p>
                          <p className="text-[10px] text-muted-foreground">{role.annualSalary}</p>
                        </div>
                      </div>
                    )}
                    {role.jobOpeningRatio && (
                      <div className="flex items-start gap-1.5">
                        <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">有効求人倍率</p>
                          <p className="text-[10px] text-muted-foreground">{role.jobOpeningRatio}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Age range */}
                  {role.ageRange && (
                    <div className="text-[10px]">
                      <span className="font-medium text-foreground">年齢層: </span>
                      <span className="text-muted-foreground">{role.ageRange}</span>
                    </div>
                  )}

                  {/* Career path */}
                  {role.careerPath && (
                    <div className="rounded-md bg-muted/10 p-2">
                      <p className="text-[10px] font-medium text-foreground">キャリアパス</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{role.careerPath}</p>
                    </div>
                  )}

                  {/* Motivation */}
                  {role.motivation && (
                    <div className="rounded-md bg-blue-500/5 p-2">
                      <p className="flex items-center gap-1 text-[10px] font-medium text-blue-400">
                        <Sparkles className="h-3 w-3" />
                        この仕事への想い
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground italic">
                        {role.motivation}
                      </p>
                    </div>
                  )}

                  {/* Challenges */}
                  {role.challenges && role.challenges.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-medium text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        日々の悩み・課題
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {role.challenges.map((ch, ci) => (
                          <li key={ci} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />
                            {ch}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
