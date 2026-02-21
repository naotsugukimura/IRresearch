"use client";

import {
  Crown,
  ClipboardCheck,
  Users,
  Heart,
  Car,
} from "lucide-react";
import type { RoleInfo } from "@/lib/types";

interface Props {
  roles: RoleInfo[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  ClipboardCheck,
  Users,
  Heart,
  Car,
};

const ROLE_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
];

export function RoleDiagram({ roles }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold">事業所の登場人物</h3>
        <p className="text-xs text-muted-foreground">放課後等デイサービスの主な職種と役割</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, i) => {
          const Icon = ICON_MAP[role.icon] ?? Users;
          const color = ROLE_COLORS[i % ROLE_COLORS.length];
          return (
            <div
              key={role.title}
              className={`rounded-lg border ${color.border} ${color.bg} p-4`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color.text}`} />
                <h4 className="text-xs font-bold">{role.title}</h4>
              </div>
              {role.required && (
                <span className="mt-1 inline-block rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] text-red-400">
                  必置
                </span>
              )}
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {role.description}
              </p>
              <div className="mt-2 space-y-1 text-[10px]">
                <div>
                  <span className="text-muted-foreground">配置: </span>
                  <span className="font-medium">{role.count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">資格: </span>
                  <span className="font-medium">{role.qualification}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">主な業務: </span>
                  <span className="font-medium">{role.keyTask}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
