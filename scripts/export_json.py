"""
Supabase → JSON エクスポートスクリプト

Usage:
  python export_json.py          # 全データをエクスポート
  python export_json.py --only companies   # 特定テーブルのみ
"""
import argparse
import sys

from dotenv import load_dotenv

load_dotenv()

from config import DATA_DIR
from db import (
    export_companies_json,
    export_financials_json,
    export_business_plans_json,
    export_histories_json,
    export_strategies_json,
    export_advantages_json,
    export_trends_json,
    export_notes_json,
    export_glossary_json,
    export_earnings_insights_json,
    export_web_research_json,
    _write_json,
)


EXPORT_STEPS = {
    "companies": ("companies.json", export_companies_json),
    "financials": ("financials.json", export_financials_json),
    "business-plans": ("business-plans.json", export_business_plans_json),
    "histories": ("histories.json", export_histories_json),
    "strategies": ("strategies.json", export_strategies_json),
    "advantages": ("competitive-advantages.json", export_advantages_json),
    "trends": ("trends.json", export_trends_json),
    "notes": ("notes.json", export_notes_json),
    "glossary": ("glossary.json", export_glossary_json),
    "earnings-insights": (None, export_earnings_insights_json),  # 企業別ファイル
    "web-research": (None, export_web_research_json),  # 企業別ファイル
}


def _export_earnings_insights(data: dict) -> None:
    """earnings-insights を企業別JSONファイルとして出力"""
    if not data:
        print("  [OK] earnings-insights/ (0社)")
        return
    insights_dir = DATA_DIR / "earnings-insights"
    insights_dir.mkdir(parents=True, exist_ok=True)
    for company_id, company_data in data.items():
        _write_json(insights_dir / f"{company_id}.json", company_data)
    print(f"  [OK] earnings-insights/ ({len(data)}社)")


def _export_company_files(data: dict, subdir: str) -> None:
    """企業別JSONファイルを汎用出力"""
    if not data:
        print(f"  [OK] {subdir}/ (0社)")
        return
    out_dir = DATA_DIR / subdir
    out_dir.mkdir(parents=True, exist_ok=True)
    for company_id, company_data in data.items():
        _write_json(out_dir / f"{company_id}.json", company_data)
    print(f"  [OK] {subdir}/ ({len(data)}社)")


def main():
    all_keys = list(EXPORT_STEPS.keys())
    parser = argparse.ArgumentParser(description="Supabase → JSON エクスポート")
    parser.add_argument(
        "--only",
        type=str,
        help=f"特定テーブルのみ: {', '.join(all_keys)}",
    )
    args = parser.parse_args()

    print("=== Supabase → JSON エクスポート ===")

    if args.only:
        if args.only not in EXPORT_STEPS:
            print(f"[ERROR] Unknown: {args.only}")
            print(f"Available: {', '.join(all_keys)}")
            sys.exit(1)
        filename, export_fn = EXPORT_STEPS[args.only]
        data = export_fn()
        if args.only == "earnings-insights":
            _export_earnings_insights(data)
        elif args.only == "web-research":
            _export_company_files(data, "web-research")
        else:
            _write_json(DATA_DIR / filename, data)
    else:
        for step_name, (filename, export_fn) in EXPORT_STEPS.items():
            data = export_fn()
            if step_name == "earnings-insights":
                _export_earnings_insights(data)
            elif step_name == "web-research":
                _export_company_files(data, "web-research")
            else:
                _write_json(DATA_DIR / filename, data)

    print("\n=== エクスポート完了 ===")


if __name__ == "__main__":
    main()
