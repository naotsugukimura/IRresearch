"""
セグメント別PL（事業計画）自動生成スクリプト

companies.json のセグメント定義 + financials.json のセグメント別財務データを使い、
全社consolidated PLからセグメント別PLを按分生成する。

- LITALICOは手動作成済みのためスキップ
- 財務データにセグメント別revenue/profitがある場合: 実績比率で按分
- 財務データがない場合: companies.jsonのrevenueShare比率で按分
"""

import json
import re
import copy
from config import DATA_DIR, COMPANIES_PATH, FINANCIALS_PATH, BUSINESS_PLANS_PATH

SKIP_COMPANIES = {"litalico"}  # 手動作成済み


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved: {path}")


def to_segment_id(name: str) -> str:
    """セグメント名からsegmentIdを生成（ローマ字化）"""
    mapping = {
        "就労支援事業": "employment_support",
        "児童福祉事業": "child_welfare",
        "就労移行支援": "employment_transition",
        "自立訓練": "independence_training",
        "障害者雇用支援": "disability_employment",
        "人材ソリューション": "hr_solution",
        "ロジスティクス": "logistics",
        "キャリア事業": "career",
        "介護・障害福祉SaaS": "care_saas",
        "ヘルスケア": "healthcare",
        # Phase 2 追加分
        "人材派遣": "staffing",
        "BPO": "bpo",
        "障害者雇用コンサルティング": "disability_consulting",
        "サテライトオフィス": "satellite_office",
        "児童発達支援": "child_development",
        "放課後等デイサービス": "after_school",
        "福祉SaaS": "welfare_saas",
        "介護ソフト": "care_software",
        "クラウドサービス": "cloud_service",
        "保守・サポート": "maintenance",
        "医療事務受託": "medical_office",
        "介護サービス": "care_service",
        "障害福祉サービス": "disability_welfare",
        "訪問介護": "home_care",
        "訪問看護": "home_nursing",
        "介護施設": "care_facility",
        "グループホーム": "group_home",
        "就労移行支援サービス": "employment_transition_svc",
        "障害者人材紹介": "disability_recruitment",
        "求人プラットフォーム": "job_platform",
        "eラーニング": "e_learning",
        "研修サービス": "training_service",
        "人材紹介": "recruitment",
        "メディア": "media",
        "SaaS": "saas",
        "HR Tech": "hr_tech",
        "フランチャイズ": "franchise",
        "直営": "direct",
        "障害福祉ソフト": "disability_welfare_soft",
        "介護クラウド": "care_cloud",
        "多職種連携システム": "multi_profession",
        "障害福祉システム": "disability_welfare_sys",
        "放デイ向けSaaS": "afterschool_saas",
        "就労支援向けSaaS": "employment_saas",
        "障害者グループホーム": "disability_group_home",
        "児童発達支援FC": "child_dev_fc",
        "放課後等デイサービスFC": "afterschool_fc",
        "就労支援": "employment_support_gen",
        "AI-OCR": "ai_ocr",
    }
    if name in mapping:
        return mapping[name]
    # フォールバック: ひらがな/カタカナ/漢字をアンダースコア区切りに
    return re.sub(r"[^\w]", "_", name.lower()).strip("_")


def get_financial_segment_ratios(financials_list, company_id):
    """財務データからセグメント別のrevenue/profit比率を取得（直近年度）"""
    for fin in financials_list:
        if fin["companyId"] == company_id:
            # 直近年度を使用
            latest = fin["fiscalYears"][-1]
            if not latest.get("segments"):
                return None
            total_revenue = sum(s["revenue"] for s in latest["segments"])
            if total_revenue == 0:
                return None
            ratios = {}
            for seg in latest["segments"]:
                rev_ratio = seg["revenue"] / total_revenue
                # profitがある場合、利益率も算出
                profit_margin = None
                if seg.get("profit") is not None and seg["revenue"] > 0:
                    profit_margin = seg["profit"] / seg["revenue"]
                ratios[seg["name"]] = {
                    "revenue_ratio": rev_ratio,
                    "profit_margin": profit_margin,
                }
            return ratios
    return None


def match_segment_name(segment_name, financial_ratios):
    """companies.jsonのセグメント名とfinancials.jsonのセグメント名をマッチング"""
    if segment_name in financial_ratios:
        return segment_name
    # 部分一致を試みる
    for fin_name in financial_ratios:
        if segment_name in fin_name or fin_name in segment_name:
            return fin_name
    return None


