// ============================================================
// 企業カテゴリ・共通型
// ============================================================

export type CompanyCategory = "A" | "B" | "C" | "D" | "E" | "F";
export type ThreatLevel = 1 | 2 | 3 | 4 | 5;
export type MarketType = "プライム" | "スタンダード" | "グロース" | "非上場";
export type PriorityRank = "S" | "A" | "B";

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
