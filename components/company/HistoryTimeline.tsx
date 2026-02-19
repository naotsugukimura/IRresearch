import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HISTORY_CATEGORY_CONFIG } from "@/lib/constants";
import { formatYearMonth } from "@/lib/utils";
import type { HistoryEvent } from "@/lib/types";

interface HistoryTimelineProps {
  events: HistoryEvent[];
  companyColor?: string;
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  const sorted = [...events].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month ?? 0) - (b.month ?? 0);
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">沿革タイムライン</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative ml-3 space-y-4 border-l-2 border-border pl-6">
          {sorted.map((event, i) => {
            const catConfig = HISTORY_CATEGORY_CONFIG[event.category];
            return (
              <div key={i} className="relative">
                <div
                  className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: catConfig.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatYearMonth(event.year, event.month)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        color: catConfig.color,
                        borderColor: catConfig.color + "40",
                      }}
                    >
                      {catConfig.label}
                    </Badge>
                  </div>
                  <h4 className="mt-1 text-sm font-medium">{event.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.description}
                  </p>
                  {event.smsImplication && (
                    <div className="mt-1.5 rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-1.5">
                      <p className="text-[10px] text-blue-400">
                        <span className="font-medium">SMSへの示唆:</span>{" "}
                        {event.smsImplication}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
