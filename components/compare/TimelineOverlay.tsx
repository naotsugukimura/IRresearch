import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HISTORY_CATEGORY_CONFIG } from "@/lib/constants";
import type { Company, CompanyHistory } from "@/lib/types";

interface TimelineOverlayProps {
  companies: Company[];
  histories: CompanyHistory[];
}

export function TimelineOverlay({ companies, histories }: TimelineOverlayProps) {
  if (companies.length === 0) return null;

  const allEvents = companies.flatMap((c) => {
    const history = histories.find((h) => h.companyId === c.id);
    return (history?.events ?? []).map((e) => ({
      ...e,
      companyId: c.id,
      companyName: c.name,
      brandColor: c.brandColor,
    }));
  });

  const sorted = allEvents.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month ?? 0) - (b.month ?? 0);
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">沿革タイムライン（重ね合わせ）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative ml-3 space-y-3 border-l-2 border-border pl-6">
          {sorted.map((event, i) => {
            const catConfig = HISTORY_CATEGORY_CONFIG[event.category];
            return (
              <div key={i} className="relative">
                <div
                  className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: event.brandColor }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {event.year}{event.month ? `.${event.month}` : ""}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] gap-1"
                    style={{ borderColor: event.brandColor + "40" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: event.brandColor }}
                    />
                    {event.companyName}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px]"
                    style={{ color: catConfig.color, borderColor: catConfig.color + "40" }}
                  >
                    {catConfig.label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs">{event.title}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
