"use client";

import { useState } from "react";
import { GitBranch, ChevronDown, ChevronUp } from "lucide-react";
import type { BonusAcquisitionFlow, BonusFlowNode, DifficultyLevel } from "@/lib/types";

interface Props {
  flow: BonusAcquisitionFlow;
}

const DIFF_COLORS: Record<DifficultyLevel, { bg: string; border: string; text: string }> = {
  low: { bg: "#10B98120", border: "#10B981", text: "#10B981" },
  medium: { bg: "#F59E0B20", border: "#F59E0B", text: "#F59E0B" },
  high: { bg: "#EF444420", border: "#EF4444", text: "#EF4444" },
};

const DIFF_LABEL: Record<DifficultyLevel, string> = {
  low: "易",
  medium: "中",
  high: "難",
};

function FlowNode({
  node,
  index,
  total,
  isExpanded,
  onToggle,
}: {
  node: BonusFlowNode;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const colors = DIFF_COLORS[node.difficulty];
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-3">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: colors.bg,
            border: `2px solid ${colors.border}`,
            color: colors.text,
          }}
        >
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border" style={{ minHeight: 16 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3">
        <button
          onClick={onToggle}
          className="flex w-full items-start justify-between text-left"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{node.label}</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
              >
                {DIFF_LABEL[node.difficulty]}
              </span>
              {node.units && (
                <span className="font-mono text-[9px] text-muted-foreground">
                  {node.units}
                </span>
              )}
            </div>
            {!isExpanded && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                {node.description}
              </p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2 rounded-md border border-border/50 bg-muted/10 p-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {node.description}
            </p>
            {node.prerequisites && node.prerequisites.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-amber-400">
                  前提条件
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {node.prerequisites.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-[10px] text-muted-foreground"
                    >
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function BonusFlowChart({ flow }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">{flow.title}</h3>
          <p className="text-xs text-muted-foreground">{flow.description}</p>
        </div>
      </div>

      <div>
        {flow.nodes.map((node, i) => (
          <FlowNode
            key={node.id}
            node={node}
            index={i}
            total={flow.nodes.length}
            isExpanded={expandedId === node.id}
            onToggle={() =>
              setExpandedId(expandedId === node.id ? null : node.id)
            }
          />
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-3 flex items-center gap-3 rounded-md bg-muted/20 p-2.5">
        <span className="text-[10px] font-medium text-muted-foreground">
          難易度の推移:
        </span>
        <div className="flex flex-1 gap-1">
          {flow.nodes.map((node) => {
            const colors = DIFF_COLORS[node.difficulty];
            return (
              <div
                key={node.id}
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: colors.border }}
                title={`${node.label}: ${DIFF_LABEL[node.difficulty]}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
