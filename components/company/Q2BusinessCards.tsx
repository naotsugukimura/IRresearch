"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Q2BusinessModel } from "@/lib/types";

interface Props {
  data: Q2BusinessModel[];
}

const SMS_APPLICABILITY_STYLE = {
  high: { color: "#10B981", label: "高", bg: "#10B98120" },
  medium: { color: "#F59E0B", label: "中", bg: "#F59E0B20" },
  low: { color: "#6B7280", label: "低", bg: "#6B728020" },
};

export function Q2BusinessCards({ data }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <h3 className="text-xs font-bold text-foreground">ビジネスモデルカード</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((biz) => {
          const sms = SMS_APPLICABILITY_STYLE[biz.smsApplicability];
          return (
            <Card key={biz.companyId} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Link href={`/company/${biz.companyId}`} className="font-bold text-sm text-foreground hover:underline">
                    {biz.companyName}
                  </Link>
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5" style={{ borderColor: "#F59E0B40", color: "#F59E0B" }}>
                    {biz.subCategory}
                  </Badge>
                </div>

                {/* TAM + Pricing */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-accent/20 px-2.5 py-2">
                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">TAM</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{biz.tam}</div>
                    <div className="text-[9px] text-muted-foreground">{biz.tamBasis}</div>
                  </div>
                  <div className="rounded-md bg-accent/20 px-2.5 py-2">
                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">課金モデル</div>
                    <div className="text-xs font-medium text-foreground mt-0.5">{biz.pricingModel}</div>
                    {biz.unitEconomics && (
                      <div className="text-[9px] text-muted-foreground">{biz.unitEconomics}</div>
                    )}
                  </div>
                </div>

                {/* Target + Channels */}
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">ターゲット</div>
                  <div className="text-[11px] text-foreground">{biz.targetCustomer}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {biz.channels.map((ch) => (
                      <Badge key={ch} variant="secondary" className="text-[8px] py-0 px-1">{ch}</Badge>
                    ))}
                  </div>
                </div>

                {/* Needs */}
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">顧客ニーズ</div>
                  <ul className="space-y-0.5">
                    {biz.customerNeeds.map((need, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="text-amber-400 mt-0.5 shrink-0">▸</span>
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Entry Barrier */}
                <div className="text-[10px]">
                  <span className="font-bold text-muted-foreground">参入障壁: </span>
                  <span className="text-foreground">{biz.entryBarrier}</span>
                </div>

                {/* SMS Applicability */}
                <div className="rounded-md px-2.5 py-2" style={{ backgroundColor: sms.bg }}>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sms.color }}>
                      SMS適用性: {sms.label}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{biz.smsNote}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
