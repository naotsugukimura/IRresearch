"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Lightbulb,
  TrendingUp,
  FileText,
} from "lucide-react";
import type { InternationalWelfareDetail } from "@/lib/types";

function StatCards({ data }: { data: InternationalWelfareDetail }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {data.statistics.map((stat, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p
              className="text-lg font-bold font-mono"
              style={{ color: data.color }}
            >
              {stat.value}
            </p>
            {stat.note && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {stat.note}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function KeyLawsSection({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="h-4 w-4" style={{ color: data.color }} />
          主要法制度
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full">
          {data.keyLaws.map((law, i) => (
            <AccordionItem key={i} value={`law-${i}`}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                  {law.name}
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 font-mono"
                  >
                    {law.year}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground pl-4">
                  {law.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function TimelineSection({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: data.color }} />
          制度の変遷
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6 space-y-0">
          <div
            className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full"
            style={{ backgroundColor: data.color, opacity: 0.3 }}
          />
          {data.timeline.map((event, i) => (
            <div key={i} className="relative pb-4 last:pb-0">
              <div
                className="absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 bg-background"
                style={{ borderColor: data.color }}
              >
                <span
                  className="text-[8px] font-bold font-mono"
                  style={{ color: data.color }}
                >
                  {String(event.year).slice(2)}
                </span>
              </div>
              <div className="ml-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 font-mono"
                  >
                    {event.year}
                  </Badge>
                  <span className="text-sm font-semibold">{event.event}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.significance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceSystemSection({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4" style={{ color: data.color }} />
          サービス体系
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.serviceSystem.map((cat, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-muted/5 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: data.color }}
                />
                <h4 className="text-xs font-bold">{cat.category}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cat.services.map((s, j) => (
                  <Badge
                    key={j}
                    variant="outline"
                    className="text-[10px] py-0"
                    style={{ borderColor: data.color, color: data.color }}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StrengthsChallengesSection({
  data,
}: {
  data: InternationalWelfareDetail;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            制度の強み
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {data.strengths.map((s, i) => (
            <div key={i}>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                {s.title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pl-3">
                {s.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            制度の課題
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {data.challenges.map((c, i) => (
            <div key={i}>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                {c.title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 pl-3">
                {c.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ComparisonTable({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4" style={{ color: data.color }} />
          日本との比較
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground w-1/5">
                  比較軸
                </th>
                <th
                  className="px-3 py-2 text-[11px] font-medium w-2/5"
                  style={{ color: data.color }}
                >
                  {data.flag} {data.country}
                </th>
                <th className="px-3 py-2 text-[11px] font-medium text-muted-foreground w-2/5">
                  🇯🇵 日本
                </th>
              </tr>
            </thead>
            <tbody>
              {data.comparisonWithJapan.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                    {row.dimension}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
                    {row.thisCountry}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
                    {row.japan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LessonsSection({ data }: { data: InternationalWelfareDetail }) {
  const applicabilityConfig = {
    high: {
      label: "適用性: 高",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    medium: {
      label: "適用性: 中",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    low: {
      label: "適用性: 低",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" style={{ color: data.color }} />
          日本への示唆
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {data.lessonsForJapan.map((lesson, i) => {
          const config = applicabilityConfig[lesson.applicability];
          return (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-muted/5 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold">{lesson.title}</h4>
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 h-4 shrink-0 ${config.className}`}
                >
                  {config.label}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {lesson.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecentTrendsSection({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: data.color }} />
          最近の動向
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1.5">
          {data.recentTrends.map((trend, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: data.color, opacity: 0.6 }}
              />
              {trend}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SourcesSection({ data }: { data: InternationalWelfareDetail }) {
  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          出典・参考資料
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1">
          {data.sources.map((source, i) => (
            <li key={i} className="text-[10px] text-muted-foreground">
              {source}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CountryDetailPage({
  data,
}: {
  data: InternationalWelfareDetail;
}) {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{data.flag}</span>
          <div>
            <h2 className="text-lg font-bold" style={{ color: data.color }}>
              {data.systemName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {data.systemDescription}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{data.overview}</p>
      </div>

      {/* Stats */}
      <StatCards data={data} />

      {/* Laws & Timeline */}
      <div className="grid lg:grid-cols-2 gap-4">
        <KeyLawsSection data={data} />
        <TimelineSection data={data} />
      </div>

      {/* Service System */}
      <ServiceSystemSection data={data} />

      {/* Strengths & Challenges */}
      <StrengthsChallengesSection data={data} />

      {/* Comparison */}
      <ComparisonTable data={data} />

      {/* Lessons */}
      <LessonsSection data={data} />

      {/* Recent Trends & Sources */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentTrendsSection data={data} />
        <SourcesSection data={data} />
      </div>
    </div>
  );
}
