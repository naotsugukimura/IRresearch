"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const marketData = [
  { year: "2018", 市場規模: 9.8 },
  { year: "2019", 市場規模: 10.5 },
  { year: "2020", 市場規模: 11.2 },
  { year: "2021", 市場規模: 12.1 },
  { year: "2022", 市場規模: 13.0 },
  { year: "2023", 市場規模: 14.0 },
  { year: "2024", 市場規模: 14.8 },
  { year: "2025", 市場規模: 15.5 },
];

export default function MarketSizeChartInner() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">障害福祉サービス市場規模推移</CardTitle>
        <p className="text-[10px] text-muted-foreground">単位: 兆円</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="市場規模"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
