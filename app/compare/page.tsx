"use client";

import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanySelector } from "@/components/compare/CompanySelector";
import { FinancialCompareTable } from "@/components/compare/FinancialCompareTable";
import { StrategyMatrix } from "@/components/compare/StrategyMatrix";
import { TimelineOverlay } from "@/components/compare/TimelineOverlay";
import {
  getCompanies,
  getAllFinancials,
  getAllStrategies,
  getAllHistories,
} from "@/lib/data";

const companies = getCompanies();
const financials = getAllFinancials();
const strategies = getAllStrategies();
const histories = getAllHistories();

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>(["litalico", "welbe"]);

  const toggleCompany = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectedCompanies = companies.filter((c) => selected.includes(c.id));
  const selectedFinancials = financials.filter((f) =>
    selected.includes(f.companyId)
  );
  const selectedStrategies = strategies.filter((s) =>
    selected.includes(s.companyId)
  );
  const selectedHistories = histories.filter((h) =>
    selected.includes(h.companyId)
  );

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
                title="企業比較"
                description="複数企業のIRデータを横串で比較"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 md:p-6">
          <CompanySelector
            companies={companies}
            selected={selected}
            onToggle={toggleCompany}
          />

          {selected.length >= 2 ? (
            <>
              <FinancialCompareTable
                companies={selectedCompanies}
                financials={selectedFinancials}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <StrategyMatrix
                  companies={selectedCompanies}
                  strategies={selectedStrategies}
                />
                <TimelineOverlay
                  companies={selectedCompanies}
                  histories={selectedHistories}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16">
              <p className="text-sm text-muted-foreground">
                2社以上を選択してください
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
