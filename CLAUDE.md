# IRkun — 障害福祉業界 競合IR分析ダッシュボード

## 概要
82社の障害福祉・介護・HR・医療DX・SaaS競合企業のIR情報を分析するNext.js静的サイト。
Vercelにデプロイして使用（`output: "export"`）。

## 開発方針（★重要）
- **「まず1つ作って → フィードバック → 良かったら横展開」の流れ**
  - 事業所分析: まず**放課後デイ**で先行実装 → フィードバック → 全19サービスに展開
  - 企業分析（上場）: まず**リタリコ**で深掘り → フィードバック → 他社に展開
  - 企業分析（非上場）: まず**Kaien**で作成 → フィードバック → 他24社に展開
- ダッシュボードは「事業所」「利用者」「企業」の3軸で構成
- 新機能は必ず代表的な1つで先行実装し、OKが出てから横展開する

## 技術スタック
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + recharts
- **フォント**: Noto Sans JP + JetBrains Mono（数値表示用）
- **カラー**: OKLch色空間、ダークモード固定（`html.dark`）
- **Python**: EDINET API / IR PDFスクレイピング / Supabase DB（`scripts/`）
- **DB**: Supabase（PostgreSQL）— DBファースト、静的エクスポート維持

## ディレクトリ構成
```
app/                    # ページ（27ページ）
  page.tsx              # ダッシュボード（/）
  market/page.tsx       # 総合ダッシュボード（/market）
  facility/page.tsx     # 事業所分析インデックス（/facility） — 4カテゴリ19サービス
  facility/houkago-day/ # 放課後等デイサービス
  facility/jidou-hattatsu/ # 児童発達支援
  facility/iryougata-jidou/ # 医療型児童発達支援
  facility/kyotaku-houmon/ # 居宅訪問型児童発達支援
  facility/hoikusho-houmon/ # 保育所等訪問支援
  facility/group-home/  # 共同生活援助（GH）
  facility/jiritsu-seikatsu/ # 自立生活援助
  facility/kinou-kunren/ # 自立訓練（機能訓練）
  facility/seikatsu-kunren/ # 自立訓練（生活訓練）
  facility/shukuhaku-kunren/ # 宿泊型自立訓練
  facility/shurou-ikou/ # 就労移行支援
  facility/shurou-a/    # 就労継続支援A型
  facility/shurou-b/    # 就労継続支援B型
  facility/shurou-teichaku/ # 就労定着支援
  facility/chiiki-ikou/ # 地域移行支援
  facility/chiiki-teichaku/ # 地域定着支援
  facility/keikaku-soudan/ # 計画相談支援
  facility/shougaiji-soudan/ # 障害児相談支援
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
  market/               # 総合ダッシュボード（MarketKpiCards, PopulationChart, EmploymentChart等）
  facility/             # 事業所分析（FacilityDetailPage, EntityDistribution, DailyTimeline, PLWaterfall, MonthlyPLTable等）
  layout/               # Sidebar, Breadcrumb, PageHeader
  shared/               # 再利用コンポーネント（Badge系）
  ui/                   # shadcn/ui基本部品
lib/
  types.ts              # 全型定義（セクション区切りコメント付き）
  data.ts               # JSONデータ読み込み関数群
  utils.ts              # フォーマッタ（formatCurrency/formatPlanCurrency）
  constants.ts          # 全定数（カテゴリ色、脅威レベル、ナビ項目等）
data/                   # 全データJSON（companies, financials, business-plans等）
  market-overview.json  # 障害者人口・雇用・事業所数時系列 + ニュース + 採用方法
  facility-analysis/    # 事業所分析（全18サービス種別のJSON）
    houkago-day.json, jidou-hattatsu.json, iryougata-jidou.json,
    kyotaku-houmon.json, hoikusho-houmon.json, group-home.json,
    jiritsu-seikatsu.json, kinou-kunren.json, seikatsu-kunren.json,
    shukuhaku-kunren.json, shurou-ikou.json, shurou-a.json,
    shurou-b.json, shurou-teichaku.json, chiiki-ikou.json,
    chiiki-teichaku.json, keikaku-soudan.json, shougaiji-soudan.json
  web-research.json     # 非上場企業Webリサーチ（全社集約）
  web-research/         # 非上場企業Webリサーチ（企業別JSON）
scripts/                # Python — DB管理 / EDINET / IRスクレイパー / Tavilyリサーチ
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

### スキーマ（19テーブル）
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
| `company_web_research` | web-research/*.json | 1（テスト） |

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

## ★ Phase 4 完了（2026-02-21）: IRクローリング + AI分析 + 82社拡大

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

## ★ Phase 5 完了（2026-02-21）: 決算インサイトUI + 収益構造分析 + エリア分析

### Phase 5a: 決算インサイトUI
- `EarningsInsightsSection.tsx` — アコーディオンUIでKPI/市場規模/M&A/中計を表示
- `data/earnings-insights.json` — 5社分の決算分析結果を統合
- 型: `CompanyEarningsInsights`, `EarningsDocument` 等

### Phase 5b: 収益構造分析（3チャート）
- `ProfitStructureSection.tsx` / `ProfitStructureInner.tsx` — dynamic import
  1. **コスト構造ウォーターフォール**: 売上→原価→粗利→人件費→広告費→その他→営業利益
  2. **セグメント収益性比較**: 横棒グラフで売上・粗利率・営業利益率
  3. **収益ドライバー分析**: KPI×単価テーブル（売上÷KPIで単価算出）
- ヘルパー: `extractPLMetrics(plan)`, `extractRevenueDrivers(plan)`

### Phase 5c: WAMNETエリア分析
- `scripts/analyze_wamnet.py` — WAMNETオープンデータ(2025年9月版)からCSVダウンロード＆分析
  - 就労移行支援/児童発達支援/放課後等デイサービスの3サービス
  - リタリコの都道府県別施設数・市場シェアを算出
  - **339施設を23都道府県で検出**
- `data/litalico-area-analysis.json` — 分析結果JSON
- `AreaAnalysisSection.tsx` / `AreaAnalysisInner.tsx` — dynamic import
  1. **サマリーカード**: 全サービス合計+サービス別施設数・シェア
  2. **都道府県別棒グラフ**: サービスフィルタ切替、スタック棒、シェアランキング
  3. **サービス別内訳**: 都道府県×サービス積み上げ棒
  4. **事業所一覧テーブル**: サービス・都道府県フィルタ付き、339件スクロール
- 型: `CompanyAreaAnalysis`, `AreaServiceData`, `AreaPrefectureData`, `AreaFacility`

## ★ Phase 6 完了（2026-02-21）: 総合ダッシュボード + 事業所分析

### Phase 6a: 総合ダッシュボード `/market`
- `data/market-overview.json` — 障害者人口・雇用・事業所数時系列・ニュース・採用方法・福祉史・介護比較・海外事例・法定雇用率推移・政策変更
- `MarketKpiCards.tsx` — 4枚KPIカード（障害者数/雇用数/事業所数/法定雇用率）
- `DisabilityPopulationChart.tsx` / `Inner` — LineChart 3線（身体/知的/精神障害）
- `EmploymentTrendsChart.tsx` / `Inner` — ComposedChart（棒: 雇用者数 + 線: 実雇用率/法定雇用率）
- `FacilityCountChart.tsx` / `Inner` — StackedBarChart（9サービス種類別、フィルタ切替）
- `RecruitmentBreakdown.tsx` / `Inner` — PieChart + 説明カード（AGT/HW/移行/農園 etc.）
- `MarketNewsFeed.tsx` — ニュースカードリスト（カテゴリフィルタ）

### Phase 6b: 事業所分析 `/facility/houkago-day`
- `data/facility-analysis/houkago-day.json` — 放課後デイ: 法人分布・推移・PL・加算・運営ストーリー
- `app/facility/page.tsx` — サービス種類インデックス（6種類、放課後デイのみactive）
- `FacilityKpiCards.tsx` — 4枚KPI（事業所数/成長率/利用者数/民間比率）
- `EntityDistributionChart.tsx` / `Inner` — BarChart + PieChart（法人格別: 株式会社54.9%が最多）
- `OperatorScaleChart.tsx` / `Inner` — BarChart（単体65.9%/2-5/6-10/11+）
- `FacilityGrowthChart.tsx` / `Inner` — 2タブ: 法人格別StackedArea + 事業所数×利用者数ComposedChart + 報酬改定ReferenceLine
- `DailyTimeline.tsx` — 展開可能タイムライン（会話・雰囲気付き、serviceType動的タイトル）
- `RoleDiagram.tsx` — 展開可能アコーディオン（年収/求人倍率/キャリアパス/想い/悩み）
- `StakeholderMap.tsx` — 7関係者の展開可能カード（本音・関わり方表示）
- `ConversationCards.tsx` — 6シーン（保護者面談/スタッフMTG/関係機関/日次連絡/担当者会議/行政指導）+ 会話サンプル展開
- `PLWaterfall.tsx` / `Inner` — 売上BarChart + コストPieChart（年間約2,256万円）
- `BonusTable.tsx` — 主要加算10個アコーディオン（カテゴリフィルタ/難易度/売上寄与バッジ/取得要件ガイド展開）
- `MonthlyPLTable.tsx` — 12ヶ月月次PL表（折りたたみセクション/スパークライン/年次合計）
- 型: `MarketOverviewData`, `FacilityAnalysisData`, `MonthlyPL` + 多数のサブ型

## ★ Phase 7 完了（2026-02-21）: 企業一覧テーブル化 + 詳細ページ再編
- 企業一覧: カードグリッド → ソート可能テーブル（セグメント/時価総額/売上/営業利益率/動向）
- 詳細ページ: 概要→沿革→事業戦略→財務分析→経営分析→事業分析→SMSへの示唆
- `SectionNav` 汎用化（props `sections?` で任意セクション受付可能）
- `Company` 型拡張: `marketCap?`（億円）, `recentTrend?`（直近の動向）
- `lib/data.ts`: `getLatestFiscalYear()` + `getFinancialsMap()` ヘルパー追加

## ★ Phase 8 完了（2026-02-22）: 全19サービス事業所分析 + KPI改善

### Phase 8a: 全サービス事業所分析展開
- 障害福祉全19サービス種（18JSON + 放課後デイ既存）の事業所分析を一括生成
  - **障害児通所系（5）**: 放課後デイ/児童発達支援/医療型/居宅訪問型/保育所等訪問
  - **居住系（2）**: 共同生活援助(GH)/自立生活援助
  - **訓練・就労系（7）**: 機能訓練/生活訓練/宿泊型/就労移行/A型/B型/就労定着
  - **相談系（4）**: 地域移行/地域定着/計画相談/障害児相談
- 各サービスに完備: 法人分布/事業規模/推移時系列/運営ストーリー/PL概要/月次PL/加算一覧
- `FacilityDetailPage.tsx` — 共通レイアウトコンポーネント化（各ページ→7行に簡素化）
- `app/facility/page.tsx` — カテゴリ別4セクション×19サービス全リンク（Coming Soonなし）
- `lib/data.ts` — FACILITY_DATA に全18サービスコード登録
- 生成スクリプト: `scripts/generate_facility_json.py`, `generate_facility_json_part2.py`, `generate_facility_pages.py`

### Phase 8b: KPI改善（3つの提案を実装）
1. **出典・更新日の明記**: MarketKpiCards, FacilityKpiCards のカード下部に出典と最終更新日を表示
2. **スパークライン追加**: KPIカードの背景にSVGスパークライン（10年推移の薄い折れ線グラフ）
3. **ドリルダウン導線**: MarketKpiCards「障害福祉事業所数」カードをクリック→`/facility`へ遷移

## ★ Phase 9a 完了（2026-02-22）: Tavily Search APIによる非上場企業Webリサーチ

### 概要
82社中25社の非上場企業にはIR/EDINET情報がないため、Tavily Search APIでWeb公開情報を自動収集→Claude APIで構造化分析するパイプラインを構築。

### 新規ファイル
- `scripts/tavily_research.py` — Tavily検索→Claude分析→JSON/DB保存
  - CLI: `--company kaien`, `--all-private`, `--type business_overview,funding`, `--export-json`, `--no-db`
  - 4リサーチタイプ: business_overview / funding / news / competitive
  - 25社の非上場企業ID一覧 (PRIVATE_COMPANY_IDS)
  - Tavily `search_depth="advanced"` (2クレジット/回、月1,000無料枠)
- `components/company/WebResearchSection.tsx` — 4タブUI
  - 信頼度バッジ（high=緑/medium=黄/low=赤）
  - BusinessOverview / FundingInfo / NewsList / CompetitiveAnalysis サブコンポーネント
  - ソースURL折りたたみ表示
- `data/web-research.json` — 全社集約JSON（data.tsから読み込み）
- `data/web-research/{company_id}.json` — 企業別JSON

### 変更ファイル
- `scripts/schema.sql` — `company_web_research` テーブル追加（※Supabase SQL Editor未実行）
- `scripts/db.py` — `upsert_company_web_research()` + `export_web_research_json()` 追加
- `scripts/export_json.py` — web-research エクスポート追加
- `lib/types.ts` — `WebResearchData`, `WebResearchEntry` 型追加
- `lib/data.ts` — `getWebResearch()` 関数 + web-research.json import 追加
- `app/company/[id]/page.tsx` — 非fullData企業にWebResearchSection表示、fullData企業にも事業分析セクションに表示

### 環境変数（scripts/.env に追加）
```
TAVILY_API_KEY=tvly-...
```

### API利用量
- 25社 × 4タイプ = 100検索 × 2クレジット = 200クレジット/月（無料枠1,000内）

## ★ Phase 10 完了（2026-02-22）: 市場ダッシュボード大幅改善 + 放デイ時系列刷新 + 企業ロゴ + 加算ガイド

### Phase 10a: 放課後デイ時系列刷新
- `FacilityGrowthChartInner.tsx` を全面リライト
  - **法人格別StackedAreaChart**: 7法人格（株式会社/合同/NPO/一般社団/社福/医療/その他）で積上げ
  - **報酬改定ReferenceLine**: 2012/2015/2018/2021/2024の5改定を黄色破線で表示
  - **改定タイムラインアコーディオン**: チャート下部に展開可能な改定詳細（影響/背景/新加算）
  - 2タブ切替: 「法人格別」(StackedArea) / 「事業所数×利用者数」(ComposedChart)
- `houkago-day.json` 更新: `facilityTimeSeries[].byEntity` + `rewardRevisions[]`
- `lib/types.ts`: `RewardRevision` 型 + `YearCount.byEntity` 追加

### Phase 10b: 市場ダッシュボード4新セクション
1. **WelfareHistoryTimeline** — 障害福祉の歴史（1946年〜2025年、18イベント）
   - カテゴリフィルタ（法制定/制度改革/転換点/国際）、8件→全件展開
2. **CareComparisonTable** — 介護保険との制度比較（9次元: 根拠法/対象者/認定方法/財源...）
   - 3列テーブル（障害福祉/介護保険/示唆）+ カテゴリ別色分け
3. **InternationalCasesSection** — 海外5カ国事例（米/デンマーク/スウェーデン/英/独）
   - 展開可能カード（制度概要/特徴/強み/弱み/日本への示唆）
4. **EmploymentPolicySection** → **EmploymentPolicySectionInner** — dynamic import
   - 法定雇用率推移チャート (1976-2026): ComposedChart (Bar=法定率 + Line=実雇用率)
   - 政策タイムライン (7件): 2024-2026の雇用/報酬/制度カテゴリ別
- `market-overview.json` に5新フィールド追加: `welfareHistory`, `careComparison`, `internationalCases`, `employmentRateHistory`, `recentPolicyChanges`
- `lib/types.ts`: `WelfareHistoryEvent`, `CareComparisonItem`, `InternationalCase`, `EmploymentRateHistory`, `RecentPolicyChange` 型追加

### Phase 10c: 企業ロゴ表示
- `CompanyList.tsx` — Google Favicon API（`google.com/s2/favicons?domain=...&sz=32`）
- officialUrl/irUrlからドメイン抽出、URL無い企業はbrandColor初期文字バッジにフォールバック

### Phase 10d: 加算取得要件ガイド
- `BonusTable.tsx` — テーブル→アコーディオンUIにリライト
  - 展開可能カード: 概要 / 取得手順 / ポイント / よくあるミス
  - アイコン: CheckCircle(手順), Lightbulb(ポイント), AlertTriangle(ミス)
- `houkago-day.json` — 全10加算に `requirementGuide` 追加（overview/steps[]/tips[]/commonMistakes[]）
- `lib/types.ts`: `BonusRequirementStep` 型 + `BonusCatalogItem.requirementGuide` 追加

## ★ Phase 11 完了（2026-02-22）: 事業所運営リアリティ大幅強化（放課後デイ先行）

### Phase 11a: DailyTimeline刷新
- `DailyTimeline.tsx` — 各時間帯に `conversation`（現場の会話）と `mood`（雰囲気）を展開表示
  - 「現場の会話を見る」ボタンで展開可能なアコーディオン
  - 発話者名を太字ハイライト、イタリック体でムード表示
- **他サービスのタイトル修正**: ハードコード「放課後等デイサービスの〜」→ `serviceType` propsから動的生成
- `DailyScheduleItem` 型拡張: `conversation?`, `mood?`

### Phase 11b: RoleDiagram刷新
- `RoleDiagram.tsx` — グリッド→展開可能アコーディオンにリライト
  - 想定年収（Banknote）/ 有効求人倍率（TrendingUp）/ 年齢層 / キャリアパス / この仕事への想い（Sparkles）/ 日々の悩み・課題（AlertCircle）
- `RoleInfo` 型拡張: `annualSalary?`, `ageRange?`, `jobOpeningRatio?`, `careerPath?`, `motivation?`, `challenges?`
- **他サービスのタイトル修正**: `serviceType` propsから動的生成

### Phase 11c: StakeholderMap新規作成
- `StakeholderMap.tsx` — 新コンポーネント。事業所を取り巻く7関係者を展開可能カードで表示
  - 利用児童 / 保護者 / 学校教員 / 相談支援専門員 / 市区町村 / 主治医・医療機関 / 近隣事業所
  - 各関係者: 関わりの頻度、説明、本音（theirPerspective）、主な関わり方（typicalInteractions）
- `StakeholderRelation` 型新規: `name`, `icon`, `frequency`, `description`, `theirPerspective`, `typicalInteractions[]`
- `OperationsStory` 型拡張: `stakeholders?`

### Phase 11d: ConversationCards強化
- `ConversationCards.tsx` — 「会話の例を見る」ボタンで dialogSample 展開表示
  - 4→6シーンに拡大（サービス担当者会議 / 行政実地指導 追加）
- `ConversationExample` 型拡張: `dialogSample?`

### Phase 11e: レイアウト変更
- `FacilityDetailPage.tsx` — DailyTimeline・RoleDiagramをフルワイド化（2列→1列）
  - StakeholderMapセクション追加（ConversationCardsの前）
  - `serviceType` を DailyTimeline / RoleDiagram に伝搬

### Phase 11f: 全18サービスへ横展開
- 放課後デイで先行実装したoperationsStory（会話・雰囲気・年収・キャリアパス・ステークホルダー等）を全18サービスに展開
- Pythonバッチスクリプト3本で一括更新:
  - `scripts/enrich_operations_batch1.py` — 障害児通所4 + 居住系2（6サービス）
  - `scripts/enrich_operations_batch2.py` — 訓練・就労系7サービス
  - `scripts/enrich_operations_batch3.py` — 相談系4サービス
- 各サービス固有のデータ: dailySchedule（会話・雰囲気）、roles（年収・求人倍率・キャリアパス・想い・悩み）、typicalConversations（6シーン+会話サンプル）、stakeholders（6-7関係者）
- `make_stakeholders()` 共通ヘルパーで基本7関係者生成 + `custom_overrides` でサービス固有カスタマイズ
- 全19サービス × 111ページのビルド成功確認済み

### ★ 次にやること（Phase 12以降）
- 全25社Tavilyリサーチ再実行（DNSエラー解消後）: `--all-private --no-db`
- Supabase SQL Editorで `company_web_research` テーブル作成（DB永続化）
- リタリコ深掘り: プラットフォーム事業構造、セグメント収益時系列、一店舗あたり事業計画
- WAMNETスクリプト汎用化（他社対応）
- キャッシュフロー/安全性データ整備 → EmptyState埋め
- IRサイトJS動的ロード対策（Playwright検討）
- e-Stat API自動取得の将来検討

## recharts動的読み込みパターン
recharts使用コンポーネントは全てSSR無効化済み:
- `FinancialCharts` → `FinancialChartsInner`（dynamic, ssr:false）
- `SegmentPieChart` → `SegmentPieChartInner`
- `PlChart` → `PlChartInner`
- `KpiComparisonChart` → `KpiComparisonChartInner`
- `MarketSizeChart` → `MarketSizeChartInner`
- `ProfitStructureSection` → `ProfitStructureInner`
- `AreaAnalysisSection` → `AreaAnalysisInner`
- `DisabilityPopulationChart` → `DisabilityPopulationChartInner`（market/）
- `EmploymentTrendsChart` → `EmploymentTrendsChartInner`（market/）
- `FacilityCountChart` → `FacilityCountChartInner`（market/）
- `RecruitmentBreakdown` → `RecruitmentBreakdownInner`（market/）
- `EntityDistributionChart` → `EntityDistributionChartInner`（facility/）
- `OperatorScaleChart` → `OperatorScaleChartInner`（facility/）
- `FacilityGrowthChart` → `FacilityGrowthChartInner`（facility/）
- `PLWaterfall` → `PLWaterfallInner`（facility/）
- `EmploymentPolicySection` → `EmploymentPolicySectionInner`（market/）

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
- `analyze_wamnet.py` — WAMNETオープンデータから事業所分析（CSVダウンロード→リタリコ抽出→都道府県別シェア）
- `generate_facility_json.py` — 6サービス分の事業所分析JSONを一括生成（Part 1: 障害児通所系 + 居住系）
- `generate_facility_json_part2.py` — 11サービス分の事業所分析JSON一括生成（Part 2: 訓練・就労・相談系）
- `generate_facility_pages.py` — 17サービス分のNext.jsページファイル一括生成
- `tavily_research.py` — Tavily Search API→Claude分析→非上場企業Webリサーチ (`--company X`, `--all-private`, `--no-db`)
- `enrich_operations_batch1.py` — 事業所operationsStory横展開: 障害児通所4+居住系2（6サービス）
- `enrich_operations_batch2.py` — 事業所operationsStory横展開: 訓練・就労系7サービス
- `enrich_operations_batch3.py` — 事業所operationsStory横展開: 相談系4サービス

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
python scripts/tavily_research.py --company kaien --no-db   # 非上場企業Webリサーチ（1社テスト）
python scripts/tavily_research.py --all-private --no-db     # 全25社一括実行
```
