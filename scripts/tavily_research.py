#!/usr/bin/env python3
"""
Tavily Search API による非上場企業Webリサーチスクリプト

Usage:
  python tavily_research.py --company kaien                   # 1社テスト（全タイプ）
  python tavily_research.py --company kaien --type funding    # 特定タイプのみ
  python tavily_research.py --all-private                     # 非上場25社一括
  python tavily_research.py --all-private --type news         # 非上場全社のニュースのみ
  python tavily_research.py --export-json                     # DB→JSONエクスポートのみ
"""
import argparse
import json
import os
import time
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv(override=True)

from config import DATA_DIR, COMPANIES_PATH

# Tavily SDK（pip install tavily-python）
try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

# Anthropic SDK
try:
    import anthropic
except ImportError:
    anthropic = None

# DB（Supabase設定がある場合のみ）
try:
    from db import upsert_company_web_research, export_web_research_json, _write_json
except Exception:
    upsert_company_web_research = None
    export_web_research_json = None
    _write_json = None

# ============================================================
# 設定
# ============================================================

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096

WEB_RESEARCH_DIR = DATA_DIR / "web-research"

# research_type → 検索クエリサフィックス
QUERY_MAP = {
    "business_overview": "事業内容 サービス 特徴 会社概要",
    "funding": "資金調達 出資 投資 ラウンド 評価額",
    "news": "最新 ニュース 2025 2026 動向",
    "competitive": "競合 市場シェア 強み 差別化",
}

ALL_TYPES = list(QUERY_MAP.keys())

# 非上場企業IDリスト
PRIVATE_COMPANY_IDS = [
    "atama_plus", "atgp", "bright_vacation", "cuore", "decoboco",
    "goodwill", "hug", "kaien", "knowbe", "kumon",
    "layerx", "lifemap", "manpower", "minnano_kaigo", "miraiz",
    "nichii", "onelife", "reha_cloud", "sompo_care", "special_learning",
    "startline", "totalmobile", "valt", "wiseman", "zyras",
]

# Claude分析プロンプト
ANALYSIS_PROMPT = """以下のWeb検索結果から、「{company_name}」に関する情報を抽出し、JSON形式で出力してください。

検索タイプ: {research_type}
検索クエリ: {query}

検索結果:
{web_results}

出力フォーマット（該当しない項目はnullとすること）:
{{
  "business_overview": {{
    "founded": "設立年（例: 2009年）",
    "employees": "従業員数（数値 or 推定値）",
    "headquarters": "本社所在地",
    "description": "事業概要（100字以内）",
    "main_services": ["主力サービス1", "主力サービス2"]
  }},
  "funding": {{
    "total_raised": "累計調達額（例: 51億円）",
    "latest_round": "直近ラウンド（例: シリーズD）",
    "investors": ["投資家1", "投資家2"],
    "valuation_estimate": "推定評価額（あれば）"
  }},
  "recent_news": [
    {{
      "title": "ニュースタイトル",
      "date": "2025-XX-XX",
      "summary": "概要（50字以内）",
      "source_url": "元記事URL"
    }}
  ],
  "competitive_position": {{
    "strengths": ["強み1", "強み2"],
    "market_position": "市場ポジションの説明",
    "threat_to_sms": "SMSへの脅威度の説明（1-5段階と理由）"
  }},
  "confidence": "low/medium/high",
  "data_freshness": "検索結果の最新日付"
}}

推定値には必ず「推定」と明記してください。
情報がない項目はnullとしてください。
必ず有効なJSONのみを出力してください。説明文は不要です。
"""


# ============================================================
# Tavily Search
# ============================================================

def search_tavily(company_name: str, research_type: str) -> dict:
    """Tavily Search APIで企業情報を検索"""
    if not TavilyClient:
        print("  [ERROR] tavily-python not installed. Run: pip install tavily-python")
        return {}
    if not TAVILY_API_KEY:
        print("  [ERROR] TAVILY_API_KEY not set")
        return {}

    query_suffix = QUERY_MAP.get(research_type, "企業情報")
    query = f'"{company_name}" {query_suffix}'

    client = TavilyClient(api_key=TAVILY_API_KEY)

    try:
        response = client.search(
            query=query,
            max_results=8,
            search_depth="advanced",
            topic="general",
            include_answer=True,
        )
        return response
    except Exception as e:
        print(f"  [ERROR] Tavily search failed: {e}")
        return {}


# ============================================================
# Claude分析
# ============================================================

def analyze_with_claude(
    company_name: str,
    research_type: str,
    query: str,
    tavily_response: dict,
) -> Optional[dict]:
    """Tavily検索結果をClaude APIで構造化分析"""
    if not anthropic:
        print("  [ERROR] anthropic not installed. Run: pip install anthropic")
        return None
    if not ANTHROPIC_API_KEY:
        print("  [ERROR] ANTHROPIC_API_KEY not set")
        return None

    results = tavily_response.get("results", [])
    if not results:
        return None

    # 検索結果をテキスト化
    web_results_text = ""
    for i, r in enumerate(results[:10]):
        web_results_text += f"\n[{i+1}] {r.get('title', 'N/A')}\n"
        web_results_text += f"URL: {r.get('url', 'N/A')}\n"
        content = r.get("content", "")[:600]
        web_results_text += f"Content: {content}\n"

    # Tavilyのanswer（AI要約）があれば追加
    answer = tavily_response.get("answer")
    if answer:
        web_results_text += f"\n[Tavily AI Summary]\n{answer}\n"

    prompt = ANALYSIS_PROMPT.format(
        company_name=company_name,
        research_type=research_type,
        query=query,
        web_results=web_results_text,
    )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text

        # JSON部分を抽出
        json_text = response_text
        if "```json" in json_text:
            json_text = json_text.split("```json")[1].split("```")[0]
        elif "```" in json_text:
            json_text = json_text.split("```")[1].split("```")[0]

        return json.loads(json_text.strip())

    except Exception as e:
        print(f"  [ERROR] Claude analysis failed: {e}")
        return None


