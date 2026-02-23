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
app/                    # ページ（49ページ）
  page.tsx              # ダッシュボード（/）
  market/page.tsx       # 総合ダッシュボード（/market）
  market/international/ # 海外制度比較インデックス + 5カ国詳細（/market/international）
  market/international/usa/    # アメリカ（ADA + Medicaid Waiver）
  market/international/denmark/ # デンマーク（BPA制度）
  market/international/sweden/  # スウェーデン（LSS法）
  market/international/uk/      # イギリス（パーソナルバジェット）
  market/international/germany/ # ドイツ（BTHG）
  reward-revision/page.tsx # 報酬改定タイムライン（/reward-revision）
  disability/page.tsx   # 障害理解インデックス（/disability） — 4グループ14障害種別
  disability/physical/  # 身体障害
  disability/intellectual/ # 知的障害
  disability/mental/    # 精神障害
  disability/developmental/ # 発達障害
  disability/acquired-brain/ # 高次脳機能障害
  disability/intractable/ # 難病
  disability/severe-multiple/ # 重症心身障害
  disability/challenging-behavior/ # 強度行動障害
  disability/addiction/ # 依存症
  disability/dementia/  # 認知症（若年性含む）
  disability/multiple/  # 重複障害
  disability/medical-care-child/ # 医療的ケア児
  disability/justice-involved/ # 触法障害者
  disability/social-withdrawal/ # 社会的ひきこもり
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
  disability/           # 障害理解（DisabilityDetailPage — 14障害種別の共通詳細レイアウト）
  plan/                 # 事業計画PL（SummaryCards, PlChart, MonthlyTable）
  dashboard/            # ダッシュボードKPI
  compare/              # 比較テーブル・チャート
  trends/               # トレンド表示
  market/               # 総合ダッシュボード（MarketKpiCards, PopulationChart, EmploymentChart, ContextAnnotations, CountryDetailPage等）
  facility/             # 事業所分析（FacilityDetailPage, EntityDistribution, DailyTimeline, PLWaterfall, MonthlyPLTable, RewardUnitTable等）
  reward/               # 報酬改定（CrossServiceTimeline, ServiceRevisionDetail）
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
  reward-revisions.json # 報酬改定タイムライン（18サービス×101件）
  facility-analysis/    # 事業所分析（全18サービス種別のJSON）
    houkago-day.json, jidou-hattatsu.json, iryougata-jidou.json,
    kyotaku-houmon.json, hoikusho-houmon.json, group-home.json,
    jiritsu-seikatsu.json, kinou-kunren.json, seikatsu-kunren.json,
    shukuhaku-kunren.json, shurou-ikou.json, shurou-a.json,
    shurou-b.json, shurou-teichaku.json, chiiki-ikou.json,
    chiiki-teichaku.json, keikaku-soudan.json, shougaiji-soudan.json
  disability-knowledge.json # 障害理解（14障害種別の詳細データ）
  international-welfare.json # 海外制度比較（5カ国の詳細データ）
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

## ★ Phase 12 完了（2026-02-22）: ナビゲーション再構築

### Phase 12a: サイドバー階層化
- `NAV_ITEMS` をフラット8項目 → 折りたたみ5グループに再構成
- `NavItem` 型に `children?: {href, label}[]` 追加
- `Sidebar.tsx` に `NavGroup` コンポーネント（ChevronRight展開/折り畳み、左ボーダーインデント）
- 不要になったアイコン（GitCompareArrows, TrendingUp, StickyNote）を削除

### Phase 12b: ホームページリデザイン
- `app/page.tsx` タイトル変更（ダッシュボード→ホーム）
- `NavigationGuide.tsx` 新規: マクロ→ミクロ3ステップ導線カード（STEP1: マクロ / STEP2: 事業所 / STEP3: 企業）

### Phase 12c: 情報鮮度バッジ
- `DataFreshnessBadge.tsx` 新規: lastUpdated/source/sourceUrl/confidence を統一表示する共通コンポーネント

## ★ Phase 13 完了（2026-02-22）: 事業所分析深堀り（放課後デイ先行→全19サービス横展開）

