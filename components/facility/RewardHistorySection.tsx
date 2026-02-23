"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { RewardRevision } from "@/lib/types";

interface Props {
  revisions: RewardRevision[];
  serviceType: string;
}

export function RewardHistorySection({ revisions, serviceType }: Props) {
  if (!revisions || revisions.length === 0) return null;

  const sorted = [...revisions].sort((a, b) => a.year - b.year);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "#F59E0B" }}
            />
            報酬改定の歴史
            <span className="text-muted-foreground font-normal text-xs">
              {serviceType}
            </span>
          </CardTitle>
          <Link
            href="/reward-revision"
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
          >
            詳細を見る
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 px-2 font-bold text-muted-foreground w-[60px]">
                  年
                </th>
                <th className="text-left py-1.5 px-2 font-bold text-muted-foreground">
                  改定内容
                </th>
                <th className="text-left py-1.5 px-2 font-bold text-muted-foreground">
                  市場への影響
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rev, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/50 last:border-b-0 hover:bg-accent/20 transition-colors"
                >
                  <td className="py-2 px-2 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">
                        {rev.year}
                      </span>
                      {rev.type === "creation" && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[8px] px-1 py-0">
                          創設
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 align-top text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">
                      {rev.title}
                    </span>
                    {rev.keyChanges.length > 0 && (
                      <span className="text-muted-foreground">
                        {" — "}
                        {rev.keyChanges.slice(0, 2).join("、")}
                        {rev.keyChanges.length > 2 && " 他"}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 align-top text-muted-foreground leading-relaxed">
                    {rev.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
