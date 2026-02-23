"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import type { Q1OpsData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  data: Q1OpsData[];
}

type SortKey = "companyName" | "salesMethod" | "supportStructure" | "subCategory";

const CONFIDENCE_STYLE = {
  high: { color: "#10B981", label: "高" },
  medium: { color: "#F59E0B", label: "中" },
  low: { color: "#6B7280", label: "低" },
};

export function Q1OpsTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("subCategory");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey] ?? "";
    const vb = b[sortKey] ?? "";
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left py-2 px-3 font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortKey === field && "text-foreground")} />
      </span>
    </th>
  );

  return (
    <Card className="border-border/50" style={{ borderLeftColor: "#EF4444", borderLeftWidth: "3px" }}>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          OPS比較表
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <SortHeader label="企業名" field="companyName" />
                <SortHeader label="カテゴリ" field="subCategory" />
                <SortHeader label="営業手法" field="salesMethod" />
                <SortHeader label="サポート体制" field="supportStructure" />
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">顧客数</th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">人員</th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">集客</th>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">差別化</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">信頼度</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const conf = CONFIDENCE_STYLE[row.confidence];
                return (
                  <tr key={row.companyId} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="py-2 px-3">
                      <Link href={`/company/${row.companyId}`} className="font-medium text-foreground hover:underline">
                        {row.companyName}
                      </Link>
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5" style={{ borderColor: "#EF444440", color: "#EF4444" }}>
                        {row.subCategory}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground">{row.salesMethod}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{row.salesDetail}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground">{row.supportStructure}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{row.supportDetail}</div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{row.customerCount ?? "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.staffCount ?? "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.advertisingMethod}</td>
                    <td className="py-2 px-3">
                      <span className="text-foreground font-medium">{row.keyStrength}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className="text-[9px] py-0 px-1" style={{ borderColor: `${conf.color}40`, color: conf.color }}>
                        {conf.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          ※ 公開情報に基づく推定値を含みます。信頼度は情報の確度を示します。
        </p>
      </CardContent>
    </Card>
  );
}
