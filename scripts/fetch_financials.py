"""
IRkun EDINET 財務データ自動取得スクリプト

Usage:
    python fetch_financials.py                        # 全17社・直近5年分
    python fetch_financials.py --company litalico     # 1社だけ
    python fetch_financials.py --years 3              # 直近3年分
    python fetch_financials.py --dry-run              # JSONに書き込まない
"""
import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

# .env サポート
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

from config import (
    COMPANY_MAP,
    FINANCIALS_PATH,
    COMPANIES_PATH,
    DEFAULT_YEARS,
    EDINET_API_KEY,
    FILING_SEARCH_MONTHS,
)
from edinet_client import (
    search_reports_in_range,
    download_xbrl_zip,
    extract_xbrl_from_zip,
)
from xbrl_parser import parse_xbrl


def to_million(value: float | None) -> int | None:
    """円単位 → 百万円単位（四捨五入）"""
    if value is None:
        return None
    return round(value / 1_000_000)


def build_fiscal_year(raw: dict, fiscal_year_label: str) -> dict:
    """パース結果をIRkunのFiscalYear形式に変換"""
    revenue = to_million(raw.get("revenue"))
    op_profit = to_million(raw.get("operating_profit"))
    ord_profit = to_million(raw.get("ordinary_profit"))
    net_income = to_million(raw.get("net_income"))
    employees = raw.get("employees")
    net_assets = to_million(raw.get("net_assets"))

    # 算出項目
    operating_margin = None
    if revenue and op_profit is not None and revenue > 0:
        operating_margin = round(op_profit / revenue * 100, 1)

    roe = None
    if net_income is not None and net_assets and net_assets > 0:
        roe = round(net_income / net_assets * 100, 1)

    employees_int = int(employees) if employees else None
    rev_per_emp = None
    if revenue and employees_int and employees_int > 0:
        rev_per_emp = round(revenue / employees_int, 1)

    return {
        "year": fiscal_year_label,
        "revenue": revenue,
        "operatingProfit": op_profit,
        "ordinaryProfit": ord_profit,
        "netIncome": net_income,
        "operatingMargin": operating_margin,
        "roe": roe,
        "employees": employees_int,
        "facilities": None,
        "users": None,
        "revenuePerEmployee": rev_per_emp,
        "segments": [],
    }


def search_annual_reports_for_company(sec_code: str, num_years: int) -> list[dict]:
    """
    企業の有価証券報告書を過去N年分検索する。
    3月決算企業は6月に提出が多い。12月決算は3月に提出が多い。
    """
    today = date.today()
    reports = []
    seen_doc_ids = set()

    for year_offset in range(num_years + 1):
        year = today.year - year_offset
        # 提出が集中する月を検索
        for month in FILING_SEARCH_MONTHS:
            start = date(year, month, 1)
            # 月の最終日
            if month == 12:
                end = date(year, 12, 31)
            else:
                end = date(year, month + 1, 1) - timedelta(days=1)

            if end > today:
                end = today
            if start > today:
                continue

            print(f"    Searching {start} to {end}...")
            found = search_reports_in_range(start, end, sec_code)
            for doc in found:
                doc_id = doc.get("docID")
                if doc_id and doc_id not in seen_doc_ids:
                    seen_doc_ids.add(doc_id)
                    reports.append(doc)

        if len(reports) >= num_years:
            break

    return reports


def extract_fiscal_year_label(doc: dict) -> str:
    """書類情報から決算期ラベルを生成（例: '2025年3月期'）"""
    period_end = doc.get("periodEnd", "")
    if period_end and len(period_end) >= 7:
        # "2025-03-31" → "2025年3月期"
        parts = period_end.split("-")
        if len(parts) >= 2:
            year = parts[0]
            month = str(int(parts[1]))
            return f"{year}年{month}月期"
    doc_desc = doc.get("docDescription", "")
    return doc_desc or "不明"


