// ============================================================
// 企業カテゴリ・共通型
// ============================================================

export type CompanyCategory = "A" | "B" | "C" | "D" | "E" | "F";
export type ThreatLevel = 1 | 2 | 3 | 4 | 5;
export type MarketType = "プライム" | "スタンダード" | "グロース" | "非上場";
export type PriorityRank = "S" | "A" | "B" | "C";

// ============================================================
// companies.json
// ============================================================

export interface CompanySegment {
  name: string;
  revenueShare: number;
}

export interface Company {
  id: string;
  name: string;
  nameEn?: string;
  stockCode?: string;
  market: MarketType;
  category: CompanyCategory;
  priorityRank: PriorityRank;
  founded?: string;
  headquarters?: string;
  ceo?: string;
  employeeCount?: number;
  mission?: string;
  description: string;
  mainServices: string[];
  segments?: CompanySegment[];
  tags: string[];
  threatLevel: ThreatLevel;
  monitoringReason: string;
  irUrl?: string;
  officialUrl?: string;
  brandColor: string;
  hasFullData: boolean;
  lastUpdated: string;
}

// ============================================================
// financials.json
// ============================================================

export interface SegmentFinancial {
  name: string;
  revenue: number;
  profit?: number;
}

export interface FiscalYear {
  year: string;
  revenue: number;
  operatingProfit: number;
  ordinaryProfit?: number;
  netIncome: number;
  operatingMargin: number;
  roe?: number;
  employees?: number;
  facilities?: number;
  users?: number;
  revenuePerEmployee?: number;
  segments?: SegmentFinancial[];
}

export interface CompanyFinancials {
  companyId: string;
  currency: "JPY";
  unit: "million";
  fiscalYears: FiscalYear[];
}

// ============================================================
// histories.json
// ============================================================

export type HistoryCategory =
  | "founding"
  | "ipo"
  | "ma"
  | "new_business"
  | "policy"
  | "management"
  | "milestone"
  | "expansion";

export interface HistoryEvent {
  year: number;
  month?: number;
  category: HistoryCategory;
  title: string;
  description: string;
  smsImplication?: string;
}

export interface CompanyHistory {
  companyId: string;
  events: HistoryEvent[];
}

// ============================================================
// strategies.json
// ============================================================

export type GrowthDriverType =
  | "expansion"
  | "ma"
  | "technology"
  | "platform"
  | "new_domain"
  | "efficiency";

export interface KeyStrategy {
  title: string;
  description: string;
  growthDriver: GrowthDriverType;
}

export interface MidTermPlan {
  name: string;
  period: string;
  targets: {
    revenue?: number;
    operatingProfit?: number;
    facilities?: number;
    description: string;
  };
  keyStrategies: KeyStrategy[];
  previousPlanComparison?: string;
}

export interface CompanyStrategy {
  companyId: string;
  plans: MidTermPlan[];
}

// ============================================================
// competitive-advantages.json
// ============================================================

export interface SmsInsights {
  threatLevel: ThreatLevel;
  learnFrom: string;
  watchFor: string;
  counterStrategy: string;
}

export interface CompetitiveAdvantage {
  companyId: string;
  strengths: string[];
  weaknesses: string[];
  differentiators: string[];
  barriers: string[];
  risks: string[];
  smsInsights: SmsInsights;
}

// ============================================================
// trends.json
// ============================================================

export type TrendCategory = "policy" | "market" | "technology" | "regulation";

export interface CompanyImpact {
  companyId: string;
  impact: "high" | "medium" | "low";
  note: string;
}

export interface IndustryTrend {
  id: string;
  category: TrendCategory;
  title: string;
  date: string;
  summary: string;
  detail?: string;
  impactByCompany: CompanyImpact[];
  sources?: string[];
}

// ============================================================
// notes.json
// ============================================================

export type NoteTemplate =
  | "earnings_analysis"
  | "midterm_plan_analysis"
  | "competitor_comparison"
  | "free_form";

export interface AnalysisNote {
  id: string;
  date: string;
  title: string;
  template: NoteTemplate;
  relatedCompanies: string[];
  relatedTrends?: string[];
  content: string;
  keyTakeaways: string[];
}

// ============================================================
// 事業計画PL
// ============================================================

export interface PlanRow {
  label: string;
  values: number[];
  annual: number | null;
  note?: string;
  unit?: string;
  isMonetary?: boolean;
  isPercent?: boolean;
  isBold?: boolean;
}

export interface PlanSection {
  title: string;
  rows: PlanRow[];
}

export interface CompanyBusinessPlan {
  companyId: string;
  segmentId?: string;
  segmentName?: string;
  sections: PlanSection[];
}

// ============================================================
// 用語集
// ============================================================

export interface GlossaryTerm {
  term: string;
  description: string;
  formula: string;
  benchmark: string;
  actionTip?: string;
}

export interface GlossaryCategory {
  title: string;
  terms: GlossaryTerm[];
}

export interface UsageStep {
  step: number;
  text: string;
}

// ============================================================
// earnings-insights/*.json（決算インサイト）
// ============================================================

// KPIフィールドはAI抽出のため値が多様（number | string | object | null）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EarningsFieldValue = any;

export interface EarningsBusinessKpis {
  arr: EarningsFieldValue;
  mrr: EarningsFieldValue;
  churn_rate: EarningsFieldValue;
  arpu: EarningsFieldValue;
  cac: EarningsFieldValue;
  ltv: EarningsFieldValue;
  user_count: EarningsFieldValue;
  facility_count: EarningsFieldValue;
  employee_count: EarningsFieldValue;
  other_kpis: EarningsFieldValue[];
}

export interface EarningsMarketSizing {
  tam: EarningsFieldValue;
  sam: EarningsFieldValue;
  som: EarningsFieldValue;
  market_growth_rate: EarningsFieldValue;
  market_notes: string | null;
}

export interface EarningsMaInfo {
  target: string;
  date: string | null;
  amount: EarningsFieldValue;
  synergy: string | null;
  status: string;
}

export interface EarningsMidtermPlan {
  name: string | null;
  period: string | null;
  revenue_target: EarningsFieldValue;
  profit_target: EarningsFieldValue;
  key_strategies: string[];
}

export interface EarningsDocument {
  fiscal_period: string;
  summary: string;
  source_file: string;
  business_kpis: EarningsBusinessKpis;
  market_sizing: EarningsMarketSizing;
  ma_info: EarningsMaInfo[];
  midterm_plan: EarningsMidtermPlan;
}

export interface CompanyEarningsInsights {
  companyId: string;
  analyzedAt: string;
  documents: EarningsDocument[];
}

// ============================================================
// エリア分析（WAMNETデータ）
// ============================================================

export interface AreaPrefectureData {
  prefecture: string;
  totalFacilities: number;
  litalicoFacilities: number;
  marketShare: number;
}

export interface AreaFacility {
  name: string;
  prefecture: string;
  address: string;
}

export interface AreaServiceData {
  serviceName: string;
  totalFacilities: number;
  litalicoFacilities: number;
  marketShare: number;
  byPrefecture: AreaPrefectureData[];
  litalicoFacilityList: AreaFacility[];
}

export interface CompanyAreaAnalysis {
  companyId: string;
  source: string;
  services: Record<string, AreaServiceData>;
  summary: {
    totalLitalicoFacilities: number;
    prefecturesWithPresence: number;
  };
}

export interface Glossary {
  common: GlossaryCategory;
  retail: GlossaryCategory;
  saas: GlossaryCategory;
  recruitment: GlossaryCategory;
  media: GlossaryCategory;
  steps: {
    title: string;
    items: UsageStep[];
  };
}