### Phase 13a: 利用者フロー図
- `UserJourneyFlow.tsx` — 2タブ（日次フロー/ライフサイクル）の縦タイムライン
  - 日次フロー: 7ステップ（送迎→集団活動→個別支援→記録）
  - ライフサイクル: 8ステップ（初回相談→見学→契約→支援→モニタリング→卒業）
  - 番号付きカラーノード、展開可能キーアクション
- 型: `UserJourney`, `UserJourneyStep`

### Phase 13b: 開業フロー図
- `StartupFlow.tsx` — 総費用/期間ヘッダー + 8ステップ縦タイムライン
  - 各ステップ: 期間/費用/必要書類/ポイント/注意事項
  - プログレスバー + 展開可能詳細パネル
- 型: `StartupGuide`, `StartupStep`

### Phase 13c: ステークホルダー図式化
- `StakeholderMap.tsx` 全面リライト — テキストカード→SVG放射状関係図
  - 中央ノード「事業所」、7関係者を円周上に配置
  - 接続線の太さ/スタイルが頻度に連動（毎日=実線太/年数回=破線細）
  - クリックで詳細パネル表示（本音・関わり方）
  - モバイルはアコーディオンリストにフォールバック

### Phase 13d: 加算取得フロー
- `BonusFlowChart.tsx` — 処遇改善加算4段階の段階的取得フローチャート
  - 処遇改善加算(I)→特定処遇改善加算(I)→ベースアップ等→新処遇改善加算
  - 各ノード: 難易度バッジ(易/中/難)、単位数、前提条件展開
  - 難易度推移バー（サマリー）
  - 相談支援は処遇改善対象外のため特定事業所加算等に差し替え
- 型: `BonusFlowNode`, `BonusAcquisitionFlow`

### Phase 13e: 全19サービス横展開
- `scripts/add_phase13_all_services.py` で全17サービス（houkago-day除く）に一括追加
- サービス類型別テンプレート: 障害児通所/居住/通所/訪問/相談の5パターン
- 障害児/成人で加算率を変更、相談支援は別の加算体系に差し替え
- `FACILITY_SECTIONS` に利用者フロー/開業フロー/関係者マップ/加算フローを追加

## ★ Phase 14 完了（2026-02-22）: 企業分析強化（リタリコで先行）

### Phase 14a: BS/PL/CF時系列チャート
- FiscalYear型拡張: BS(totalAssets/netAssets/equity/equityRatio/currentRatio) + CF(operatingCF/investingCF/financingCF/freeCF/cashAndEquivalents)
- FinancialChartsInner: PLタブ（既存）+ BSタブ（総資産・純資産BarChart + 自己資本比率・流動比率ComposedChart）+ CFタブ（3CF棒グラフ + FCF・現金ComposedChart）
- BSデータがある企業でタブ自動表示、ない企業はPLのみ
- EmptyState条件化: BS/CFデータがある企業ではプレースホルダー非表示
- リタリコ5年分のBS/CFデータ手動追加（scripts/add_bs_cf_data.py）

### Phase 14b: セグメント管理会計ビュー
- SegmentMonthlyTrend: セグメント別月次売上推移LineChart（12ヶ月時系列）
- SegmentCostStructure: セグメント別コスト構造StackedBarChart（原価/人件費/広告/その他）
- ProfitStructureInnerに2チャート追加（セグメントデータがある企業のみ表示）

### Phase 14c: PLシミュレーション
- PLSimulator/PLSimulatorInner: BusinessPlanの主要パラメータをスライダーで調整
  - 売上高/売上原価/人件費/広告宣伝費/その他販管費の±30%
  - リアルタイム営業利益・営業利益率再計算
  - 楽観/悲観プリセット + リセット
  - 感度分析: 各項目+10%時の営業利益変動を棒グラフ表示
- dynamic import (ssr: false) パターン
- 企業詳細ページ経営分析セクションに配置

## ★ 事業ライフサイクル機能 完了（2026-02-22）

