import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowRight } from "lucide-react";
import { getInternationalWelfareData } from "@/lib/data";

export default function InternationalWelfarePage() {
  const data = getInternationalWelfareData();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title="海外制度比較"
                description="主要5カ国の障害福祉制度 ── 日本への示唆と各国のアプローチ"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
                    国名
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
                    制度名
                  </th>
                  <th className="hidden px-4 py-2.5 text-[11px] font-medium text-muted-foreground md:table-cell">
                    概要
                  </th>
                  <th className="w-8 px-2 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {data.countries.map((country) => (
                  <tr
                    key={country.id}
                    className="group border-b border-border/50 last:border-b-0 transition-colors hover:bg-accent/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/market/international/${country.id}`}
                        className="flex items-center gap-2.5 hover:opacity-80"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: country.color }}
                        >
                          {country.country}
                        </span>
                      </Link>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground md:hidden pl-7">
                        {country.systemName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {country.systemName}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {country.overview}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <Link href={`/market/international/${country.id}`}>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick comparison cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {data.countries.map((country) => {
              const gdpStat = country.statistics.find((s) =>
                s.label.includes("GDP")
              );
              const empStat = country.statistics.find((s) =>
                s.label.includes("雇用率")
              );
              return (
                <Link
                  key={country.id}
                  href={`/market/international/${country.id}`}
                  className="rounded-lg border border-border/50 p-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{country.flag}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: country.color }}
                    >
                      {country.country}
                    </span>
                  </div>
                  {empStat && (
                    <div className="mb-1">
                      <p className="text-[10px] text-muted-foreground">
                        障害者雇用率
                      </p>
                      <p
                        className="text-sm font-bold font-mono"
                        style={{ color: country.color }}
                      >
                        {empStat.value}
                      </p>
                    </div>
                  )}
                  {gdpStat && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        支出/GDP比
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {gdpStat.value}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
