"use client";

import { Clock } from "lucide-react";
import type { DailyScheduleItem } from "@/lib/types";

interface Props {
  schedule: DailyScheduleItem[];
}

const TIME_COLORS: Record<string, string> = {
  "09:00": "#3B82F6",
  "09:30": "#3B82F6",
  "10:00": "#8B5CF6",
  "13:00": "#F59E0B",
  "14:00": "#10B981",
  "14:30": "#10B981",
  "16:00": "#06B6D4",
  "17:00": "#F59E0B",
  "18:00": "#EF4444",
  "18:30": "#6B7280",
};

export function DailyTimeline({ schedule }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-bold">事業所の一日の流れ</h3>
          <p className="text-xs text-muted-foreground">放課後等デイサービスの典型的なタイムスケジュール</p>
        </div>
      </div>
      <div className="relative space-y-0">
        {schedule.map((item, i) => {
          const color = TIME_COLORS[item.time] ?? "#6B7280";
          const isLast = i === schedule.length - 1;
          return (
            <div key={item.time} className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="h-3 w-3 shrink-0 rounded-full border-2"
                  style={{ borderColor: color, backgroundColor: `${color}40` }}
                />
                {!isLast && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              {/* Content */}
              <div className="pb-4 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color }}>
                    {item.time}
                  </span>
                  <span className="text-xs font-medium">{item.activity}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    {item.who}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
