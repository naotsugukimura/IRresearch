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
