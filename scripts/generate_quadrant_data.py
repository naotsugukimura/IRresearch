#!/usr/bin/env python3
"""
Claude API を使って象限別データを生成するスクリプト。

Usage:
  python generate_quadrant_data.py --type q1-ops        # Q1 OPS比較データ
  python generate_quadrant_data.py --type q2-biz         # Q2 ビジネスモデルカード
  python generate_quadrant_data.py --type q3-industry    # Q3 業界勢力図
  python generate_quadrant_data.py --type q1-bpmn        # Q1 BPMNビジネスモデル図
  python generate_quadrant_data.py --all                 # 全部
"""
import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(override=True)

from config import DATA_DIR, COMPANIES_PATH

import anthropic

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 8192

QUADRANT_DATA_DIR = DATA_DIR / "quadrant-data"
QUADRANT_DATA_DIR.mkdir(parents=True, exist_ok=True)


def call_claude(prompt: str) -> str:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def extract_json(text: str) -> dict | list:
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    return json.loads(text.strip())


def load_companies_by_quadrant(quadrant: str) -> list[dict]:
    with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
        companies = json.load(f)
    return [c for c in companies if c.get("quadrant") == quadrant]


def save_json(data, filename: str):
    path = QUADRANT_DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {path}")


# ============================================================
# Q1 OPS 比較データ
# ============================================================

def generate_q1_ops():
    print("\n=== Q1 OPS Comparison Data ===")
    companies = load_companies_by_quadrant("Q1")
    company_list = "\n".join([
        f"- {c['id']}: {c['name']} ({c.get('subCategory','?')}) - {c['description'][:80]}"
        for c in companies
    ])

    prompt = f"""以下の障害福祉業界の直接競合8社について、OPS（営業・サポート体制）の比較データをJSON配列で出力してください。

対象企業:
{company_list}

各社について、公開情報（IR資料、採用ページ、プレスリリース等）から推定できる範囲で以下を出力してください。
推定値には必ず「推定」と明記してください。情報がない場合はnullとしてください。

出力フォーマット（JSON配列）:
```json
[
  {{
    "companyId": "企業ID",
    "companyName": "企業名",
    "subCategory": "サブカテゴリ",
    "salesMethod": "主な営業手法（例: インバウンド中心/アウトバウンド/代理店経由/混合）",
    "salesDetail": "営業手法の詳細説明（50字以内）",
    "supportStructure": "サポート体制（例: 専任担当制/チーム制/セルフサービス）",
    "supportDetail": "サポート体制の詳細（50字以内）",
    "customerCount": "顧客数・利用者数（例: 約3,000事業所）またはnull",
    "staffCount": "従業員数（例: 約2,500名）またはnull",
    "advertisingMethod": "主な広告・集客手法（例: リスティング広告+SEO+展示会）",
    "keyStrength": "差別化ポイント（30字以内）",
    "confidence": "low/medium/high"
  }}
]
```

重要:
- 障害福祉業界の文脈で回答してください
- SaaS企業（HUG, NDソフトウェア, knowbe）は事業所向けSaaSとしてのOPSを回答
- 人材紹介企業（atGP, パーソル）は障害者雇用支援としてのOPSを回答
- メディア・就労支援（リタリコ, ウェルビー, ココルポート）は就労移行支援としてのOPSを回答
- 必ず有効なJSONのみを出力してください。"""

    print("  Calling Claude API...")
    result = call_claude(prompt)
    data = extract_json(result)
    save_json(data, "q1-ops.json")
    print(f"  Generated {len(data)} companies")
    return data


# ============================================================
# Q2 ビジネスモデルカード
# ============================================================

