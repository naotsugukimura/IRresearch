import type {
  CompanyCategory,
  Quadrant,
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
      { href: "/facility/lifecycle", label: "事業所ライフサイクル" },
      { href: "/facility/flow", label: "利用フロー図" },
    ],
  },
  {
    href: "/company",
    label: "企業分析",
    icon: "Building2",
    children: [
      { href: "/company/chaos-map", label: "カオスマップ" },
      { href: "/company", label: "企業一覧" },
      { href: "/compare", label: "企業比較" },
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
// 4象限（業界×提供価値マトリクス）
// ============================================================

export interface QuadrantConfig {
  label: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
  purpose: string;
  industryAxis: string;
  valueAxis: string;
  /** この象限で知りたいこと（戦略的な情報ニーズ） */
  knowItems: string[];
  /** サービスカテゴリ（Q1: 人材紹介/SaaS/メディア、Q3: 介護/医療/SaaS 等） */
  subCategories: { label: string; description: string }[];
  /** この象限の企業を見る際の視点・問い */
  keyQuestions: string[];
}

export const QUADRANT_CONFIG: Record<Quadrant, QuadrantConfig> = {
  Q1: {
    label: "直接競合",
    slug: "direct-competitor",
    color: "#EF4444",
    icon: "Target",
    description: "障害福祉業界で同じサービスを提供している企業",
    purpose: "OPS・売上・人員体制まで深く知り、差別化ポイントを見つける",
    industryAxis: "同じ業界",
    valueAxis: "同じ価値",
    knowItems: [
      "売上・顧客数・利益率",
      "人員体制・組織構成",
      "広告の出し方・営業手法",
      "サポート体制・お客さんの声",
      "ビジネスモデル（ステークホルダー×サービスのやり取り）",
    ],
    subCategories: [
      { label: "人材紹介", description: "dodaチャレンジ、atGP等 — 支援員・障害者雇用枠の両面" },
      { label: "SaaS", description: "のうびー、HUG、NDソフト等 — 福祉事業所向けソフトウェア" },
      { label: "メディア", description: "リタリコ仕事ナビ等 — 求職者・事業所マッチング" },
    ],
    keyQuestions: [
      "自社と同じ市場で、どの企業がどれだけシェアを持っているか？",
      "競合のOPS（営業→受注→サポート）はどう設計されているか？",
      "差別化の余地はどこにあるか？",
    ],
  },
  Q2: {
    label: "市場探索",
    slug: "market-explorer",
    color: "#F59E0B",
    icon: "Compass",
    description: "障害福祉業界で異なる価値を提供している企業",
    purpose: "事業開発として新市場を発見し、参入機会を評価する",
    industryAxis: "同じ業界",
    valueAxis: "異なる価値",
    knowItems: [
      "誰の・何のニーズに刺しているか",
      "市場規模（TAM/SAM/SOM）",
      "ビジネスモデル（課金モデル/顧客セグメント/チャネル）",
      "参入障壁と成功要因",
    ],
    subCategories: [
      { label: "事業所向け", description: "キモチプラス、Lean on Me、AI支援さん、ファクタリング、コンサルFC" },
      { label: "企業向け", description: "エスプール（サテライトオフィス・農園）等" },
      { label: "独自路線", description: "ヘラルボニー、ローランズ等 — 新しい障害福祉の形" },
    ],
    keyQuestions: [
      "この市場にSMS/AIBPOが参入する余地はあるか？",
      "顧客は誰で、どんなペインを持っているか？",
      "既存の自社アセットを活かせるか？",
    ],
  },
  Q3: {
    label: "OPS深化",
    slug: "ops-deepdive",
    color: "#3B82F6",
    icon: "Cog",
    description: "異なる業界で同じ価値（SaaS・人材・メディア）を提供している企業",
    purpose: "介護・保育・医療等の隣接業界から運営ノウハウを学ぶ",
    industryAxis: "異なる業界",
    valueAxis: "同じ価値",
    knowItems: [
      "組織運営のやり方・OPSの作り方",
      "事業立ち上げから現在の土俵を築くまでの変遷",
      "市場規模と業界内の勢力図",
      "ホリゾンタル/バーティカルSaaSの戦略",
    ],
    subCategories: [
      { label: "介護", description: "SMS、ケア21、ツクイ、ニチイ等 — 準市場の先輩" },
      { label: "医療", description: "エムスリー、JMDC、メドレー等 — プラットフォーム型" },
      { label: "SaaS", description: "freee、サイボウズ等 — ホリゾンタルSaaSの成功モデル" },
      { label: "HR/メディア", description: "リクルート等 — メディア×HRの大規模運営" },
    ],
    keyQuestions: [
      "隣接業界で成功しているOPSモデルは、障害福祉に転用できるか？",
      "事業規模をスケールさせた企業は、どの段階で何をしたか？",
      "業界別の市場構造（寡占 vs 分散）はどうなっているか？",
    ],
  },
  Q4: {
    label: "技術キャッチアップ",
    slug: "tech-catchup",
    color: "#8B5CF6",
    icon: "Zap",
    description: "異なる業界で異なる価値を提供しているが、技術面で参考にしたい企業",
    purpose: "AIBPO時代に備え、AI/DXの最新技術をキャッチアップする",
    industryAxis: "異なる業界",
    valueAxis: "異なる価値",
    knowItems: [
      "どのAI/DX技術を採用しているか",
      "技術をどうビジネスに変えているか",
      "自社（SMS/AIBPO）への適用可能性",
    ],
    subCategories: [
      { label: "AI/BPO", description: "LayerX、AI inside等 — AIを事業の中核に据えた企業" },
      { label: "営業AI", description: "営業プロセスをAIで変革する企業" },
      { label: "EdTech", description: "Aidemy、atama plus等 — 学習・教育のDX" },
    ],
    keyQuestions: [
      "AIBPOが到来する中で、何の技術を最優先でキャッチアップすべきか？",
      "この技術を障害福祉の文脈に当てはめるとどう使えるか？",
      "技術導入のROIはどの程度か？",
    ],
  },
};

export const QUADRANT_SLUG_MAP: Record<string, Quadrant> = {
  "direct-competitor": "Q1",
  "market-explorer": "Q2",
  "ops-deepdive": "Q3",
  "tech-catchup": "Q4",
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

export type SectionGroup = {
  groupId: string;
  groupLabel: string;
  groupColor: string;
  sections: readonly { id: string; label: string }[];
};

/** @deprecated Use SectionGroup instead */
export type FacilitySectionGroup = SectionGroup;

export const MARKET_SECTION_GROUPS: readonly SectionGroup[] = [
  {
    groupId: "overview",
    groupLabel: "市場概況",
    groupColor: "#3B82F6",
    sections: [
      { id: "summary", label: "概要" },
      { id: "demand", label: "障害者人口" },
      { id: "facilities", label: "事業所数" },
    ],
  },
  {
    groupId: "employment",
    groupLabel: "雇用",
    groupColor: "#10B981",
    sections: [
      { id: "employment", label: "雇用推移" },
      { id: "recruitment", label: "採用方法" },
      { id: "employment-policy", label: "法定雇用率" },
    ],
  },
  {
    groupId: "system",
    groupLabel: "制度",
    groupColor: "#F59E0B",
    sections: [
      { id: "history", label: "制度沿革" },
      { id: "care-comparison", label: "介護比較" },
    ],
  },
  {
    groupId: "trends",
    groupLabel: "動向",
    groupColor: "#8B5CF6",
    sections: [
      { id: "news", label: "ニュース" },
      { id: "industry-trends", label: "業界トレンド" },
    ],
  },
];

export const FACILITY_SECTION_GROUPS: readonly SectionGroup[] = [
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
      { id: "pl", label: "収支構造" },
      { id: "monthlyPL", label: "月次収支" },
      { id: "lifecycle", label: "事業ライフサイクル" },
      { id: "rewardTable", label: "報酬単位" },
      { id: "bonuses", label: "加算一覧" },
    ],
  },
  {
    groupId: "operations",
    groupLabel: "業務プロセス理解",
    groupColor: "#8B5CF6",
    sections: [
      { id: "roles", label: "登場人物" },
      { id: "dailyFlow", label: "一日の流れ" },
      { id: "blueprint", label: "業務プロセス" },
      { id: "detailedProcess", label: "詳細業務マップ" },
      { id: "userJourney", label: "利用者フロー" },
      { id: "stakeholders", label: "関係者マップ" },
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