### BusinessLifecycle コンポーネント（放課後デイ先行）
- `components/facility/BusinessLifecycle.tsx`（"use client"、rechartsなし）
- 4フェーズタブUI: 開業まで / 1年目 / 2-3年目 / 成長期・分岐
- 各フェーズ: 課題(severity) / 成功vs失敗分岐 / 外部サービスニーズ(9カテゴリ) / 民間vs社福 / FC
- Phase 0 は既存 `StartupFlow` を埋め込み表示
- 後方互換: `businessLifecycle` がないサービスは `StartupFlow` にフォールバック
- `FACILITY_SECTIONS`: `startup` → `lifecycle` に変更

### 新しい型（lib/types.ts）
- `BusinessLifecycle`, `LifecyclePhase`, `LifecyclePhaseId`
- `LifecycleChallenge`, `SuccessFailureScenario`
- `ExternalServiceNeed`, `ExternalServiceCategory`
- `EntityTypeConsideration`, `FranchiseConsideration`
- `FacilityAnalysisData` に `businessLifecycle?: BusinessLifecycle` 追加

### デプロイ
- `main` ブランチ直接運用（feature/dashboard-macroは廃止）
- プロダクションURL: `i-rapp.vercel.app`

### 事業所分析リファクタリング 完了（2026-02-22）
- FacilityKpiCards: 配列バウンドチェック + ゼロ除算ガード追加
- houkago-day: `getFacilityAnalysis("65")` + `notFound()` に統一（特殊関数削除）
- `app/facility/error.tsx`: Next.js Error Boundary追加（白画面防止）
- FacilityDetailPage: SectionNav統合 + データ有無に基づく動的フィルタリング
- FACILITY_SECTIONS: `monthlyPL` セクション追加

### OOPリファクタリング Phase 1 完了（2026-02-22）
- `scripts/analyzers/base.py`: BaseIRAnalyzer ABC + AnalysisResult dataclass
- `scripts/analyzers/tavily.py`: TavilyAnalyzer（非上場企業Webリサーチ）
- `scripts/analyzers/registry.py`: Company→Analyzer ファクトリ
- `scripts/ir_pipeline.py`: 統一CLI（`--company`/`--all-private`/`--parallel`対応）
- kaienテスト済み、既存スクリプト変更なし

### ダッシュボードUI改善 完了（2026-02-22）
- **ホーム刷新**: 企業モニタリング概況 → 3カードダイジェスト（マーケットハイライト/注目企業/ニュース）— `HomeDigest.tsx`新規
- **/market SectionNav**: 10セクションへのページ内ナビ追加（MARKET_SECTIONS拡張）
- **事業所分析テーブル化**: カードグリッド → カテゴリ別テーブル（特徴説明+規模+概要）
- **全18サービス法人格別時系列**: `scripts/add_entity_timeseries.py`でbyEntityデータ生成（17JSON更新）
- **報酬改定 常時展開**: アコーディオン廃止、全内容を常時表示
- **FacilityGrowthChartInner動的化**: serviceType prop追加、ハードコード統計（倍率/シェア）を動的計算に変更

## ★ Phase 15 完了（2026-02-22）: マーケット文脈アノテーション + 企業BS/CFデータ横展開

### Phase 15a: マーケット文脈アノテーション（3プレイヤー）
- `ContextAnnotation` 型追加: chartId + government/provider/user の3プレイヤー視点
- `data/market-overview.json` に `contextAnnotations` 配列追加（6エントリ: 障害者人口/雇用/事業所数 × 各2件）
- `components/market/ContextAnnotations.tsx` — 展開可能カードUI（Landmark/Building2/Users アイコン）
- 3チャートWrapper + Inner に annotations prop追加（DisabilityPopulation/EmploymentTrends/FacilityCount）
- `/market` ページで chartId でフィルターして各チャートに渡す

### Phase 15b: 企業BS/CFデータ横展開
- `scripts/add_bscf_data.py` 実行: Tavily + Claude APIで16社のBS/CFデータをWeb検索→抽出
- 14社成功（recruit:38, saint_care:35, medley:30, care21:24 等）、2社(cocoruport/spool)はデータ不足
- `data/financials.json` に反映済み

## ★ Phase 16 完了（2026-02-22）: 報酬単位表 全19サービス

