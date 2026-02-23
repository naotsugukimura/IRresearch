"""
IRkun: Classify 62 unclassified companies into Q1-Q4 quadrants.
Based on chaos map axes:
  Q1 (direct competitor): same industry + same value (disability welfare, same services)
  Q2 (market explorer): same industry + different value (disability welfare, different services)
  Q3 (OPS deep dive): different industry + same value (care/medical/SaaS/HR, learn OPS)
  Q4 (tech catchup): different industry + different value (AI/DX tech reference)
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
COMPANIES_PATH = PROJECT_ROOT / "data" / "companies.json"

# Classification rules based on category + tags + description analysis
CLASSIFICATION = {
    # === Category A: 障害福祉事業所運営 → Q1 (直接競合) or Q2 (市場探索) ===
    "bright_vacation":  {"quadrant": "Q1", "subCategory": "事業所運営"},  # 障害福祉事業所運営
    "global_kids":      {"quadrant": "Q2", "subCategory": "保育・児童"},  # 保育事業が主だが児童発達支援にも参入
    "goodwill":         {"quadrant": "Q1", "subCategory": "事業所運営"},  # 障害者就労支援事業所運営
    "lifedrink":        {"quadrant": "Q2", "subCategory": "独自路線"},    # 飲料メーカーだが障害者雇用推進
    "miraiz":           {"quadrant": "Q1", "subCategory": "事業所運営"},  # 障害福祉サービス
    "onelife":          {"quadrant": "Q1", "subCategory": "事業所運営"},  # 障害福祉事業所運営
    "qubell":           {"quadrant": "Q1", "subCategory": "事業所運営"},  # 就労支援事業所運営

    # === Category B: 障害者雇用・コンサル → Q1 or Q2 ===
    "cuore":            {"quadrant": "Q2", "subCategory": "企業向け"},    # 障害者雇用コンサル
    "ewell":            {"quadrant": "Q2", "subCategory": "企業向け"},    # 健康経営・福利厚生
    "pasona":           {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 大手人材、障害者雇用も展開
    "valt":             {"quadrant": "Q2", "subCategory": "企業向け"},    # 障害者雇用支援

    # === Category C: 福祉SaaS・システム → Q1 (SaaS) or Q2 ===
    "kanamic":          {"quadrant": "Q1", "subCategory": "SaaS"},        # 介護・福祉向けSaaS
    "lifemap":          {"quadrant": "Q2", "subCategory": "事業所向け"},  # 福祉系マッピング
    "reha_cloud":       {"quadrant": "Q2", "subCategory": "事業所向け"},  # リハビリ系クラウド
    "sakura_cs":        {"quadrant": "Q3", "subCategory": "SaaS"},        # IT基盤（みずほ系）
    "totalmobile":      {"quadrant": "Q2", "subCategory": "事業所向け"},  # モバイルワーク
    "wiseman":          {"quadrant": "Q1", "subCategory": "SaaS"},        # 介護福祉SaaS
    "zyras":            {"quadrant": "Q2", "subCategory": "事業所向け"},  # 福祉系システム

    # === Category D: 介護・福祉関連 → Q3 (OPS深化) ===
    "ami":              {"quadrant": "Q3", "subCategory": "介護"},        # ヨガ→福祉M&A
    "charm_care":       {"quadrant": "Q3", "subCategory": "介護"},        # 介護施設運営
    "curebito":         {"quadrant": "Q3", "subCategory": "医療"},        # 医療系CUCグループ
    "minnano_kaigo":    {"quadrant": "Q3", "subCategory": "介護"},        # 介護メディア
    "nichii":           {"quadrant": "Q3", "subCategory": "介護"},        # 大手介護
    "saint_care":       {"quadrant": "Q3", "subCategory": "介護"},        # 介護ホールディング
    "silverii":         {"quadrant": "Q3", "subCategory": "介護"},        # 高齢者配食
    "sompo_care":       {"quadrant": "Q3", "subCategory": "介護"},        # 大手介護（損保系）
    "sorust":           {"quadrant": "Q3", "subCategory": "介護"},        # 介護大手ソラスト
    "sun_welfare":      {"quadrant": "Q3", "subCategory": "介護"},        # 介護・ホスピス
    "tsukui":           {"quadrant": "Q3", "subCategory": "介護"},        # 介護大手ツクイ
    "unimat":           {"quadrant": "Q3", "subCategory": "介護"},        # 介護リタイアメント

    # === Category E: 人材・HR → Q3 (OPS深化 - HR/メディア) ===
    "benefit_one":      {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 福利厚生大手
    "crowd_works":      {"quadrant": "Q3", "subCategory": "HR/メディア"}, # クラウドソーシング
    "decoboco":         {"quadrant": "Q2", "subCategory": "企業向け"},    # 発達障害×HR（同じ業界）
    "dip":              {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 求人メディア大手
    "en_japan":         {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 求人メディア大手
    "lancers":          {"quadrant": "Q3", "subCategory": "HR/メディア"}, # フリーランスマッチング
    "manpower":         {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 人材派遣大手
    "outsourcing":      {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 人材アウトソーシング
    "proto":            {"quadrant": "Q3", "subCategory": "HR/メディア"}, # メディア企業
    "special_learning": {"quadrant": "Q2", "subCategory": "事業所向け"},  # 障害福祉×eラーニング
    "tryt":             {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 医療福祉人材
    "ut_group":         {"quadrant": "Q3", "subCategory": "HR/メディア"}, # 製造派遣大手

    # === Category F: テック・教育・医療DX → Q3 or Q4 ===
    "aidemy":           {"quadrant": "Q4", "subCategory": "EdTech"},       # AI教育プラットフォーム
    "atama_plus":       {"quadrant": "Q4", "subCategory": "EdTech"},       # AIタブレット学習
    "benesse":          {"quadrant": "Q3", "subCategory": "介護"},         # 教育＋介護大手
    "care_net":         {"quadrant": "Q3", "subCategory": "医療"},         # 医療メディア
    "cybozu":           {"quadrant": "Q3", "subCategory": "SaaS"},         # グループウェア大手
    "freee":            {"quadrant": "Q3", "subCategory": "SaaS"},         # クラウド会計
    "genda":            {"quadrant": "Q4", "subCategory": "AI/BPO"},       # エンタメ×テック
    "jmdc":             {"quadrant": "Q3", "subCategory": "医療"},         # 医療ビッグデータ
    "kumon":            {"quadrant": "Q4", "subCategory": "EdTech"},       # 公文式教育
    "medpeer":          {"quadrant": "Q3", "subCategory": "医療"},         # 医師向けプラットフォーム
    "money_forward":    {"quadrant": "Q3", "subCategory": "SaaS"},         # クラウド会計
    "obic":             {"quadrant": "Q3", "subCategory": "SaaS"},         # 基幹システム
    "phc":              {"quadrant": "Q3", "subCategory": "医療"},         # 医療機器
    "progrit":          {"quadrant": "Q4", "subCategory": "EdTech"},       # 英語コーチング
    "rakus":            {"quadrant": "Q3", "subCategory": "SaaS"},         # クラウドサービス
    "sansan":           {"quadrant": "Q3", "subCategory": "SaaS"},         # 名刺管理SaaS
    "shift":            {"quadrant": "Q4", "subCategory": "AI/BPO"},       # ソフトウェアテスト
    "surala":           {"quadrant": "Q4", "subCategory": "EdTech"},       # AI学習支援
    "uzabase":          {"quadrant": "Q4", "subCategory": "AI/BPO"},       # 経済メディア×AI
    "visasq":           {"quadrant": "Q4", "subCategory": "AI/BPO"},       # ナレッジマッチング
}


def main():
    with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
        companies = json.load(f)

    updated = 0
    for company in companies:
        cid = company["id"]
        if cid in CLASSIFICATION:
            cls = CLASSIFICATION[cid]
            company["quadrant"] = cls["quadrant"]
            company["subCategory"] = cls["subCategory"]
            updated += 1

    with open(COMPANIES_PATH, "w", encoding="utf-8") as f:
        json.dump(companies, f, ensure_ascii=False, indent=2)

    # Summary
    q_counts = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}
    unclassified = 0
    for c in companies:
        q = c.get("quadrant")
        if q in q_counts:
            q_counts[q] += 1
        else:
            unclassified += 1

    print(f"Updated {updated} companies")
    print(f"Q1 (direct): {q_counts['Q1']}")
    print(f"Q2 (market): {q_counts['Q2']}")
    print(f"Q3 (OPS):    {q_counts['Q3']}")
    print(f"Q4 (tech):   {q_counts['Q4']}")
    print(f"Unclassified: {unclassified}")
    print(f"Total: {sum(q_counts.values()) + unclassified}")


if __name__ == "__main__":
    main()
