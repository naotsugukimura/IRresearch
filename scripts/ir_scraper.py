"""
企業IRページから決算説明資料のPDFリンクを抽出するスクレイパー
"""
import json
import re
import time
import warnings
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from config import COMPANIES_PATH, REQUEST_DELAY, USER_AGENT

# SSL警告を抑制（verify=False フォールバック時）
warnings.filterwarnings("ignore", message="Unverified HTTPS request")

# 決算説明資料を見つけるためのキーワードパターン
PDF_KEYWORDS = [
    "決算説明",
    "決算資料",
    "決算補足",
    "IR資料",
    "決算プレゼン",
    "earnings",
    "presentation",
    "financial_results",
    "financial release",
    "kessan",
]

# 決算説明サブページを見つけるためのリンクテキストキーワード
SUB_PAGE_KEYWORDS = [
    "決算",
    "説明",
    "資料",
    "プレゼンテーション",
    "ライブラリ",
    "library",
    "IR",
    "earnings",
    "presentation",
    "results",
]

# 決算説明サブページを見つけるためのURLパスキーワード
SUB_PAGE_PATH_KEYWORDS = [
    "presentation",
    "library",
    "results",
    "material",
    "presen",
    "kessan",
    "earnings",
]

# 除外パターン（招集通知、株主通信など）
EXCLUDE_KEYWORDS = [
    "招集通知",
    "株主通信",
    "コーポレートガバナンス",
    "有価証券報告書",
    "四半期報告書",
]

# サブページ上ではキーワードマッチを緩和して全PDFを拾う
# （決算説明資料ページにあるPDFは基本的に関連資料）
SUB_PAGE_PDF_KEYWORDS = PDF_KEYWORDS + [
    "決算",
    "financial",
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "1Q",
    "2Q",
    "3Q",
    "FY",
    "通期",
    "四半期",
]


def _fetch_page(url: str, verify: bool = True) -> Optional[str]:
    """ページのHTMLを取得する（SSL失敗時にverify=Falseでリトライ）"""
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=30,
            allow_redirects=True,
            verify=verify,
        )
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding
        return resp.text
    except requests.exceptions.SSLError:
        if verify:
            print(f"  [WARN] SSL error, retrying without verification: {url}")
            return _fetch_page(url, verify=False)
        print(f"  [WARN] SSL error (even without verify): {url}")
        return None
    except requests.RequestException as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return None


def _is_pdf_link(href: str) -> bool:
    """PDFリンクかどうかを判定"""
    if not href:
        return False
    return href.lower().endswith(".pdf") or "/pdf/" in href.lower()


def _matches_keywords(text: str, href: str, keywords: list[str] = None) -> bool:
    """キーワードにマッチするか"""
    if keywords is None:
        keywords = PDF_KEYWORDS
    combined = f"{text} {href}".lower()
    for kw in keywords:
        if kw.lower() in combined:
            # 除外キーワードチェック
            for ex in EXCLUDE_KEYWORDS:
                if ex.lower() in combined:
                    return False
            return True
    return False


def _extract_pdfs_from_soup(
    soup: BeautifulSoup, base_url: str, seen_urls: set, keywords: list[str] = None,
) -> list[dict]:
    """BeautifulSoupオブジェクトからPDFリンクを抽出する"""
    results = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        text = a_tag.get_text(strip=True)
        full_url = urljoin(base_url, href)

        if _is_pdf_link(full_url) and _matches_keywords(text, href, keywords):
            if full_url not in seen_urls:
                seen_urls.add(full_url)
                results.append({
                    "url": full_url,
                    "title": text or "（タイトル不明）",
                })
    return results


def _find_sub_pages(soup: BeautifulSoup, base_url: str, seen_urls: set) -> list[str]:
    """IR関連サブページのURLを探す"""
    sub_pages = []
    base_domain = urlparse(base_url).netloc

    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        text = a_tag.get_text(strip=True)
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        # 同一ドメインのHTMLページのみ
        if parsed.netloc != base_domain:
            continue
        if _is_pdf_link(full_url):
            continue
        if full_url in seen_urls:
            continue

        # テキストベースのマッチ
        text_match = any(kw in text for kw in SUB_PAGE_KEYWORDS)

        # URLパスベースのマッチ
        path_lower = parsed.path.lower()
        path_match = any(kw in path_lower for kw in SUB_PAGE_PATH_KEYWORDS)

        if text_match or path_match:
            sub_pages.append(full_url)

    return sub_pages


def scrape_ir_page(ir_url: str, company_name: str) -> list[dict]:
    """
    企業のIRページから決算説明資料のPDFリンクを抽出する。

    Returns:
        list of {"url": str, "title": str} dicts
    """
    print(f"  Scraping IR page: {ir_url}")
    html = _fetch_page(ir_url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    results = []
    seen_urls = set()

    # Phase 1: IRトップページからPDFを抽出
    results.extend(_extract_pdfs_from_soup(soup, ir_url, seen_urls))

    # Phase 2: サブページを探索
    sub_pages = _find_sub_pages(soup, ir_url, seen_urls)

    # サブページをスキャン（最大5ページ）
    for sub_url in sub_pages[:5]:
        if sub_url in seen_urls:
            continue
        seen_urls.add(sub_url)

        time.sleep(REQUEST_DELAY)
        print(f"    Scanning sub-page: {sub_url}")
        sub_html = _fetch_page(sub_url)
        if not sub_html:
            continue

        sub_soup = BeautifulSoup(sub_html, "html.parser")
        # サブページでは緩和キーワードで検索
        results.extend(
            _extract_pdfs_from_soup(sub_soup, sub_url, seen_urls, SUB_PAGE_PDF_KEYWORDS)
        )

    print(f"  Found {len(results)} earnings presentation PDFs")
    return results


def scrape_companies(company_ids: Optional[list[str]] = None) -> dict[str, list[dict]]:
    """
    companies.json から irUrl を読み取り、各社のIRページをスクレイプする。

    Args:
        company_ids: 対象企業IDリスト。Noneなら全社。

    Returns:
        {company_id: [{"url": str, "title": str}, ...]}
    """
    with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
        companies = json.load(f)

    results = {}
    for company in companies:
        cid = company["id"]
        if company_ids and cid not in company_ids:
            continue

        ir_url = company.get("irUrl")
        if not ir_url:
            print(f"[{cid}] No irUrl defined, skipping")
            continue

        print(f"\n[{cid}] {company['name']}")
        pdfs = scrape_ir_page(ir_url, company["name"])
        results[cid] = pdfs

        time.sleep(REQUEST_DELAY)

    return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="IR page scraper for earnings presentations")
    parser.add_argument("--company", type=str, help="Target company ID")
    args = parser.parse_args()

    targets = [args.company] if args.company else None
    result = scrape_companies(targets)

    for cid, pdfs in result.items():
        print(f"\n=== {cid} ===")
        for pdf in pdfs:
            print(f"  {pdf['title']}: {pdf['url']}")
