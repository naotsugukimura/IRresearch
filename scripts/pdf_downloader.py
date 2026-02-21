"""
決算説明資料PDFをダウンロードして保存する
"""
import os
import re
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests

from config import REQUEST_DELAY, USER_AGENT, DOWNLOADS_DIR


def _safe_filename(url: str, title: str) -> str:
    """URLとタイトルから安全なファイル名を生成する"""
    # URLからファイル名部分を取得
    parsed = urlparse(url)
    url_filename = os.path.basename(parsed.path)

    if url_filename and url_filename.endswith(".pdf"):
        # URLのファイル名を使用（日本語OK）
        return url_filename

    # タイトルからファイル名を生成
    safe = re.sub(r'[<>:"/\\|?*]', "_", title)
    safe = safe[:80]  # 長すぎる場合は切り詰め
    if not safe.endswith(".pdf"):
        safe += ".pdf"
    return safe


def download_pdf(url: str, company_id: str, title: str = "") -> Optional[Path]:
    """
    PDFをダウンロードして保存する。

    Args:
        url: PDFのURL
        company_id: 企業ID（サブディレクトリ名）
        title: PDFのタイトル（ファイル名生成用）

    Returns:
        保存先のパス。失敗時はNone。
    """
    company_dir = DOWNLOADS_DIR / company_id
    company_dir.mkdir(parents=True, exist_ok=True)

    filename = _safe_filename(url, title)
    filepath = company_dir / filename

    # 既にダウンロード済みならスキップ
    if filepath.exists():
        print(f"  [SKIP] Already exists: {filename}")
        return filepath

    try:
        resp = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=60,
            stream=True,
        )
        resp.raise_for_status()

        # Content-Typeチェック
        content_type = resp.headers.get("Content-Type", "")
        if "pdf" not in content_type.lower() and not url.lower().endswith(".pdf"):
            print(f"  [WARN] Not a PDF ({content_type}): {url}")
            return None

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_mb = filepath.stat().st_size / (1024 * 1024)
        print(f"  [OK] Downloaded: {filename} ({size_mb:.1f}MB)")
        return filepath

    except requests.RequestException as e:
        print(f"  [WARN] Download failed: {e}")
        return None


def download_all(pdf_dict: dict[str, list[dict]], max_per_company: int = 5) -> dict[str, list[Path]]:
    """
    スクレイプ結果から全PDFをダウンロードする。

    Args:
        pdf_dict: {company_id: [{"url": str, "title": str}, ...]}
        max_per_company: 1社あたりの最大ダウンロード数

    Returns:
        {company_id: [Path, ...]}
    """
    results = {}

    for company_id, pdfs in pdf_dict.items():
        print(f"\n[{company_id}] Downloading {min(len(pdfs), max_per_company)} PDFs...")
        downloaded = []

        for pdf_info in pdfs[:max_per_company]:
            path = download_pdf(pdf_info["url"], company_id, pdf_info.get("title", ""))
            if path:
                downloaded.append(path)
            time.sleep(REQUEST_DELAY)

        results[company_id] = downloaded

    return results


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Download earnings presentation PDFs")
    parser.add_argument("--company", type=str, help="Target company ID")
    parser.add_argument("--url", type=str, help="Direct PDF URL to download")
    args = parser.parse_args()

    if args.url and args.company:
        download_pdf(args.url, args.company, "manual_download")
    else:
        print("Use fetch_earnings.py for automated download pipeline")
