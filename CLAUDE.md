# IRkun — 障害福祉業界 競合IR分析ダッシュボード

## 概要
35社の障害福祉サービス競合企業のIR情報を分析するNext.js静的サイト。
Vercelにデプロイして使用（`output: "export"`）。

## 技術スタック
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + recharts
- **フォント**: Noto Sans JP + JetBrains Mono（数値表示用）
- **カラー**: OKLch色空間、ダークモード固定（`html.dark`）
- **Python**: EDINET API / IR PDFスクレイピング（`scripts/`）

## ディレクトリ構成
```
app/                    # ページ（7ページ）
  page.tsx              # ダッシュボード（/）
  company/[id]/page.tsx # 企業詳細（35社分SSG）
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
scripts/                # Python EDINET / IRスクレイパー
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
- LITALICOは3セグメント（就労支援/児童支援/プラットフォーム）のPLを持つ
- `getBusinessPlanByCompanyId()` → 全社合算PL（segmentIdなし）
- `getBusinessPlansByCompanyId()` → 全プラン（全社合算 + セグメント別）
- `BusinessPlanSection` がタブUIで切替

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
- `config.py` — 設定・企業マッピング（IRkun ID → 証券コード）
- `edinet_client.py` — EDINET API v2クライアント（SSLリトライ付き）
- `fetch_financials.py` — 有報から財務データ取得→financials.json更新
- `ir_scraper.py` — IRページから決算説明資料PDFリンク抽出
- `pdf_downloader.py` — PDFダウンロード管理
- `earnings_analyzer.py` — Claude APIでPDF分析（KPI/TAM/M&A抽出）
- `fetch_earnings.py` — パイプラインオーケストレータ
- 環境変数: `EDINET_API_KEY`, `ANTHROPIC_API_KEY`

## ビルド & デプロイ
```bash
npm run dev      # ローカル開発（Turbopack）
npm run build    # 静的エクスポート（out/）
# Vercelにpushでデプロイ
```
