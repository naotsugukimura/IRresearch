#!/usr/bin/env python3
"""
Tavily Search API to generate earnings insights for listed companies
where PDF scraping fails (JS-rendered IR pages).

Outputs the same JSON format as earnings_analyzer.py so the UI works unchanged.

Usage:
  python tavily_earnings.py --company welbe
  python tavily_earnings.py --companies welbe,medley,freee
  python tavily_earnings.py --all-missing   # all listed companies without insights
"""
import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv(override=True)

from config import DATA_DIR, COMPANIES_PATH, COMPANY_MAP

# Tavily SDK
try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

# Anthropic SDK
try:
    import anthropic
except ImportError:
    anthropic = None

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096

INSIGHTS_DIR = DATA_DIR / "earnings-insights"

# Non-listed company IDs (exclude from --all-missing)
PRIVATE_COMPANY_IDS = {
    "atama_plus", "atgp", "bright_vacation", "cuore", "decoboco",
    "goodwill", "hug", "kaien", "knowbe", "kumon",
    "layerx", "lifemap", "manpower", "minnano_kaigo", "miraiz",
    "nichii", "onelife", "reha_cloud", "sompo_care", "special_learning",
    "startline", "totalmobile", "valt", "wiseman", "zyras",
}

# Search queries for earnings data
EARNINGS_QUERIES = [
    "{name} 決算 業績 売上高 営業利益 2025 2026",
    "{name} 決算説明 KPI 事業所数 ユーザー数 施設数",
    "{name} M&A 買収 中期経営計画 成長戦略",
]

ANALYSIS_PROMPT = """以下のWeb検索結果から、上場企業「{company_name}」（証券コード: {stock_code}）の決算・業績情報を抽出し、
earnings_analyzer.pyと同じJSON形式で出力してください。

検索結果:
{web_results}

以下のJSON形式で出力してください。該当する情報がない項目はnullとしてください。
数値は単位を統一してください（売上高・利益は百万円、成長率は%）。

{{
  "business_kpis": {{
    "arr": null,
    "mrr": null,
    "churn_rate": null,
    "arpu": null,
    "cac": null,
    "ltv": null,
    "user_count": null,
    "facility_count": null,
    "employee_count": null,
    "other_kpis": [
      {{"name": "KPI名", "value": 123, "unit": "単位"}}
    ]
  }},
  "market_sizing": {{
    "tam": null,
    "sam": null,
    "som": null,
    "market_growth_rate": null,
    "market_notes": "市場に関する補足情報"
  }},
  "ma_info": [
    {{
      "target": "買収対象企業名",
      "date": "実施時期",
      "amount": "投資額",
      "synergy": "シナジー効果",
      "status": "completed/announced/planned"
    }}
  ],
  "midterm_plan": {{
    "name": "計画名称",
    "period": "対象期間",
    "revenue_target": "売上目標",
    "profit_target": "利益目標",
    "key_strategies": ["重点施策1", "重点施策2"]
  }},
  "fiscal_period": "この情報の対象期間（例: 2025年3月期）",
  "summary": "企業業績の要約（200字以内）"
}}

推定値には「推定」と明記してください。
必ず有効なJSONのみを出力してください。説明文は不要です。
"""


def search_tavily(query: str) -> dict:
    """Tavily Search APIで検索"""
    if not TavilyClient or not TAVILY_API_KEY:
        return {}
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


