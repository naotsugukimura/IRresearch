"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ChevronDown, ChevronUp, Check, X, ArrowRight } from "lucide-react";
import type { InternationalCase } from "@/lib/types";

const COUNTRY_SLUG_MAP: Record<string, string> = {
  USA: "usa",
  Denmark: "denmark",
  Sweden: "sweden",
  UK: "uk",
  Germany: "germany",
};

interface Props {
  data: InternationalCase[];
}

export function InternationalCasesSection({ data }: Props) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-bold">海外の障害福祉制度</h3>
            <p className="text-xs text-muted-foreground">
              主要5カ国の制度比較 — 日本への示唆
            </p>
          </div>
        </div>
        <Link
          href="/market/international"
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          詳細比較ページ
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((country) => {
          const isExpanded = expandedCountry === country.countryEn;
          return (
            <div
              key={country.countryEn}
              className="rounded-lg border border-border/50 bg-muted/5 transition-colors hover:bg-muted/10"
            >
              <button
                onClick={() => setExpandedCountry(isExpanded ? null : country.countryEn)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span className="text-xl">{country.flag}</span>
                <div className="flex-1">
                  <span className="text-xs font-bold">{country.country}</span>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
                    {country.system}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border/30 p-3 pt-2">
                  {/* Key Features */}
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground">主な特徴</p>
                    <ul className="mt-1 space-y-0.5">
                      {country.keyFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-medium text-emerald-400">強み</p>
                      <ul className="mt-1 space-y-0.5">
                        {country.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                            <Check className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 text-emerald-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-red-400">課題</p>
                      <ul className="mt-1 space-y-0.5">
                        {country.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                            <X className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 text-red-400" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Lesson */}
                  <div className="mt-2 rounded-md bg-amber-500/10 p-2">
                    <p className="text-[10px] font-medium text-amber-400">日本への示唆</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-amber-300/80">
                      {country.lessonForJapan}
                    </p>
                  </div>

                  {/* Detail link */}
                  {COUNTRY_SLUG_MAP[country.countryEn] && (
                    <Link
                      href={`/market/international/${COUNTRY_SLUG_MAP[country.countryEn]}`}
                      className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      詳しく見る
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
