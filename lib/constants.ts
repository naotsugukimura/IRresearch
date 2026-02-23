import type {
  CompanyCategory,
  ThreatLevel,
  HistoryCategory,
  GrowthDriverType,
  TrendCategory,
  NoteTemplate,
  PriorityRank,
} from "./types";

// ============================================================
// ナビゲーション
// ============================================================

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  children?: { href: string; label: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム", icon: "LayoutDashboard" },
  {
    href: "/market",
    label: "マクロ環境",
    icon: "Globe",
    children: [
      { href: "/market", label: "市場ダッシュボード" },
      { href: "/market/international", label: "海外制度比較" },
      { href: "/trends", label: "業界トレンド" },
      { href: "/reward-revision", label: "報酬改定" },
    ],
  },
  {
    href: "/disability",
    label: "障害理解",
    icon: "Heart",
    children: [
      { href: "/disability", label: "障害種別一覧" },
    ],
  },
  {
    href: "/facility",
    label: "事業所分析",
    icon: "Building",
    children: [
      { href: "/facility", label: "サービス種別一覧" },
      { href: "/facility/flow", label: "利用フロー図" },
    ],
  },
  {
    href: "/company",
    label: "企業分析",
    icon: "Building2",
    children: [
      { href: "/company", label: "企業一覧" },
      { href: "/company/chaos-map", label: "カオスマップ" },
      { href: "/compare", label: "企業比較" },
    ],
  },
  {
    href: "/learn",
    label: "ナレッジ",
    icon: "GraduationCap",
    children: [
      { href: "/learn", label: "用語集" },
      { href: "/notes", label: "分析ノート" },
    ],
  },
];

// ============================================================
// 企業カテゴリ
// ============================================================

export const CATEGORY_CONFIG: Record<
  CompanyCategory,
  { label: string; description: string; color: string; bgClass: string }
> = {
  A: {
    label: "直接競合",
    description: "障害福祉サービス運営の上場企業",
    color: "#EF4444",
    bgClass: "bg-category-a",
  },
  B: {
    label: "隣接競合",
    description: "障害者雇用支援・福祉周辺",
    color: "#F59E0B",
    bgClass: "bg-category-b",
  },
  C: {
    label: "SaaS競合",
    description: "福祉SaaS・システム競合",
    color: "#3B82F6",
    bgClass: "bg-category-c",
  },
  D: {
    label: "大手ヘルスケア",
    description: "大手介護・ヘルスケア企業",
    color: "#8B5CF6",
    bgClass: "bg-category-d",
  },
  E: {
    label: "非上場主要企業",
    description: "業界で存在感のある非上場企業",
    color: "#6B7280",
    bgClass: "bg-category-e",
  },
  F: {
    label: "テクノロジー参考",
    description: "DX・AI活用のベンチマーク企業",
    color: "#10B981",
    bgClass: "bg-category-f",
  },
};

// ============================================================
// 脅威レベル
// ============================================================

export const THREAT_LEVEL_CONFIG: Record<
  ThreatLevel,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  1: { label: "低", color: "#10B981", bgClass: "bg-emerald-500", textClass: "text-emerald-400" },
  2: { label: "やや低", color: "#6EE7B7", bgClass: "bg-emerald-400", textClass: "text-emerald-300" },
  3: { label: "中", color: "#F59E0B", bgClass: "bg-amber-500", textClass: "text-amber-400" },
  4: { label: "高", color: "#F87171", bgClass: "bg-red-400", textClass: "text-red-400" },
  5: { label: "最高", color: "#EF4444", bgClass: "bg-red-500", textClass: "text-red-500" },
};

// ============================================================
// 優先度ランク
// ============================================================

export const PRIORITY_RANK_CONFIG: Record<
  PriorityRank,
  { label: string; description: string; color: string }
> = {
  S: { label: "S", description: "最重点監視（四半期ごと）", color: "#EF4444" },
  A: { label: "A", description: "重点監視（半期ごと）", color: "#F59E0B" },
  B: { label: "B", description: "定期チェック（年次）", color: "#6B7280" },
  C: { label: "C", description: "参考モニタリング", color: "#4B5563" },
};

// ============================================================
// 企業ブランドカラー
// ============================================================

export const COMPANY_COLORS: Record<string, string> = {
  litalico: "#00A5E3",
  welbe: "#E85298",
  cocoruport: "#4CAF50",
  spool: "#FF6B35",
  sms: "#1E3A5F",
  persol: "#0066CC",
  pasona: "#003399",
  copel: "#FF9900",
  nd_software: "#2E7D32",
  kanamic: "#1565C0",
  sorust: "#7B1FA2",
  care21: "#C62828",
  saint_care: "#00695C",
  unimat: "#4E342E",
  medley: "#1A237E",
  visional: "#212121",
  recruit: "#FF0000",
  kaien: "#3F51B5",
  startline: "#009688",
};

// ============================================================
// 沿革カテゴリ
// ============================================================

export const HISTORY_CATEGORY_CONFIG: Record<
  HistoryCategory,
  { label: string; color: string; icon: string }
> = {
  founding: { label: "創業", color: "#3B82F6", icon: "Rocket" },
  ipo: { label: "上場", color: "#8B5CF6", icon: "TrendingUp" },
  ma: { label: "M&A", color: "#EF4444", icon: "Merge" },
  new_business: { label: "新規事業", color: "#10B981", icon: "Sparkles" },
  policy: { label: "制度対応", color: "#F59E0B", icon: "Scale" },
  management: { label: "経営変更", color: "#6B7280", icon: "Users" },
  milestone: { label: "マイルストーン", color: "#06B6D4", icon: "Flag" },
  expansion: { label: "拠点拡大", color: "#D97706", icon: "MapPin" },
};

