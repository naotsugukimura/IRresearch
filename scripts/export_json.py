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
}


def main():
    parser = argparse.ArgumentParser(description="Supabase → JSON エクスポート")
    parser.add_argument(
        "--only",
        type=str,
        help=f"特定テーブルのみ: {', '.join(EXPORT_STEPS.keys())}",
    )
    args = parser.parse_args()

    print("=== Supabase → JSON エクスポート ===")

    if args.only:
        if args.only not in EXPORT_STEPS:
            print(f"[ERROR] Unknown: {args.only}")
            print(f"Available: {', '.join(EXPORT_STEPS.keys())}")
            sys.exit(1)
        filename, export_fn = EXPORT_STEPS[args.only]
        data = export_fn()
        _write_json(DATA_DIR / filename, data)
    else:
        for step_name, (filename, export_fn) in EXPORT_STEPS.items():
            data = export_fn()
            _write_json(DATA_DIR / filename, data)

    print("\n=== エクスポート完了 ===")


if __name__ == "__main__":
    main()
