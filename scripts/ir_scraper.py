"""
企業IRページから決算説明資料のPDFリンクを抽出するスクレイパー
"""
import json
import re
import time
from typing import Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from config import COMPANIES_PATH, REQUEST_DELAY

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
    "kessan",
]

# 除外パターン（招集通知、株主通信など）
EXCLUDE_KEYWORDS = [
    "招集通知",
    "株主通信",
    "コーポレートガバナンス",
    "有価証券報告書",
    "四半期報告書",
]

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


def _fetch_page(url: str) -> Optional[str]:
    """ページのHTMLを取得する"""
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=30,
            allow_redirects=True,
        )
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding
        return resp.text
    except requests.RequestException as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return None


def _is_pdf_link(href: str) -> bool:
    """PDFリンクかどうかを判定"""
    if not href:
        return False
    return href.lower().endswith(".pdf") or "/pdf/" in href.lower()


def _matches_keywords(text: str, href: str) -> bool:
    """決算説明資料に関連するキーワードにマッチするか"""
    combined = f"{text} {href}".lower()
    for kw in PDF_KEYWORDS:
        if kw.lower() in combined:
            # 除外キーワードチェック
            for ex in EXCLUDE_KEYWORDS:
                if ex.lower() in combined:
                    return False
            return True
    return False


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

    # 全リンクをスキャン
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        text = a_tag.get_text(strip=True)

        # 相対URLを絶対URLに変換
        full_url = urljoin(ir_url, href)

        # PDFリンクかつキーワードマッチ
        if _is_pdf_link(full_url) and _matches_keywords(text, href):
            if full_url not in seen_urls:
                seen_urls.add(full_url)
                results.append({
                    "url": full_url,
                    "title": text or "（タイトル不明）",
                })

    # IRページ内のサブページも探索（1階層のみ）
    sub_pages = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        text = a_tag.get_text(strip=True)
        full_url = urljoin(ir_url, href)

        # IR関連サブページを判定
        if any(kw in text for kw in ["決算", "説明", "資料", "IR", "earnings"]):
            if not _is_pdf_link(full_url) and full_url.startswith("http"):
                sub_pages.append(full_url)

    # サブページをスキャン（最大3ページ）
    for sub_url in sub_pages[:3]:
        if sub_url in seen_urls:
            continue
        seen_urls.add(sub_url)

        time.sleep(REQUEST_DELAY)
        sub_html = _fetch_page(sub_url)
        if not sub_html:
            continue

        sub_soup = BeautifulSoup(sub_html, "html.parser")
        for a_tag in sub_soup.find_all("a", href=True):
            href = a_tag["href"]
            text = a_tag.get_text(strip=True)
            full_url = urljoin(sub_url, href)

            if _is_pdf_link(full_url) and _matches_keywords(text, href):
                if full_url not in seen_urls:
                    seen_urls.add(full_url)
                    results.append({
                        "url": full_url,
                        "title": text or "（タイトル不明）",
                    })

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
