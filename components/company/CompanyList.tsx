"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { CompanyCard } from "./CompanyCard";
import type { Company, CompanyCategory } from "@/lib/types";

interface CompanyListProps {
  companies: Company[];
}

const categories: (CompanyCategory | "all")[] = ["all", "A", "B", "C", "D", "E", "F"];

export function CompanyList({ companies }: CompanyListProps) {
  const [filter, setFilter] = useState<CompanyCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) => {
    if (filter !== "all" && c.category !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="企業名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => {
            const isActive = filter === cat;
            const config = cat !== "all" ? CATEGORY_CONFIG[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {cat === "all" ? "全て" : `${cat}: ${config?.label}`}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length}社</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
