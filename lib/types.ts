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
  marketCap?: number; // 時価総額（億円）
  recentTrend?: string; // 直近の動向
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

// ============================================================
// 総合ダッシュボード（Market Overview）
// ============================================================

export interface DisabilityPopulationYear {
  year: number;
  physical: number;
  intellectual: number;
  mental: number;
  total: number;
  populationRatio: number;
}

export interface DisabilityEmploymentYear {
  year: number;
  employedCount: number;
  actualRate: number;
  legalRate: number;
  complianceRate: number;
  companyCount: number | null;
  zeroEmploymentCompanies: number | null;
}

export interface ServiceFacilityCount {
  year: number;
  services: Record<string, number>;
}

export type NewsCategory = "policy" | "market" | "technology" | "regulation";

export interface MarketNews {
  id: string;
  date: string;
  title: string;
  category: NewsCategory;
  summary: string;
  source?: string;
}

export interface RecruitmentMethod {
  method: string;
  abbreviation: string;
  share: number;
  trend: "increasing" | "stable" | "decreasing";
  description: string;
}

export interface WelfareHistoryEvent {
  year: number;
  title: string;
  category: "law" | "system" | "milestone" | "international";
  description: string;
  impact?: string;
}

export interface CareComparisonItem {
  dimension: string;
  disability: string;
  care: string;
  insight: string;
}

export interface InternationalCase {
  country: string;
  countryEn: string;
  flag: string;
  system: string;
  keyFeatures: string[];
  strengths: string[];
  weaknesses: string[];
  lessonForJapan: string;
}

export interface EmploymentRateHistory {
  year: number;
  legalRate: number;
  actualRate: number;
  event?: string;
}

export interface RecentPolicyChange {
  year: number;
  month?: number;
  title: string;
  category: "employment" | "reward" | "system";
  description: string;
  impact: string;
}

export interface MarketOverviewData {
  lastUpdated: string;
  sources: string[];
  disabilityPopulation: DisabilityPopulationYear[];
  disabilityEmployment: DisabilityEmploymentYear[];
  facilityCountsByType: ServiceFacilityCount[];
  news: MarketNews[];
  recruitmentMethods: RecruitmentMethod[];
  welfareHistory?: WelfareHistoryEvent[];
  careComparison?: CareComparisonItem[];
  internationalCases?: InternationalCase[];
  employmentRateHistory?: EmploymentRateHistory[];
  recentPolicyChanges?: RecentPolicyChange[];
}

// ============================================================
// 事業所分析（Facility Analysis）
// ============================================================

export interface EntityTypeCount {
  type: string;
  count: number;
  share: number;
}

export interface EntityDistribution {
  asOf: string;
  total: number;
  byEntityType: EntityTypeCount[];
}

export interface OperatorScaleBucket {
  label: string;
  key: string;
  count: number;
  share: number;
  color: string;
}

export interface OperatorScale {
  asOf: string;
  buckets: OperatorScaleBucket[];
}

export interface YearCount {
  year: number;
  count: number;
  byEntity?: Record<string, number>;
}

export interface RewardRevision {
  year: number;
  title: string;
  type: "creation" | "revision";
  description: string;
  impact: string;
  baseReward: string;
  keyChanges: string[];
}

export interface FacilityRevenueItem {
  label?: string;
  name?: string;
  monthlyAmount: number;
  annualAmount: number;
  note?: string;
}

export interface FacilityCostItem {
  category: string;
  monthlyAmount: number;
  annualAmount: number;
  share: number;
  detail?: string;
}

export interface FacilityPL {
  source: string;
  assumptions: string;
  rewardUnit: {
    baseUnit: string;
    unitPrice: number;
    note: string;
  };
  revenue: {
    baseReward: FacilityRevenueItem;
    bonuses: { name: string; monthlyAmount: number; annualAmount: number }[];
    totalMonthly: number;
    totalAnnual: number;
  };
  costs: {
    items: FacilityCostItem[];
    totalMonthly: number;
    totalAnnual: number;
  };
  profitMargin: number;
  note: string;
}

export type DifficultyLevel = "low" | "medium" | "high";
export type RevenueImpactLevel = "low" | "medium" | "high";

export interface BonusRequirementStep {
  step: string;
  detail: string;
}

export interface BonusCatalogItem {
  name: string;
  category: string;
  units: string;
  requirement: string;
  difficulty: DifficultyLevel;
  revenueImpact: RevenueImpactLevel;
  requirementGuide?: {
    overview: string;
    steps: BonusRequirementStep[];
    tips: string[];
    commonMistakes?: string[];
  };
}

export interface DailyScheduleItem {
  time: string;
  activity: string;
  who: string;
  detail: string;
  conversation?: string;
  mood?: string;
}

export interface RoleInfo {
  title: string;
  description: string;
  icon: string;
  required: boolean;
  count: string;
  qualification: string;
  keyTask: string;
  annualSalary?: string;
  ageRange?: string;
  jobOpeningRatio?: string;
  careerPath?: string;
  motivation?: string;
  challenges?: string[];
}

export interface StakeholderRelation {
  name: string;
  icon: string;
  frequency: string;
  description: string;
  theirPerspective: string;
  typicalInteractions: string[];
}

export interface ConversationExample {
  scene: string;
  context: string;
  topics: string[];
  insight: string;
  dialogSample?: string[];
}

export interface OperationsStory {
  dailySchedule: DailyScheduleItem[];
  roles: RoleInfo[];
  typicalConversations: ConversationExample[];
  stakeholders?: StakeholderRelation[];
}

// 月次事業計画テーブル
export interface MonthlyPLRow {
  label: string;
  values: number[];
  unit?: string;
  note?: string;
  calculated?: boolean;
  isPercent?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
}

export interface MonthlyPLSection {
  title: string;
  rows: MonthlyPLRow[];
}

export interface MonthlyPLGlossary {
  term: string;
  description: string;
  benchmark?: string;
}

export interface MonthlyPL {
  title: string;
  assumptions: string;
  months: string[];
  sections: MonthlyPLSection[];
  glossary: MonthlyPLGlossary[];
}

export interface FacilityAnalysisData {
  serviceType: string;
  serviceCode: string;
  lastUpdated: string;
  source: string;
  entityDistribution: EntityDistribution;
  operatorScale: OperatorScale;
  facilityTimeSeries: YearCount[];
  userTimeSeries: YearCount[];
  rewardRevisions?: RewardRevision[];
  facilityPL: FacilityPL;
  bonusCatalog: BonusCatalogItem[];
  monthlyPL?: MonthlyPL;
  operationsStory: OperationsStory;
}

// ============================================================
// Webリサーチ（Tavily Search API）
// ============================================================

export interface WebResearchEntry {
  type: "business_overview" | "funding" | "news" | "competitive";
  queryTerms: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  sourceUrls: string[];
  searchedAt: string;
}

export interface WebResearchData {
  companyId: string;
  research: WebResearchEntry[];
}
