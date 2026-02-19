import companiesData from "@/data/companies.json";
import financialsData from "@/data/financials.json";
import historiesData from "@/data/histories.json";
import strategiesData from "@/data/strategies.json";
import advantagesData from "@/data/competitive-advantages.json";
import trendsData from "@/data/trends.json";
import notesData from "@/data/notes.json";

import type {
  Company,
  CompanyFinancials,
  CompanyHistory,
  CompanyStrategy,
  CompetitiveAdvantage,
  IndustryTrend,
  AnalysisNote,
  CompanyCategory,
} from "./types";

// ============================================================
// 企業
// ============================================================

export function getCompanies(): Company[] {
  return companiesData as unknown as Company[];
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function getCompaniesByCategory(category: CompanyCategory): Company[] {
  return getCompanies().filter((c) => c.category === category);
}

export function getCompaniesWithFullData(): Company[] {
  return getCompanies().filter((c) => c.hasFullData);
}

// ============================================================
// 財務
// ============================================================

export function getAllFinancials(): CompanyFinancials[] {
  return financialsData as unknown as CompanyFinancials[];
}

export function getFinancialsByCompanyId(
  companyId: string
): CompanyFinancials | undefined {
  return getAllFinancials().find((f) => f.companyId === companyId);
}

// ============================================================
// 沿革
// ============================================================

export function getAllHistories(): CompanyHistory[] {
  return historiesData as unknown as CompanyHistory[];
}

export function getHistoryByCompanyId(
  companyId: string
): CompanyHistory | undefined {
  return getAllHistories().find((h) => h.companyId === companyId);
}

// ============================================================
// 戦略
// ============================================================

export function getAllStrategies(): CompanyStrategy[] {
  return strategiesData as unknown as CompanyStrategy[];
}

export function getStrategyByCompanyId(
  companyId: string
): CompanyStrategy | undefined {
  return getAllStrategies().find((s) => s.companyId === companyId);
}

// ============================================================
// 競争優位性
// ============================================================

export function getAllAdvantages(): CompetitiveAdvantage[] {
  return advantagesData as unknown as CompetitiveAdvantage[];
}

export function getAdvantageByCompanyId(
  companyId: string
): CompetitiveAdvantage | undefined {
  return getAllAdvantages().find((a) => a.companyId === companyId);
}

// ============================================================
// トレンド
// ============================================================

export function getAllTrends(): IndustryTrend[] {
  return trendsData as unknown as IndustryTrend[];
}

// ============================================================
// ノート
// ============================================================

export function getAllNotes(): AnalysisNote[] {
  return notesData as unknown as AnalysisNote[];
}