def generate_q2_biz():
    print("\n=== Q2 Business Model Cards ===")
    companies = load_companies_by_quadrant("Q2")
    company_list = "\n".join([
        f"- {c['id']}: {c['name']} ({c.get('subCategory','?')}) - {c['description'][:80]}"
        for c in companies
    ])

    prompt = f"""以下の障害福祉業界の市場探索企業（Q2: 同じ業界×異なる価値）について、ビジネスモデル分析データをJSON配列で出力してください。

対象企業:
{company_list}

各社について、公開情報から推定できる範囲で以下を出力してください。

出力フォーマット（JSON配列）:
```json
[
  {{
    "companyId": "企業ID",
    "companyName": "企業名",
    "subCategory": "サブカテゴリ",
    "tam": "TAM（獲得可能な最大市場規模）の推定値（例: 約500億円）",
    "tamBasis": "TAM算出根拠（30字以内）",
    "pricingModel": "課金モデル（例: SaaS月額/成果報酬/ライセンス/手数料）",
    "unitEconomics": "単価イメージ（例: 月額3万円/事業所）またはnull",
    "targetCustomer": "ターゲット顧客（例: 障害福祉事業所/障害者雇用企業）",
    "channels": ["主な販売チャネル1", "チャネル2"],
    "customerNeeds": ["顧客ニーズ1", "ニーズ2", "ニーズ3"],
    "entryBarrier": "参入障壁（30字以内）",
    "smsApplicability": "high/medium/low",
    "smsNote": "SMSグループへの示唆（50字以内）",
    "confidence": "low/medium/high"
  }}
]
```

重要:
- 障害福祉業界の文脈で回答してください
- SMS = エス・エム・エス（カイポケ等を運営する介護・福祉DX企業）
- TAMは障害福祉市場の準市場特性（公定価格・給付費制度）を考慮
- 必ず有効なJSONのみを出力してください。"""

    print("  Calling Claude API...")
    result = call_claude(prompt)
    data = extract_json(result)
    save_json(data, "q2-business-models.json")
    print(f"  Generated {len(data)} companies")
    return data


# ============================================================
# Q3 業界勢力図
# ============================================================

def generate_q3_industry():
    print("\n=== Q3 Industry Force Map ===")
    companies = load_companies_by_quadrant("Q3")
    company_list = "\n".join([
        f"- {c['id']}: {c['name']} ({c.get('subCategory','?')}) - {c['description'][:80]}"
        for c in companies
    ])

    prompt = f"""以下の企業が属する業界（介護/医療/SaaS/HR）について、業界別の勢力図データをJSON配列で出力してください。

Q3（OPS深化）の対象企業:
{company_list}

各業界について、市場規模・主要プレイヤー・構造を出力してください。

出力フォーマット（JSON配列）:
```json
[
  {{
    "industry": "業界名（介護/医療/SaaS/HR・メディア）",
    "marketSize": "市場規模（例: 約12兆円）",
    "marketSizeYear": 2024,
    "growthRate": "成長率（例: CAGR 3.5%）",
    "structure": "寡占型/分散型/新興成長型",
    "structureNote": "業界構造の説明（50字以内）",
    "keyPlayers": [
      {{
        "name": "企業名",
        "companyId": "IRkunのcompanyId（該当する場合）またはnull",
        "revenue": "売上高（例: 約5,000億円）",
        "marketShare": "市場シェア（例: 約4%）またはnull",
        "position": "首位/2位/3位/主要プレイヤー",
        "note": "特徴（20字以内）"
      }}
    ],
    "relevanceToWelfare": "障害福祉との関連性・学びのポイント（80字以内）",
    "confidence": "low/medium/high"
  }}
]
```

重要:
- 各業界で5-8社の主要プレイヤーを含めてください（Q3対象企業を必ず含む）
- 介護 → SMS, ケア21, ニチイ, SOMPOケア, ベネッセ等
- 医療 → エムスリー, JMDC, メドレー, メドピア等
- SaaS → freee, サイボウズ, ラクス等（ホリゾンタルSaaS）
- HR・メディア → リクルート, パーソル, エン・ジャパン, dip等
- 障害福祉のOPS改善に活かせる視点を重視
- 必ず有効なJSONのみを出力してください。"""

    print("  Calling Claude API...")
    result = call_claude(prompt)
    data = extract_json(result)
    save_json(data, "q3-industry-force.json")
    print(f"  Generated {len(data)} industries")
    return data


