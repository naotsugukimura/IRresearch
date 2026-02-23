"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { COMPANY_SECTIONS, type FacilitySectionGroup } from "@/lib/constants";

interface Props {
  sections?: readonly { id: string; label: string }[];
  groups?: readonly FacilitySectionGroup[];
}

export function SectionNav({ sections, groups }: Props) {
  const flatSections = groups
    ? groups.flatMap((g) => g.sections)
    : sections ?? COMPANY_SECTIONS;

  const [activeId, setActiveId] = useState<string>(flatSections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    flatSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(section.id);
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [flatSections]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // If groups are provided, render grouped navigation
  if (groups) {
    // Determine which group the active section belongs to
    const activeGroupId = groups.find((g) =>
      g.sections.some((s) => s.id === activeId)
    )?.groupId;

    return (
      <nav className="sticky top-0 z-10 flex gap-0.5 overflow-x-auto border-b border-border bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {groups.map((group) => {
          const isActiveGroup = group.groupId === activeGroupId;
          // Check if any section in this group exists (for filtering)
          const visibleSections = group.sections;
          if (visibleSections.length === 0) return null;

          return (
            <div key={group.groupId} className="flex items-center gap-0.5 shrink-0">
              {/* Group separator with color indicator */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-colors",
                  isActiveGroup
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: group.groupColor }}
                />
                <span className="whitespace-nowrap">{group.groupLabel}</span>
              </div>
              {/* Section buttons within this group */}
              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleClick(section.id)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    activeId === section.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {section.label}
                </button>
              ))}
              {/* Divider between groups */}
              <div className="w-px h-4 bg-border mx-1 shrink-0" />
            </div>
          );
        })}
      </nav>
    );
  }

  // Flat sections (non-grouped) - original behavior
  return (
    <nav className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {flatSections.map((section) => (
        <button
          key={section.id}
          onClick={() => handleClick(section.id)}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            activeId === section.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
