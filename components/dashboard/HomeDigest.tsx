import Link from "next/link";
import { TrendingUp, TrendingDown, Globe, Newspaper, Building2 } from "lucide-react";
import type { Company, CompanyFinancials, MarketOverviewData } from "@/lib/types";

interface Props {
  companies: Company[];
  financials: CompanyFinancials[];
  market: MarketOverviewData;
}

/* Minimal inline SVG sparkline (same pattern as MarketKpiCards) */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      className="opacity-30"
      viewBox={`0 0 ${w} ${h}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function calcYoY(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function HomeDigest({ companies, financials, market }: Props) {
  // --- Market highlights ---
  const latestPop = market.disabilityPopulation[market.disabilityPopulation.length - 1];
  const prevPop = market.disabilityPopulation[market.disabilityPopulation.length - 2];
  const latestEmp = market.disabilityEmployment[market.disabilityEmployment.length - 1];
  const latestFacility = market.facilityCountsByType[market.facilityCountsByType.length - 1];
  const prevFacility = market.facilityCountsByType[market.facilityCountsByType.length - 2];
  const totalFacilities = Object.values(latestFacility.services).reduce((a, b) => a + b, 0);
  const prevTotalFacilities = Object.values(prevFacility.services).reduce((a, b) => a + b, 0);
  const facGrowth = ((totalFacilities - prevTotalFacilities) / prevTotalFacilities * 100).toFixed(1);
  const popGrowth = ((latestPop.total - prevPop.total) / prevPop.total * 100).toFixed(1);

  const popSpark = market.disabilityPopulation.map((d) => d.total);
  const facSpark = market.facilityCountsByType.map((d) =>
    Object.values(d.services).reduce((a, b) => a + b, 0)
  );

  // --- Top movers (revenue growth) ---
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const movers: { id: string; name: string; growth: number }[] = [];
  for (const fin of financials) {
    const fy = fin.fiscalYears;
    if (fy.length < 2) continue;
    const latest = fy[fy.length - 1];
    const prev = fy[fy.length - 2];
    const yoy = calcYoY(latest.revenue, prev.revenue);
    if (yoy === null) continue;
    const company = companyMap.get(fin.companyId);
    if (!company) continue;
    movers.push({ id: fin.companyId, name: company.name, growth: yoy });
  }
  movers.sort((a, b) => b.growth - a.growth);
  const topGrowers = movers.slice(0, 3);
  const topDecliners = movers.filter((m) => m.growth < 0).sort((a, b) => a.growth - b.growth).slice(0, 3);

  // --- News ---
  const recentNews = market.news.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Market Highlights */}
      <Link
        href="/market"
        className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-blue-500/50 hover:bg-accent/30"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-md bg-blue-500/10 p-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <h3 className="text-xs font-bold">マーケットハイライト</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">障害者数</p>
              <p className="font-mono text-sm font-bold">{(latestPop.total / 10000).toFixed(0)}万人</p>
              <p className="text-[10px] text-emerald-400">+{popGrowth}%</p>
            </div>
            <Sparkline values={popSpark} color="#60a5fa" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">障害福祉事業所数</p>
              <p className="font-mono text-sm font-bold">{(totalFacilities / 10000).toFixed(1)}万</p>
              <p className="text-[10px] text-emerald-400">+{facGrowth}%</p>
            </div>
            <Sparkline values={facSpark} color="#fbbf24" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">法定雇用率</p>
              <p className="font-mono text-sm font-bold">{latestEmp.legalRate}%</p>
              <p className="text-[10px] text-muted-foreground">達成率 {latestEmp.complianceRate}%</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground group-hover:text-foreground">
          詳しく見る →
        </p>
      </Link>

      {/* Card 2: Top Movers */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-md bg-emerald-500/10 p-1.5">
            <Building2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <h3 className="text-xs font-bold">注目企業</h3>
        </div>
        {topGrowers.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-[10px] font-medium text-muted-foreground">売上成長率 TOP</p>
            <div className="space-y-1.5">
              {topGrowers.map((m) => (
                <Link
                  key={m.id}
                  href={`/company/${m.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50"
                >
                  <span className="text-xs">{m.name}</span>
                  <span className="flex items-center gap-1 font-mono text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +{m.growth.toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {topDecliners.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-medium text-muted-foreground">売上減少</p>
            <div className="space-y-1.5">
              {topDecliners.map((m) => (
                <Link
                  key={m.id}
                  href={`/company/${m.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50"
                >
                  <span className="text-xs">{m.name}</span>
                  <span className="flex items-center gap-1 font-mono text-xs text-red-400">
                    <TrendingDown className="h-3 w-3" />
                    {m.growth.toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Recent News */}
      <Link
        href="/market#news"
        className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-purple-500/50 hover:bg-accent/30"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-md bg-purple-500/10 p-1.5">
            <Newspaper className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <h3 className="text-xs font-bold">最新ニュース</h3>
        </div>
        <div className="space-y-3">
          {recentNews.map((news) => (
            <div key={news.id}>
              <p className="text-xs font-medium leading-snug">{news.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {news.date} ・ {news.category}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground group-hover:text-foreground">
          すべて見る →
        </p>
      </Link>
    </div>
  );
}
