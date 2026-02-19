"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/lib/types";

interface CompanySelectorProps {
  companies: Company[];
  selected: string[];
  onToggle: (id: string) => void;
  maxSelect?: number;
}

export function CompanySelector({
  companies,
  selected,
  onToggle,
  maxSelect = 4,
}: CompanySelectorProps) {
  const fullDataCompanies = companies.filter((c) => c.hasFullData);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        比較する企業を選択（最大{maxSelect}社）
      </p>
      <div className="flex flex-wrap gap-2">
        {fullDataCompanies.map((c) => {
          const isSelected = selected.includes(c.id);
          const isDisabled = !isSelected && selected.length >= maxSelect;
          return (
            <button
              key={c.id}
              onClick={() => !isDisabled && onToggle(c.id)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground/20",
                isDisabled && "cursor-not-allowed opacity-40"
              )}
            >
              <Checkbox checked={isSelected} />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.brandColor }}
              />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
