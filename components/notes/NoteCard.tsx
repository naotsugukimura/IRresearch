import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyBadge } from "@/components/shared/CompanyBadge";
import { NOTE_TEMPLATE_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AnalysisNote, Company } from "@/lib/types";

interface NoteCardProps {
  note: AnalysisNote;
  companies: Company[];
}

export function NoteCard({ note, companies }: NoteCardProps) {
  const templateConfig = NOTE_TEMPLATE_CONFIG[note.template];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">{note.title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {formatDate(note.date)}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {templateConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">{note.content}</p>

        {note.keyTakeaways.length > 0 && (
          <div className="mt-2.5 rounded-md border border-border bg-muted/20 p-2.5">
            <h4 className="text-[10px] font-medium text-muted-foreground">
              Key Takeaways
            </h4>
            <ul className="mt-1 space-y-0.5">
              {note.keyTakeaways.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {note.relatedCompanies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.relatedCompanies.map((id) => {
              const company = companies.find((c) => c.id === id);
              if (!company) return null;
              return (
                <CompanyBadge
                  key={id}
                  companyId={company.id}
                  name={company.name}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