// ============================================================
// 成長ドライバー
// ============================================================

export const GROWTH_DRIVER_CONFIG: Record<
  GrowthDriverType,
  { label: string; color: string }
> = {
  expansion: { label: "拠点拡大", color: "#D97706" },
  ma: { label: "M&A", color: "#EF4444" },
  technology: { label: "テクノロジー", color: "#8B5CF6" },
  platform: { label: "プラットフォーム", color: "#3B82F6" },
  new_domain: { label: "新領域", color: "#10B981" },
  efficiency: { label: "効率化", color: "#6B7280" },
};

// ============================================================
// トレンドカテゴリ
// ============================================================

export const TREND_CATEGORY_CONFIG: Record<
  TrendCategory,
  { label: string; color: string; icon: string }
> = {
  policy: { label: "政策・報酬改定", color: "#DC2626", icon: "Scale" },
  market: { label: "市場動向", color: "#F59E0B", icon: "TrendingUp" },
  technology: { label: "テクノロジー", color: "#8B5CF6", icon: "Cpu" },
  regulation: { label: "法規制", color: "#3B82F6", icon: "Shield" },
};

// ============================================================
// ノートテンプレート
// ============================================================

export const NOTE_TEMPLATE_CONFIG: Record<
  NoteTemplate,
  { label: string; description: string }
> = {
  earnings_analysis: { label: "決算分析", description: "四半期・通期決算の分析ノート" },
  midterm_plan_analysis: { label: "中計分析", description: "中期経営計画の分析ノート" },
  competitor_comparison: { label: "競合比較", description: "複数社の横串比較ノート" },
  free_form: { label: "自由記述", description: "テンプレートなしの自由記述" },
};

// ============================================================
// 企業詳細ページセクション
// ============================================================

export const MARKET_SECTIONS = [
  { id: "summary", label: "概要" },
  { id: "demand", label: "障害者人口" },
  { id: "employment", label: "障害者雇用" },
  { id: "recruitment", label: "採用方法" },
  { id: "facilities", label: "事業所数" },
  { id: "employment-policy", label: "雇用政策" },
  { id: "history", label: "制度沿革" },
  { id: "care-comparison", label: "介護比較" },
  { id: "international", label: "海外事例" },
  { id: "news", label: "ニュース" },
] as const;

export type FacilitySectionGroup = {
  groupId: string;
  groupLabel: string;
  groupColor: string;
  sections: readonly { id: string; label: string }[];
};

export const FACILITY_SECTION_GROUPS: readonly FacilitySectionGroup[] = [
  {
    groupId: "market",
    groupLabel: "市場系",
    groupColor: "#3B82F6",
    sections: [
      { id: "overview", label: "概要" },
      { id: "entities", label: "参入法人" },
      { id: "scale", label: "事業規模" },
      { id: "timeseries", label: "推移" },
      { id: "regional", label: "地域分布" },
    ],
  },
  {
    groupId: "history",
    groupLabel: "沿革系",
    groupColor: "#F59E0B",
    sections: [
      { id: "rewardHistory", label: "報酬改定の歴史" },
    ],
  },
  {
    groupId: "management",
    groupLabel: "経営系",
    groupColor: "#10B981",
    sections: [
      { id: "lifecycle", label: "事業ライフサイクル" },
      { id: "pl", label: "収支構造" },
      { id: "rewardTable", label: "報酬単位" },
      { id: "monthlyPL", label: "月次収支" },
      { id: "bonusFlow", label: "加算フロー" },
      { id: "bonuses", label: "加算一覧" },
    ],
  },
  {
    groupId: "operations",
    groupLabel: "業務プロセス理解",
    groupColor: "#8B5CF6",
    sections: [
      { id: "userJourney", label: "利用者フロー" },
      { id: "blueprint", label: "業務プロセス" },
      { id: "operations", label: "一日の流れ" },
      { id: "roles", label: "登場人物" },
      { id: "stakeholders", label: "関係者マップ" },
      { id: "conversations", label: "現場の声" },
    ],
  },
] as const;

// Flat list for backward compatibility
export const FACILITY_SECTIONS = FACILITY_SECTION_GROUPS.flatMap(
  (g) => g.sections
);

export const COMPANY_SECTIONS = [
  { id: "overview", label: "概要" },
  { id: "history", label: "沿革" },
  { id: "strategy", label: "事業戦略" },
  { id: "financial", label: "財務分析" },
  { id: "management", label: "経営分析" },
  { id: "business", label: "事業分析" },
  { id: "insights", label: "SMSへの示唆" },
] as const;

// ============================================================
// 用語集カテゴリ（学習サポートページ）
// ============================================================

export const GLOSSARY_CATEGORY_COLORS: Record<string, string> = {
  common: "#6B7280",
  retail: "#F59E0B",
  saas: "#3B82F6",
  recruitment: "#10B981",
  media: "#8B5CF6",
};

export const GLOSSARY_CATEGORY_ICONS: Record<string, string> = {
  common: "\u{1F6E1}\uFE0F",
  retail: "\u{1F3EA}",
  saas: "\u{1F4BB}",
  recruitment: "\u{1F91D}",
  media: "\u{1F310}",
};

// ============================================================
// インパクトレベル
// ============================================================

export const IMPACT_CONFIG: Record<
  "high" | "medium" | "low",
  { label: string; color: string; bgClass: string }
> = {
  high: { label: "大", color: "#EF4444", bgClass: "bg-red-500/20 text-red-400 border-red-500/30" },
  medium: { label: "中", color: "#F59E0B", bgClass: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { label: "小", color: "#10B981", bgClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};
