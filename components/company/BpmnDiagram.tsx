"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BpmnModel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  data: BpmnModel[];
}

const NODE_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  stakeholder: { bg: "#1E293B", border: "#3B82F6", text: "#93C5FD" },
  service: { bg: "#1E293B", border: "#10B981", text: "#6EE7B7" },
  platform: { bg: "#EF444420", border: "#EF4444", text: "#FCA5A5" },
};

const EDGE_COLOR: Record<string, string> = {
  money: "#10B981",
  service: "#3B82F6",
  information: "#F59E0B",
  contract: "#8B5CF6",
};

const EDGE_DASH: Record<string, string> = {
  money: "none",
  service: "none",
  information: "4 2",
  contract: "6 3",
};

export function BpmnDiagram({ data }: Props) {
  const [activeCompany, setActiveCompany] = useState<string>(data[0]?.companyId ?? "");

  const model = data.find((d) => d.companyId === activeCompany);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <h3 className="text-xs font-bold text-foreground">ビジネスモデル図</h3>
      </div>

      {/* Company selector */}
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => (
          <button
            key={d.companyId}
            onClick={() => setActiveCompany(d.companyId)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
              activeCompany === d.companyId
                ? "text-foreground border-border bg-accent"
                : "text-muted-foreground border-transparent hover:bg-accent/50"
            )}
          >
            {d.companyName}
          </button>
        ))}
      </div>

      {model && <BpmnCanvas model={model} />}
    </div>
  );
}

function BpmnCanvas({ model }: { model: BpmnModel }) {
  // Calculate SVG viewBox from node positions
  const maxX = Math.max(...model.nodes.map((n) => n.x)) + 160;
  const maxY = Math.max(...model.nodes.map((n) => n.y)) + 80;
  const viewBox = `0 0 ${Math.max(maxX, 600)} ${Math.max(maxY, 400)}`;

  // Build node position map
  const nodeMap = new Map(model.nodes.map((n) => [n.id, n]));

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{model.summary}</p>
          <Badge variant="outline" className="text-[9px] py-0 px-1.5" style={{ borderColor: "#EF444440", color: "#EF4444" }}>
            {model.subCategory}
          </Badge>
        </div>

        <div className="overflow-x-auto rounded-md bg-accent/10 border border-border/30">
          <svg viewBox={viewBox} className="w-full" style={{ minHeight: 300, maxHeight: 420 }}>
            <defs>
              {Object.entries(EDGE_COLOR).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              ))}
            </defs>

            {/* Edges */}
            {model.edges.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const sx = src.x + 60;
              const sy = src.y + 20;
              const tx = tgt.x + 60;
              const ty = tgt.y + 20;
              const mx = (sx + tx) / 2;
              const my = (sy + ty) / 2;
              const color = EDGE_COLOR[edge.type] ?? "#6B7280";
              const dash = EDGE_DASH[edge.type] ?? "none";

              return (
                <g key={edge.id}>
                  <line
                    x1={sx} y1={sy} x2={tx} y2={ty}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray={dash}
                    markerEnd={`url(#arrow-${edge.type})`}
                    opacity={0.7}
                  />
                  <rect
                    x={mx - edge.label.length * 4.5}
                    y={my - 9}
                    width={edge.label.length * 9}
                    height={16}
                    rx={3}
                    fill="#0F172A"
                    stroke={color}
                    strokeWidth={0.5}
                    opacity={0.9}
                  />
                  <text
                    x={mx}
                    y={my + 3}
                    textAnchor="middle"
                    fill={color}
                    fontSize={12}
                    fontWeight="bold"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {model.nodes.map((node) => {
              const style = NODE_STYLE[node.type] ?? NODE_STYLE.stakeholder;
              const w = Math.max(node.label.length * 12 + 16, 80);
              return (
                <g key={node.id}>
                  <rect
                    x={node.x + 60 - w / 2}
                    y={node.y}
                    width={w}
                    height={40}
                    rx={node.type === "platform" ? 8 : 4}
                    fill={style.bg}
                    stroke={style.border}
                    strokeWidth={node.type === "platform" ? 2 : 1}
                  />
                  <text
                    x={node.x + 60}
                    y={node.y + 24}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize={14}
                    fontWeight={node.type === "platform" ? "bold" : "normal"}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[9px]">
          {Object.entries(EDGE_COLOR).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">
                {type === "money" ? "金銭" : type === "service" ? "サービス" : type === "information" ? "情報" : "契約"}
              </span>
            </div>
          ))}
          <span className="text-muted-foreground">|</span>
          {Object.entries(NODE_STYLE).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }} />
              <span className="text-muted-foreground">
                {type === "stakeholder" ? "関係者" : type === "service" ? "サービス" : "プラットフォーム"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
