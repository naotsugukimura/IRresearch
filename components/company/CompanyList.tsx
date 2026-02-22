"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { Company, CompanyCategory, FiscalYear } from "@/lib/types";

function getFaviconUrl(company: Company): string | null {
  const url = company.officialUrl || company.irUrl;
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

interface CompanyListProps {
  companies: Company[];
  financialsMap: Record<string, FiscalYear | null>;
}

type SortKey =
  | "category"
  | "name"
  | "marketCap"
  | "revenue"
  | "operatingMargin"
  | "lastUpdated";
type SortDir = "asc" | "desc";

const categories: (CompanyCategory | "all")[] = [
  "all",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

function formatOku(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}兆`;
  return `${value.toLocaleString()}億`;
}

function revenueMillionToOku(million: number): string {
  const oku = million / 100;
  if (oku >= 10000) return `${(oku / 10000).toFixed(1)}兆`;
  if (oku >= 1) return `${oku.toFixed(0)}億`;
  return `${million.toLocaleString()}百万`;
}

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "category", label: "セグメント", className: "w-[100px]" },
  { key: "name", label: "会社名", className: "min-w-[140px]" },
  { key: "marketCap", label: "時価総額", className: "w-[100px] text-right" },
  { key: "revenue", label: "売上", className: "w-[100px] text-right" },
  {
    key: "operatingMargin",
    label: "営業利益率",
    className: "w-[90px] text-right",
  },
  { key: "lastUpdated", label: "直近の動向", className: "min-w-[180px]" },
];

export function CompanyList({ companies, financialsMap }: CompanyListProps) {
  const [filter, setFilter] = useState<CompanyCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "category" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    const filtered = companies.filter((c) => {
      if (filter !== "all" && c.category !== filter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      const fyA = financialsMap[a.id];
      const fyB = financialsMap[b.id];

      switch (sortKey) {
        case "category":
          cmp = a.category.localeCompare(b.category);
          if (cmp === 0) cmp = (fyB?.revenue ?? 0) - (fyA?.revenue ?? 0);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name, "ja");
          break;
        case "marketCap":
          cmp = (a.marketCap ?? 0) - (b.marketCap ?? 0);
          break;
        case "revenue":
          cmp = (fyA?.revenue ?? 0) - (fyB?.revenue ?? 0);
          break;
        case "operatingMargin":
          cmp =
            (fyA?.operatingMargin ?? -999) - (fyB?.operatingMargin ?? -999);
          break;
        case "lastUpdated":
          cmp = a.lastUpdated.localeCompare(b.lastUpdated);
          break;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [companies, filter, search, sortKey, sortDir, financialsMap]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter + Search */}
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

      <p className="text-xs text-muted-foreground">{sorted.length}社</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "cursor-pointer select-none px-3 py-2.5 text-left font-medium text-muted-foreground hover:text-foreground",
                    col.className
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((company) => {
              const fy = financialsMap[company.id];
              const catConfig = CATEGORY_CONFIG[company.category];
              return (
                <tr
                  key={company.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/20"
                >
                  {/* Segment */}
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${catConfig.color}20`,
                        color: catConfig.color,
                      }}
                    >
                      {catConfig.label}
                    </span>
                  </td>

                  {/* Company name */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const favicon = getFaviconUrl(company);
                        return favicon ? (
                          <Image
                            src={favicon}
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4 flex-shrink-0 rounded-sm"
                            unoptimized
                          />
                        ) : (
                          <span
                            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm text-[8px] font-bold text-white"
                            style={{ backgroundColor: company.brandColor || "#6B7280" }}
                          >
                            {company.name.charAt(0)}
                          </span>
                        );
                      })()}
                      <div>
                        <Link
                          href={`/company/${company.id}`}
                          className="font-medium text-foreground hover:text-blue-400 hover:underline"
                        >
                          {company.name}
                        </Link>
                        {company.stockCode && (
                          <span className="ml-1.5 text-[10px] text-muted-foreground">
                            {company.stockCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Market cap */}
                  <td className="px-3 py-2.5 text-right font-mono">
                    {company.marketCap ? (
                      <span>{formatOku(company.marketCap)}</span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="px-3 py-2.5 text-right font-mono">
                    {fy ? (
                      <span>{revenueMillionToOku(fy.revenue)}</span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>

                  {/* Operating margin */}
                  <td className="px-3 py-2.5 text-right font-mono">
                    {fy ? (
                      <span
                        className={
                          fy.operatingMargin >= 10
                            ? "text-emerald-400"
                            : fy.operatingMargin >= 0
                              ? "text-foreground"
                              : "text-red-400"
                        }
                      >
                        {fy.operatingMargin.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>

                  {/* Recent trend */}
                  <td className="max-w-[280px] truncate px-3 py-2.5 text-muted-foreground">
                    {company.recentTrend ?? "\u2014"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