### Phase 16a: 放課後デイ先行実装
- `RewardUnitTable.tsx` — 2タブUI（基本報酬 / 主要加算）
  - 基本報酬テーブル: カテゴリ(rowSpan)×定員×利用時間×単位数×概算金額
  - 主要加算テーブル: 加算名×単位数×算定単位×主な要件
  - 折りたたみ地域区分別単価（8区分: 1級地11.10円〜その他10.00円）
  - 注意事項ノート
- 型: `RewardUnitRow`, `RewardBonusRow`, `RewardUnitTableData`
- `FacilityAnalysisData` に `rewardUnitTable?` フィールド追加
- `FACILITY_SECTIONS` に `{ id: "rewardTable", label: "報酬単位" }` 追加

### Phase 16b: 全17サービス横展開
- `scripts/generate_reward_tables.py` — Claude APIで17サービスの報酬単位データを並列生成
- 各サービス令和6年度改定ベース: 基本報酬(8-35行) + 主要加算(10-14種) + 地域区分 + 注意事項
- 合計4,619行のデータ追加

## ★ Phase 17 完了（2026-02-22）: 報酬改定タイムラインページ

### 新規ページ `/reward-revision`
- `app/reward-revision/page.tsx` — 独立したトップレベルページ
- **上部: 全サービス横断タイムライン** (`components/reward/CrossServiceTimeline.tsx`)
  - 改定年ごと（2006〜2024年）にグルーピング表示
  - カテゴリフィルター（障害児通所/居住/訓練就労/相談/訪問系）
  - 各年の影響サービスをバッジ表示、クリックで詳細展開
  - 新設=青、改定=amber のカラーコード
- **下部: サービス別詳細タブ** (`components/reward/ServiceRevisionDetail.tsx`)
  - 18サービスをカテゴリ別グルーピングしたタブUI
  - 各サービスの全改定をカード型タイムラインで詳細表示（基本報酬額/変更点/市場影響）
- `data/reward-revisions.json` — 18サービス×合計101件の改定データ
- `scripts/generate_reward_revisions.py` — Claude APIでデータ生成
- 型: `ServiceRevisionEntry`, `RewardRevisionPageData`
- ナビ: NAV_ITEMSマクロ環境グループに「報酬改定」リンク追加

## ★ 事業ライフサイクル横展開 完了（2026-02-22）
- `scripts/generate_lifecycle.py` 実行済み: 全17サービスにbusinessLifecycleデータ追加済み

## ★ Phase 18 完了（2026-02-23）: 障害理解セクション トップレベル昇格 + 14障害種別

### 概要
ナレッジ配下のサブページだった `/learn/disability`（4カテゴリのタブUI）を、
サイドバーのトップレベルセクションに昇格。事業所分析（19サービス個別ページ）と同じ構造パターンで
14障害種別を独立ページとして実装。

### サイドバー構造（変更後）
```
ホーム → マクロ環境 → 障害理解★NEW → 事業所分析 → 企業分析 → ナレッジ
```

### 14障害種別（4グループ）
- **三障害（手帳制度）**: 身体障害 / 知的障害 / 精神障害 / 発達障害
- **専門領域**: 高次脳機能障害 / 難病 / 依存症 / 認知症（若年性含む）
- **複合・重度**: 重症心身障害 / 強度行動障害 / 重複障害 / 医療的ケア児
- **社会的課題**: 触法障害者 / 社会的ひきこもり

### 新規ファイル
- `app/disability/page.tsx` — indexページ（カテゴリ別テーブル一覧、/facility と同パターン）
- `app/disability/[14種]/page.tsx` — 各障害種別の詳細ページ（各9行）
- `components/disability/DisabilityDetailPage.tsx` — 詳細ページ共通コンポーネント（KPI/発覚タイムライン/治療/就労サポート）

### 変更ファイル
- `data/disability-knowledge.json` — 4→14カテゴリ（+10種、+約800行）
- `lib/data.ts` — `getDisabilityCategory(id)` 関数追加
- `lib/constants.ts` — NAV_ITEMSに「障害理解」追加、ナレッジから削除
- `components/layout/Sidebar.tsx` — Heartアイコン追加
- `app/learn/disability/page.tsx` — `/disability` へリダイレクト