def allocate_plan_by_segment(consolidated_plan, segment_name, revenue_ratio,
                              profit_margin=None, consolidated_profit_margin=None):
    """consolidated PLを指定比率でセグメント別に按分する"""
    segment_plan = copy.deepcopy(consolidated_plan)

    for section in segment_plan["sections"]:
        for row in section["rows"]:
            if row.get("isPercent"):
                # 比率系は按分後に再計算するので、一旦そのまま
                continue

            if row["label"] in ("売上高",):
                # 売上高: revenue比率で按分
                row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                if row["annual"] is not None:
                    row["annual"] = round(row["annual"] * revenue_ratio)

            elif row["label"] in ("売上原価",):
                if profit_margin is not None:
                    # 財務データから利益率がわかる場合: 売上 - 営業利益を逆算
                    # まず売上を取得
                    revenue_row = _find_row(section, "売上高")
                    if revenue_row:
                        # cost = revenue * (1 - gross_margin_implied)
                        # 簡易: 原価率 = 1 - 粗利率
                        # consolidated粗利率を使い、セグメントごとの利益率差を原価率に反映
                        seg_cost_ratio = 1.0 - (profit_margin + 0.15)  # 利益率+15%が粗利の概算
                        if seg_cost_ratio < 0.5:
                            seg_cost_ratio = 0.5
                        if seg_cost_ratio > 0.85:
                            seg_cost_ratio = 0.85
                        row["values"] = [round(rv * revenue_ratio * seg_cost_ratio)
                                        for rv in consolidated_plan["sections"][
                                            _find_section_idx(consolidated_plan, section["title"])
                                        ]["rows"][_find_row_idx(section, "売上高")]["values"]]
                        # ↑ 複雑になるので簡易化: revenue比率で按分
                        row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                        if row["annual"] is not None:
                            row["annual"] = round(row["annual"] * revenue_ratio)
                    else:
                        row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                        if row["annual"] is not None:
                            row["annual"] = round(row["annual"] * revenue_ratio)
                else:
                    row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                    if row["annual"] is not None:
                        row["annual"] = round(row["annual"] * revenue_ratio)

            elif row["label"] in ("粗利", "営業利益"):
                # 利益系: revenue比率で按分（profit_marginがあれば調整）
                if profit_margin is not None and row["label"] == "営業利益":
                    revenue_row = _find_row_in_plan(segment_plan, "売上高")
                    if revenue_row:
                        row["values"] = [round(rv * profit_margin) for rv in revenue_row["values"]]
                        if revenue_row["annual"] is not None:
                            row["annual"] = round(revenue_row["annual"] * profit_margin)
                        continue
                row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                if row["annual"] is not None:
                    row["annual"] = round(row["annual"] * revenue_ratio)

            elif row.get("isMonetary"):
                # その他の金額系: revenue比率で按分
                row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                if row["annual"] is not None:
                    row["annual"] = round(row["annual"] * revenue_ratio)

            else:
                # KPI系（利用者数、拠点数等）: revenue比率で按分
                row["values"] = [round(v * revenue_ratio) for v in row["values"]]
                if row["annual"] is not None:
                    row["annual"] = round(row["annual"] * revenue_ratio)

    # 粗利率・営業利益率を再計算
    _recalculate_ratios(segment_plan)

    return segment_plan


def _find_row(section, label):
    """セクション内でlabelに一致するrowを返す"""
    for row in section["rows"]:
        if row["label"] == label:
            return row
    return None


def _find_row_in_plan(plan, label):
    """プラン全体からlabelに一致するrowを返す"""
    for section in plan["sections"]:
        for row in section["rows"]:
            if row["label"] == label:
                return row
    return None


def _find_section_idx(plan, title):
    for i, s in enumerate(plan["sections"]):
        if s["title"] == title:
            return i
    return 0


def _find_row_idx(section, label):
    for i, r in enumerate(section["rows"]):
        if r["label"] == label:
            return i
    return 0


