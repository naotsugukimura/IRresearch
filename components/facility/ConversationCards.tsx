"use client";

import { MessageCircle } from "lucide-react";
import type { ConversationExample } from "@/lib/types";

interface Props {
  conversations: ConversationExample[];
}

const SCENE_COLORS = [
  { border: "border-l-blue-500", dot: "bg-blue-500" },
  { border: "border-l-emerald-500", dot: "bg-emerald-500" },
  { border: "border-l-amber-500", dot: "bg-amber-500" },
  { border: "border-l-purple-500", dot: "bg-purple-500" },
];

export function ConversationCards({ conversations }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">現場の声・会話シーン</h3>
          <p className="text-xs text-muted-foreground">事業所で日常的に交わされる会話のテーマ</p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {conversations.map((conv, i) => {
          const color = SCENE_COLORS[i % SCENE_COLORS.length];
          return (
            <div
              key={conv.scene}
              className={`rounded-lg border border-border ${color.border} border-l-4 p-4`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color.dot}`} />
                <h4 className="text-xs font-bold">{conv.scene}</h4>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{conv.context}</p>
              <div className="mt-2">
                <p className="text-[10px] font-medium text-muted-foreground">主な話題:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {conv.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 rounded-md bg-muted/20 p-2">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">Insight: </span>
                  {conv.insight}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