## ★ Phase 19 完了（2026-02-23）: 海外5カ国 障害福祉制度 詳細ページ

### 概要
`/market` ページ内のセクションとして表示されていた海外5カ国の障害福祉制度を、
国ごとの独立詳細ページに拡張。マクロ環境配下に `/market/international` を新設。

### URL構造
```
/market/international          ← 5カ国一覧（テーブル + KPI比較カード）
/market/international/usa      ← アメリカ（ADA + Medicaid Waiver）
/market/international/denmark  ← デンマーク（BPA制度）
/market/international/sweden   ← スウェーデン（LSS法）
/market/international/uk       ← イギリス（パーソナルバジェット）
/market/international/germany  ← ドイツ（BTHG）
```

### 各国ページの構成（9セクション）
概要・システム名 → 統計KPI(6項目) → 主要法制度(アコーディオン) → 制度の変遷(タイムライン) →
サービス体系(6分野) → 強み・課題(2カラム) → 日本との比較(テーブル6軸) →
日本への示唆(適用性バッジ付き) → 最近の動向・出典

### 新規ファイル
- `data/international-welfare.json` — 5カ国分の詳細データ
- `components/market/CountryDetailPage.tsx` — 共通詳細ページコンポーネント
- `app/market/international/page.tsx` — indexページ
- `app/market/international/{usa,denmark,sweden,uk,germany}/page.tsx` — 各国詳細

### 変更ファイル
- `lib/types.ts` — `InternationalWelfareDetail` + `InternationalWelfareData` 型追加
- `lib/data.ts` — `getInternationalWelfareData()` + `getInternationalWelfareCountry()` 追加
- `lib/constants.ts` — マクロ環境childrenに「海外制度比較」追加
- `components/market/InternationalCasesSection.tsx` — 詳細ページへのリンク追加

## ★ Phase 20 完了（2026-02-23）: 業界カオスマップ

### 新規ページ `/company/chaos-map`
- `components/company/ChaosMap.tsx` — 80社を6カテゴリで俯瞰するインタラクティブマップ
  - **マップビュー**: カテゴリ別カード内に企業チップ配置（脅威レベルでサイズ変動、市場区分でグルーピング）
  - **リストビュー**: テーブル表示（企業名/カテゴリ/市場/脅威/優先度/主要サービス）
  - カテゴリフィルター + マップ/リスト切替
  - KPIカード4枚（総企業数/カテゴリ数/上場企業/高脅威企業）
  - 各企業クリックで `/company/[id]` へ遷移
- `app/company/chaos-map/page.tsx` — ページファイル
- `lib/constants.ts` — NAV_ITEMS企業分析に「カオスマップ」追加

## ★ Phase 22 完了（2026-02-23）: BPMN風サービス利用フロー図

### 新規ページ `/facility/flow`
- **React Flow** (@xyflow/react v12) を導入
- 障害福祉サービスの利用フロー全体をBPMN風プロセスフロー図で可視化
  - **4レーン**: 利用者/相談支援/市区町村/事業所
  - **カスタムノード**: StartEnd(丸型)/Process(角丸)/Gateway(ひし形)/Lane(縦書きラベル)
  - ズーム・スクロール・コントロール付きインタラクティブ図
- フェーズ概要カード4枚（相談・計画 → 申請・審査 → 契約・利用開始 → モニタリング）
- 補足情報: 障害支援区分/セルフプラン/モニタリング頻度

### 新規ファイル
- `components/facility/ServiceFlowChart.tsx` — React Flowベースのフローチャート実装
- `components/facility/ServiceFlowChartSection.tsx` — dynamic importラッパー(ssr:false)
- `app/facility/flow/page.tsx` — ページファイル

### 変更ファイル
- `lib/constants.ts` — NAV_ITEMS事業所分析に「利用フロー図」追加
- `package.json` — `@xyflow/react` 依存追加

## ★ 障害サブタイプ詳細ページ 全14カテゴリ横展開 完了（2026-02-23）

