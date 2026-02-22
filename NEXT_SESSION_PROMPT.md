# IRkun 次回セッション — 大量横展開

## 今回完了したこと（2026-02-22）

### Phase 12: ナビゲーション再構築
- サイドバー5グループ階層化、ホームリデザイン、DataFreshnessBadge

### Phase 13: 事業所分析深堀り（全19サービス）
- UserJourneyFlow / StartupFlow / StakeholderMap SVG / BonusFlowChart
- 放課後デイ先行 → 全19サービスにPythonバッチで横展開済み

### Phase 14: 企業分析強化（リタリコ先行）
- 14a: FinancialCharts 3タブ化（PL/BS/CF）+ リタリコBS/CFデータ
- 14b: セグメント月次売上推移 + コスト構造比較
- 14c: PLシミュレーション（スライダー調整→営業利益リアルタイム再計算）

### 事業ライフサイクル機能（放課後デイ先行）
- BusinessLifecycle.tsx — 4フェーズタブUI
  - 開業まで / 1年目 / 2-3年目 / 成長期・分岐
  - 課題(severity) / 成功vs失敗分岐 / 外部サービスニーズ(9カテゴリ) / 民間vs社福 / FC
- Phase 0 は既存 StartupFlow を埋め込み
- 後方互換: businessLifecycleなしは StartupFlow にフォールバック
- `main` にマージ済み、Vercelプロダクション（i-rapp.vercel.app）で確認済み

### ブランチ状態
- `feature/dashboard-macro` と `main` は同一コミット（3e3a24c）
- 次回も `feature/dashboard-macro` で作業し、適宜 `main` にマージ

---

## 次回やること

### ★ 最優先: 全82社IR分析の一括実行

**目的**: 上場52社の決算インサイト + 非上場17社のWebリサーチを一括実行し、全社のデータを揃える。

#### 現状（2026-02-22時点）
| 種別 | 対象 | 済 | 残 |
|---|---|---|---|
| 決算インサイト（上場PDF分析） | 57社 | 5社(litalico,sms,persol,pasona,visional) | **52社** |
| Webリサーチ（非上場） | 25社 | 8社(atama_plus,atgp,bright_vacation,cuore,decoboco,goodwill,hug,kaien) | **17社** |
| 事業計画PL | 82社 | 28社 | 54社 |

#### コスト見積もり
| 項目 | コスト | 時間 |
|---|---|---|
| 上場52社（決算PDF分析）| ~$28 | ~35分（並列3） |
| 非上場17社（Webリサーチ）| ~$4 | ~15分 |
| **合計API費用** | **~$32（約4,800円）** | |
| PDF取得・URL修正 | $0 | 1〜3時間（最大ボトルネック） |

#### 実行手順

**Step 1: 非上場17社Webリサーチ（簡単・先にやる）**
```bash
cd C:\Users\81806\AIBPO\IRkun
# 未実施の17社を一括実行（DB保存なし、JSON直接出力）
python scripts/tavily_research.py --all-private --no-db
```
- Tavilyクレジット: 136消費（無料枠1,000内で余裕）
- 出力先: `data/web-research/{company_id}.json`
- 8社済みのものはスキップされる（冪等）

**Step 2: 上場52社の決算PDF取得（ボトルネック）**
```bash
# まず既存のPDF取得スクリプトで試す
python scripts/fetch_earnings.py --all
```
- IR URLが変更されている企業が多い → エラーになった企業のURLを手動修正
- `scripts/earnings_urls.json` or スクリプト内のURL定義を確認・更新
- 30MB超のPDFはスキップ（仕様）

**Step 3: 上場52社の決算インサイト分析**
```bash
# PDF取得済みの企業を一括分析
python scripts/analyze_earnings.py --all
```
- モデル: claude-sonnet-4-20250514 / max_tokens: 4,096
- 1PDF = 1 API呼び出し、平均2PDF/社
- 出力先: `data/earnings-insights/{company_id}.json`
- 5社済みのものはスキップされる（冪等）

**Step 4: ビルド検証**
```bash
npm run build
```

**Step 5: コミット**
```bash
git add data/web-research/ data/earnings-insights/
git commit -m "feat: 全82社IR分析データ追加（上場52社決算 + 非上場17社Webリサーチ）"
```

#### 注意事項
- `fetch_earnings.py` のURL修正が最も時間がかかる作業。エラーログを見て1社ずつ修正する
- Tavily無料枠の残りクレジット数を事前に確認（https://app.tavily.com）
- Claude APIの利用量上限に注意（Sonnetで$32程度）
- 全スクリプトは冪等（再実行しても安全）なので、途中で止まっても再開可能

