"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  MessageCircle,
  Activity,
  Baby,
  School,
  GraduationCap,
  Sparkles,
  Brain,
  HeartPulse,
  Accessibility,
} from "lucide-react";
import type { DisabilityKnowledgeData, DisabilityCategory } from "@/lib/types";

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Baby,
  School,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  Brain,
  HeartPulse,
  Accessibility,
};

function formatPopulation(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万人`;
  return `${n.toLocaleString()}人`;
}

function formatSalary(n: number): string {
  return `${(n / 10000).toFixed(1)}万円`;
}

// ─── Mini Sparkline ───
function Sparkline({ data, color }: { data: { year: number; count: number }[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.count));
  const min = Math.min(...data.map((d) => d.count));
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.count - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="inline-block ml-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Section A: Summary & Stats ───
function SummarySection({ cat }: { cat: DisabilityCategory }) {
  const growth =
    cat.statistics.trendData.length >= 2
      ? (
          ((cat.statistics.trendData[cat.statistics.trendData.length - 1].count -
            cat.statistics.trendData[0].count) /
            cat.statistics.trendData[0].count) *
          100
        ).toFixed(0)
      : null;

  return (
    <div className="space-y-4">
      {/* Overview */}
      <p className="text-sm leading-relaxed">{cat.overview}</p>

      {/* SubType Badges */}
      <div className="flex flex-wrap gap-2">
        {cat.subTypes.map((st) => (
          <div key={st.name} className="group relative">
            <Badge
              variant="outline"
              className="cursor-default text-xs"
              style={{ borderColor: cat.color, color: cat.color }}
            >
              {st.name}
            </Badge>
            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 rounded-lg border bg-popover text-popover-foreground text-xs shadow-md">
              {st.description}
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">推定人数</p>
            <p className="text-lg font-bold font-mono" style={{ color: cat.color }}>
              {formatPopulation(cat.statistics.totalPopulation)}
            </p>
            <Sparkline data={cat.statistics.trendData} color={cat.color} />
            <p className="text-[10px] text-muted-foreground mt-1">{cat.statistics.populationNote}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">有病率</p>
            <p className="text-lg font-bold font-mono" style={{ color: cat.color }}>
              {cat.statistics.prevalenceRate}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{cat.statistics.prevalenceNote}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">一般就労率</p>
            <p className="text-lg font-bold font-mono" style={{ color: cat.color }}>
              {cat.employment.employmentRate}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{cat.employment.employmentRateNote}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">平均月額賃金</p>
            <p className="text-lg font-bold font-mono" style={{ color: cat.color }}>
              {formatSalary(cat.employment.averageSalary)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{cat.employment.averageSalaryNote}</p>
          </CardContent>
        </Card>
      </div>

      {growth && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" style={{ color: cat.color }} />
          <span>
            {cat.statistics.trendData[0].year}年→{cat.statistics.trendData[cat.statistics.trendData.length - 1].year}年で
            <span className="font-semibold" style={{ color: cat.color }}>
              +{growth}%
            </span>
            増加 — {cat.statistics.trend}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Section B: Discovery Triggers (Timeline) ───
function DiscoveryTimeline({ cat }: { cat: DisabilityCategory }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: cat.color }} />
          ライフステージと発覚のきっかけ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6 space-y-0">
          {/* Vertical line */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full"
            style={{ backgroundColor: cat.color, opacity: 0.3 }}
          />
          {cat.discoveryTriggers.map((trigger, i) => {
            const Icon = ICON_MAP[trigger.icon] || Users;
            return (
              <div key={i} className="relative pb-4 last:pb-0">
                {/* Dot */}
                <div
                  className="absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 bg-background"
                  style={{ borderColor: cat.color }}
                >
                  <Icon className="h-3 w-3" style={{ color: cat.color }} />
                </div>
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{trigger.stage}</span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {trigger.age}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{trigger.trigger}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section C: Treatments ───
function TreatmentSection({ cat }: { cat: DisabilityCategory }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <HeartPulse className="h-4 w-4" style={{ color: cat.color }} />
          医療とアプローチ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full">
          {cat.treatments.map((t, i) => (
            <AccordionItem key={i} value={`treatment-${i}`}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {t.category}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <div className="bg-muted/30 rounded-lg p-2.5 text-xs">
                    <span className="font-medium">Note:</span> {t.notes}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// ─── Section D: Employment & Daily Life ───
function EmploymentSection({ cat }: { cat: DisabilityCategory }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4" style={{ color: cat.color }} />
          就労と日常のサポート
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Difficulties */}
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-amber-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              就労における困難さ
            </h4>
            <ul className="space-y-1.5">
              {cat.employment.difficulties.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Support */}
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              職場でできる配慮
            </h4>
            <ul className="space-y-1.5">
              {cat.employment.workplaceSupport.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Daily Life */}
        <div className="mt-4 border-t pt-4 space-y-3">
          <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: cat.color }}>
            <Heart className="h-3.5 w-3.5" />
            友人・同僚としての接し方
          </h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm leading-relaxed">{cat.dailyLife.friendSupport}</p>
          </div>
          <div>
            <h5 className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              コミュニケーション Tips
            </h5>
            <ul className="space-y-1.5">
              {cat.dailyLife.communicationTips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-0.5 text-[10px] font-mono font-bold shrink-0" style={{ color: cat.color }}>
                    {i + 1}.
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tab Icon ───
function TabIcon({ iconName, color }: { iconName: string; color: string }) {
  const Icon = ICON_MAP[iconName] || Users;
  return <Icon className="h-4 w-4" style={{ color }} />;
}

// ─── Main Component ───
export function DisabilityKnowledgePage({ data }: { data: DisabilityKnowledgeData }) {
  const [activeTab, setActiveTab] = useState(data.categories[0].id);
  const activeCat = data.categories.find((c) => c.id === activeTab) ?? data.categories[0];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {data.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === cat.id
                ? "border-current"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={activeTab === cat.id ? { color: cat.color, borderColor: cat.color } : undefined}
          >
            <TabIcon iconName={cat.icon} color={activeTab === cat.id ? cat.color : "currentColor"} />
            {cat.title}
          </button>
        ))}
      </div>

      {/* Section A: Summary */}
      <SummarySection cat={activeCat} />

      {/* Section B & C: Discovery + Treatment side by side on desktop */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DiscoveryTimeline cat={activeCat} />
        <TreatmentSection cat={activeCat} />
      </div>

      {/* Section D: Employment & Daily */}
      <EmploymentSection cat={activeCat} />

      {/* Source */}
      <p className="text-[10px] text-muted-foreground text-right">
        {data.source} / {data.lastUpdated}
      </p>
    </div>
  );
}
