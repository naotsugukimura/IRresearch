"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Compass,
  Cog,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Company, Quadrant, ThreatLevel } from "@/lib/types";
import { QUADRANT_CONFIG, THREAT_LEVEL_CONFIG } from "@/lib/constants";

const QUADRANT_ICONS: Record<Quadrant, React.ElementType> = {
  Q1: Target,
  Q2: Compass,
  Q3: Cog,
  Q4: Zap,
};

// Grid order: top-left(Q1), top-right(Q2), bottom-left(Q3), bottom-right(Q4)
const QUADRANT_ORDER: Quadrant[] = ["Q1", "Q2", "Q3", "Q4"];

function CompanyChip({ company }: { company: Company }) {
  const threat = THREAT_LEVEL_CONFIG[company.threatLevel as ThreatLevel];
  const q = company.quadrant;
  const qConfig = q ? QUADRANT_CONFIG[q] : null;
  const chipColor = qConfig?.color ?? "#6B7280";

  const sizeClass =
    company.threatLevel >= 4
      ? "px-2.5 py-1.5 text-xs"
      : company.threatLevel >= 3
        ? "px-2 py-1 text-[11px]"
        : "px-1.5 py-0.5 text-[10px]";

  return (
    <Link
      href={`/company/${company.id}`}
      className="inline-flex items-center gap-1.5 rounded-md border transition-all hover:scale-105 hover:shadow-md hover:shadow-black/20"
      style={{
        borderColor: `${chipColor}40`,
        backgroundColor: `${chipColor}10`,
      }}
      onClick={(e) => e.stopPropagation()}
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

function QuadrantCard({
  quadrant,
  companies,
}: {
  quadrant: Quadrant;
  companies: Company[];
}) {
  const config = QUADRANT_CONFIG[quadrant];
  const Icon = QUADRANT_ICONS[quadrant];

  const sorted = [...companies].sort(
    (a, b) => (b.threatLevel as number) - (a.threatLevel as number)
  );

  return (
    <Link
      href={`/company/quadrant/${config.slug}`}
      className="block group"
    >
      <Card
        className="border-border/50 overflow-hidden transition-all hover:shadow-lg hover:shadow-black/10 h-full"
        style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
      >
        <div className="px-4 pt-3 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: config.color }} />
              <span className="text-sm font-bold" style={{ color: config.color }}>
                {config.label}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 h-4">
                {companies.length}
              </Badge>
            </div>
            <ChevronRight
              className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"
            />
          </div>
          {/* Axis labels */}
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className="text-[9px] py-0 px-1.5"
              style={{ borderColor: `${config.color}30`, color: config.color }}
            >
              {config.industryAxis}
            </Badge>
            <span className="text-[9px] text-muted-foreground">/</span>
            <Badge
              variant="outline"
              className="text-[9px] py-0 px-1.5"
              style={{ borderColor: `${config.color}30`, color: config.color }}
            >
              {config.valueAxis}
            </Badge>
          </div>
          {/* Description */}
          <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">
            {config.purpose}
          </p>
        </div>

        {/* Companies */}
        <CardContent className="pt-0 pb-3 px-4">
          {sorted.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sorted.map((c) => (
                <CompanyChip key={c.id} company={c} />
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">
              企業が未分類です
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function StatsSummary({ companies }: { companies: Company[] }) {
  const classified = companies.filter((c) => c.quadrant);
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
          <p className="text-[10px] text-muted-foreground">企業</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">4</p>
          <p className="text-[10px] text-muted-foreground">象限</p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold font-mono text-blue-400">
            {classified.length}
          </p>
          <p className="text-[10px] text-muted-foreground">分類済み</p>
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

function UnclassifiedSection({ companies }: { companies: Company[] }) {
  const [expanded, setExpanded] = useState(false);
  const unclassified = companies.filter((c) => !c.quadrant);

  if (unclassified.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span>未分類の企業（{unclassified.length}社）</span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unclassified.map((c) => (
            <Link
              key={c.id}
              href={`/company/${c.id}`}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-border/30 bg-muted/20 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChaosMap({ companies }: { companies: Company[] }) {
  const byQuadrant: Record<Quadrant, Company[]> = {
    Q1: [], Q2: [], Q3: [], Q4: [],
  };

  for (const c of companies) {
    if (c.quadrant && byQuadrant[c.quadrant]) {
      byQuadrant[c.quadrant].push(c);
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <StatsSummary companies={companies} />

      {/* Matrix Header */}
      <div className="flex gap-3">
        {/* Y-axis label area */}
        <div className="flex flex-col justify-around w-6 shrink-0">
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider -rotate-90 whitespace-nowrap">
              同じ業界
            </span>
          </div>
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider -rotate-90 whitespace-nowrap">
              異なる業界
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="flex-1">
          {/* X-axis labels */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                同じ提供価値
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                異なる提供価値
              </span>
            </div>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {QUADRANT_ORDER.map((q) => (
              <QuadrantCard
                key={q}
                quadrant={q}
                companies={byQuadrant[q]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
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

      {/* Unclassified companies */}
      <UnclassifiedSection companies={companies} />
    </div>
  );
}
