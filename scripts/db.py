"""
IRkun Supabase データベースクライアント
— httpx で PostgREST API を直接叩く軽量版（supabase SDK不要）
"""
import json
from pathlib import Path
from typing import Optional

import httpx

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY, DATA_DIR


# ============================================================
# HTTP クライアント（PostgREST直接）
# ============================================================

_http: Optional[httpx.Client] = None


def _get_http() -> httpx.Client:
    """httpxクライアントを取得（シングルトン）"""
    global _http
    if _http is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_SERVICE_KEY が未設定です。\n"
                "scripts/.env に設定してください。"
            )
        _http = httpx.Client(
            base_url=f"{SUPABASE_URL}/rest/v1",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            timeout=60.0,
        )
    return _http


def _post(table: str, data: dict | list) -> list[dict]:
    """INSERT（単一 or 複数行）"""
    resp = _get_http().post(f"/{table}", json=data)
    resp.raise_for_status()
    return resp.json()


def _upsert(table: str, data: dict | list, on_conflict: str = "") -> list[dict]:
    """UPSERT"""
    h = _get_http()
    headers = dict(h.headers)
    resolution = f"merge-duplicates"
    headers["Prefer"] = f"return=representation,resolution={resolution}"
    params = {}
    if on_conflict:
        params["on_conflict"] = on_conflict
    resp = h.post(f"/{table}", json=data, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()


def _select(table: str, columns: str = "*", params: Optional[dict] = None) -> list[dict]:
    """SELECT（全件 or フィルタ付き）。1000件制限を自動ページング。"""
    h = _get_http()
    all_rows: list[dict] = []
    offset = 0
    limit = 1000
    while True:
        p = {"select": columns, "limit": str(limit), "offset": str(offset)}
        if params:
            p.update(params)
        resp = h.get(f"/{table}", params=p)
        resp.raise_for_status()
        rows = resp.json()
        all_rows.extend(rows)
        if len(rows) < limit:
            break
        offset += limit
    return all_rows


def _delete(table: str, params: dict) -> None:
    """DELETE"""
    resp = _get_http().delete(f"/{table}", params=params)
    resp.raise_for_status()


# ============================================================
# Companies
# ============================================================

def upsert_company(company: dict) -> None:
    """企業データをUPSERT"""
    row = {
        "id": company["id"],
        "name": company["name"],
        "name_en": company.get("nameEn"),
        "stock_code": company.get("stockCode"),
        "market": company.get("market"),
        "category": company["category"],
        "priority_rank": company["priorityRank"],
        "founded": company.get("founded"),
        "headquarters": company.get("headquarters"),
        "ceo": company.get("ceo"),
        "employee_count": company.get("employeeCount"),
        "mission": company.get("mission"),
        "description": company["description"],
        "main_services": json.dumps(company.get("mainServices", []), ensure_ascii=False),
        "tags": json.dumps(company.get("tags", []), ensure_ascii=False),
        "threat_level": company["threatLevel"],
        "monitoring_reason": company["monitoringReason"],
        "ir_url": company.get("irUrl"),
        "official_url": company.get("officialUrl"),
        "brand_color": company["brandColor"],
        "has_full_data": company["hasFullData"],
        "last_updated": company["lastUpdated"],
    }
    _upsert("companies", row, on_conflict="id")


def upsert_company_segments(company_id: str, segments: list[dict]) -> None:
    """企業セグメントをUPSERT（既存を削除して再投入）"""
    _delete("company_segments", {"company_id": f"eq.{company_id}"})
    batch = []
    for i, seg in enumerate(segments):
        batch.append({
            "company_id": company_id,
            "name": seg["name"],
            "revenue_share": seg["revenueShare"],
            "sort_order": i,
        })
    if batch:
        _post("company_segments", batch)


# ============================================================
# Financials
# ============================================================

def upsert_fiscal_year(company_id: str, fy: dict) -> int:
    """財務データをUPSERT。返り値はfiscal_years.id"""
    row = {
        "company_id": company_id,
        "year": fy["year"],
        "revenue": fy.get("revenue"),
        "operating_profit": fy.get("operatingProfit"),
        "ordinary_profit": fy.get("ordinaryProfit"),
        "net_income": fy.get("netIncome"),
        "operating_margin": fy.get("operatingMargin"),
        "roe": fy.get("roe"),
        "employees": fy.get("employees"),
        "facilities": fy.get("facilities"),
        "users": fy.get("users"),
        "revenue_per_employee": fy.get("revenuePerEmployee"),
    }
    result = _upsert("fiscal_years", row, on_conflict="company_id,year")
    fy_id = result[0]["id"]

    # セグメント別財務（バッチ）
    if fy.get("segments"):
        _delete("segment_financials", {"fiscal_year_id": f"eq.{fy_id}"})
        batch = [{
            "fiscal_year_id": fy_id,
            "name": seg["name"],
            "revenue": seg["revenue"],
            "profit": seg.get("profit"),
        } for seg in fy["segments"]]
        if batch:
            _post("segment_financials", batch)

    return fy_id


# ============================================================
# Business Plans
# ============================================================

def upsert_business_plan(bp: dict) -> int:
    """事業計画PLをUPSERT。返り値はbusiness_plans.id"""
    company_id = bp["companyId"]
    segment_id = bp.get("segmentId")

    # 既存プランを検索
    params = {"company_id": f"eq.{company_id}", "select": "id"}
    if segment_id:
        params["segment_id"] = f"eq.{segment_id}"
    else:
        params["segment_id"] = "is.null"
    existing = _select("business_plans", params=params)

    if existing:
        bp_id = existing[0]["id"]
        # 子テーブルを削除
        sections = _select("plan_sections", columns="id", params={"business_plan_id": f"eq.{bp_id}"})
        for sec in sections:
            _delete("plan_rows", {"plan_section_id": f"eq.{sec['id']}"})
        _delete("plan_sections", {"business_plan_id": f"eq.{bp_id}"})
    else:
        row = {
            "company_id": company_id,
            "segment_id": segment_id,
            "segment_name": bp.get("segmentName"),
        }
        result = _post("business_plans", row)
        bp_id = result[0]["id"]

    # セクション + 行を投入（バッチINSERT）
    for sec_i, section in enumerate(bp.get("sections", [])):
        sec_row = {
            "business_plan_id": bp_id,
            "title": section["title"],
            "sort_order": sec_i,
        }
        sec_result = _post("plan_sections", sec_row)
        sec_id = sec_result[0]["id"]

        batch = []
        for row_i, plan_row in enumerate(section.get("rows", [])):
            batch.append({
                "plan_section_id": sec_id,
                "label": plan_row["label"],
                "values": json.dumps(plan_row["values"]),
                "annual": plan_row.get("annual"),
                "note": plan_row.get("note"),
                "unit": plan_row.get("unit"),
                "is_monetary": plan_row.get("isMonetary", False),
                "is_percent": plan_row.get("isPercent", False),
                "is_bold": plan_row.get("isBold", False),
                "sort_order": row_i,
            })
        if batch:
            _post("plan_rows", batch)

    return bp_id


# ============================================================
# Histories
# ============================================================

def upsert_history_events(company_id: str, events: list[dict]) -> None:
    """沿革イベントをUPSERT（既存を削除して再投入）"""
    _delete("history_events", {"company_id": f"eq.{company_id}"})
    batch = [{
        "company_id": company_id,
        "year": event["year"],
        "month": event.get("month"),
        "category": event["category"],
        "title": event["title"],
        "description": event["description"],
        "sms_implication": event.get("smsImplication"),
    } for event in events]
    if batch:
        _post("history_events", batch)


# ============================================================
# Strategies (中期計画)
# ============================================================

def upsert_midterm_plans(company_id: str, plans: list[dict]) -> None:
    """中期計画をUPSERT（既存を削除して再投入）"""
    existing = _select("midterm_plans", columns="id", params={"company_id": f"eq.{company_id}"})
    for mp in existing:
        _delete("key_strategies", {"midterm_plan_id": f"eq.{mp['id']}"})
    _delete("midterm_plans", {"company_id": f"eq.{company_id}"})

    for plan in plans:
        targets = plan.get("targets", {})
        row = {
            "company_id": company_id,
            "name": plan["name"],
            "period": plan["period"],
            "target_revenue": targets.get("revenue"),
            "target_operating_profit": targets.get("operatingProfit"),
            "target_facilities": targets.get("facilities"),
            "target_description": targets.get("description", ""),
            "previous_plan_comparison": plan.get("previousPlanComparison"),
        }
        result = _post("midterm_plans", row)
        mp_id = result[0]["id"]

        ks_batch = [{
            "midterm_plan_id": mp_id,
            "title": ks["title"],
            "description": ks["description"],
            "growth_driver": ks["growthDriver"],
            "sort_order": i,
        } for i, ks in enumerate(plan.get("keyStrategies", []))]
        if ks_batch:
            _post("key_strategies", ks_batch)


# ============================================================
# Competitive Advantages
# ============================================================

def upsert_competitive_advantage(adv: dict) -> None:
    """競争優位性をUPSERT"""
    sms = adv.get("smsInsights", {})
    row = {
        "company_id": adv["companyId"],
        "strengths": json.dumps(adv.get("strengths", []), ensure_ascii=False),
        "weaknesses": json.dumps(adv.get("weaknesses", []), ensure_ascii=False),
        "differentiators": json.dumps(adv.get("differentiators", []), ensure_ascii=False),
        "barriers": json.dumps(adv.get("barriers", []), ensure_ascii=False),
        "risks": json.dumps(adv.get("risks", []), ensure_ascii=False),
        "sms_threat_level": sms.get("threatLevel"),
        "sms_learn_from": sms.get("learnFrom"),
        "sms_watch_for": sms.get("watchFor"),
        "sms_counter_strategy": sms.get("counterStrategy"),
    }
    _upsert("competitive_advantages", row, on_conflict="company_id")


# ============================================================
# Trends
# ============================================================

def upsert_trend(trend: dict) -> None:
    """業界トレンドをUPSERT"""
    row = {
        "id": trend["id"],
        "category": trend["category"],
        "title": trend["title"],
        "date": trend["date"],
        "summary": trend["summary"],
        "detail": trend.get("detail"),
        "sources": json.dumps(trend.get("sources", []), ensure_ascii=False),
    }
    _upsert("industry_trends", row, on_conflict="id")

    # 企業影響（バッチ）
    _delete("trend_company_impacts", {"trend_id": f"eq.{trend['id']}"})
    batch = [{
        "trend_id": trend["id"],
        "company_id": impact["companyId"],
        "impact": impact["impact"],
        "note": impact["note"],
    } for impact in trend.get("impactByCompany", [])]
    if batch:
        _post("trend_company_impacts", batch)


# ============================================================
# Notes
# ============================================================

def upsert_note(note: dict) -> None:
    """分析ノートをUPSERT"""
    row = {
        "id": note["id"],
        "date": note["date"],
        "title": note["title"],
        "template": note["template"],
        "related_companies": json.dumps(note.get("relatedCompanies", []), ensure_ascii=False),
        "related_trends": json.dumps(note.get("relatedTrends", []), ensure_ascii=False),
        "content": note["content"],
        "key_takeaways": json.dumps(note.get("keyTakeaways", []), ensure_ascii=False),
    }
    _upsert("analysis_notes", row, on_conflict="id")


# ============================================================
# Glossary
# ============================================================

def upsert_glossary(glossary_data: dict) -> None:
    """用語集をUPSERT"""
    row = {
        "id": 1,
        "data": json.dumps(glossary_data, ensure_ascii=False),
    }
    _upsert("glossary", row, on_conflict="id")


# ============================================================
# Earnings Documents（将来Phase用）
# ============================================================

def insert_earnings_document(
    company_id: str,
    file_name: str,
    fiscal_period: Optional[str] = None,
    source_url: Optional[str] = None,
    file_size_mb: Optional[float] = None,
) -> int:
    """決算説明資料レコードを挿入。返り値はearnings_documents.id"""
    row = {
        "company_id": company_id,
        "file_name": file_name,
        "fiscal_period": fiscal_period,
        "source_url": source_url,
        "file_size_mb": file_size_mb,
    }
    result = _post("earnings_documents", row)
    return result[0]["id"]


def insert_earnings_insight(document_id: int, insight_type: str, data: dict) -> None:
    """AI分析結果を挿入"""
    row = {
        "document_id": document_id,
        "insight_type": insight_type,
        "data": json.dumps(data, ensure_ascii=False),
    }
    _post("earnings_insights", row)


# ============================================================
# エクスポート: DB → JSON（/data/*.json）
# ============================================================

def _write_json(path: Path, data) -> None:
    """JSONファイルを書き出す（既存と同一フォーマット）"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  [OK] {path.name}")


def export_companies_json() -> list[dict]:
    """companies.json をエクスポート"""
    companies = _select("companies", params={"order": "id"})
    segments = _select("company_segments", params={"order": "company_id,sort_order"})

    seg_map: dict[str, list] = {}
    for s in segments:
        seg_map.setdefault(s["company_id"], []).append({
            "name": s["name"],
            "revenueShare": float(s["revenue_share"]),
        })

    result = []
    for c in companies:
        obj: dict = {
            "id": c["id"],
            "name": c["name"],
        }
        if c.get("name_en"):
            obj["nameEn"] = c["name_en"]
        if c.get("stock_code"):
            obj["stockCode"] = c["stock_code"]
        obj["market"] = c["market"]
        obj["category"] = c["category"]
        obj["priorityRank"] = c["priority_rank"]
        if c.get("founded"):
            obj["founded"] = c["founded"]
        if c.get("headquarters"):
            obj["headquarters"] = c["headquarters"]
        if c.get("ceo"):
            obj["ceo"] = c["ceo"]
        if c.get("employee_count") is not None:
            obj["employeeCount"] = c["employee_count"]
        if c.get("mission"):
            obj["mission"] = c["mission"]
        obj["description"] = c["description"]
        obj["mainServices"] = _parse_jsonb(c["main_services"])
        if c["id"] in seg_map:
            obj["segments"] = seg_map[c["id"]]
        obj["tags"] = _parse_jsonb(c["tags"])
        obj["threatLevel"] = c["threat_level"]
        obj["monitoringReason"] = c["monitoring_reason"]
        if c.get("ir_url"):
            obj["irUrl"] = c["ir_url"]
        if c.get("official_url"):
            obj["officialUrl"] = c["official_url"]
        obj["brandColor"] = c["brand_color"]
        obj["hasFullData"] = c["has_full_data"]
        obj["lastUpdated"] = c["last_updated"]
        result.append(obj)

    return result


def export_financials_json() -> list[dict]:
    """financials.json をエクスポート"""
    fys = _select("fiscal_years", params={"order": "company_id,year"})
    seg_fins = _select("segment_financials", params={"order": "fiscal_year_id"})

    seg_map: dict[int, list] = {}
    for sf in seg_fins:
        seg_map.setdefault(sf["fiscal_year_id"], []).append({
            "name": sf["name"],
            "revenue": _num(sf["revenue"]),
            **({"profit": _num(sf["profit"])} if sf.get("profit") is not None else {}),
        })

    company_fys: dict[str, list] = {}
    for fy in fys:
        company_fys.setdefault(fy["company_id"], []).append(fy)

    result = []
    for company_id, years in company_fys.items():
        fiscal_years = []
        for fy in years:
            obj: dict = {"year": fy["year"]}
            for json_key, db_key in [
                ("revenue", "revenue"),
                ("operatingProfit", "operating_profit"),
                ("ordinaryProfit", "ordinary_profit"),
                ("netIncome", "net_income"),
                ("operatingMargin", "operating_margin"),
                ("roe", "roe"),
                ("employees", "employees"),
                ("facilities", "facilities"),
                ("users", "users"),
                ("revenuePerEmployee", "revenue_per_employee"),
            ]:
                val = fy.get(db_key)
                if val is not None:
                    obj[json_key] = _num(val)
            if fy["id"] in seg_map:
                obj["segments"] = seg_map[fy["id"]]
            fiscal_years.append(obj)

        result.append({
            "companyId": company_id,
            "currency": "JPY",
            "unit": "million",
            "fiscalYears": fiscal_years,
        })

    return result


def export_business_plans_json() -> list[dict]:
    """business-plans.json をエクスポート"""
    plans = _select("business_plans", params={"order": "id"})
    sections = _select("plan_sections", params={"order": "business_plan_id,sort_order"})
    rows = _select("plan_rows", params={"order": "plan_section_id,sort_order"})

    row_map: dict[int, list] = {}
    for r in rows:
        row_map.setdefault(r["plan_section_id"], []).append(r)

    sec_map: dict[int, list] = {}
    for s in sections:
        sec_map.setdefault(s["business_plan_id"], []).append(s)

    result = []
    for bp in plans:
        obj: dict = {"companyId": bp["company_id"]}
        if bp.get("segment_id"):
            obj["segmentId"] = bp["segment_id"]
        if bp.get("segment_name"):
            obj["segmentName"] = bp["segment_name"]

        bp_sections = []
        for sec in sec_map.get(bp["id"], []):
            sec_rows = []
            for r in row_map.get(sec["id"], []):
                row_obj: dict = {
                    "label": r["label"],
                    "values": _parse_jsonb(r["values"]),
                    "annual": _num(r["annual"]) if r.get("annual") is not None else None,
                }
                if r.get("note"):
                    row_obj["note"] = r["note"]
                if r.get("unit"):
                    row_obj["unit"] = r["unit"]
                if r.get("is_monetary"):
                    row_obj["isMonetary"] = True
                if r.get("is_percent"):
                    row_obj["isPercent"] = True
                if r.get("is_bold"):
                    row_obj["isBold"] = True
                sec_rows.append(row_obj)
            bp_sections.append({"title": sec["title"], "rows": sec_rows})

        obj["sections"] = bp_sections
        result.append(obj)

    return result


def export_histories_json() -> list[dict]:
    """histories.json をエクスポート"""
    events = _select("history_events", params={"order": "company_id,year,month"})

    company_events: dict[str, list] = {}
    for e in events:
        company_events.setdefault(e["company_id"], []).append(e)

    result = []
    for company_id, evts in company_events.items():
        events_list = []
        for e in evts:
            obj: dict = {"year": e["year"]}
            if e.get("month") is not None:
                obj["month"] = e["month"]
            obj["category"] = e["category"]
            obj["title"] = e["title"]
            obj["description"] = e["description"]
            if e.get("sms_implication"):
                obj["smsImplication"] = e["sms_implication"]
            events_list.append(obj)
        result.append({"companyId": company_id, "events": events_list})

    return result


def export_strategies_json() -> list[dict]:
    """strategies.json をエクスポート"""
    mps = _select("midterm_plans", params={"order": "company_id,id"})
    kss = _select("key_strategies", params={"order": "midterm_plan_id,sort_order"})

    ks_map: dict[int, list] = {}
    for ks in kss:
        ks_map.setdefault(ks["midterm_plan_id"], []).append(ks)

    company_plans: dict[str, list] = {}
    for mp in mps:
        company_plans.setdefault(mp["company_id"], []).append(mp)

    result = []
    for company_id, plans in company_plans.items():
        plans_list = []
        for mp in plans:
            targets: dict = {}
            if mp.get("target_revenue") is not None:
                targets["revenue"] = _num(mp["target_revenue"])
            if mp.get("target_operating_profit") is not None:
                targets["operatingProfit"] = _num(mp["target_operating_profit"])
            if mp.get("target_facilities") is not None:
                targets["facilities"] = mp["target_facilities"]
            targets["description"] = mp["target_description"]

            strategies = []
            for ks in ks_map.get(mp["id"], []):
                strategies.append({
                    "title": ks["title"],
                    "description": ks["description"],
                    "growthDriver": ks["growth_driver"],
                })

            plan_obj: dict = {
                "name": mp["name"],
                "period": mp["period"],
                "targets": targets,
                "keyStrategies": strategies,
            }
            if mp.get("previous_plan_comparison"):
                plan_obj["previousPlanComparison"] = mp["previous_plan_comparison"]
            plans_list.append(plan_obj)

        result.append({"companyId": company_id, "plans": plans_list})

    return result


def export_advantages_json() -> list[dict]:
    """competitive-advantages.json をエクスポート"""
    advs = _select("competitive_advantages", params={"order": "company_id"})

    result = []
    for a in advs:
        obj = {
            "companyId": a["company_id"],
            "strengths": _parse_jsonb(a["strengths"]),
            "weaknesses": _parse_jsonb(a["weaknesses"]),
            "differentiators": _parse_jsonb(a["differentiators"]),
            "barriers": _parse_jsonb(a["barriers"]),
            "risks": _parse_jsonb(a["risks"]),
            "smsInsights": {
                "threatLevel": a["sms_threat_level"],
                "learnFrom": a["sms_learn_from"],
                "watchFor": a["sms_watch_for"],
                "counterStrategy": a["sms_counter_strategy"],
            },
        }
        result.append(obj)

    return result


def export_trends_json() -> list[dict]:
    """trends.json をエクスポート"""
    trends = _select("industry_trends", params={"order": "id"})
    impacts = _select("trend_company_impacts", params={"order": "trend_id"})

    imp_map: dict[str, list] = {}
    for imp in impacts:
        imp_map.setdefault(imp["trend_id"], []).append(imp)

    result = []
    for t in trends:
        obj: dict = {
            "id": t["id"],
            "category": t["category"],
            "title": t["title"],
            "date": t["date"],
            "summary": t["summary"],
        }
        if t.get("detail"):
            obj["detail"] = t["detail"]
        obj["impactByCompany"] = [
            {
                "companyId": imp["company_id"],
                "impact": imp["impact"],
                "note": imp["note"],
            }
            for imp in imp_map.get(t["id"], [])
        ]
        sources = _parse_jsonb(t.get("sources", "[]"))
        if sources:
            obj["sources"] = sources
        result.append(obj)

    return result


def export_notes_json() -> list[dict]:
    """notes.json をエクスポート"""
    notes = _select("analysis_notes", params={"order": "id"})

    result = []
    for n in notes:
        obj: dict = {
            "id": n["id"],
            "date": n["date"],
            "title": n["title"],
            "template": n["template"],
            "relatedCompanies": _parse_jsonb(n["related_companies"]),
        }
        related_trends = _parse_jsonb(n.get("related_trends", "[]"))
        if related_trends:
            obj["relatedTrends"] = related_trends
        obj["content"] = n["content"]
        obj["keyTakeaways"] = _parse_jsonb(n["key_takeaways"])
        result.append(obj)

    return result


def export_glossary_json() -> dict:
    """glossary.json をエクスポート"""
    rows = _select("glossary", params={"id": "eq.1"})
    if not rows:
        return {}
    return _parse_jsonb(rows[0]["data"])


def export_all_json() -> None:
    """全テーブルを /data/*.json にエクスポート"""
    print("=== Supabase → JSON エクスポート ===")

    _write_json(DATA_DIR / "companies.json", export_companies_json())
    _write_json(DATA_DIR / "financials.json", export_financials_json())
    _write_json(DATA_DIR / "business-plans.json", export_business_plans_json())
    _write_json(DATA_DIR / "histories.json", export_histories_json())
    _write_json(DATA_DIR / "strategies.json", export_strategies_json())
    _write_json(DATA_DIR / "competitive-advantages.json", export_advantages_json())
    _write_json(DATA_DIR / "trends.json", export_trends_json())
    _write_json(DATA_DIR / "notes.json", export_notes_json())
    _write_json(DATA_DIR / "glossary.json", export_glossary_json())

    print("\n=== エクスポート完了 ===")


# ============================================================
# ユーティリティ
# ============================================================

def _parse_jsonb(val):
    """Supabaseから返るJSONBフィールドをパースする"""
    if val is None:
        return []
    if isinstance(val, (list, dict)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except json.JSONDecodeError:
            return val
    return val


def _num(val):
    """数値をint/floatに変換（Decimalも対応）"""
    if val is None:
        return None
    if isinstance(val, int):
        return val
    f = float(val)
    if f == int(f) and abs(f) < 1e15:
        return int(f)
    return f