# ============================================================
# Q1 BPMN ビジネスモデル図
# ============================================================

def generate_q1_bpmn():
    print("\n=== Q1 BPMN Business Model Diagrams ===")
    companies = load_companies_by_quadrant("Q1")
    company_list = "\n".join([
        f"- {c['id']}: {c['name']} ({c.get('subCategory','?')}) - {c['description'][:80]}"
        for c in companies
    ])

    prompt = f"""以下の障害福祉業界の直接競合8社について、ビジネスモデルのステークホルダー関係図データをJSON配列で出力してください。
React Flowで描画するため、ノード（x,y座標付き）とエッジ（接続情報）の形式です。

対象企業:
{company_list}

出力フォーマット（JSON配列）:
```json
[
  {{
    "companyId": "企業ID",
    "companyName": "企業名",
    "subCategory": "サブカテゴリ",
    "summary": "ビジネスモデルの一言サマリー（40字以内）",
    "nodes": [
      {{
        "id": "ノードID（例: user, company, gov, provider）",
        "label": "表示名（例: 障害者, 企業, 自治体）",
        "type": "stakeholder/service/platform",
        "x": 100,
        "y": 200
      }}
    ],
    "edges": [
      {{
        "id": "エッジID（例: e1）",
        "source": "ノードID",
        "target": "ノードID",
        "label": "やり取り内容（例: 給付費請求, サービス提供, 紹介料）",
        "type": "money/service/information/contract"
      }}
    ]
  }}
]
```

各企業のビジネスモデルに応じたステークホルダーとフロー:

■ メディア・就労支援（リタリコ, ウェルビー, ココルポート）:
  - ステークホルダー: 障害者(利用者), 企業(雇用先), 自治体(給付費), 相談支援
  - フロー: 訓練提供, 給付費請求, 就職マッチング, 定着支援
  - キャンバスサイズ: 800x400程度

■ 人材紹介（atGP, パーソル）:
  - ステークホルダー: 求職者(障害者), 企業(求人), プラットフォーム
  - フロー: 求人掲載, マッチング, 紹介料, 定着支援

■ SaaS（HUG, NDソフトウェア, knowbe）:
  - ステークホルダー: 事業所, 利用者, 国保連, 自治体
  - フロー: SaaS利用料, 請求代行, データ管理

座標は以下の規則:
- 左から右へフローが流れるレイアウト（x: 50-750, y: 50-350）
- 中心に対象企業を配置
- 上に行政系、下にエンドユーザー系
- ノード間は150px以上の間隔

必ず有効なJSONのみを出力してください。"""

    print("  Calling Claude API...")
    result = call_claude(prompt)
    data = extract_json(result)
    save_json(data, "q1-bpmn.json")
    print(f"  Generated {len(data)} companies")
    return data


# ============================================================
# メイン
# ============================================================

GENERATORS = {
    "q1-ops": generate_q1_ops,
    "q2-biz": generate_q2_biz,
    "q3-industry": generate_q3_industry,
    "q1-bpmn": generate_q1_bpmn,
}

def main():
    parser = argparse.ArgumentParser(description="Generate quadrant data via Claude API")
    parser.add_argument("--type", type=str, help=f"Data type: {','.join(GENERATORS.keys())}")
    parser.add_argument("--all", action="store_true", help="Generate all types")
    args = parser.parse_args()

    if not ANTHROPIC_API_KEY:
        print("[ERROR] ANTHROPIC_API_KEY not set")
        return

    if args.all:
        types = list(GENERATORS.keys())
    elif args.type:
        types = [t.strip() for t in args.type.split(",")]
        invalid = [t for t in types if t not in GENERATORS]
        if invalid:
            print(f"[ERROR] Unknown type(s): {invalid}")
            return
    else:
        parser.error("--type or --all required")

    print(f"=== Quadrant Data Generator ===")
    print(f"Types: {types}")

    for t in types:
        GENERATORS[t]()

    print(f"\n=== Done: {len(types)} type(s) ===")


if __name__ == "__main__":
    main()
