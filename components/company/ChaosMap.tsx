"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  Monitor,
  Building2,
  Shield,
  Cpu,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import type { Company, CompanyCategory, ThreatLevel } from "@/lib/types";
import { CATEGORY_CONFIG, THREAT_LEVEL_CONFIG } from "@/lib/constants";

const CATEGORY_ICONS: Record<CompanyCategory, React.ElementType> = {
  A: Target,
  B: Users,
  C: Monitor,
  D: Building2,
  E: Shield,
  F: Cpu,
};

// Market sub-groups for better visual grouping within categories
const MARKET_ORDER: Record<string, number> = {
  "プライム": 0,
  "スタンダード": 1,
  "グロース": 2,
  "非上場": 3,
};

function CompanyChip({
  company,
}: {
  company: Company;
}) {
  const cat = CATEGORY_CONFIG[company.category];
  const threat = THREAT_LEVEL_CONFIG[company.threatLevel as ThreatLevel];

  // Size based on threat level
  const sizeClass =
    company.threatLevel >= 4
      ? "px-2.5 py-1.5 text-xs"
      : company.threatLevel >= 3
        ? "px-2 py-1 text-[11px]"
        : "px-1.5 py-0.5 text-[10px]";

  return (
    <Link
      href={`/company/${company.id}`}
      className="inline-flex items-center gap-1.5 rounded-md border transition-all hover:scale-105 hover:shadow-md hover:shadow-black/20 group"
      style={{
        borderColor: `${cat.color}40`,
        backgroundColor: `${cat.color}10`,
      }}
    >
      <span className={`${sizeClass} font-medium truncate max-w-[140px]`}>
        {company.name}
      </span>
      {company.threatLevel >= 3 && (
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
          style={{ backgroundColor: threat.color }}
        />
      )}
    </Link>
  );
}

function CategorySection({
  category,
  companies,
}: {
  category: CompanyCategory;
  companies: Company[];
}) {
  const config = CATEGORY_CONFIG[category];
  const Icon = CATEGORY_ICONS[category];

  // Sort: higher threat first, then by market type
  const sorted = [...companies].sort((a, b) => {
    const threatDiff = (b.threatLevel as number) - (a.threatLevel as number);
    if (threatDiff !== 0) return threatDiff;
    return (MARKET_ORDER[a.market] ?? 9) - (MARKET_ORDER[b.market] ?? 9);
  });

  // Group by market type
  const byMarket: Record<string, Company[]> = {};
  for (const c of sorted) {
    const m = c.market;
    if (!byMarket[m]) byMarket[m] = [];
    byMarket[m].push(c);
  }
  const marketGroups = Object.entries(byMarket).sort(
    ([a], [b]) => (MARKET_ORDER[a] ?? 9) - (MARKET_ORDER[b] ?? 9)
  );

  return (
    <Card
      className="border-border/50 overflow-hidden"
      style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: config.color }} />
            <span style={{ color: config.color }}>{config.label}</span>
            <Badge variant="outline" className="text-[10px] py-0 h-4 ml-1">
              {companies.length}社
            </Badge>
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {config.description}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-4">
        {marketGroups.map(([market, comps]) => (
          <div key={market} className="mb-2 last:mb-0">
            <div className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wider font-medium">
              {market}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {comps.map((c) => (
                <CompanyChip key={c.id} company={c} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ThreatLegend() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
      <span className="font-medium">脅威レベル:</span>
      {([1, 2, 3, 4, 5] as ThreatLevel[]).map((level) => {
        const config = THREAT_LEVEL_CONFIG[level];
        return (
          <span key={level} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}

function CategoryLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
      <span className="font-medium">カテゴリ:</span>
      {(["A", "B", "C", "D", "E", "F"] as CompanyCategory[]).map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const Icon = CATEGORY_ICONS[cat];
        return (
          <span key={cat} className="flex items-center gap-1">
            <Icon className="h-3 w-3" style={{ color: config.color }} />
            <span style={{ color: config.color }}>{config.label}</span>
          </span>
        );
      })}
    </div>
  );
}

function StatsSummary({ companies }: { companies: Company[] }) {
  const categories = ["A", "B", "C", "D", "E", "F"] as CompanyCategory[];
  const listed = companies.filter((c) => c.market !== "非上場").length;
  const highThreat = companies.filter(
    (c) => (c.threatLevel as number) >= 4
  ).length;

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">
            {companies.length}
          </p>
          <p className="text-[10px] text-muted-foreground">総企業数</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">
            {categories.length}
          </p>
          <p className="text-[10px] text-muted-foreground">カテゴリ</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-blue-400">
            {listed}
          </p>
          <p className="text-[10px] text-muted-foreground">上場企業</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-red-400">
            {highThreat}
          </p>
          <p className="text-[10px] text-muted-foreground">高脅威(4+)</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ListView({
  companies,
  filter,
}: {
  companies: Company[];
  filter: CompanyCategory | "all";
}) {
  const filtered =
    filter === "all"
      ? companies
      : companies.filter((c) => c.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    const catDiff = a.category.localeCompare(b.category);
    if (catDiff !== 0) return catDiff;
    return (b.threatLevel as number) - (a.threatLevel as number);
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              企業名
            </th>
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              カテゴリ
            </th>
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              市場
            </th>
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              脅威
            </th>
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              優先度
            </th>
            <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground">
              主要サービス
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const cat = CATEGORY_CONFIG[c.category];
            const threat = THREAT_LEVEL_CONFIG[c.threatLevel as ThreatLevel];
            return (
              <tr
                key={c.id}
                className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 transition-colors"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/company/${c.id}`}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: cat.color }}
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0"
                    style={{ borderColor: cat.color, color: cat.color }}
                  >
                    {cat.label}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-[11px] text-muted-foreground">
                  {c.market}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            i <= (c.threatLevel as number)
                              ? threat.color
                              : "#374151",
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className="text-[10px] font-bold font-mono"
                    style={{
                      color:
                        c.priorityRank === "S"
                          ? "#EF4444"
                          : c.priorityRank === "A"
                            ? "#F59E0B"
                            : "#6B7280",
                    }}
                  >
                    {c.priorityRank}
                  </span>
                </td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {(c.mainServices ?? []).slice(0, 2).join(", ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChaosMap({ companies }: { companies: Company[] }) {
  const [filter, setFilter] = useState<CompanyCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  const categories = ["A", "B", "C", "D", "E", "F"] as CompanyCategory[];
  const filtered =
    filter === "all"
      ? companies
      : companies.filter((c) => c.category === filter);

  const byCategory: Record<string, Company[]> = {};
  for (const c of filtered) {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <StatsSummary companies={companies} />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              filter === "all"
                ? "bg-foreground/10 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            全て
          </button>
          {categories.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  filter === cat
                    ? "font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  filter === cat
                    ? { backgroundColor: `${config.color}20`, color: config.color }
                    : undefined
                }
              >
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <button
            onClick={() => setViewMode("map")}
            className={`p-1 rounded transition-colors ${
              viewMode === "map"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded transition-colors ${
              viewMode === "list"
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CategoryLegend />
        <ThreatLegend />
      </div>

      {/* Map or List View */}
      {viewMode === "map" ? (
        <div className="grid lg:grid-cols-2 gap-3">
          {categories
            .filter((cat) => byCategory[cat]?.length)
            .map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                companies={byCategory[cat]}
              />
            ))}
        </div>
      ) : (
        <ListView companies={filtered} filter={filter} />
      )}
    </div>
  );
}
