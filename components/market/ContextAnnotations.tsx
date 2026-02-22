"use client";

import { useState } from "react";
import { Landmark, Building2, Users, ChevronDown } from "lucide-react";
import type { ContextAnnotation } from "@/lib/types";

interface Props {
  annotations: ContextAnnotation[];
}

const PLAYERS = [
  { key: "government" as const, label: "行政", icon: Landmark, color: "#3B82F6" },
  { key: "provider" as const, label: "事業者", icon: Building2, color: "#10B981" },
  { key: "user" as const, label: "利用者", icon: Users, color: "#F59E0B" },
];

export function ContextAnnotations({ annotations }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (annotations.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-muted/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>3プレイヤーの文脈（行政・事業者・利用者）</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          {annotations.map((ann, i) => (
            <div key={i} className="space-y-2">
              <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                {ann.yearRange}
              </span>
              <div className="grid gap-2 md:grid-cols-3">
                {PLAYERS.map((p) => {
                  const text = ann[p.key];
                  return (
                    <div
                      key={p.key}
                      className="rounded-md border border-border/40 bg-card p-2.5"
                    >
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <p.icon className="h-3 w-3" style={{ color: p.color }} />
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: p.color }}
                        >
                          {p.label}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