### 概要
精神障害で先行実装した「サブタイプ詳細ページ」パターンを全14障害カテゴリ・67ページに横展開。
各カテゴリトップページにサブタイプ一覧テーブル（推定人数/有病率/好発年齢）を表示し、
クリックで個別詳細ページ（症状/困難さ/治療/経過/共に生きるヒント/誤解と実際）へ遷移。

### URL構造
```
/disability/{category}              ← カテゴリトップ（サブタイプテーブル付き）
/disability/{category}/{sub-type}   ← サブタイプ詳細（67ページ）
```

### フィードバック反映
- **カテゴリトップから「ライフステージと発覚のきっかけ」「医療とアプローチ」を削除**
  - これらは個別の障害に紐づくものであり、カテゴリ全体のフローではないため
  - `subTypeData` がある場合は非表示、ない場合は従来表示（後方互換）

### 新規ファイル
- `data/disability-subtypes/{14ファイル}.json` — 各カテゴリのサブタイプ詳細データ
- `components/disability/SubTypeDetailPage.tsx` — サブタイプ詳細共通コンポーネント（9セクション）
- `app/disability/{category}/{sub-type}/page.tsx` — 67ページ

### 変更ファイル
- `lib/data.ts` — 14カテゴリ分のimport + `SUB_TYPE_DATA_MAP` 拡張
- `lib/types.ts` — `DisabilitySubTypeDetail` + `DisabilitySubTypeData` 型
- `components/disability/DisabilityDetailPage.tsx` — サブタイプテーブル追加 + 条件付きセクション非表示
- `app/disability/*/page.tsx` — 14ページ全てに `subTypeData` props追加

### 生成スクリプト
- `scripts/generate_subtypes.py` — Claude APIでサブタイプデータ生成（13カテゴリ並列）
- `scripts/generate_subtype_pages.py` — JSONからNext.jsページファイル一括生成

## ★ Phase 23 完了（2026-02-23）: 事業所分析ページ4タブUI化

### 概要
事業所分析の各サービス詳細ページ（全19ページ）を4タブUIに分割。
17セクションの超長尺ページ（推定6000-9000px）を4タブに分離し、スクロール量を1/4に削減。

### 4タブ構成
1. **📊 市場系**（青）: 概要KPI / 参入法人 / 事業規模 / 推移
2. **📜 沿革系**（黄）: 報酬改定の歴史と市場への影響（新規セクション）
3. **💰 経営系**（緑）: 事業ライフサイクル / PL / 報酬単位 / 月次収支 / 加算フロー / 加算一覧
4. **業務プロセス理解**（紫）: 利用者フロー / 業務プロセス / 一日の流れ / 登場人物 / 関係者マップ / 現場の声

### 新規ファイル
- `components/facility/RewardHistorySection.tsx` — 報酬改定タイムラインUI（展開可能アコーディオン）

### 変更ファイル
- `lib/constants.ts` — `FACILITY_SECTION_GROUPS`（4グループ定義）+ `FacilitySectionGroup` 型エクスポート
- `components/layout/SectionNav.tsx` — `groups` prop追加、カラードット付きカテゴリラベル + セパレーター表示
- `components/facility/FacilityDetailPage.tsx` — タブUI化（`useState`でタブ切替、`"use client"` 追加）

### 設計ポイント
- **タブUI**: `useState`でactiveTab管理、条件レンダリングでタブ内容切替
- タブバー: sticky + backdrop-blur、アイコン + ラベル + セクション数バッジ + カラーインジケーター
- SectionNavはタブ内ローカルナビとして動作（2セクション以上のタブのみ表示）
- モバイル対応: sm未満では短縮ラベル（市場/沿革/経営/業務）表示
- `FACILITY_SECTIONS`はflatMap後方互換で維持
- `OPTIONAL_SECTION_CHECKS` に `rewardHistory` 追加（データなし→沿革タブ自体を非表示）

## ★ Phase 21a 完了（2026-02-23）: 事業所地域分析（都道府県別分布）

### 概要
WAMNET Open Data (2025/09) から全サービスの都道府県別事業所数を自動集計。
11/18サービスで地域分析データを取得し、市場系タブ内「地域分布」セクションとして表示。

