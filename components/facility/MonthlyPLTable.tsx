"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import type { MonthlyPL } from "@/lib/types";

interface Props {
  data: MonthlyPL;
}

function formatValue(value: number, isPercent?: boolean): string {
  if (isPercent) {
    return `${value.toFixed(1)}%`;
  }
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return value.toLocaleString();
}

function getAnnualTotal(values: number[], isPercent?: boolean): string {
  if (isPercent) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return `${avg.toFixed(1)}%`;
  }
  const total = values.reduce((a, b) => a + b, 0);
  if (Math.abs(total) >= 10000) {
    return `${(total / 10000).toFixed(1)}万`;
  }
  return total.toLocaleString();
}

export function MonthlyPLTable({ data }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(data.sections.map((_, i) => i))
  );
  const [showGlossary, setShowGlossary] = useState(false);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-bold">{data.title}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {data.assumptions}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="sticky left-0 z-10 min-w-[160px] bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground">
                項目 / 指標
              </th>
              {data.months.map((m) => (
                <th
                  key={m}
                  className="min-w-[70px] px-2 py-2 text-right font-medium text-muted-foreground"
                >
                  {m}
                </th>
              ))}
              <th className="min-w-[80px] px-2 py-2 text-right font-bold text-muted-foreground">
                年間
              </th>
            </tr>
          </thead>
          <tbody>
            {data.sections.map((section, sIdx) => {
              const isExpanded = expandedSections.has(sIdx);
              return (
                <SectionBlock
                  key={sIdx}
                  section={section}
                  sIdx={sIdx}
                  isExpanded={isExpanded}
                  onToggle={() => toggleSection(sIdx)}
                  monthCount={data.months.length}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Glossary */}
      {data.glossary && data.glossary.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" />
            用語・KPI解説
            {showGlossary ? (
              <ChevronDown className="ml-auto h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="ml-auto h-3.5 w-3.5" />
            )}
          </button>
          {showGlossary && (
            <div className="border-t border-border px-4 pb-4">
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.glossary.map((g) => (
                  <div
                    key={g.term}
                    className="rounded-md bg-muted/20 p-2.5"
                  >
                    <p className="text-[11px] font-bold text-foreground">
                      {g.term}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      {g.description}
                    </p>
                    {g.benchmark && (
                      <p className="mt-0.5 text-[10px] text-blue-400">
                        {g.benchmark}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionBlock({
  section,
  sIdx,
  isExpanded,
  onToggle,
  monthCount,
}: {
  section: { title: string; rows: MonthlyPL["sections"][0]["rows"] };
  sIdx: number;
  isExpanded: boolean;
  onToggle: () => void;
  monthCount: number;
}) {
  // Find the total/profit row to always show even when collapsed
  const summaryRow = section.rows.find((r) => r.isTotal || r.isProfit);
  const detailRows = section.rows.filter((r) => !r.isTotal && !r.isProfit);
  const bottomRows = section.rows.filter((r) => r.isTotal || r.isProfit);

  return (
    <>
      {/* Section header */}
      <tr
        className="cursor-pointer border-t border-border bg-muted/15 hover:bg-muted/25"
        onClick={onToggle}
      >
        <td
          colSpan={monthCount + 2}
          className="sticky left-0 z-10 bg-muted/15 px-3 py-2"
        >
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {section.title}
            {!isExpanded && summaryRow && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                (年間:{" "}
                {getAnnualTotal(summaryRow.values, summaryRow.isPercent)})
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* Detail rows */}
      {isExpanded &&
        detailRows.map((row, rIdx) => (
          <tr
            key={`${sIdx}-${rIdx}`}
            className="border-b border-border/30 hover:bg-muted/10"
          >
            <td className="sticky left-0 z-10 bg-background px-3 py-1.5">
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-[11px]",
                    row.calculated
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {row.label}
                </span>
              </div>
            </td>
            {row.values.map((v, mIdx) => (
              <td
                key={mIdx}
                className="px-2 py-1.5 text-right font-mono text-[11px] text-muted-foreground"
              >
                {formatValue(v, row.isPercent)}
              </td>
            ))}
            <td className="px-2 py-1.5 text-right font-mono text-[11px] font-medium text-foreground">
              {getAnnualTotal(row.values, row.isPercent)}
            </td>
          </tr>
        ))}

      {/* Total / profit rows */}
      {isExpanded &&
        bottomRows.map((row, rIdx) => (
          <tr
            key={`${sIdx}-total-${rIdx}`}
            className={cn(
              "border-b border-border",
              row.isProfit
                ? "bg-emerald-500/5"
                : "bg-muted/20"
            )}
          >
            <td className="sticky left-0 z-10 px-3 py-2" style={{
              backgroundColor: row.isProfit ? "oklch(0.35 0.02 155 / 0.3)" : "oklch(0.25 0 0 / 0.3)"
            }}>
              <span className="text-[11px] font-bold text-foreground">
                {row.label}
              </span>
            </td>
            {row.values.map((v, mIdx) => {
              const isNegative = v < 0;
              return (
                <td
                  key={mIdx}
                  className={cn(
                    "px-2 py-2 text-right font-mono text-[11px] font-bold",
                    row.isProfit && isNegative
                      ? "text-red-400"
                      : row.isProfit && !isNegative
                        ? "text-emerald-400"
                        : "text-foreground"
                  )}
                >
                  {formatValue(v, row.isPercent)}
                </td>
              );
            })}
            <td
              className={cn(
                "px-2 py-2 text-right font-mono text-[11px] font-bold",
                row.isProfit
                  ? row.values.reduce((a, b) => a + b, 0) < 0
                    ? "text-red-400"
                    : "text-emerald-400"
                  : "text-foreground"
              )}
            >
              {getAnnualTotal(row.values, row.isPercent)}
            </td>
          </tr>
        ))}
    </>
  );
}
