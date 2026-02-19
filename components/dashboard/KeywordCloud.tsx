"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyStrategy } from "@/lib/types";

interface KeywordCloudProps {
  strategies: CompanyStrategy[];
}

export function KeywordCloud({ strategies }: KeywordCloudProps) {
  const keywords = new Map<string, number>();

  strategies.forEach((s) => {
    s.plans.forEach((plan) => {
      plan.keyStrategies.forEach((ks) => {
        const words = [ks.title, ks.description].join(" ");
        const terms = [
          "プラットフォーム", "M&A", "AI", "DX", "テクノロジー",
          "拠点拡大", "人材", "効率化", "BPO", "データ活用",
          "就労支援", "児童", "農園", "リワーク", "SaaS",
          "全国展開", "品質向上", "コスト削減", "ブランド", "連携",
        ];
        terms.forEach((term) => {
          if (words.includes(term)) {
            keywords.set(term, (keywords.get(term) ?? 0) + 1);
          }
        });
      });
    });
  });

  const sorted = [...keywords.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">戦略キーワード</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {sorted.map(([word, count]) => {
            const ratio = count / maxCount;
            const size = ratio > 0.7 ? "text-sm" : ratio > 0.4 ? "text-xs" : "text-[10px]";
            const opacity = ratio > 0.7 ? "opacity-100" : ratio > 0.4 ? "opacity-80" : "opacity-60";
            return (
              <Badge
                key={word}
                variant="secondary"
                className={`${size} ${opacity}`}
              >
                {word}
                <span className="ml-1 text-muted-foreground">{count}</span>
              </Badge>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-xs text-muted-foreground">
              戦略データがありません
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
