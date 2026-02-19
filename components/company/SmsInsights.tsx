import { Lightbulb, Eye, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import type { SmsInsights as SmsInsightsType } from "@/lib/types";

interface SmsInsightsProps {
  insights: SmsInsightsType;
  companyName: string;
}

export function SmsInsights({ insights, companyName }: SmsInsightsProps) {
  return (
    <Card className="border-blue-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">SMSへの示唆</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">脅威度:</span>
            <ThreatBadge level={insights.threatLevel} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {companyName}から学ぶべきこと・注視すべき動き・対抗策
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
            <h4 className="text-xs font-medium text-emerald-400">
              学ぶべきポイント
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.learnFrom}
          </p>
        </div>

        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <h4 className="text-xs font-medium text-amber-400">
              注視すべき動き
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.watchFor}
          </p>
        </div>

        <div className="rounded-md border border-blue-500/20 bg-blue-500/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Swords className="h-3.5 w-3.5 text-blue-400" />
            <h4 className="text-xs font-medium text-blue-400">
              対抗施策
            </h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.counterStrategy}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