### 新規ファイル
- `scripts/analyze_wamnet_all.py` — 全サービスWAMNET分析バッチスクリプト
- `components/facility/FacilityRegionalChart.tsx` — dynamic importラッパー
- `components/facility/FacilityRegionalChartInner.tsx` — 3ビューUI（Top10棒グラフ/地域別円グラフ/全都道府県テーブル）

### 変更ファイル
- `lib/types.ts` — `FacilityRegionalData`, `PrefectureData`, `RegionData` 型追加
- `lib/constants.ts` — 市場系セクションに `{ id: "regional", label: "地域分布" }` 追加
- `components/facility/FacilityDetailPage.tsx` — regionalセクション追加 + OPTIONAL_SECTION_CHECKS
- `data/facility-analysis/*.json` — 11ファイルに `regionalData` フィールド追加

### データ取得状況
- **取得成功 (11)**: houkago-day, jidou-hattatsu, iryougata-jidou, kyotaku-houmon, hoikusho-houmon, seikatsu-kunren, shurou-b, shurou-teichaku, keikaku-soudan, chiiki-ikou, chiiki-teichaku
- **404エラー (7)**: group-home, jiritsu-seikatsu, shurou-ikou, shurou-a, kinou-kunren, shougaiji-soudan, shukuhaku-kunren
  - WAMNETのサービスコード体系が一部異なる可能性あり（要調査）

### ★ 次にやること（優先度順）

#### Phase 21b: 残り7サービスの地域分析 + 複数サービス分析
- WAMNETの正しいサービスコードを調査して残り7サービスのデータ取得
- **複数サービス分析**: 法人の兼業パターン分析
  - 同一法人が運営する複数サービスの組み合わせ（放デイ+児発、GH+B型 等）
  - クロス集計テーブル or サンキーダイアグラム

#### その他（継続タスク）
- **全82社IR分析一括実行**: NEXT_SESSION_PROMPT.md参照（Step 1-5の手順あり、API費用~$32）
- **非上場企業Webリサーチ**: 残り17社分（tavily_research.py実行中 or 完了）
- Supabase `company_web_research` テーブル作成（SQL Editor手動実行が必要）
- OOPリファクタリング Phase 2: PdfEarningsAnalyzer + EdinetAnalyzer

## システム設計方針（★重要 — IR分析パイプラインに適用）

### 背景
82社のIR分析を進めるにあたり、会社ごとにデータ取得方法が異なる（PDF/EDINET/Tavily/手動）。
現状はスクリプトごとにロジックがバラバラで、新しい分析手法を追加するたびに全体に影響が出る。
オブジェクト指向の設計原則を導入し、拡張性と保守性を確保する。

### 設計原則

#### 1. ベースクラス（共通インターフェース）
どんな企業のアナライザーでも必ず以下の3メソッドを持つ:
```python
class BaseIRAnalyzer:
    def fetch_data(self) -> RawData:           # 情報を集める
    def analyze(self, data) -> StructuredData:  # Claude等で構造化・分析
    def save(self, result) -> None:             # Supabaseに保存
    def run(self):                              # fetch -> analyze -> save パイプライン
```

#### 2. サブクラス（会社・手法ごとの専用実装）
```python
class PdfIRAnalyzer(BaseIRAnalyzer):     # 上場企業: PDFダウンロード -> Claude分析
class EdinetAnalyzer(BaseIRAnalyzer):    # 上場企業: EDINET APIから財務データ取得
class TavilyAnalyzer(BaseIRAnalyzer):    # 非上場企業: Tavily Web検索 -> Claude分析
class ManualAnalyzer(BaseIRAnalyzer):    # 手動入力データの構造化
```

#### 3. ポリモーフィズム（多態性）
メインスクリプトは相手がPDFだろうがTavilyだろうが気にしない:
```python
for company in companies:
    analyzer = get_analyzer(company)  # 会社の属性に応じて適切なサブクラスを返す
    analyzer.run()                    # 各自の方法で fetch -> analyze -> save
```

