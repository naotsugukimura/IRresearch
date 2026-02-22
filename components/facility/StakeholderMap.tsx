"use client";

import { useState } from "react";
import {
  Smile,
  UserCircle,
  School,
  Handshake,
  Building,
  Stethoscope,
  Building2,
  Network,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { StakeholderRelation } from "@/lib/types";

interface Props {
  stakeholders: StakeholderRelation[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smile,
  UserCircle,
  School,
  Handshake,
  Building,
  Stethoscope,
  Building2,
};

const STAKEHOLDER_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
];

export function StakeholderMap({ stakeholders }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Network className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">地域のネットワーク・ステークホルダー</h3>
          <p className="text-xs text-muted-foreground">
            事業所を取り巻く関係者と、それぞれの視点・関わり方
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {stakeholders.map((sh, i) => {
          const Icon = ICON_MAP[sh.icon] ?? UserCircle;
          const color = STAKEHOLDER_COLORS[i % STAKEHOLDER_COLORS.length];
          const isExpanded = expandedIdx === i;

          return (
            <div
              key={sh.name}
              className={`rounded-lg border ${color.border} ${color.bg} transition-colors`}
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="flex w-full items-start gap-3 p-3 text-left"
              >
                <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">{sh.name}</h4>
                    <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {sh.frequency}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    {sh.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/30 px-4 pb-3 pt-2.5 space-y-2.5">
                  {/* Their perspective */}
                  <div className="rounded-md bg-muted/10 p-2">
                    <p className="text-[10px] font-medium text-foreground">この人たちの本音</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground italic">
                      {sh.theirPerspective}
                    </p>
                  </div>

                  {/* Typical interactions */}
                  <div>
                    <p className="text-[10px] font-medium text-foreground">主な関わり方</p>
                    <ul className="mt-1 space-y-0.5">
                      {sh.typicalInteractions.map((interaction, ii) => (
                        <li key={ii} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                          {interaction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
