import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRevenue, formatPercent, formatNumber } from "@/lib/utils";
import type { Company, CompanyFinancials } from "@/lib/types";

interface FinancialCompareTableProps {
  companies: Company[];
  financials: CompanyFinancials[];
}

export function FinancialCompareTable({
  companies,
  financials,
}: FinancialCompareTableProps) {
  if (companies.length === 0) return null;

  const rows = companies.map((c) => {
    const f = financials.find((f) => f.companyId === c.id);
    const latest = f?.fiscalYears[f.fiscalYears.length - 1];
    const prev = f?.fiscalYears.length && f.fiscalYears.length >= 2
      ? f.fiscalYears[f.fiscalYears.length - 2]
      : undefined;
    const yoyRevenue =
      latest && prev && prev.revenue > 0
        ? ((latest.revenue - prev.revenue) / prev.revenue) * 100
        : null;

    return {
      company: c,
      revenue: latest?.revenue,
      operatingProfit: latest?.operatingProfit,
      netIncome: latest?.netIncome,
      operatingMargin: latest?.operatingMargin,
      employees: latest?.employees,
      facilities: latest?.facilities,
      yoyRevenue,
      year: latest?.year,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">財務比較テーブル（直近期）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">指標</TableHead>
                {rows.map((r) => (
                  <TableHead key={r.company.id} className="text-xs text-center">
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-1"
                      style={{ backgroundColor: r.company.brandColor }}
                    />
                    {r.company.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">決算期</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center">
                    {r.year ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">売上高</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center font-medium">
                    {r.revenue ? formatRevenue(r.revenue) : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">売上YoY</TableCell>
                {rows.map((r) => (
                  <TableCell
                    key={r.company.id}
                    className={`text-xs text-center ${
                      r.yoyRevenue && r.yoyRevenue > 0
                        ? "text-emerald-400"
                        : r.yoyRevenue && r.yoyRevenue < 0
                        ? "text-red-400"
                        : ""
                    }`}
                  >
                    {r.yoyRevenue !== null ? formatPercent(r.yoyRevenue) : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">営業利益</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center">
                    {r.operatingProfit ? formatRevenue(r.operatingProfit) : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">営業利益率</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center">
                    {r.operatingMargin ? formatPercent(r.operatingMargin) : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">従業員数</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center">
                    {r.employees ? `${formatNumber(r.employees)}名` : "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground">拠点数</TableCell>
                {rows.map((r) => (
                  <TableCell key={r.company.id} className="text-xs text-center">
                    {r.facilities ? `${r.facilities}拠点` : "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