#### 4. 出力の規格化（カプセル化）
Python側の取得・分析ロジックがどれだけ複雑でも、Next.js に渡すデータは統一フォーマット:
- `CompanyFinancials` / `EarningsInsights` / `WebResearchData` 等の既存型に収束
- 新しい分析手法を追加しても、フロント側のコード変更が不要

#### 5. 段階的導入
- **現状のスクリプトを壊さない**: 既存スクリプトは動くまま、新規開発分から適用
- **まずベースクラスを作り、1つのアナライザー（例: TavilyAnalyzer）で実証**
- **うまくいったら既存スクリプトを順次リファクタリング**

### 適用スコープ
- `scripts/` 配下のPythonスクリプト（IR取得・分析パイプライン）
- Next.js側（`lib/types.ts`, `lib/data.ts`）は既に統一型で設計されているため変更不要
- Supabase DB スキーマも既存テーブル設計を維持

## 大量展開プロトコル（★次回セッション向け）
横展開・大量ファイル生成時は以下のプロトコルに従う:
1. **タスク分割**: 5-10件の独立した小タスクに分割
2. **バックグラウンド実行**: `run_in_background: true` でPythonスクリプト並列実行
3. **1分おき報告**: バックグラウンドタスクの進捗を1分ごとにユーザーに報告
4. **遅延検知**: 2分以上応答がないタスクは即座に確認・リトライ
5. **圧縮耐性設計**:
   - 各タスクは自己完結（前のコンテキストに依存しない）
   - NEXT_SESSION_PROMPT.mdに「今どこまで完了したか」を逐次更新
   - Pythonスクリプトは冪等（再実行しても安全）
   - 完了したタスクはコミット＆プッシュして確定
6. **検証**: 各バッチ完了後に `npm run build` で即座にビルド確認

## デジタル庁ダッシュボードガイドブック（★設計原則）
参考: `20240531_resources_dashboard-guidebook_guidebook_01.pdf`（121ページ）
IRkunの設計に常に適用すべきエッセンス:
- **「誰が・いつ・何のために見るか」を明確に**: 新人キャッチアップ / 企画者の意思決定 / イベント駆動型閲覧
- **マクロ→ミクロの情報階層**: 制度沿革 → 3プレイヤー → 事業所 → 企業
- **KPIは最上部に**: 重要指標をカード型で配置、数値＋前年比＋スパークライン
- **比較を可能にする**: 複数サービス・複数企業の横並び比較
- **データの鮮度を示す**: lastUpdated/source/confidence（DataFreshnessBadge）
- **アクション可能な情報**: 数値+「だからどうすべきか」のインサイト
- **段階的開示**: 概要→詳細のドリルダウン（アコーディオン・タブ・リンク）
- **色の意味を統一**: セマンティックカラー（profit=緑, cost=赤, bep=金）

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
- `PLSimulator` → `PLSimulatorInner`（plan/）

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
- `add_phase13_data.py` — Phase 13データ追加: houkago-dayにuserJourney/startupGuide
- `add_bonus_flow_data.py` — Phase 13d: bonusAcquisitionFlow追加（houkago-day）
- `add_phase13_all_services.py` — Phase 13e: 全18サービスにuserJourney/startupGuide/bonusAcquisitionFlow横展開
- `add_lifecycle_data.py` — 事業ライフサイクル: houkago-dayにbusinessLifecycle追加（パイロット）
- `generate_lifecycle.py` — 事業ライフサイクル: 全17サービスにbusinessLifecycle横展開（Claude API並列）
- `generate_reward_tables.py` — 報酬単位表: 全17サービスにrewardUnitTable横展開（Claude API並列）
- `generate_reward_revisions.py` — 報酬改定タイムライン: 全18サービスの改定履歴データ生成 → reward-revisions.json
- `add_bscf_data.py` — 企業BS/CFデータ: Tavily+Claude APIで上場企業のBS/CFを検索→抽出→financials.json更新

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
python scripts/generate_lifecycle.py                        # 事業ライフサイクル全17サービス横展開
python scripts/generate_reward_tables.py                    # 報酬単位表全17サービス横展開
python scripts/generate_reward_revisions.py                 # 報酬改定タイムラインデータ生成
python scripts/add_bscf_data.py                             # 企業BS/CFデータ横展開
```
