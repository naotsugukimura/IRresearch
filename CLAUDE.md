# IRkun — 障害福祉業界 競合IR分析ダッシュボード

## 概要
82社の障害福祉・介護・HR・医療DX・SaaS競合企業のIR情報を分析するNext.js静的サイト。
Vercelにデプロイして使用（`output: "export"`）。

## 技術スタック
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + recharts
- **フォント**: Noto Sans JP + JetBrains Mono（数値表示用）
- **カラー**: OKLch色空間、ダークモード固定（`html.dark`）
- **Python**: EDINET API / IR PDFスクレイピング / Supabase DB（`scripts/`）
- **DB**: Supabase（PostgreSQL）— DBファースト、静的エクスポート維持

## ディレクトリ構成
```
app/                    # ページ（7ページ）
  page.tsx              # ダッシュボード（/）
  company/[id]/page.tsx # 企業詳細（82社分SSG）
  compare/page.tsx      # 企業比較
  learn/page.tsx        # 学習サポート（用語集）
  trends/page.tsx       # 業界トレンド
  notes/page.tsx        # 分析ノート
components/
  company/              # 企業詳細の各セクション
  plan/                 # 事業計画PL（SummaryCards, PlChart, MonthlyTable）
  dashboard/            # ダッシュボードKPI
  compare/              # 比較テーブル・チャート
  trends/               # トレンド表示
  layout/               # Sidebar, Breadcrumb, PageHeader
  shared/               # 再利用コンポーネント（Badge系）
  ui/                   # shadcn/ui基本部品
lib/
  types.ts              # 全型定義（セクション区切りコメント付き）
  data.ts               # JSONデータ読み込み関数群
  utils.ts              # フォーマッタ（formatCurrency/formatPlanCurrency）
  constants.ts          # 全定数（カテゴリ色、脅威レベル、ナビ項目等）
data/                   # 全データJSON（companies, financials, business-plans等）
scripts/                # Python — DB管理 / EDINET / IRスクレイパー
```

## 重要な型
```typescript
// 企業（companies.json）
Company { id, name, category: A-F, segments?, brandColor, hasFullData }

// 事業計画PL（business-plans.json）
CompanyBusinessPlan { companyId, segmentId?, segmentName?, sections: PlanSection[] }
PlanSection { title, rows: PlanRow[] }
PlanRow { label, values: number[12], annual, isMonetary?, isPercent?, isBold? }

// 財務（financials.json）— 単位: 百万円
CompanyFinancials { companyId, fiscalYears: FiscalYear[] }
```

## セグメント別PL
- 28社・71セグメントのPLを保持（business-plans.json: 99プラン）※82社中28社にPLデータあり
- `getBusinessPlanByCompanyId()` → 全社合算PL（segmentIdなし）
- `getBusinessPlansByCompanyId()` → 全プラン（全社合算 + セグメント別）
- `BusinessPlanSection` がタブUIで切替

## Supabase DB（2026-02-21導入）

### アーキテクチャ
```
Pythonスクリプト → Supabase DB（単一ソースオブトゥルース）
                       ↓
                 export_json.py
                       ↓
                 /data/*.json（既存と同一形式）
                       ↓
                 next build → Vercel
```

### スキーマ（18テーブル）
`scripts/schema.sql` — Supabase SQL Editorで実行済み

