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
import disabilityKnowledgeData from "@/data/disability-knowledge.json";
import internationalWelfareData from "@/data/international-welfare.json";
import physicalSubTypesData from "@/data/disability-subtypes/physical.json";
import intellectualSubTypesData from "@/data/disability-subtypes/intellectual.json";
import mentalSubTypesData from "@/data/disability-subtypes/mental.json";
import developmentalSubTypesData from "@/data/disability-subtypes/developmental.json";
import acquiredBrainSubTypesData from "@/data/disability-subtypes/acquired-brain.json";
import intractableSubTypesData from "@/data/disability-subtypes/intractable.json";
import severeMultipleSubTypesData from "@/data/disability-subtypes/severe-multiple.json";
import challengingBehaviorSubTypesData from "@/data/disability-subtypes/challenging-behavior.json";
import addictionSubTypesData from "@/data/disability-subtypes/addiction.json";
import dementiaSubTypesData from "@/data/disability-subtypes/dementia.json";
import multipleSubTypesData from "@/data/disability-subtypes/multiple.json";
import medicalCareChildSubTypesData from "@/data/disability-subtypes/medical-care-child.json";
import justiceInvolvedSubTypesData from "@/data/disability-subtypes/justice-involved.json";
import socialWithdrawalSubTypesData from "@/data/disability-subtypes/social-withdrawal.json";
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
  DisabilityKnowledgeData,
  DisabilityCategory,
  RewardRevisionPageData,
  InternationalWelfareData,
  InternationalWelfareDetail,
  DisabilitySubTypeData,
  DisabilitySubTypeDetail,
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

// ============================================================
// 障害理解（Disability Knowledge）
// ============================================================

export function getDisabilityKnowledge(): DisabilityKnowledgeData {
  return disabilityKnowledgeData as unknown as DisabilityKnowledgeData;
}

export function getDisabilityCategory(id: string): DisabilityCategory | undefined {
  const data = getDisabilityKnowledge();
  return data.categories.find((c) => c.id === id);
}

// ============================================================
// 障害サブタイプ詳細
// ============================================================

const SUB_TYPE_DATA_MAP: Record<string, unknown> = {
  physical: physicalSubTypesData,
  intellectual: intellectualSubTypesData,
  mental: mentalSubTypesData,
  developmental: developmentalSubTypesData,
  "acquired-brain": acquiredBrainSubTypesData,
  intractable: intractableSubTypesData,
  "severe-multiple": severeMultipleSubTypesData,
  "challenging-behavior": challengingBehaviorSubTypesData,
  addiction: addictionSubTypesData,
  dementia: dementiaSubTypesData,
  multiple: multipleSubTypesData,
  "medical-care-child": medicalCareChildSubTypesData,
  "justice-involved": justiceInvolvedSubTypesData,
  "social-withdrawal": socialWithdrawalSubTypesData,
};

export function getDisabilitySubTypes(parentId: string): DisabilitySubTypeData | undefined {
  const raw = SUB_TYPE_DATA_MAP[parentId];
  if (!raw) return undefined;
  return raw as unknown as DisabilitySubTypeData;
}

export function getDisabilitySubType(parentId: string, subTypeId: string): DisabilitySubTypeDetail | undefined {
  const data = getDisabilitySubTypes(parentId);
  if (!data) return undefined;
  return data.subTypes.find((s) => s.id === subTypeId);
}

// ============================================================
// 海外制度
// ============================================================

export function getInternationalWelfareData(): InternationalWelfareData {
  return internationalWelfareData as unknown as InternationalWelfareData;
}

export function getInternationalWelfareCountry(id: string): InternationalWelfareDetail | undefined {
  const data = getInternationalWelfareData();
  return data.countries.find((c) => c.id === id);
}

// ============================================================
// 報酬改定タイムライン
// ============================================================

import rewardRevisionsData from "@/data/reward-revisions.json";

export function getRewardRevisions(): RewardRevisionPageData {
  return rewardRevisionsData as unknown as RewardRevisionPageData;
}
