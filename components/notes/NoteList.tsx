"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NOTE_TEMPLATE_CONFIG } from "@/lib/constants";
import { NoteCard } from "./NoteCard";
import type { AnalysisNote, Company, NoteTemplate } from "@/lib/types";

interface NoteListProps {
  notes: AnalysisNote[];
  companies: Company[];
}

const templates: (NoteTemplate | "all")[] = [
  "all",
  "earnings_analysis",
  "midterm_plan_analysis",
  "competitor_comparison",
  "free_form",
];

export function NoteList({ notes, companies }: NoteListProps) {
  const [filter, setFilter] = useState<NoteTemplate | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) => {
    if (filter !== "all" && n.template !== filter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ノートを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {templates.map((t) => {
            const isActive = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {t === "all" ? "全て" : NOTE_TEMPLATE_CONFIG[t].label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{sorted.length}件</p>

      <div className="space-y-3">
        {sorted.map((note) => (
          <NoteCard key={note.id} note={note} companies={companies} />
        ))}
      </div>
    </div>
  );
}