---

### 1. 事業ライフサイクル横展開（18サービス）
`scripts/add_lifecycle_all_services.py` を作成し、残り18サービスに `businessLifecycle` データを追加。
- **テンプレート5パターン**: 障害児通所 / 居住 / 通所（日中活動） / 訪問 / 相談
- **参考実装**: `scripts/add_phase13_all_services.py`（同じ横展開パターン）
- houkago-day.json のデータ構造を雛形に、サービス固有の内容にカスタマイズ

### 2. 企業データ横展開
- 他の上場企業にもBS/CFデータを追加（`scripts/add_bs_cf_data.py` を拡張）
- Tavily全25社リサーチ実行（`scripts/tavily_research.py --all-private --no-db`）

### 3. （余裕があれば）Phase 15: マーケット文脈アノテーション

---

## 大量展開プロトコル（★必ず守ること）

### タスク設計
```
大タスク → 5-10の小タスク（各タスクは自己完結・冪等）
例: 18サービス横展開 → 5バッチ（障害児4/居住2/訓練就労7/相談4/検証1）
```

### 実行フロー
```
1. Pythonスクリプトを作成（バッチごとに分割 or 引数で制御）
2. run_in_background: true でバックグラウンド実行
3. 1分おきにTaskOutputで進捗確認→ユーザーに報告
4. 2分以上無応答なら即確認・リトライ
5. 各バッチ完了後に npm run build で検証
6. ビルド通ったらコミット＆プッシュ
7. NEXT_SESSION_PROMPT.md の進捗チェックリストを更新
```

### 圧縮耐性（コンテキスト圧縮に備える）
- 各Pythonスクリプトは単体で実行可能（引数で対象サービスを指定）
- 進捗は NEXT_SESSION_PROMPT.md に書き込み（圧縮後も参照可能）
- コミットメッセージにバッチ番号を含める（例: `feat: lifecycle batch 2/5 (居住系)`)
- 圧縮が起きたら、まず NEXT_SESSION_PROMPT.md を読んで状況を把握

### 進捗チェックリスト（次回セッションで更新する）
- [ ] Batch 1: 障害児通所系 4サービス（jidou-hattatsu, iryougata-jidou, hoikusho-houmon, chiiki-ikou）
- [ ] Batch 2: 居住系 2サービス（group-home, shukuhaku-kunren）
- [ ] Batch 3: 訓練・就労系 7サービス（shurou-ikou, shurou-a, shurou-b, shurou-teichaku, seikatsu-kunren, kinou-kunren, jiritsu-seikatsu）
- [ ] Batch 4: 相談系 4サービス（keikaku-soudan, shougaiji-soudan, chiiki-teichaku, kyotaku-houmon）
- [ ] Batch 5: ビルド検証 + main マージ
- [ ] 企業BS/CFデータ横展開
- [ ] Tavily 25社リサーチ

---

## 重要ファイル（次回セッションで参照するもの）

| ファイル | 用途 |
|---------|------|
| `CLAUDE.md` | プロジェクト全体の仕様・型・コマンド一覧 |
| `NEXT_SESSION_PROMPT.md` | このファイル（進捗トラッキング） |
| `lib/types.ts` | BusinessLifecycle等の型定義 |
| `components/facility/BusinessLifecycle.tsx` | ライフサイクルUIコンポーネント |
| `components/facility/FacilityDetailPage.tsx` | 統合ページ（lifecycle/startupフォールバック） |
| `data/facility-analysis/houkago-day.json` | パイロットデータ（businessLifecycle構造の雛形） |
| `scripts/add_lifecycle_data.py` | パイロットスクリプト（houkago-day用） |
| `scripts/add_phase13_all_services.py` | 横展開スクリプトの参考実装 |

---

## デジタル庁ダッシュボードガイドブック エッセンス
参考PDF: `20240531_resources_dashboard-guidebook_guidebook_01.pdf`

新機能を設計する際、常に以下を意識する:
- **誰が・いつ・何のために**: 新人のキャッチアップ / 企画者の意思決定 / イベント駆動
- **マクロ→ミクロ**: 制度 → 市場 → 事業所 → 企業の情報階層
- **KPIファースト**: 最上部にカード型KPI（数値+前年比+スパークライン）
- **比較可能性**: 横並び比較ができる構造
- **鮮度表示**: DataFreshnessBadge（lastUpdated/source/confidence）
- **段階的開示**: 概要→ドリルダウン（アコーディオン・タブ）
- **セマンティックカラー**: profit=緑, cost=赤, bep=金, severity=高赤/中黄/低緑
