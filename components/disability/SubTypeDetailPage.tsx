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
  Activity,
  AlertTriangle,
  CheckCircle2,
  Heart,
  HeartPulse,
  Lightbulb,
  MessageCircle,
  FileText,
  Users,
  TrendingUp,
  X,
} from "lucide-react";
import type { DisabilitySubTypeDetail } from "@/lib/types";

function StatCards({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">推定人数</p>
          <p
            className="text-lg font-bold font-mono"
            style={{ color: data.color }}
          >
            {data.estimatedPopulation}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">有病率</p>
          <p
            className="text-lg font-bold font-mono"
            style={{ color: data.color }}
          >
            {data.prevalence}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">好発年齢</p>
          <p
            className="text-lg font-bold font-mono"
            style={{ color: data.color }}
          >
            {data.onsetAge}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SymptomsSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: data.color }} />
          症状
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.symptoms.map((group, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-muted/5 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: data.color }}
                />
                <h4 className="text-xs font-bold">{group.category}</h4>
              </div>
              <ul className="space-y-1">
                {group.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[11px] text-muted-foreground flex items-start gap-2"
                  >
                    <span
                      className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: data.color, opacity: 0.5 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyChallengesSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          日常生活の困難さ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {data.dailyChallenges.map((challenge, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
              {challenge}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TreatmentsSection({ data }: { data: DisabilitySubTypeDetail }) {
  const effectivenessColor = (eff: string) => {
    if (eff.includes("有効") || eff.includes("改善")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (eff.includes("限定") || eff.includes("補助")) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-muted-foreground border-border bg-muted/10";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <HeartPulse className="h-4 w-4" style={{ color: data.color }} />
          治療・支援アプローチ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full">
          {data.treatments.map((t, i) => (
            <AccordionItem key={i} value={`treatment-${i}`}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                  {t.type}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] py-0 ${effectivenessColor(t.effectiveness)}`}
                  >
                    {t.effectiveness}
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function ProgressionSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: data.color }} />
          経過・予後
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6 space-y-0">
          <div
            className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full"
            style={{ backgroundColor: data.color, opacity: 0.3 }}
          />
          {data.progression.map((stage, i) => (
            <div key={i} className="relative pb-4 last:pb-0">
              <div
                className="absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 bg-background"
                style={{ borderColor: data.color }}
              >
                <span
                  className="text-[9px] font-bold font-mono"
                  style={{ color: data.color }}
                >
                  {i + 1}
                </span>
              </div>
              <div className="ml-2">
                <span className="text-sm font-semibold">{stage.stage}</span>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LivingWithSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" style={{ color: data.color }} />
          共に生きるためのヒント
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {data.livingWith.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-muted/5 p-3"
          >
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: data.color }} />
              {item.tip}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 pl-5">
              {item.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MisconceptionsSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4" style={{ color: data.color }} />
          よくある誤解と実際
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {data.misconceptions.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
            <div className="flex items-start gap-2 p-2.5 bg-red-500/5 border-b border-border/30">
              <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-400">{item.myth}</p>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-emerald-500/5">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
              <p className="text-xs text-emerald-400">{item.reality}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RelatedServicesSection({ data }: { data: DisabilitySubTypeDetail }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: data.color }} />
          関連する障害福祉サービス
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {data.relatedServices.map((service, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] py-0.5"
              style={{ borderColor: data.color, color: data.color }}
            >
              {service}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SourcesSection({ data }: { data: DisabilitySubTypeDetail }) {
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

export function SubTypeDetailPage({
  data,
}: {
  data: DisabilitySubTypeDetail;
}) {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">{data.overview}</p>
      </div>

      {/* Stats */}
      <StatCards data={data} />

      {/* Symptoms & Daily Challenges */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SymptomsSection data={data} />
        <DailyChallengesSection data={data} />
      </div>

      {/* Treatments & Progression */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TreatmentsSection data={data} />
        <ProgressionSection data={data} />
      </div>

      {/* Living With & Misconceptions */}
      <div className="grid lg:grid-cols-2 gap-4">
        <LivingWithSection data={data} />
        <MisconceptionsSection data={data} />
      </div>

      {/* Related Services & Sources */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RelatedServicesSection data={data} />
        <SourcesSection data={data} />
      </div>
    </div>
  );
}
