import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyBadge } from "@/components/shared/CompanyBadge";
import { formatDate } from "@/lib/utils";
import type { Company } from "@/lib/types";

interface UpdateTimelineProps {
  companies: Company[];
}

export function UpdateTimeline({ companies }: UpdateTimelineProps) {
  const updates = companies
    .filter((c) => c.hasFullData)
    .map((c) => ({
      companyId: c.id,
      companyName: c.name,
      date: c.lastUpdated,
      label: `${c.name}のデータを更新`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">直近更新</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {updates.map((u, i) => (
            <div key={i} className="flex items-start gap-3">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CompanyBadge companyId={u.companyId} name={u.companyName} />
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatDate(u.date)}
                </p>
              </div>
            </div>
          ))}
          {updates.length === 0 && (
            <p className="text-xs text-muted-foreground">更新履歴はありません</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
