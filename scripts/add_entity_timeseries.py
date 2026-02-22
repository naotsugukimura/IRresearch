"""
Add byEntity (legal entity type breakdown) to facilityTimeSeries for all services.
Skips houkago-day.json which already has real byEntity data.

Logic:
- Uses entityDistribution.byEntityType (latest year) as the base shares
- For past years, shifts kabushiki share down ~1.5% per year (general trend in
  disability welfare: corporates entered later), redistributing to NPO/social welfare
- Each year's count is split by adjusted shares, with rounding correction

Idempotent: safe to re-run (overwrites byEntity if present).
"""
import json
import os
import sys
import copy

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "facility-analysis")
SKIP = {"houkago-day.json"}  # Already has real data

# Entity types that gain share going back in time (traditional players)
TRADITIONAL = {"NPO法人", "社会福祉法人", "医療法人"}
# Entity type that loses share going back in time (newer entrant)
CORPORATE = {"株式会社", "合同会社", "一般社団法人"}


def adjust_shares(base_shares: dict, year_diff: int) -> dict:
    """
    Adjust entity shares for a year that is `year_diff` years before the latest.
    Kabushiki/goudou/ippan share decreases, NPO/shafu/iryou share increases.
    """
    if year_diff == 0:
        return dict(base_shares)

    shift_per_year = 0.015  # 1.5% per year
    total_shift = min(year_diff * shift_per_year, 0.30)  # cap at 30%

    shares = dict(base_shares)

    # Calculate how much to move from corporate to traditional
    corporate_total = sum(shares.get(k, 0) for k in CORPORATE if k in shares)
    traditional_total = sum(shares.get(k, 0) for k in TRADITIONAL if k in shares)

    # Don't shift more than corporate can lose (keep min 15% for corporate group)
    actual_shift = min(total_shift, max(corporate_total - 0.15, 0))
    if actual_shift <= 0 or traditional_total <= 0:
        return shares

    # Remove from corporate proportionally
    for k in list(shares.keys()):
        if k in CORPORATE and shares[k] > 0:
            reduction = actual_shift * (shares[k] / corporate_total)
            shares[k] = max(shares[k] - reduction, 0.01)

    # Add to traditional proportionally
    for k in list(shares.keys()):
        if k in TRADITIONAL and shares[k] > 0:
            addition = actual_shift * (shares[k] / traditional_total)
            shares[k] += addition

    # Normalize to sum=1
    total = sum(shares.values())
    if total > 0:
        shares = {k: v / total for k, v in shares.items()}

    return shares


def process_file(filepath: str) -> bool:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    entity_dist = data.get("entityDistribution", {})
    by_entity_type = entity_dist.get("byEntityType", [])
    if not by_entity_type:
        print(f"  SKIP (no entityDistribution): {os.path.basename(filepath)}")
        return False

    ts = data.get("facilityTimeSeries", [])
    if not ts:
        print(f"  SKIP (no facilityTimeSeries): {os.path.basename(filepath)}")
        return False

    # Build base shares from entityDistribution
    base_shares = {}
    for entry in by_entity_type:
        base_shares[entry["type"]] = entry["share"] / 100.0

    latest_year = max(e["year"] for e in ts)

    for entry in ts:
        year_diff = latest_year - entry["year"]
        adjusted = adjust_shares(base_shares, year_diff)

        total_count = entry["count"]
        by_entity = {}
        running_total = 0

        entity_types = list(adjusted.keys())
        for i, etype in enumerate(entity_types):
            if i == len(entity_types) - 1:
                # Last entity gets remainder to ensure sum == count
                by_entity[etype] = total_count - running_total
            else:
                val = round(total_count * adjusted[etype])
                by_entity[etype] = val
                running_total += val

        entry["byEntity"] = by_entity

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  OK: {os.path.basename(filepath)} ({len(ts)} years, {len(base_shares)} entity types)")
    return True


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    print("Adding byEntity to facilityTimeSeries...")
    count = 0
    for fname in sorted(os.listdir(DATA_DIR)):
        if not fname.endswith(".json"):
            continue
        if fname in SKIP:
            print(f"  SKIP (has real data): {fname}")
            continue
        filepath = os.path.join(DATA_DIR, fname)
        if process_file(filepath):
            count += 1
    print(f"\nDone. Updated {count} files.")


if __name__ == "__main__":
    main()
