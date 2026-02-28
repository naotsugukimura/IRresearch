import Link from "next/link";
import { Globe, Building2, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const GUIDE_CARDS = [
  {
    icon: Building2,
    title: "企業を分析する",
    description:
      "上場企業のIR分析、財務時系列、セグメント別PL、決算インサイト。非上場企業のWebリサーチも含め82社をカバー",
    href: "/company",
    color: "#8B5CF6",
    tags: ["82社", "財務分析", "事業戦略", "決算分析"],
  },
  {
    icon: Globe,
    title: "マクロ環境を知る",
    description:
      "障害福祉の制度沿革、障害者人口・雇用の推移、事業所数の変化、海外との比較など業界の全体像を把握する",
    href: "/market",
    color: "#3B82F6",
    tags: ["制度沿革", "市場規模", "雇用統計", "海外比較"],
  },
  {
    icon: FileText,
    title: "分析を記録する",
    description:
      "決算分析、中計分析、競合比較など、リサーチの成果をノートとして蓄積・共有する",
    href: "/notes",
    color: "#10B981",
    tags: ["決算分析", "中計分析", "競合比較", "自由記述"],
  },
];

export function NavigationGuide() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold">
          IRリサーチ
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          企業分析 → マクロ環境 → 分析記録 の流れで、競合企業とマクロ環境を深掘りリサーチ
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {GUIDE_CARDS.map((card, idx) => (
          <Link key={card.href} href={card.href} className="group">
            <Card className="h-full transition-colors hover:border-foreground/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <card.icon
                      className="h-4 w-4"
                      style={{ color: card.color }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    STEP {idx + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{card.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  <span>詳しく見る</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
