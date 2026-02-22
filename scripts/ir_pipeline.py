"""
Unified IR analysis pipeline CLI.

Usage:
  python scripts/ir_pipeline.py --company kaien --no-db          # 1 company, JSON only
  python scripts/ir_pipeline.py --all-private --no-db            # All 25 private companies
  python scripts/ir_pipeline.py --company kaien --analyzer tavily # Specific analyzer
  python scripts/ir_pipeline.py --company kaien --dry-run        # Preview without saving
  python scripts/ir_pipeline.py --all-private --no-db --parallel 5  # Parallel execution
"""

import argparse
import json
import logging
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

# Ensure scripts/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

from analyzers.registry import get_analyzers
from config import COMPANIES_PATH, COMPANY_MAP
from tavily_research import PRIVATE_COMPANY_IDS


def load_company_names() -> dict[str, str]:
    """Load company ID -> name mapping from companies.json."""
    companies_data = json.loads(Path(COMPANIES_PATH).read_text(encoding="utf-8"))
    return {c["id"]: c["name"] for c in companies_data}


def run_one(company_id: str, company_name: str, args) -> str:
    """Run analyzers for one company. Returns status string."""
    analyzers = get_analyzers(
        company_id,
        company_name,
        analyzer_filter=args.analyzer,
        save_db=not args.no_db,
        save_json=True,
        export_json=args.export_json,
        dry_run=args.dry_run,
    )

    if not analyzers:
        return f"SKIP: {company_id} (no applicable analyzer)"

    statuses = []
    for analyzer in analyzers:
        result = analyzer.run()
        if result and result.success:
            n_types = len(result.data)
            statuses.append(f"OK:{analyzer.analyzer_type}({n_types} types)")
        elif result:
            statuses.append(f"FAIL:{analyzer.analyzer_type}({result.error})")
        else:
            statuses.append(f"SKIP:{analyzer.analyzer_type}(no data)")

    return f"{company_id}: {', '.join(statuses)}"


def main():
    parser = argparse.ArgumentParser(description="IRkun unified IR analysis pipeline")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--company", type=str, help="Target company ID")
    group.add_argument("--all-listed", action="store_true", help="All listed companies")
    group.add_argument("--all-private", action="store_true", help="All private companies")

    parser.add_argument("--analyzer", type=str, help="Filter: tavily/edinet/pdf_earnings")
    parser.add_argument("--dry-run", action="store_true", help="Skip save")
    parser.add_argument("--no-db", action="store_true", help="Skip DB writes")
    parser.add_argument("--export-json", action="store_true", help="Export DB -> JSON after save")
    parser.add_argument("--parallel", type=int, default=1, help="Parallel workers (default: 1)")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(name)s %(levelname)s: %(message)s",
    )

    company_names = load_company_names()

    # Determine targets
    targets: list[tuple[str, str]] = []
    if args.company:
        name = company_names.get(args.company, args.company)
        targets = [(args.company, name)]
    elif args.all_listed:
        targets = [(cid, company_names.get(cid, cid)) for cid in COMPANY_MAP]
    elif args.all_private:
        targets = [(cid, company_names.get(cid, cid)) for cid in PRIVATE_COMPANY_IDS]

    total = len(targets)
    print(f"Running IR pipeline for {total} companies (parallel={args.parallel})...")

    if args.parallel > 1 and total > 1:
        # Parallel execution
        completed = 0
        with ThreadPoolExecutor(max_workers=args.parallel) as executor:
            futures = {
                executor.submit(run_one, cid, cname, args): cid
                for cid, cname in targets
            }
            for future in as_completed(futures):
                completed += 1
                status = future.result()
                print(f"[{completed}/{total}] {status}")
    else:
        # Sequential execution
        for i, (cid, cname) in enumerate(targets, 1):
            status = run_one(cid, cname, args)
            print(f"[{i}/{total}] {status}")
            if i < total:
                time.sleep(1)

    print("Done!")


if __name__ == "__main__":
    main()
