#!/usr/bin/env python3
"""
companies.json の象限分類済み企業に subCategory フィールドを追加する。
QuadrantDetailPage.tsx のキーワードマッチロジックをPythonに移植 + Q2/Q4は手動マッピング。

Usage:
  python add_subcategory.py          # 実行（companies.json を更新）
  python add_subcategory.py --dry    # ドライラン（変更内容のみ表示）
"""
import argparse
import json
from pathlib import Path

from config import COMPANIES_PATH

# Q1: QuadrantDetailPage.tsx の Q1_CLASSIFY と同一ロジック
Q1_CLASSIFY = [
    {"label": "人材紹介", "keywords": ["人材紹介", "人材派遣", "求人", "dodaチャレンジ", "atGP"]},
    {"label": "SaaS", "keywords": ["SaaS", "クラウド", "ソフト", "システム", "請求管理", "支援記録"]},
    {"label": "メディア・就労支援", "keywords": ["就労移行", "就労定着", "放課後", "児童発達", "メディア", "仕事ナビ"]},
]

# Q3: QuadrantDetailPage.tsx の Q3_CLASSIFY と同一ロジック
Q3_CLASSIFY = [
    {"label": "介護", "keywords": ["介護", "ケア", "グループホーム", "カイポケ"]},
    {"label": "医療", "keywords": ["m3.com", "MR", "治験", "CLINICS", "医療", "JMDC"]},
    {"label": "SaaS", "keywords": ["freee", "サイボウズ", "会計", "業務", "SaaS"]},
    {"label": "HR・メディア", "keywords": ["Indeed", "リクナビ", "ビズリーチ", "ジョブメドレー", "Airシリーズ", "人材"]},
]

# Q2: 手動マッピング（4社）
Q2_MANUAL = {
    "copel": "事業所向け",
    "kaien": "事業所向け",
    "spool": "企業向け",
    "startline": "企業向け",
}

# Q4: 手動マッピング（3社）
Q4_MANUAL = {
    "ai_inside": "AI/BPO",
    "layerx": "AI/BPO",
    "visional": "HR・メディア",
}


def classify_company(company: dict, rules: list[dict]) -> str | None:
    text = " ".join([
        company.get("name", ""),
        company.get("description", ""),
        *company.get("mainServices", []),
    ])
    for rule in rules:
        if any(kw in text for kw in rule["keywords"]):
            return rule["label"]
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true", help="Dry run")
    args = parser.parse_args()

    with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
        companies = json.load(f)

    updated = 0
    for company in companies:
        quadrant = company.get("quadrant")
        if not quadrant:
            continue

        sub_category = None
        if quadrant == "Q1":
            sub_category = classify_company(company, Q1_CLASSIFY)
        elif quadrant == "Q3":
            sub_category = classify_company(company, Q3_CLASSIFY)
        elif quadrant == "Q2":
            sub_category = Q2_MANUAL.get(company["id"])
        elif quadrant == "Q4":
            sub_category = Q4_MANUAL.get(company["id"])

        if sub_category:
            company["subCategory"] = sub_category
            updated += 1
            print(f"  {quadrant} {company['id']:25s} -> {sub_category}")
        else:
            print(f"  {quadrant} {company['id']:25s} -> (unclassified)")

    if not args.dry:
        with open(COMPANIES_PATH, "w", encoding="utf-8") as f:
            json.dump(companies, f, ensure_ascii=False, indent=2)
        print(f"\nUpdated {updated} companies in {COMPANIES_PATH}")
    else:
        print(f"\n[DRY RUN] Would update {updated} companies")


if __name__ == "__main__":
    main()
