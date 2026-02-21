"""
既存 JSON データを Supabase に移行するスクリプト

Usage:
  python migrate_to_supabase.py          # 全データ移行
  python migrate_to_supabase.py --only companies   # 特定テーブルのみ
"""
import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from config import DATA_DIR
from db import (
    upsert_company,
    upsert_company_segments,
    upsert_fiscal_year,
    upsert_business_plan,
    upsert_history_events,
    upsert_midterm_plans,
    upsert_competitive_advantage,
    upsert_trend,
    upsert_note,
    upsert_glossary,
)


def _load_json(filename: str) -> list | dict:
    path = DATA_DIR / filename
    if not path.exists():
        print(f"  [WARN] {filename} not found, skipping")
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def migrate_companies():
    """companies.json → companies + company_segments"""
    print("\n--- companies ---")
    data = _load_json("companies.json")
    for i, company in enumerate(data):
        upsert_company(company)
        segments = company.get("segments", [])
        if segments:
            upsert_company_segments(company["id"], segments)
        print(f"  [{i+1}/{len(data)}] {company['id']}")
    print(f"  [OK] {len(data)} companies migrated")


def migrate_financials():
    """financials.json → fiscal_years + segment_financials"""
    print("\n--- financials ---")
    data = _load_json("financials.json")
    total_fys = 0
    for company_fin in data:
        cid = company_fin["companyId"]
        for fy in company_fin.get("fiscalYears", []):
            upsert_fiscal_year(cid, fy)
            total_fys += 1
        print(f"  {cid}: {len(company_fin.get('fiscalYears', []))} years")
    print(f"  [OK] {total_fys} fiscal years migrated")


def migrate_business_plans():
    """business-plans.json → business_plans + plan_sections + plan_rows"""
    print("\n--- business-plans ---")
    data = _load_json("business-plans.json")
    for i, bp in enumerate(data):
        seg_label = bp.get("segmentName", "全社")
        upsert_business_plan(bp)
        if (i + 1) % 10 == 0 or i == len(data) - 1:
            print(f"  [{i+1}/{len(data)}] {bp['companyId']} / {seg_label}")
    print(f"  [OK] {len(data)} business plans migrated")


def migrate_histories():
    """histories.json → history_events"""
    print("\n--- histories ---")
    data = _load_json("histories.json")
    total = 0
    for company_hist in data:
        cid = company_hist["companyId"]
        events = company_hist.get("events", [])
        upsert_history_events(cid, events)
        total += len(events)
        print(f"  {cid}: {len(events)} events")
    print(f"  [OK] {total} history events migrated")


def migrate_strategies():
    """strategies.json → midterm_plans + key_strategies"""
    print("\n--- strategies ---")
    data = _load_json("strategies.json")
    total = 0
    for company_strat in data:
        cid = company_strat["companyId"]
        plans = company_strat.get("plans", [])
        upsert_midterm_plans(cid, plans)
        total += len(plans)
        print(f"  {cid}: {len(plans)} plans")
    print(f"  [OK] {total} midterm plans migrated")


def migrate_advantages():
    """competitive-advantages.json → competitive_advantages"""
    print("\n--- competitive-advantages ---")
    data = _load_json("competitive-advantages.json")
    for i, adv in enumerate(data):
        upsert_competitive_advantage(adv)
        print(f"  [{i+1}/{len(data)}] {adv['companyId']}")
    print(f"  [OK] {len(data)} advantages migrated")


def migrate_trends():
    """trends.json → industry_trends + trend_company_impacts"""
    print("\n--- trends ---")
    data = _load_json("trends.json")
    for i, trend in enumerate(data):
        upsert_trend(trend)
        print(f"  [{i+1}/{len(data)}] {trend['id']}")
    print(f"  [OK] {len(data)} trends migrated")


def migrate_notes():
    """notes.json → analysis_notes"""
    print("\n--- notes ---")
    data = _load_json("notes.json")
    for i, note in enumerate(data):
        upsert_note(note)
        print(f"  [{i+1}/{len(data)}] {note['id']}")
    print(f"  [OK] {len(data)} notes migrated")


def migrate_glossary():
    """glossary.json → glossary"""
    print("\n--- glossary ---")
    data = _load_json("glossary.json")
    if data:
        upsert_glossary(data)
        print(f"  [OK] glossary migrated")


MIGRATE_STEPS = {
    "companies": migrate_companies,
    "financials": migrate_financials,
    "business-plans": migrate_business_plans,
    "histories": migrate_histories,
    "strategies": migrate_strategies,
    "advantages": migrate_advantages,
    "trends": migrate_trends,
    "notes": migrate_notes,
    "glossary": migrate_glossary,
}


def main():
    parser = argparse.ArgumentParser(description="JSON → Supabase 移行")
    parser.add_argument(
        "--only",
        type=str,
        help=f"特定テーブルのみ移行: {', '.join(MIGRATE_STEPS.keys())}",
    )
    args = parser.parse_args()

    print("=== JSON → Supabase 移行 ===")

    if args.only:
        if args.only not in MIGRATE_STEPS:
            print(f"[ERROR] Unknown: {args.only}")
            print(f"Available: {', '.join(MIGRATE_STEPS.keys())}")
            sys.exit(1)
        MIGRATE_STEPS[args.only]()
    else:
        # FK制約の順序で投入
        for step_name, step_fn in MIGRATE_STEPS.items():
            step_fn()

    print("\n=== 移行完了 ===")


if __name__ == "__main__":
    main()
