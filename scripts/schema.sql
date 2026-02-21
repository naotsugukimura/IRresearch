-- ============================================================
-- IRkun Supabase スキーマ
-- Supabase SQL Editor にコピペして実行
-- ============================================================

-- 企業マスタ
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  stock_code TEXT,
  market TEXT,
  category TEXT NOT NULL,
  priority_rank TEXT NOT NULL,
  founded TEXT,
  headquarters TEXT,
  ceo TEXT,
  employee_count INT,
  mission TEXT,
  description TEXT NOT NULL,
  main_services JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  threat_level INT NOT NULL,
  monitoring_reason TEXT NOT NULL,
  ir_url TEXT,
  official_url TEXT,
  brand_color TEXT NOT NULL,
  has_full_data BOOLEAN NOT NULL DEFAULT false,
  last_updated TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 企業セグメント
CREATE TABLE IF NOT EXISTS company_segments (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  revenue_share NUMERIC NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(company_id, name)
);

-- 財務データ（年度別）
CREATE TABLE IF NOT EXISTS fiscal_years (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  revenue NUMERIC,
  operating_profit NUMERIC,
  ordinary_profit NUMERIC,
  net_income NUMERIC,
  operating_margin NUMERIC,
  roe NUMERIC,
  employees INT,
  facilities INT,
  users INT,
  revenue_per_employee NUMERIC,
  UNIQUE(company_id, year)
);

-- セグメント別財務
CREATE TABLE IF NOT EXISTS segment_financials (
  id SERIAL PRIMARY KEY,
  fiscal_year_id INT NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  revenue NUMERIC NOT NULL,
  profit NUMERIC
);

-- 事業計画PL
CREATE TABLE IF NOT EXISTS business_plans (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  segment_id TEXT,
  segment_name TEXT
);

-- segment_idがある場合のユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS uq_business_plans_with_segment
  ON business_plans (company_id, segment_id)
  WHERE segment_id IS NOT NULL;

-- segment_idがNULL（全社統合）の場合のユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS uq_business_plans_no_segment
  ON business_plans (company_id)
  WHERE segment_id IS NULL;

-- PLセクション
CREATE TABLE IF NOT EXISTS plan_sections (
  id SERIAL PRIMARY KEY,
  business_plan_id INT NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- PL行データ
CREATE TABLE IF NOT EXISTS plan_rows (
  id SERIAL PRIMARY KEY,
  plan_section_id INT NOT NULL REFERENCES plan_sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  "values" JSONB NOT NULL,
  annual NUMERIC,
  note TEXT,
  unit TEXT,
  is_monetary BOOLEAN DEFAULT false,
  is_percent BOOLEAN DEFAULT false,
  is_bold BOOLEAN DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

-- 沿革イベント
CREATE TABLE IF NOT EXISTS history_events (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sms_implication TEXT
);

-- 中期計画
CREATE TABLE IF NOT EXISTS midterm_plans (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  target_revenue NUMERIC,
  target_operating_profit NUMERIC,
  target_facilities INT,
  target_description TEXT NOT NULL,
  previous_plan_comparison TEXT
);

-- 重点施策
CREATE TABLE IF NOT EXISTS key_strategies (
  id SERIAL PRIMARY KEY,
  midterm_plan_id INT NOT NULL REFERENCES midterm_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  growth_driver TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 競争優位性
CREATE TABLE IF NOT EXISTS competitive_advantages (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  differentiators JSONB NOT NULL DEFAULT '[]',
  barriers JSONB NOT NULL DEFAULT '[]',
  risks JSONB NOT NULL DEFAULT '[]',
  sms_threat_level INT,
  sms_learn_from TEXT,
  sms_watch_for TEXT,
  sms_counter_strategy TEXT
);

-- 業界トレンド
CREATE TABLE IF NOT EXISTS industry_trends (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  sources JSONB DEFAULT '[]'
);

-- トレンド企業影響
CREATE TABLE IF NOT EXISTS trend_company_impacts (
  id SERIAL PRIMARY KEY,
  trend_id TEXT NOT NULL REFERENCES industry_trends(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  impact TEXT NOT NULL,
  note TEXT NOT NULL,
  UNIQUE(trend_id, company_id)
);

-- 分析ノート
CREATE TABLE IF NOT EXISTS analysis_notes (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  template TEXT NOT NULL,
  related_companies JSONB NOT NULL DEFAULT '[]',
  related_trends JSONB DEFAULT '[]',
  content TEXT NOT NULL,
  key_takeaways JSONB NOT NULL DEFAULT '[]'
);

-- 用語集（JSONB一括格納）
CREATE TABLE IF NOT EXISTS glossary (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL
);

-- ★ 決算説明資料（PDFメタデータ）
CREATE TABLE IF NOT EXISTS earnings_documents (
  id SERIAL PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_period TEXT,
  source_url TEXT,
  file_name TEXT NOT NULL,
  file_size_mb NUMERIC,
  downloaded_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ★ AI分析結果
CREATE TABLE IF NOT EXISTS earnings_insights (
  id SERIAL PRIMARY KEY,
  document_id INT NOT NULL REFERENCES earnings_documents(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
