"""
決算説明資料の取得・分析パイプライン

Usage:
  python fetch_earnings.py --company litalico
  python fetch_earnings.py --company litalico --scrape-only
  python fetch_earnings.py --company litalico --analyze-only
  python fetch_earnings.py --all
"""
import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(override=True)

from config import COMPANY_MAP
from ir_scraper import scrape_companies
from pdf_downloader import download_all, DOWNLOADS_DIR
from earnings_analyzer import analyze_company


def get_downloaded_pdfs(company_id: str) -> list[Path]:
    """既にダウンロード済みのPDFファイルを取得する"""
    company_dir = DOWNLOADS_DIR / company_id
    if not company_dir.exists():
        return []
    return sorted(company_dir.glob("*.pdf"))


def main():
    parser = argparse.ArgumentParser(
        description="決算説明資料の取得・分析パイプライン"
    )
    parser.add_argument(
        "--company",
        type=str,
        help="対象企業ID（例: litalico, welbe）",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="全社を対象にする",
    )
    parser.add_argument(
        "--scrape-only",
        action="store_true",
        help="スクレイプのみ（ダウンロード・分析しない）",
    )
    parser.add_argument(
        "--analyze-only",
        action="store_true",
        help="分析のみ（ダウンロード済みPDFを対象）",
    )
    parser.add_argument(
        "--max-pdfs",
        type=int,
        default=3,
        help="1社あたりの最大PDF数（デフォルト: 3）",
    )
    args = parser.parse_args()

    if not args.company and not args.all:
        parser.error("--company または --all を指定してください")

    # 対象企業を決定
    if args.all:
        company_ids = list(COMPANY_MAP.keys())
    else:
        if args.company not in COMPANY_MAP:
            print(f"[ERROR] Unknown company: {args.company}")
            print(f"Available: {', '.join(COMPANY_MAP.keys())}")
            sys.exit(1)
        company_ids = [args.company]

    print(f"=== 決算説明資料 取得・分析パイプライン ===")
    print(f"対象: {len(company_ids)}社")
    print()

    if args.analyze_only:
        # 分析のみモード
        for cid in company_ids:
            print(f"\n[{cid}] {COMPANY_MAP[cid]['name']}")
            pdfs = get_downloaded_pdfs(cid)
            if not pdfs:
                print(f"  [SKIP] No downloaded PDFs found")
                continue
            print(f"  Found {len(pdfs)} downloaded PDFs")
            analyze_company(cid, pdfs)
        return

    # スクレイプ
    print("--- Phase 1: IRページスクレイプ ---")
    pdf_links = scrape_companies(company_ids)

    if args.scrape_only:
        print("\n=== スクレイプ結果 ===")
        for cid, pdfs in pdf_links.items():
            print(f"\n[{cid}] {len(pdfs)} PDFs found:")
            for pdf in pdfs:
                print(f"  {pdf['title']}: {pdf['url']}")
        return

    # ダウンロード
    print("\n--- Phase 2: PDFダウンロード ---")
    downloaded = download_all(pdf_links, max_per_company=args.max_pdfs)

    # 分析
    print("\n--- Phase 3: Claude API分析 ---")
    for cid, paths in downloaded.items():
        if paths:
            print(f"\n[{cid}] {COMPANY_MAP[cid]['name']}")
            analyze_company(cid, paths)

    print("\n=== 完了 ===")
    total_pdfs = sum(len(v) for v in downloaded.values())
    print(f"ダウンロード: {total_pdfs} PDFs")


if __name__ == "__main__":
    main()
