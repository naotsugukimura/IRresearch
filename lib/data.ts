import companiesData from "@/data/companies.json";
import financialsData from "@/data/financials.json";
import historiesData from "@/data/histories.json";
import strategiesData from "@/data/strategies.json";
import advantagesData from "@/data/competitive-advantages.json";
import trendsData from "@/data/trends.json";
import notesData from "@/data/notes.json";
import businessPlansData from "@/data/business-plans.json";
import glossaryData from "@/data/glossary.json";
import earningsInsightsData from "@/data/earnings-insights.json";
import areaAnalysisData from "@/data/litalico-area-analysis.json";
import marketOverviewData from "@/data/market-overview.json";
import webResearchData from "@/data/web-research.json";
import jidouHattatsuData from "@/data/facility-analysis/jidou-hattatsu.json";
import iryougataJidouData from "@/data/facility-analysis/iryougata-jidou.json";
import houkagoDayData from "@/data/facility-analysis/houkago-day.json";
import kyotakuHoumonData from "@/data/facility-analysis/kyotaku-houmon.json";
import hoikushoHoumonData from "@/data/facility-analysis/hoikusho-houmon.json";
import groupHomeData from "@/data/facility-analysis/group-home.json";
import jiritsuSeikatsuData from "@/data/facility-analysis/jiritsu-seikatsu.json";
import kinouKunrenData from "@/data/facility-analysis/kinou-kunren.json";
import seikatsuKunrenData from "@/data/facility-analysis/seikatsu-kunren.json";
import shukuhakuKunrenData from "@/data/facility-analysis/shukuhaku-kunren.json";
import shurouIkouData from "@/data/facility-analysis/shurou-ikou.json";
import shurouAData from "@/data/facility-analysis/shurou-a.json";
import shurouBData from "@/data/facility-analysis/shurou-b.json";
import shurouTeichakuData from "@/data/facility-analysis/shurou-teichaku.json";
import chiikiIkouData from "@/data/facility-analysis/chiiki-ikou.json";
import chiikiTeichakuData from "@/data/facility-analysis/chiiki-teichaku.json";
import keikakuSoudanData from "@/data/facility-analysis/keikaku-soudan.json";
import shougaijiSoudanData from "@/data/facility-analysis/shougaiji-soudan.json";

import type {
  Company,
  CompanyFinancials,
  FiscalYear,
  CompanyHistory,
  CompanyStrategy,
  CompetitiveAdvantage,
  IndustryTrend,
  AnalysisNote,
  CompanyCategory,
  CompanyBusinessPlan,
  Glossary,
  CompanyEarningsInsights,
  CompanyAreaAnalysis,
  MarketOverviewData,
  FacilityAnalysisData,
  WebResearchData,
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

export function getLatestFiscalYear(
  companyId: string
): FiscalYear | null {
  const financials = getFinancialsByCompanyId(companyId);
  if (!financials || financials.fiscalYears.length === 0) return null;
  return financials.fiscalYears[financials.fiscalYears.length - 1];
}

export function getFinancialsMap(): Record<string, FiscalYear | null> {
  const companies = getCompanies();
  const map: Record<string, FiscalYear | null> = {};
  for (const c of companies) {
    map[c.id] = getLatestFiscalYear(c.id);
  }
  return map;
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

// ============================================================
// 事業計画PL
// ============================================================

export function getAllBusinessPlans(): CompanyBusinessPlan[] {
  return businessPlansData as unknown as CompanyBusinessPlan[];
}

export function getBusinessPlanByCompanyId(
  companyId: string
): CompanyBusinessPlan | undefined {
  return getAllBusinessPlans().find((bp) => bp.companyId === companyId && !bp.segmentId);
}

export function getBusinessPlansByCompanyId(
  companyId: string
): CompanyBusinessPlan[] {
  return getAllBusinessPlans().filter((bp) => bp.companyId === companyId);
}

// ============================================================
// 用語集
// ============================================================

export function getGlossary(): Glossary {
  return glossaryData as unknown as Glossary;
}

// ============================================================
// 決算インサイト
// ============================================================

export function getAllEarningsInsights(): CompanyEarningsInsights[] {
  return earningsInsightsData as unknown as CompanyEarningsInsights[];
}

export function getEarningsInsightsByCompanyId(
  companyId: string
): CompanyEarningsInsights | undefined {
  return getAllEarningsInsights().find((e) => e.companyId === companyId);
}

// ============================================================
// エリア分析（WAMNETデータ）
// ============================================================

export function getAreaAnalysis(): CompanyAreaAnalysis {
  return areaAnalysisData as unknown as CompanyAreaAnalysis;
}

export function getAreaAnalysisByCompanyId(
  companyId: string
): CompanyAreaAnalysis | undefined {
  const data = getAreaAnalysis();
  return data.companyId === companyId ? data : undefined;
}

// ============================================================
// 総合ダッシュボード（Market Overview）
// ============================================================

export function getMarketOverview(): MarketOverviewData {
  return marketOverviewData as unknown as MarketOverviewData;
}

// ============================================================
// 事業所分析（Facility Analysis）
// ============================================================

const FACILITY_DATA: Record<string, unknown> = {
  "23": kinouKunrenData,
  "24": seikatsuKunrenData,
  "25": shukuhakuKunrenData,
  "27": shurouIkouData,
  "31": shurouAData,
  "32": shurouBData,
  "33": shurouTeichakuData,
  "35": groupHomeData,
  "36": jiritsuSeikatsuData,
  "46": keikakuSoudanData,
  "47": shougaijiSoudanData,
  "53": chiikiIkouData,
  "54": chiikiTeichakuData,
  "63": jidouHattatsuData,
  "64": iryougataJidouData,
  "65": houkagoDayData,
  "66": kyotakuHoumonData,
  "67": hoikushoHoumonData,
};

export function getFacilityAnalysis(serviceCode: string): FacilityAnalysisData | undefined {
  const data = FACILITY_DATA[serviceCode];
  return data ? (data as unknown as FacilityAnalysisData) : undefined;
}

// ============================================================
// Webリサーチ（Tavily Search API）
// ============================================================

export function getWebResearch(companyId: string): WebResearchData | undefined {
  const all = webResearchData as unknown as WebResearchData[];
  return all.find((d) => d.companyId === companyId);
}
