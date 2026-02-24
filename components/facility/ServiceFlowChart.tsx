"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  Handle,
  type NodeProps,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ====== Custom Node Types ======

function StartEndNode({ data }: NodeProps) {
  return (
    <div
      className="rounded-full px-4 py-2 text-xs font-bold text-center border-2 shadow-md"
      style={{
        backgroundColor: data.color as string ?? "#10B981",
        borderColor: data.borderColor as string ?? "#059669",
        color: "#fff",
        minWidth: 80,
      }}
    >
      {data.label as string}
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

function ProcessNode({ data }: NodeProps) {
  const color = data.color as string;
  const label = data.label as string;
  const description = data.description ? String(data.description) : "";
  const who = data.who ? String(data.who) : "";

  return (
    <div
      className="rounded-lg px-3 py-2 text-center border shadow-md"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}60`,
        minWidth: 120,
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div className="text-[10px] font-bold mb-0.5" style={{ color }}>
        {label}
      </div>
      {description && (
        <div className="text-[8px] text-muted-foreground leading-tight">
          {description}
        </div>
      )}
      {who && (
        <div
          className="mt-1 text-[7px] px-1.5 py-0.5 rounded-full inline-block"
          style={{ backgroundColor: `${color}25`, color }}
        >
          {who}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

function GatewayNode({ data }: NodeProps) {
  return (
    <div className="relative" style={{ width: 44, height: 44 }}>
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div
        className="absolute inset-0 border-2 shadow-md"
        style={{
          transform: "rotate(45deg)",
          backgroundColor: `${data.color as string}20`,
          borderColor: data.color as string,
          borderRadius: 4,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-bold" style={{ color: data.color as string }}>
          {data.label as string}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

function LaneLabel({ data }: NodeProps) {
  return (
    <div
      className="text-[9px] font-bold tracking-wider px-2 py-1 rounded-sm"
      style={{
        color: data.color as string,
        backgroundColor: `${data.color as string}10`,
        borderLeft: `3px solid ${data.color as string}`,
        writingMode: "vertical-rl",
        textOrientation: "mixed",
        minHeight: 100,
      }}
    >
      {data.label as string}
    </div>
  );
}

// ====== Node definitions for the 障害福祉サービス利用フロー ======

const SERVICE_FLOW_NODES: Node[] = [
  // Lane labels
  { id: "lane-user", type: "lane", position: { x: 0, y: 30 }, data: { label: "利用者/家族", color: "#3B82F6" }, draggable: false },
  { id: "lane-soudan", type: "lane", position: { x: 0, y: 180 }, data: { label: "相談支援", color: "#8B5CF6" }, draggable: false },
  { id: "lane-gyousei", type: "lane", position: { x: 0, y: 330 }, data: { label: "市区町村", color: "#F59E0B" }, draggable: false },
  { id: "lane-jigyousho", type: "lane", position: { x: 0, y: 480 }, data: { label: "事業所", color: "#10B981" }, draggable: false },

  // Start
  { id: "start", type: "startEnd", position: { x: 50, y: 50 }, data: { label: "困りごと\n発生", color: "#3B82F6", borderColor: "#2563EB" } },

  // User lane
  { id: "u1", type: "process", position: { x: 170, y: 40 }, data: { label: "相談窓口へ", description: "市区町村・基幹相談\n支援センター等", color: "#3B82F6", who: "利用者" } },
  { id: "u2", type: "process", position: { x: 570, y: 40 }, data: { label: "認定調査\n（面接）", description: "心身の状況を\n80項目で調査", color: "#3B82F6", who: "利用者" } },
  { id: "u3", type: "process", position: { x: 920, y: 40 }, data: { label: "契約・\n重要事項説明", description: "利用契約書\n重要事項説明書", color: "#3B82F6", who: "利用者" } },
  { id: "u4", type: "process", position: { x: 1070, y: 40 }, data: { label: "サービス\n利用開始", description: "個別支援計画に\n基づく支援", color: "#3B82F6", who: "利用者" } },

  // Soudan lane
  { id: "s1", type: "process", position: { x: 310, y: 190 }, data: { label: "サービス等\n利用計画案", description: "アセスメント\n→計画案作成", color: "#8B5CF6", who: "相談支援専門員" } },
  { id: "s2", type: "process", position: { x: 770, y: 190 }, data: { label: "サービス等\n利用計画", description: "支給決定後\n本計画策定", color: "#8B5CF6", who: "相談支援専門員" } },
  { id: "s3", type: "process", position: { x: 1220, y: 190 }, data: { label: "モニタリング", description: "定期的な\n計画見直し", color: "#8B5CF6", who: "相談支援専門員" } },

  // Gyousei lane
  { id: "g1", type: "process", position: { x: 460, y: 340 }, data: { label: "申請受付", description: "障害福祉サービス\n利用申請", color: "#F59E0B", who: "市区町村" } },
  { id: "g2", type: "gateway", position: { x: 650, y: 348 }, data: { label: "審査", color: "#F59E0B" } },
  { id: "g3", type: "process", position: { x: 720, y: 340 }, data: { label: "支給決定\n受給者証交付", description: "障害支援区分\nサービス種類・量", color: "#F59E0B", who: "市区町村" } },

  // Jigyousho lane
  { id: "j1", type: "process", position: { x: 920, y: 490 }, data: { label: "個別支援\n計画作成", description: "サビ管/児発管\nが作成", color: "#10B981", who: "事業所" } },
  { id: "j2", type: "process", position: { x: 1070, y: 490 }, data: { label: "サービス提供", description: "計画に基づく\n日々の支援", color: "#10B981", who: "事業所" } },
  { id: "j3", type: "process", position: { x: 1220, y: 490 }, data: { label: "記録・\n報酬請求", description: "国保連に\n請求書提出", color: "#10B981", who: "事業所" } },

  // End
  { id: "end", type: "startEnd", position: { x: 1370, y: 200 }, data: { label: "継続\n支援", color: "#10B981", borderColor: "#059669" } },
];

const SERVICE_FLOW_EDGES: Edge[] = [
  // User flow
  { id: "e-start-u1", source: "start", target: "u1", type: "smoothstep", animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 } },
  { id: "e-u1-s1", source: "u1", target: "s1", type: "smoothstep", style: { stroke: "#3B82F680" }, label: "紹介" },
  { id: "e-s1-g1", source: "s1", target: "g1", type: "smoothstep", style: { stroke: "#8B5CF680" }, label: "計画案提出" },
  { id: "e-g1-g2", source: "g1", target: "g2", type: "smoothstep", style: { stroke: "#F59E0B80" } },
  { id: "e-g1-u2", source: "g1", target: "u2", type: "smoothstep", style: { stroke: "#F59E0B60" }, label: "調査派遣" },
  { id: "e-g2-g3", source: "g2", target: "g3", type: "smoothstep", style: { stroke: "#F59E0B", strokeWidth: 2 } },
  { id: "e-g3-s2", source: "g3", target: "s2", type: "smoothstep", style: { stroke: "#F59E0B80" }, label: "決定通知" },
  { id: "e-s2-u3", source: "s2", target: "u3", type: "smoothstep", style: { stroke: "#8B5CF680" }, label: "事業所紹介" },
  { id: "e-u3-j1", source: "u3", target: "j1", type: "smoothstep", style: { stroke: "#3B82F680" }, label: "契約" },
  { id: "e-j1-u4", source: "j1", target: "u4", type: "smoothstep", style: { stroke: "#10B98180" } },
  { id: "e-j1-j2", source: "j1", target: "j2", type: "smoothstep", style: { stroke: "#10B981", strokeWidth: 2 } },
  { id: "e-u4-j2", source: "u4", target: "j2", type: "smoothstep", style: { stroke: "#3B82F640" } },
  { id: "e-j2-j3", source: "j2", target: "j3", type: "smoothstep", style: { stroke: "#10B981", strokeWidth: 2 } },
  { id: "e-j3-s3", source: "j3", target: "s3", type: "smoothstep", style: { stroke: "#10B98180" }, label: "報告" },
  { id: "e-s3-end", source: "s3", target: "end", type: "smoothstep", animated: true, style: { stroke: "#10B981", strokeWidth: 2 } },
  // Monitoring loop
  { id: "e-s3-j1-loop", source: "s3", target: "j1", type: "smoothstep", style: { stroke: "#8B5CF640", strokeDasharray: "5 5" }, label: "計画変更" },
];

const nodeTypes = {
  startEnd: StartEndNode,
  process: ProcessNode,
  gateway: GatewayNode,
  lane: LaneLabel,
};

export function ServiceFlowChart() {
  const defaultEdgeOptions = useMemo(
    () => ({
      style: { strokeWidth: 1.5, stroke: "#6B7280" },
      labelStyle: { fill: "#D1D5DB", fontSize: 12, fontWeight: 500 },
      labelBgStyle: { fill: "#1f2937", fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 3,
    }),
    []
  );

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden bg-background">
      <ReactFlow
        nodes={SERVICE_FLOW_NODES}
        edges={SERVICE_FLOW_EDGES}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={onInit}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1f2937" />
        <Controls
          showInteractive={false}
          className="!bg-background !border-border !shadow-lg [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!bg-accent"
        />
      </ReactFlow>
    </div>
  );
}