# ============================================================
# メイン処理
# ============================================================

def research_company(
    company_id: str,
    company_name: str,
    research_types: list[str],
    save_db: bool = True,
    save_json: bool = True,
) -> dict[str, dict]:
    """1社のWebリサーチを実行"""
    print(f"\n{'='*60}")
    print(f"[{company_id}] {company_name}")
    print(f"{'='*60}")

    results = {}

    for rtype in research_types:
        query_suffix = QUERY_MAP.get(rtype, "企業情報")
        query = f'"{company_name}" {query_suffix}'

        print(f"\n  [{rtype}] Searching: {query}")

        # Tavily検索
        tavily_response = search_tavily(company_name, rtype)
        search_results = tavily_response.get("results", [])

        if not search_results:
            print(f"  [{rtype}] No results, skipping")
            continue

        print(f"  [{rtype}] {len(search_results)} results found")
        source_urls = [r.get("url", "") for r in search_results]

        # Claude分析
        print(f"  [{rtype}] Analyzing with Claude...")
        analysis = analyze_with_claude(company_name, rtype, query, tavily_response)

        if not analysis:
            print(f"  [{rtype}] Analysis failed")
            continue

        confidence = analysis.get("confidence", "unknown")
        print(f"  [{rtype}] OK (confidence: {confidence})")

        # DB保存
        if save_db and upsert_company_web_research:
            try:
                rid = upsert_company_web_research(
                    company_id=company_id,
                    research_type=rtype,
                    query_terms=query,
                    source_urls=source_urls,
                    data=analysis,
                )
                print(f"  [{rtype}] DB saved (id={rid})")
            except Exception as e:
                print(f"  [{rtype}] DB save failed: {e}")

        results[rtype] = analysis

        # レート制限対策
        time.sleep(1)

    # JSONファイル保存
    if save_json and results:
        WEB_RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
        output = {
            "companyId": company_id,
            "research": [
                {
                    "type": rtype,
                    "queryTerms": f'"{company_name}" {QUERY_MAP.get(rtype, "")}',
                    "data": data,
                    "sourceUrls": [],
                    "searchedAt": __import__("datetime").datetime.now().isoformat(),
                }
                for rtype, data in results.items()
            ],
        }
        output_path = WEB_RESEARCH_DIR / f"{company_id}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n  Saved: {output_path}")

    return results


def export_json_only() -> None:
    """DB→JSONエクスポートのみ実行"""
    if not export_web_research_json or not _write_json:
        print("[ERROR] DB functions not available")
        return

    print("=== Web Research JSON エクスポート ===")
    data = export_web_research_json()
    if not data:
        print("  No data to export")
        return

    WEB_RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
    for company_id, company_data in data.items():
        _write_json(WEB_RESEARCH_DIR / f"{company_id}.json", company_data)
    print(f"\n  Exported {len(data)} companies")


def main():
    parser = argparse.ArgumentParser(description="Tavily Search APIによる非上場企業リサーチ")
    parser.add_argument("--company", type=str, help="対象企業ID")
    parser.add_argument("--all-private", action="store_true", help="非上場25社一括")
    parser.add_argument("--type", type=str, help=f"リサーチタイプ（カンマ区切り）: {','.join(ALL_TYPES)}")
    parser.add_argument("--export-json", action="store_true", help="DB→JSONエクスポートのみ")
    parser.add_argument("--no-db", action="store_true", help="DB保存をスキップ")
    args = parser.parse_args()

    if args.export_json:
        export_json_only()
        return

    # 企業データ読み込み
    companies_data = json.loads(Path(COMPANIES_PATH).read_text(encoding="utf-8"))
    company_map = {c["id"]: c for c in companies_data}

    # リサーチタイプ
    if args.type:
        research_types = [t.strip() for t in args.type.split(",")]
        invalid = [t for t in research_types if t not in ALL_TYPES]
        if invalid:
            print(f"[ERROR] Unknown type(s): {invalid}")
            print(f"Available: {ALL_TYPES}")
            return
    else:
        research_types = ALL_TYPES

    # 対象企業を決定
    if args.all_private:
        targets = [
            (cid, company_map[cid]["name"])
            for cid in PRIVATE_COMPANY_IDS
            if cid in company_map
        ]
    elif args.company:
        if args.company not in company_map:
            print(f"[ERROR] Unknown company: {args.company}")
            return
        targets = [(args.company, company_map[args.company]["name"])]
    else:
        parser.error("--company or --all-private required")

    print(f"=== Tavily Web Research ===")
    print(f"対象: {len(targets)}社")
    print(f"タイプ: {research_types}")
    print(f"API利用見込み: {len(targets) * len(research_types) * 2} クレジット (advanced)")

    save_db = not args.no_db

    for company_id, company_name in targets:
        research_company(
            company_id=company_id,
            company_name=company_name,
            research_types=research_types,
            save_db=save_db,
        )

    print(f"\n=== 完了: {len(targets)}社 ===")


if __name__ == "__main__":
    main()
