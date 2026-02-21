"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { PlanSection } from "@/lib/types";
import { formatCurrencyDetail, formatPercent, MONTHS } from "@/lib/utils";

interface MonthlyTableProps {
  section: PlanSection;
  color: string;
}

export function MonthlyTable({ section, color }: MonthlyTableProps) {
  const formatValue = (
    value: number,
    isMonetary?: boolean,
    isPercent?: boolean
  ) => {
    if (isPercent) return formatPercent(value);
    if (isMonetary) return formatCurrencyDetail(value);
    return value.toLocaleString();
  };

  const getCellColor = (value: number, isMonetary?: boolean) => {
    if (!isMonetary) return "";
    if (value < 0) return "text-cost";
    return "";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="sticky left-0 z-10 bg-card min-w-[180px] text-xs shadow-[2px_0_8px_rgba(0,0,0,0.3)]">
                  項目
                </TableHead>
                {MONTHS.map((m) => (
                  <TableHead key={m} className="text-right text-xs min-w-[90px] font-mono">
                    {m}
                  </TableHead>
                ))}
                <TableHead className="text-right text-xs min-w-[100px] font-bold font-mono">
                  年間合計
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.rows.map((row) => (
                <TableRow
                  key={row.label}
                  className={
                    row.isBold
                      ? "font-bold bg-muted/30"
                      : "hover:bg-muted/20"
                  }
                >
                  <TableCell className="sticky left-0 z-10 bg-card text-xs whitespace-nowrap shadow-[2px_0_8px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-1">
                      {row.isBold && (
                        <span
                          className="w-1 h-4 rounded-full inline-block"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      {row.label}
                      {row.note && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground/40 cursor-help shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[220px] text-xs">
                            {row.note}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  {row.values.map((v, i) => (
                    <TableCell
                      key={i}
                      className={`text-right text-xs tabular-nums font-mono ${getCellColor(v, row.isMonetary)}`}
                    >
                      {formatValue(v, row.isMonetary, row.isPercent)}
                    </TableCell>
                  ))}
                  <TableCell
                    className={`text-right text-xs tabular-nums font-mono font-semibold ${
                      row.annual !== null
                        ? getCellColor(row.annual, row.isMonetary)
                        : ""
                    }`}
                  >
                    {row.annual !== null
                      ? formatValue(row.annual, row.isMonetary, row.isPercent)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
