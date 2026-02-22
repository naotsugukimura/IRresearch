"""
Add BS/CF data to existing financials.json entries using Tavily + Claude.
Targets companies that have PL data but no BS/CF data.

Usage:
  python scripts/add_bscf_data.py                  # All missing
  python scripts/add_bscf_data.py sms              # Single company
  python scripts/add_bscf_data.py --dry-run         # Show targets
"""
import json
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

import anthropic

try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

MAX_PARALLEL = 3
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FINANCIALS_PATH = os.path.join(BASE_DIR, "data", "financials.json")

CLIENT = anthropic.Anthropic()

# Load company name map from config
sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))
from config import COMPANY_MAP


def search_bscf(company_name: str, stock_code: str) -> str:
    """Search for BS/CF data via Tavily"""
    if not TavilyClient or not TAVILY_API_KEY:
        return ""
    client = TavilyClient(api_key=TAVILY_API_KEY)
    queries = [
        f"{company_name} {stock_code} 貸借対照表 総資産 純資産 自己資本比率",
        f"{company_name} {stock_code} キャッシュフロー 営業CF 投資CF 財務CF フリーCF",
    ]
    all_text = ""
    for q in queries:
        try:
            resp = client.search(query=q, max_results=5, search_depth="advanced", include_answer=True)
            for r in resp.get("results", [])[:5]:
                all_text += f"\n[{r.get('title','')}]\n{r.get('content','')[:500]}\n"
            if resp.get("answer"):
                all_text += f"\n[Tavily Summary]\n{resp['answer']}\n"
        except Exception as e:
            print(f"  Search error: {e}")
        time.sleep(1)
    return all_text


def extract_bscf_with_claude(company_name: str, fiscal_years: list, web_text: str) -> dict:
    """Use Claude to extract BS/CF data from web search results"""
    fy_list = [fy["year"] for fy in fiscal_years]

    prompt = f"""Web search results for {company_name} Balance Sheet and Cash Flow data:

{web_text}

Based on the search results above, extract BS (Balance Sheet) and CF (Cash Flow) data for {company_name}.
The company has financial data for these fiscal years: {fy_list}

Return a JSON object mapping fiscal year string to its BS/CF data.
Only include years where you found actual data (not estimated).
All monetary values in MILLION YEN (百万円).

Format:
{{
  "2024年3月期": {{
    "totalAssets": 12345,
    "netAssets": 6789,
    "equity": 6500,
    "equityRatio": 52.7,
    "currentAssets": 8000,
    "currentLiabilities": 4000,
    "currentRatio": 200.0,
    "operatingCF": 3000,
    "investingCF": -1500,
    "financingCF": -800,
    "freeCF": 1500,
    "cashAndEquivalents": 5000
  }}
}}

Rules:
- Use null for any value you cannot determine from the search results
- equityRatio is in percentage (e.g. 52.7 means 52.7%)
- currentRatio is in percentage
- freeCF = operatingCF + investingCF
- Return ONLY valid JSON, no explanation"""

    try:
        response = CLIENT.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
        if text.startswith("json"):
            text = text[4:].strip()
        return json.loads(text)
    except Exception as e:
        print(f"  Claude error: {e}")
        return {}


def process_company(company_id: str, financials: dict, total: int, idx: int) -> bool:
    """Process one company: search + extract + merge"""
    cm = COMPANY_MAP.get(company_id, {})
    name = cm.get("name", company_id)
    stock_code = cm.get("stock_code", "")

    if not stock_code:
        print(f"[{idx}/{total}] {name} ({company_id}) SKIP - no stock code")
        return False

    print(f"[{idx}/{total}] {name} ({company_id}) searching...", flush=True)

    web_text = search_bscf(name, stock_code)
    if not web_text.strip():
        print(f"  No search results")
        return False

    bscf = extract_bscf_with_claude(name, financials["fiscalYears"], web_text)
    if not bscf:
        print(f"  No BS/CF extracted")
        return False

    # Merge BS/CF into fiscal years
    merged = 0
    for fy in financials["fiscalYears"]:
        year_key = fy["year"]
        if year_key in bscf:
            data = bscf[year_key]
            for k, v in data.items():
                if v is not None:
                    fy[k] = v
                    merged += 1

    print(f"  OK: merged {merged} fields across {len(bscf)} years")
    return merged > 0


def main():
    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    with open(FINANCIALS_PATH, "r", encoding="utf-8") as f:
        all_financials = json.load(f)

    # Find companies with PL but no BS/CF
    targets = []
    for fin in all_financials:
        cid = fin["companyId"]
        has_bs = any(fy.get("totalAssets") is not None for fy in fin["fiscalYears"])
        if not has_bs:
            # Only listed companies
            if cid in COMPANY_MAP:
                targets.append(fin)

    if args:
        targets = [t for t in targets if t["companyId"] in args]
        if not targets and args:
            # Maybe specified company already has BS data, try it anyway
            for fin in all_financials:
                if fin["companyId"] in args:
                    targets.append(fin)

    print(f"=== BS/CF Data Addition ===")
    print(f"Targets: {len(targets)} companies")

    if dry_run:
        for t in targets:
            cm = COMPANY_MAP.get(t["companyId"], {})
            print(f"  {t['companyId']}: {cm.get('name', '?')} ({cm.get('stock_code', '?')})")
        return

    total = len(targets)
    success = 0

    for i, fin in enumerate(targets, 1):
        if process_company(fin["companyId"], fin, total, i):
            success += 1

    # Save back
    with open(FINANCIALS_PATH, "w", encoding="utf-8") as f:
        json.dump(all_financials, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nDone! {success}/{total} companies updated")


if __name__ == "__main__":
    main()
