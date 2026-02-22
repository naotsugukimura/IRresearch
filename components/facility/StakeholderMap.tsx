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

const NODE_COLORS = [
  "#3B82F6", "#F43F5E", "#10B981", "#8B5CF6",
  "#F59E0B", "#06B6D4", "#F97316",
];

const FREQ_OPACITY: Record<string, number> = {
  "毎日": 1,
  "週数回": 0.85,
  "週1回": 0.7,
  "月数回": 0.55,
  "月1回": 0.4,
  "随時": 0.5,
  "年数回": 0.3,
};

function getOpacity(freq: string): number {
  for (const [key, val] of Object.entries(FREQ_OPACITY)) {
    if (freq.includes(key)) return val;
  }
  return 0.5;
}

export function StakeholderMap({ stakeholders }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const cx = 200;
  const cy = 170;
  const radius = 130;
  const nodeR = 28;

  const positions = stakeholders.map((_, i) => {
    const angle = (2 * Math.PI * i) / stakeholders.length - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Network className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">ステークホルダーマップ</h3>
          <p className="text-xs text-muted-foreground">
            事業所を中心とした関係者ネットワーク（クリックで詳細）
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* SVG Diagram */}
        <div className="flex-shrink-0">
          <svg
            viewBox="0 0 400 340"
            className="w-full max-w-[400px] mx-auto"
            style={{ minHeight: 280 }}
          >
            {/* Connection lines */}
            {positions.map((pos, i) => {
              const opacity = getOpacity(stakeholders[i].frequency);
              const isSelected = selected === i;
              return (
                <line
                  key={`line-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={NODE_COLORS[i % NODE_COLORS.length]}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeOpacity={isSelected ? 1 : opacity}
                  strokeDasharray={opacity < 0.5 ? "4 3" : undefined}
                />
              );
            })}

            {/* Center node */}
            <circle cx={cx} cy={cy} r={32} fill="#1E293B" stroke="#334155" strokeWidth="2" />
            <text x={cx} y={cy - 5} textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="700">
              事業所
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748B" fontSize="7">
              (中心)
            </text>

            {/* Stakeholder nodes */}
            {positions.map((pos, i) => {
              const color = NODE_COLORS[i % NODE_COLORS.length];
              const sh = stakeholders[i];
              const isSelected_ = selected === i;
              return (
                <g
                  key={`node-${i}`}
                  onClick={() => setSelected(isSelected_ ? null : i)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected_ ? nodeR + 3 : nodeR}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isSelected_ ? 2.5 : 1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 2}
                    textAnchor="middle"
                    fill={color}
                    fontSize="8"
                    fontWeight="700"
                  >
                    {sh.name.length > 5 ? sh.name.slice(0, 5) : sh.name}
                  </text>
                  {sh.name.length > 5 && (
                    <text
                      x={pos.x}
                      y={pos.y + 8}
                      textAnchor="middle"
                      fill={color}
                      fontSize="7"
                      fontWeight="600"
                    >
                      {sh.name.slice(5)}
                    </text>
                  )}
                  <text
                    x={pos.x}
                    y={pos.y + (sh.name.length > 5 ? 18 : 10)}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="6.5"
                  >
                    {sh.frequency}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          {selected !== null ? (
            <SelectedDetail
              stakeholder={stakeholders[selected]}
              color={NODE_COLORS[selected % NODE_COLORS.length]}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-6">
              <p className="text-center text-xs text-muted-foreground">
                ノードをクリックすると<br />関係者の詳細が表示されます
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: list fallback */}
      <div className="mt-4 space-y-2 lg:hidden">
        {stakeholders.map((sh, i) => {
          const Icon = ICON_MAP[sh.icon] ?? UserCircle;
          const color = NODE_COLORS[i % NODE_COLORS.length];
          const isExpanded = selected === i;

          return (
            <div key={sh.name} className="rounded-lg border border-border">
              <button
                onClick={() => setSelected(isExpanded ? null : i)}
                className="flex w-full items-center gap-2 p-2.5 text-left"
              >
                <span style={{ color }}><Icon className="h-4 w-4 flex-shrink-0" /></span>
                <span className="flex-1 text-xs font-medium">{sh.name}</span>
                <span className="text-[9px] text-muted-foreground">{sh.frequency}</span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-border px-3 pb-2.5 pt-2 space-y-2">
                  <p className="text-[10px] text-muted-foreground">{sh.description}</p>
                  <div className="rounded-md bg-accent/30 p-2">
                    <p className="text-[10px] font-medium">この人たちの本音</p>
                    <p className="mt-0.5 text-[10px] italic text-muted-foreground">{sh.theirPerspective}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">主な関わり方</p>
                    <ul className="mt-1 space-y-0.5">
                      {sh.typicalInteractions.map((t, ii) => (
                        <li key={ii} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                          {t}
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

function SelectedDetail({
  stakeholder,
  color,
  onClose,
}: {
  stakeholder: StakeholderRelation;
  color: string;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h4 className="text-sm font-bold">{stakeholder.name}</h4>
          <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {stakeholder.frequency}
          </span>
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          &times;
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {stakeholder.description}
      </p>

      <div className="rounded-md bg-accent/30 p-2.5">
        <p className="text-[10px] font-semibold">この人たちの本音</p>
        <p className="mt-1 text-[10px] leading-relaxed italic text-muted-foreground">
          {stakeholder.theirPerspective}
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold">主な関わり方</p>
        <ul className="mt-1.5 space-y-1">
          {stakeholder.typicalInteractions.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
