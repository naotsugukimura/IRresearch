"""
EDINET API v2 クライアント
"""
import io
import time
import zipfile
from datetime import date, timedelta
from typing import Optional

import requests

from config import EDINET_API_BASE, EDINET_API_KEY, REQUEST_DELAY

MAX_RETRIES = 3
RETRY_BASE_DELAY = 2.0  # seconds


def _headers() -> dict:
    return {"Subscription-Key": EDINET_API_KEY}


def _request_with_retry(method: str, url: str, **kwargs) -> requests.Response:
    """
    SSL/Connection エラー時にexponential backoffでリトライする共通リクエスト関数。
    """
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.request(method, url, **kwargs)
            time.sleep(REQUEST_DELAY)
            return resp
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as e:
            last_error = e
            wait = RETRY_BASE_DELAY * (2 ** attempt)
            print(f"  [RETRY {attempt + 1}/{MAX_RETRIES}] {type(e).__name__}: {e}")
            print(f"  Waiting {wait}s before retry...")
            time.sleep(wait)

    raise last_error  # type: ignore[misc]


def get_documents(target_date: date, doc_type: int = 2) -> list[dict]:
    """
    指定日の書類一覧を取得する。
    doc_type: 1=メタデータのみ, 2=提出書類一覧含む
    """
    url = f"{EDINET_API_BASE}/documents.json"
    params = {
        "date": target_date.strftime("%Y-%m-%d"),
        "type": doc_type,
    }
    resp = _request_with_retry("GET", url, params=params, headers=_headers(), timeout=30)
    resp.raise_for_status()
    data = resp.json()

    results = data.get("results", [])
    return results


def find_annual_reports(
    target_date: date,
    edinet_code: Optional[str] = None,
    sec_code: Optional[str] = None,
) -> list[dict]:
    """
    指定日の有価証券報告書を検索する。
    edinet_code または sec_code で絞り込み可能。
    """
    docs = get_documents(target_date)
    reports = []

    for doc in docs:
        # 有価証券報告書: ordinanceCode=010, formCode=030000
        if doc.get("ordinanceCode") != "010" or doc.get("formCode") != "030000":
            continue

        if edinet_code and doc.get("edinetCode") != edinet_code:
            continue

        if sec_code:
            doc_sec = doc.get("secCode", "")
            # secCodeは5桁（4桁+チェックディジット）の場合がある
            if doc_sec and not doc_sec.startswith(sec_code):
                continue

        reports.append(doc)

    return reports


def search_reports_in_range(
    start_date: date,
    end_date: date,
    sec_code: str,
) -> list[dict]:
    """
    日付範囲で有価証券報告書を検索する。
    EDINET APIは1日単位なので、日毎にリクエストする。
    """
    reports = []
    current = start_date

    while current <= end_date:
        try:
            day_reports = find_annual_reports(current, sec_code=sec_code)
            reports.extend(day_reports)
        except requests.RequestException as e:
            print(f"  [WARN] {current}: {e}")
        current += timedelta(days=1)

    return reports


def download_xbrl_zip(doc_id: str) -> Optional[bytes]:
    """
    docIDからXBRLのzipファイルをダウンロードする。
    type=1: XBRL一式（zip）
    """
    url = f"{EDINET_API_BASE}/documents/{doc_id}"
    params = {"type": 1}
    try:
        resp = _request_with_retry("GET", url, params=params, headers=_headers(), timeout=60)
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as e:
        print(f"  [WARN] Download failed for {doc_id} after {MAX_RETRIES} retries: {e}")
        return None

    if resp.status_code != 200:
        print(f"  [WARN] Download failed for {doc_id}: HTTP {resp.status_code}")
        return None

    return resp.content


def extract_xbrl_from_zip(zip_bytes: bytes) -> Optional[str]:
    """
    zipからメインのXBRLファイル（.xbrl）の内容を取り出す。
    XBRL/PublicDoc/ 配下の .xbrl ファイルを探す。
    """
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            xbrl_files = [
                name for name in zf.namelist()
                if name.endswith(".xbrl")
                and "PublicDoc" in name
                and "AuditDoc" not in name
            ]
            if not xbrl_files:
                # PublicDoc配下になくても .xbrl ファイルを探す
                xbrl_files = [
                    name for name in zf.namelist()
                    if name.endswith(".xbrl") and "AuditDoc" not in name
                ]
            if not xbrl_files:
                print("  [WARN] No .xbrl file found in zip")
                return None

            # 最も名前が長い（メインの）XBRLファイルを選択
            main_xbrl = max(xbrl_files, key=len)
            return zf.read(main_xbrl).decode("utf-8")
    except zipfile.BadZipFile:
        print("  [WARN] Bad zip file")
        return None


def resolve_edinet_code(sec_code: str, search_date: date) -> Optional[str]:
    """
    証券コードからEDINETコードを解決する。
    最近の書類一覧から証券コードに一致する企業のEDINETコードを取得。
    """
    # 過去30日分を検索
    current = search_date
    for _ in range(30):
        try:
            docs = get_documents(current)
            for doc in docs:
                doc_sec = doc.get("secCode", "")
                if doc_sec and doc_sec.startswith(sec_code):
                    return doc.get("edinetCode")
        except requests.RequestException:
            pass
        current -= timedelta(days=1)

    return None
