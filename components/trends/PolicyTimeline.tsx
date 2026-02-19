import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TREND_CATEGORY_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { IndustryTrend } from "@/lib/types";

interface PolicyTimelineProps {
  trends: IndustryTrend[];
}

export function PolicyTimeline({ trends }: PolicyTimelineProps) {
  const sorted = [...trends].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-sm">政策・業界タイムライン</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative ml-3 space-y-3 border-l-2 border-border pl-6">
          {sorted.map((trend) => {
            const catConfig = TREND_CATEGORY_CONFIG[trend.category];
            return (
              <div key={trend.id} className="relative">
                <div
                  className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: catConfig.color }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(trend.date)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px]"
                    style={{
                      color: catConfig.color,
                      borderColor: catConfig.color + "40",
                    }}
                  >
                    {catConfig.label}
                  </Badge>
                </div>
                <h4 className="mt-0.5 text-xs font-medium">{trend.title}</h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {trend.summary}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