def analyze_with_claude(
    company_name: str,
    stock_code: str,
    web_results_text: str,
) -> Optional[dict]:
    """Tavily results -> Claude -> structured JSON"""
    if not anthropic or not ANTHROPIC_API_KEY:
        print("  [ERROR] Anthropic API not available")
        return None

    prompt = ANALYSIS_PROMPT.format(
        company_name=company_name,
        stock_code=stock_code,
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
        json_text = response_text
        if "```json" in json_text:
            json_text = json_text.split("```json")[1].split("```")[0]
        elif "```" in json_text:
            json_text = json_text.split("```")[1].split("```")[0]
        return json.loads(json_text.strip())
    except Exception as e:
        print(f"  [ERROR] Claude analysis failed: {e}")
        return None


def research_earnings(company_id: str, company_name: str, stock_code: str) -> Optional[dict]:
    """Research earnings for one company via Tavily + Claude"""
    print(f"\n[{company_id}] {company_name} ({stock_code})")

    all_web_results = []
    for query_template in EARNINGS_QUERIES:
        query = query_template.format(name=company_name)
        print(f"  Searching: {query[:60]}...")
        response = search_tavily(query)
        results = response.get("results", [])
        if results:
            all_web_results.extend(results)
            print(f"  -> {len(results)} results")
        answer = response.get("answer")
        if answer:
            all_web_results.append({"title": "Tavily AI Summary", "url": "", "content": answer})
        time.sleep(1)

    if not all_web_results:
        print(f"  [SKIP] No search results found")
        return None

    # Deduplicate by URL
    seen_urls = set()
    unique_results = []
    for r in all_web_results:
        url = r.get("url", "")
        if url and url in seen_urls:
            continue
        seen_urls.add(url)
        unique_results.append(r)

    # Format for Claude
    web_results_text = ""
    for i, r in enumerate(unique_results[:15]):
        web_results_text += f"\n[{i+1}] {r.get('title', 'N/A')}\n"
        web_results_text += f"URL: {r.get('url', 'N/A')}\n"
        content = r.get("content", "")[:600]
        web_results_text += f"Content: {content}\n"

    print(f"  Analyzing with Claude ({len(unique_results)} unique results)...")
    result = analyze_with_claude(company_name, stock_code, web_results_text)

    if not result:
        print(f"  [FAIL] Analysis failed")
        return None

    result["source_file"] = "tavily_web_search"
    print(f"  [OK] Analysis complete")
    return result


def get_listed_company_ids() -> list[str]:
    """Get all listed company IDs from companies.json"""
    companies = json.loads(Path(COMPANIES_PATH).read_text(encoding="utf-8"))
    return [
        c["id"]
        for c in companies
        if c["id"] not in PRIVATE_COMPANY_IDS and c.get("stockCode")
    ]


def get_missing_company_ids() -> list[str]:
    """Get listed company IDs that don't have earnings insights yet"""
    listed = get_listed_company_ids()
    existing = {p.stem for p in INSIGHTS_DIR.glob("*.json")} if INSIGHTS_DIR.exists() else set()
    return [cid for cid in listed if cid not in existing]


def main():
    parser = argparse.ArgumentParser(description="Tavily-based earnings insights for listed companies")
    parser.add_argument("--company", type=str, help="Single company ID")
    parser.add_argument("--companies", type=str, help="Comma-separated company IDs")
    parser.add_argument("--all-missing", action="store_true", help="All listed companies without insights")
    parser.add_argument("--dry-run", action="store_true", help="Show target companies only")
    args = parser.parse_args()

    # Load company data
    companies_data = json.loads(Path(COMPANIES_PATH).read_text(encoding="utf-8"))
    company_map = {c["id"]: c for c in companies_data}

    # Determine targets
    if args.all_missing:
        target_ids = get_missing_company_ids()
    elif args.companies:
        target_ids = [c.strip() for c in args.companies.split(",")]
    elif args.company:
        target_ids = [args.company]
    else:
        parser.error("--company, --companies, or --all-missing required")

    # Filter to valid IDs
    valid_targets = []
    for cid in target_ids:
        if cid not in company_map:
            print(f"[WARN] Unknown company: {cid}, skipping")
            continue
        valid_targets.append(cid)

    print(f"=== Tavily Earnings Research ===")
    print(f"Target: {len(valid_targets)} companies")
    print(f"API cost: ~{len(valid_targets) * 3 * 2} Tavily credits + ~${len(valid_targets) * 0.03:.1f} Claude")

    if args.dry_run:
        for cid in valid_targets:
            c = company_map[cid]
            print(f"  {cid}: {c['name']} ({c.get('stockCode', 'N/A')})")
        return

    INSIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    success_count = 0

    for cid in valid_targets:
        c = company_map[cid]
        stock_code = c.get("stockCode", "")

        result = research_earnings(cid, c["name"], stock_code)
        if not result:
            continue

        output = {
            "companyId": cid,
            "analyzedAt": datetime.now().isoformat(),
            "documents": [result],
        }

        output_path = INSIGHTS_DIR / f"{cid}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"  Saved: {output_path.name}")
        success_count += 1

    print(f"\n=== Done: {success_count}/{len(valid_targets)} companies ===")


if __name__ == "__main__":
    main()