| テーブル | 対応JSON | レコード数 |
|---------|----------|-----------|
| `companies` | companies.json | 82 |
| `company_segments` | companies.json > segments | ~70 |
| `fiscal_years` | financials.json | 140 |
| `segment_financials` | financials.json > segments | ~200 |
| `business_plans` | business-plans.json | 99 |
| `plan_sections` | → sections | ~200 |
| `plan_rows` | → rows | ~3000 |
| `history_events` | histories.json | 52 |
| `midterm_plans` | strategies.json | 7 |
| `key_strategies` | → keyStrategies | ~20 |
| `competitive_advantages` | competitive-advantages.json | 5 |
| `industry_trends` | trends.json | 10 |
| `trend_company_impacts` | → impactByCompany | ~40 |
| `analysis_notes` | notes.json | 5 |
| `glossary` | glossary.json（JSONB一括） | 1 |
| `earnings_documents` | earnings-insights/*.json | 12（5社分） |
| `earnings_insights` | earnings-insights/*.json | ~50 |

### Pythonスクリプト（DB関連）
- `scripts/db.py` — httpxでPostgREST API直接叩く（supabase SDK不使用 ← Python 3.14非対応のため）
  - `upsert_*()` 関数群 + `export_*_json()` 関数群 + `_write_json()`
  - バッチINSERT対応済み（plan_rows, history_events等）
- `scripts/migrate_to_supabase.py` — 既存JSON→DB移行（冪等、実行済み）
- `scripts/export_json.py` — DB→JSON出力（`python export_json.py` / `--only companies`）
- `scripts/schema.sql` — テーブル定義（Supabase SQL Editorで実行済み）
- `scripts/config.py` — `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` を環境変数から読み込み

### 環境変数（scripts/.env）
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...（service_role key）
EDINET_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 重要な設計判断
- **business_plans**: partial unique index（segment_id NULLとnon-NULLで別制約）
- **JSONBフィールド**: main_services, tags, strengths等は `json.dumps()` で格納
- **httpx直接**: supabase Python SDKはPython 3.14でpyicebergビルド失敗 → httpxでPostgREST直接
- **Next.js側変更なし**: `lib/data.ts` はJSON importのまま

## ★ Phase 3 完了（2026-02-21）: 既存スクリプトのDB書き込み対応

全4スクリプトをJSON直接書き込みからSupabase DB経由に変更済み:
- `fetch_financials.py` — `upsert_fiscal_year()` + `update_company_has_full_data()`
- `generate_all_company_data.py` — `upsert_company_segments()` + `upsert_fiscal_year()` + `upsert_business_plan()`
- `generate_segment_plans.py` — `upsert_business_plan()`
- `earnings_analyzer.py` — `insert_earnings_document()` + `insert_earnings_insight()`

共通: `--export-json` フラグでDB書き込み後にJSONエクスポートも可能

## ★ Phase 4 進行中（2026-02-21）: IRクローリング + AI分析 + 82社拡大

### 完了
- **企業数拡大**: 28社 → 82社（障害福祉/介護/HR/医療DX/SaaS/AI/EdTech）
  - M3, クベル, E-well等のユーザー指定企業を含む
  - `data/companies_additional_52.json` に追加分のバックアップ
- **IR URL設定**: 14社に`irUrl`を設定（既存5社 + 新規9社）
  - spool: `/ir/` → `/investor/`、recruit: `.co.jp` → `.com`、welbe: `corporate.welbe.co.jp`に修正
- **ir_scraper.py改善**: SSL回避、サブページ探索強化（URLパス+テキストマッチ）、緩和キーワード
- **AI分析**: 5社12件のPDF → Claude API分析 → DB + JSON保存完了
  - litalico(3), sms(2), persol(3), pasona(1), visional(3)
  - `data/earnings-insights/{company_id}.json` に出力

### 課題
- 多くのIRサイトがJS動的ロードのためBeautifulSoupでPDF取れない
- Playwright等のブラウザ自動化が必要（未実装）

### ★ 次にやること（Phase 5）

### Phase 5: Next.js UI — 決算インサイト表示
1. `lib/types.ts` に `EarningsInsight` 型追加
2. `lib/data.ts` に `getEarningsInsights()` 追加
3. 企業詳細ページに「決算資料インサイト」セクション追加
4. KPI/市場規模/M&A情報のカード表示

## recharts動的読み込みパターン
recharts使用コンポーネントは全てSSR無効化済み:
- `FinancialCharts` → `FinancialChartsInner`（dynamic, ssr:false）
- `SegmentPieChart` → `SegmentPieChartInner`
- `PlChart` → `PlChartInner`
- `KpiComparisonChart` → `KpiComparisonChartInner`
- `MarketSizeChart` → `MarketSizeChartInner`

## 金額フォーマッタの使い分け
- `formatCurrency(value, "million")` — 財務データ用（百万円単位）
- `formatPlanCurrency(value)` — 事業計画用（円単位 → 万/億に変換）
- `formatCurrencyDetail(value)` — 月次テーブル用（¥付き円表示）

## セマンティックカラー（globals.css .dark）
- `--profit`: 利益（緑系 oklch）→ `text-profit`, `bg-profit`
- `--cost`: コスト（赤系）→ `text-cost`
- `--bep`: 損益分岐点（金色）→ `text-bep`, `bg-bep`
- `--phase-invest/growth/stable`: PLチャートフェーズ背景

## Pythonスクリプト（scripts/）
- `config.py` — 設定・企業マッピング（COMPANY_MAP: 17社の証券コード）
- `db.py` — Supabase PostgREST httpxクライアント（upsert_* + export_*_json）
- `edinet_client.py` — EDINET API v2クライアント（SSLリトライ付き）
- `fetch_financials.py` — 有報から財務データ取得→DB投入 (`--export-json`)
- `generate_all_company_data.py` — 23社データ一括生成→DB投入 (`--export-json`)
- `generate_segment_plans.py` — セグメント別PL生成→DB投入 (`--export-json`)
- `ir_scraper.py` — IRページから決算説明資料PDFリンク抽出
- `pdf_downloader.py` — PDFダウンロード管理
- `earnings_analyzer.py` — Claude APIでPDF分析→DB投入（KPI/TAM/M&A抽出）
- `fetch_earnings.py` — 決算説明資料パイプラインオーケストレータ
- `export_json.py` — DB→JSON出力（全テーブル + earnings-insights企業別）
- `migrate_to_supabase.py` — 既存JSON→DB移行（冪等）

## ビルド & デプロイ
```bash
npm run dev      # ローカル開発（Turbopack）
npm run build    # 静的エクスポート（out/）
# Vercelにpushでデプロイ

# DB操作（全スクリプトがDB経由）
python scripts/generate_all_company_data.py --export-json   # 23社データ生成
python scripts/generate_segment_plans.py --export-json      # セグメントPL生成
python scripts/fetch_financials.py --export-json            # EDINET財務データ取得
python scripts/fetch_earnings.py --all                      # 決算説明資料 取得→分析
python scripts/export_json.py                               # DB→JSON全出力
python scripts/export_json.py --only companies              # 特定テーブルのみ
```