def process_company(company_id: str, info: dict, num_years: int, dry_run: bool) -> dict | None:
    """1社分の財務データを取得・パースする"""
    sec_code = info["stock_code"]
    name = info["name"]
    print(f"\n[{company_id}] {name} (証券コード: {sec_code})")

    # 有価証券報告書を検索
    print(f"  Searching annual reports (past {num_years} years)...")
    reports = search_annual_reports_for_company(sec_code, num_years)

    if not reports:
        print(f"  [SKIP] No annual reports found")
        return None

    print(f"  Found {len(reports)} report(s)")

    fiscal_years = []
    for doc in reports:
        doc_id = doc.get("docID")
        doc_desc = doc.get("docDescription", "?")
        print(f"  Processing: {doc_desc} (docID: {doc_id})")

        # XBRLダウンロード
        zip_bytes = download_xbrl_zip(doc_id)
        if not zip_bytes:
            continue

        # XBRL抽出
        xbrl_content = extract_xbrl_from_zip(zip_bytes)
        if not xbrl_content:
            continue

        # パース
        raw = parse_xbrl(xbrl_content)
        if not raw:
            print(f"  [WARN] Could not extract financial data")
            continue

        fiscal_year_label = extract_fiscal_year_label(doc)
        fy = build_fiscal_year(raw, fiscal_year_label)

        # 最低限、売上高がある場合のみ追加
        if fy["revenue"] is not None:
            fiscal_years.append(fy)
            rev_str = f"{fy['revenue']:,}百万円" if fy["revenue"] else "N/A"
            op_str = f"{fy['operatingProfit']:,}百万円" if fy["operatingProfit"] else "N/A"
            print(f"    → {fiscal_year_label}: 売上 {rev_str} / 営業利益 {op_str}")
        else:
            print(f"    → {fiscal_year_label}: 売上データなし（スキップ）")

    if not fiscal_years:
        print(f"  [SKIP] No valid financial data extracted")
        return None

    # 年度順にソート（古い順）
    fiscal_years.sort(key=lambda fy: fy["year"])

    return {
        "companyId": company_id,
        "currency": "JPY",
        "unit": "million",
        "fiscalYears": fiscal_years,
    }


def main():
    parser = argparse.ArgumentParser(description="EDINET 財務データ取得")
    parser.add_argument("--company", type=str, help="特定企業のみ取得（IRkun ID）")
    parser.add_argument("--years", type=int, default=DEFAULT_YEARS, help=f"取得年数（デフォルト: {DEFAULT_YEARS}）")
    parser.add_argument("--dry-run", action="store_true", help="JSONファイルに書き込まない")
    args = parser.parse_args()

    if not EDINET_API_KEY:
        print("ERROR: EDINET_API_KEY が設定されていません。")
        print("  export EDINET_API_KEY=your_key  または scripts/.env に設定してください。")
        print("  APIキーは https://disclosure.edinet-fsa.go.jp/ で無料取得できます。")
        sys.exit(1)

    # 対象企業の決定
    if args.company:
        if args.company not in COMPANY_MAP:
            print(f"ERROR: Unknown company ID: {args.company}")
            print(f"  Available: {', '.join(COMPANY_MAP.keys())}")
            sys.exit(1)
        targets = {args.company: COMPANY_MAP[args.company]}
    else:
        targets = COMPANY_MAP

    print(f"=== IRkun EDINET 財務データ取得 ===")
    print(f"対象: {len(targets)}社 / 取得年数: {args.years}年")
    if args.dry_run:
        print("(DRY RUN — JSONファイルへの書き込みなし)")
    print()

    # 既存データ読み込み
    existing_financials = []
    if FINANCIALS_PATH.exists():
        with open(FINANCIALS_PATH, "r", encoding="utf-8") as f:
            existing_financials = json.load(f)

    # 既存データのインデックス
    financials_map = {item["companyId"]: item for item in existing_financials}

    # 処理結果
    success_count = 0
    fail_count = 0
    updated_ids = []

    for company_id, info in targets.items():
        result = process_company(company_id, info, args.years, args.dry_run)
        if result:
            financials_map[company_id] = result
            success_count += 1
            updated_ids.append(company_id)
        else:
            fail_count += 1

    # 結果サマリー
    print(f"\n=== 結果サマリー ===")
    print(f"成功: {success_count}社 / 失敗: {fail_count}社")

    if args.dry_run:
        print("\n(DRY RUN — ファイル更新なし)")
        if updated_ids:
            print("更新対象だった企業:")
            for cid in updated_ids:
                fy_data = financials_map[cid]
                years = [fy["year"] for fy in fy_data["fiscalYears"]]
                print(f"  {cid}: {', '.join(years)}")
        return

    if not updated_ids:
        print("更新対象なし。終了します。")
        return

    # financials.json を書き出し
    output = list(financials_map.values())
    with open(FINANCIALS_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n✓ {FINANCIALS_PATH} を更新しました（{len(output)}社分）")

    # companies.json の hasFullData を更新
    if COMPANIES_PATH.exists():
        with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
            companies = json.load(f)

        updated_flags = 0
        for company in companies:
            cid = company.get("id")
            if cid in financials_map and not company.get("hasFullData"):
                company["hasFullData"] = True
                updated_flags += 1

        if updated_flags > 0:
            with open(COMPANIES_PATH, "w", encoding="utf-8") as f:
                json.dump(companies, f, ensure_ascii=False, indent=2)
            print(f"✓ {COMPANIES_PATH} の hasFullData を {updated_flags}社分更新しました")

    print("\n完了！ `npm run build` でサイトをリビルドしてください。")


if __name__ == "__main__":
    main()