def _recalculate_ratios(plan):
    """粗利率・営業利益率を売上高から再計算"""
    revenue_row = _find_row_in_plan(plan, "売上高")
    gross_row = _find_row_in_plan(plan, "粗利")
    gross_rate_row = _find_row_in_plan(plan, "粗利率")
    profit_row = _find_row_in_plan(plan, "営業利益")
    profit_rate_row = _find_row_in_plan(plan, "営業利益率")

    if revenue_row and gross_row and gross_rate_row:
        gross_rate_row["values"] = [
            round(g / r * 100, 1) if r > 0 else 0.0
            for g, r in zip(gross_row["values"], revenue_row["values"])
        ]
        if gross_row["annual"] and revenue_row["annual"]:
            gross_rate_row["annual"] = round(
                gross_row["annual"] / revenue_row["annual"] * 100, 1
            )

    if revenue_row and profit_row and profit_rate_row:
        profit_rate_row["values"] = [
            round(p / r * 100, 1) if r > 0 else 0.0
            for p, r in zip(profit_row["values"], revenue_row["values"])
        ]
        if profit_row["annual"] and revenue_row["annual"]:
            profit_rate_row["annual"] = round(
                profit_row["annual"] / revenue_row["annual"] * 100, 1
            )

    # 粗利 = 売上 - 原価 を再計算
    cost_row = _find_row_in_plan(plan, "売上原価")
    if revenue_row and cost_row and gross_row:
        gross_row["values"] = [
            r - c for r, c in zip(revenue_row["values"], cost_row["values"])
        ]
        if revenue_row["annual"] is not None and cost_row["annual"] is not None:
            gross_row["annual"] = revenue_row["annual"] - cost_row["annual"]

    # 販管費合計を再計算
    for section in plan["sections"]:
        if section["title"] == "販管費":
            total_row = _find_row(section, "販管費合計")
            if total_row:
                detail_rows = [r for r in section["rows"]
                              if r["label"] != "販管費合計" and r.get("isMonetary")]
                if detail_rows:
                    total_row["values"] = [
                        sum(r["values"][i] for r in detail_rows)
                        for i in range(len(total_row["values"]))
                    ]
                    if all(r["annual"] is not None for r in detail_rows):
                        total_row["annual"] = sum(r["annual"] for r in detail_rows)

    # 営業利益 = 粗利 - 販管費合計 を再計算
    sga_total = _find_row_in_plan(plan, "販管費合計")
    if gross_row and sga_total and profit_row:
        profit_row["values"] = [
            g - s for g, s in zip(gross_row["values"], sga_total["values"])
        ]
        if gross_row["annual"] is not None and sga_total["annual"] is not None:
            profit_row["annual"] = gross_row["annual"] - sga_total["annual"]

    # 比率を最終再計算
    if revenue_row and gross_row and gross_rate_row:
        gross_rate_row["values"] = [
            round(g / r * 100, 1) if r > 0 else 0.0
            for g, r in zip(gross_row["values"], revenue_row["values"])
        ]
        if gross_row["annual"] and revenue_row["annual"]:
            gross_rate_row["annual"] = round(
                gross_row["annual"] / revenue_row["annual"] * 100, 1
            )

    if revenue_row and profit_row and profit_rate_row:
        profit_rate_row["values"] = [
            round(p / r * 100, 1) if r > 0 else 0.0
            for p, r in zip(profit_row["values"], revenue_row["values"])
        ]
        if profit_row["annual"] and revenue_row["annual"]:
            profit_rate_row["annual"] = round(
                profit_row["annual"] / revenue_row["annual"] * 100, 1
            )


def generate_segment_plans():
    companies = load_json(COMPANIES_PATH)
    financials = load_json(FINANCIALS_PATH)
    plans = load_json(BUSINESS_PLANS_PATH)

    # 既存のconsolidated plan (segmentIdなし) をcompanyIdでインデックス
    consolidated = {}
    for p in plans:
        if not p.get("segmentId"):
            consolidated[p["companyId"]] = p

    # 既存のsegment planを削除（SKIP_COMPANIES以外）
    new_plans = []
    for p in plans:
        if p.get("segmentId") and p["companyId"] not in SKIP_COMPANIES:
            continue  # 再生成するので除外
        new_plans.append(p)

    generated_count = 0

    for company in companies:
        cid = company["id"]
        if cid in SKIP_COMPANIES:
            print(f"  SKIP: {cid} (手動作成済み)")
            continue

        segments = company.get("segments")
        if not segments:
            print(f"  SKIP: {cid} (セグメント定義なし)")
            continue

        if cid not in consolidated:
            print(f"  SKIP: {cid} (consolidated PLなし)")
            continue

        # 財務データからセグメント比率を取得
        fin_ratios = get_financial_segment_ratios(financials, cid)

        cons_plan = consolidated[cid]

        for seg in segments:
            seg_name = seg["name"]
            seg_id = to_segment_id(seg_name)
            rev_share = seg["revenueShare"] / 100.0

            # 財務データがあればそちらの比率を優先
            profit_margin = None
            if fin_ratios:
                matched = match_segment_name(seg_name, fin_ratios)
                if matched:
                    rev_share = fin_ratios[matched]["revenue_ratio"]
                    profit_margin = fin_ratios[matched]["profit_margin"]

            # セグメント別PLを生成
            seg_plan = allocate_plan_by_segment(
                cons_plan, seg_name, rev_share, profit_margin
            )

            # メタデータを設定
            seg_plan["companyId"] = cid
            seg_plan["segmentId"] = seg_id
            seg_plan["segmentName"] = seg_name

            # KPI行にセグメント名のnoteを追加
            for section in seg_plan["sections"]:
                if section["title"] in ("集客KPI", "事業KPI"):
                    for row in section["rows"]:
                        if not row.get("note"):
                            row["note"] = f"{seg_name}セグメント"

            new_plans.append(seg_plan)
            generated_count += 1
            print(f"  生成: {cid} / {seg_name} (rev_share={rev_share:.1%}, seg_id={seg_id})")

    save_json(BUSINESS_PLANS_PATH, new_plans)
    print(f"\n合計 {generated_count} セグメントPLを生成しました。")


if __name__ == "__main__":
    generate_segment_plans()
