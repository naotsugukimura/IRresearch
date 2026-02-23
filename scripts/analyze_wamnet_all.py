"""
WAMNET Open Data: All 18 disability welfare services regional analysis.
Downloads CSV data for each service and aggregates facility counts by prefecture.
Outputs JSON files into data/facility-analysis/{slug}.json (adds regionalData field).

Usage:
  python scripts/analyze_wamnet_all.py
  python scripts/analyze_wamnet_all.py --service houkago-day
  python scripts/analyze_wamnet_all.py --dry-run
"""

import csv
import json
import zipfile
import argparse
from collections import defaultdict
from pathlib import Path

import httpx

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
FACILITY_DIR = DATA_DIR / "facility-analysis"
DOWNLOADS_DIR = SCRIPT_DIR / "downloads" / "wamnet"

BASE_URL = "https://www.wam.go.jp"

# Service slug -> WAMNET service code mapping
SERVICE_MAP = {
    "houkago-day": "65",
    "jidou-hattatsu": "63",
    "iryougata-jidou": "64",
    "kyotaku-houmon": "66",
    "hoikusho-houmon": "67",
    "group-home": "35",
    "jiritsu-seikatsu": "36",
    "shurou-ikou": "27",
    "shurou-a": "31",
    "shurou-b": "32",
    "shurou-teichaku": "33",
    "seikatsu-kunren": "24",
    "kinou-kunren": "23",
    "shukuhaku-kunren": "25",
    "keikaku-soudan": "46",
    "shougaiji-soudan": "47",
    "chiiki-ikou": "53",
    "chiiki-teichaku": "54",
}

PREFECTURES = {
    "01": "Hokkaido", "02": "Aomori", "03": "Iwate", "04": "Miyagi", "05": "Akita",
    "06": "Yamagata", "07": "Fukushima", "08": "Ibaraki", "09": "Tochigi", "10": "Gunma",
    "11": "Saitama", "12": "Chiba", "13": "Tokyo", "14": "Kanagawa", "15": "Niigata",
    "16": "Toyama", "17": "Ishikawa", "18": "Fukui", "19": "Yamanashi", "20": "Nagano",
    "21": "Gifu", "22": "Shizuoka", "23": "Aichi", "24": "Mie", "25": "Shiga",
    "26": "Kyoto", "27": "Osaka", "28": "Hyogo", "29": "Nara", "30": "Wakayama",
    "31": "Tottori", "32": "Shimane", "33": "Okayama", "34": "Hiroshima", "35": "Yamaguchi",
    "36": "Tokushima", "37": "Kagawa", "38": "Ehime", "39": "Kochi", "40": "Fukuoka",
    "41": "Saga", "42": "Nagasaki", "43": "Kumamoto", "44": "Oita", "45": "Miyazaki",
    "46": "Kagoshima", "47": "Okinawa",
}

PREF_JP = {
    "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県", "05": "秋田県",
    "06": "山形県", "07": "福島県", "08": "茨城県", "09": "栃木県", "10": "群馬県",
    "11": "埼玉県", "12": "千葉県", "13": "東京都", "14": "神奈川県", "15": "新潟県",
    "16": "富山県", "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
    "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県", "25": "滋賀県",
    "26": "京都府", "27": "大阪府", "28": "兵庫県", "29": "奈良県", "30": "和歌山県",
    "31": "鳥取県", "32": "島根県", "33": "岡山県", "34": "広島県", "35": "山口県",
    "36": "徳島県", "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
    "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県", "45": "宮崎県",
    "46": "鹿児島県", "47": "沖縄県",
}

# Region grouping
REGIONS = {
    "Hokkaido/Tohoku": ["01", "02", "03", "04", "05", "06", "07"],
    "Kanto": ["08", "09", "10", "11", "12", "13", "14"],
    "Chubu": ["15", "16", "17", "18", "19", "20", "21", "22", "23"],
    "Kinki": ["24", "25", "26", "27", "28", "29", "30"],
    "Chugoku/Shikoku": ["31", "32", "33", "34", "35", "36", "37", "38", "39"],
    "Kyushu/Okinawa": ["40", "41", "42", "43", "44", "45", "46", "47"],
}

REGION_JP = {
    "Hokkaido/Tohoku": "北海道・東北",
    "Kanto": "関東",
    "Chubu": "中部",
    "Kinki": "近畿",
    "Chugoku/Shikoku": "中国・四国",
    "Kyushu/Okinawa": "九州・沖縄",
}


def download_zip(service_code: str, slug: str) -> Path:
    """Download and extract WAMNET CSV zip."""
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    url = f"{BASE_URL}/content/files/pcpub/top/sfkopendata/202509/sfkopendata_202509_{service_code}.zip"
    zip_path = DOWNLOADS_DIR / f"{slug}.zip"

    if zip_path.exists():
        print(f"  [skip] already downloaded: {slug}")
    else:
        print(f"  [download] {url}")
        with httpx.Client(timeout=60, follow_redirects=True, verify=False) as client:
            resp = client.get(url)
            resp.raise_for_status()
            zip_path.write_bytes(resp.content)
            print(f"  [done] {len(resp.content):,} bytes")

    extract_dir = DOWNLOADS_DIR / slug
    if not extract_dir.exists():
        extract_dir.mkdir(parents=True)
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(extract_dir)

    return extract_dir


def analyze_csv(extract_dir: Path) -> dict:
    """Parse CSV and count facilities by prefecture."""
    csv_files = list(extract_dir.rglob("*.csv"))
    if not csv_files:
        print("  [error] No CSV files found")
        return {}

    count_by_pref = defaultdict(int)
    # Track entity types by prefecture
    entity_by_pref = defaultdict(lambda: defaultdict(int))

    for csv_file in csv_files:
        with open(csv_file, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.reader(f)
            next(reader)  # skip header

            for cols in reader:
                if len(cols) < 16:
                    continue

                area_code = cols[0].strip()
                if len(area_code) >= 2:
                    pref_code = area_code[:2]
                    if pref_code in PREF_JP:
                        count_by_pref[pref_code] += 1

                        # Column 3: corporation name - detect type
                        corp_name = cols[3].strip() if len(cols) > 3 else ""
                        entity_type = classify_entity(corp_name)
                        entity_by_pref[pref_code][entity_type] += 1

    return dict(count_by_pref), dict(entity_by_pref)


def classify_entity(corp_name: str) -> str:
    """Classify corporation type from name."""
    if not corp_name:
        return "other"
    checks = [
        ("kabushiki", ["株式会社", "カブシキ"]),
        ("shaho", ["社会福祉法人"]),
        ("ippan_shadan", ["一般社団法人"]),
        ("tokutei_hieiri", ["特定非営利活動法人", "NPO"]),
        ("iryo", ["医療法人"]),
        ("godo", ["合同会社"]),
    ]
    for etype, keywords in checks:
        for kw in keywords:
            if kw in corp_name:
                return etype
    return "other"


def build_regional_data(count_by_pref: dict, entity_by_pref: dict) -> dict:
    """Build the regional analysis JSON structure."""
    total = sum(count_by_pref.values())

    # By prefecture (sorted by count desc)
    prefectures = []
    for code in sorted(PREF_JP.keys()):
        cnt = count_by_pref.get(code, 0)
        if cnt > 0:
            prefectures.append({
                "code": code,
                "name": PREF_JP[code],
                "count": cnt,
                "share": round(cnt / total * 100, 1) if total > 0 else 0,
            })

    # By region
    regions = []
    for region_key, pref_codes in REGIONS.items():
        cnt = sum(count_by_pref.get(c, 0) for c in pref_codes)
        regions.append({
            "name": REGION_JP[region_key],
            "count": cnt,
            "share": round(cnt / total * 100, 1) if total > 0 else 0,
        })

    # Top 10
    top10 = sorted(prefectures, key=lambda x: x["count"], reverse=True)[:10]

    # Entity type by top prefectures
    entity_summary = {}
    for code in sorted(count_by_pref.keys(), key=lambda c: count_by_pref[c], reverse=True)[:5]:
        if code in entity_by_pref:
            entity_summary[PREF_JP[code]] = dict(entity_by_pref[code])

    return {
        "totalFacilities": total,
        "prefectureCount": len([p for p in prefectures if p["count"] > 0]),
        "source": "WAMNET Open Data (2025/09)",
        "byPrefecture": prefectures,
        "byRegion": regions,
        "top10": top10,
        "concentration": {
            "top3Share": round(sum(p["share"] for p in top10[:3]), 1),
            "top5Share": round(sum(p["share"] for p in top10[:5]), 1),
            "top10Share": round(sum(p["share"] for p in top10[:10]), 1),
        },
    }


def process_service(slug: str, service_code: str, dry_run: bool = False) -> bool:
    """Process one service: download CSV, analyze, inject into JSON."""
    print(f"\n=== {slug} (code: {service_code}) ===")

    json_path = FACILITY_DIR / f"{slug}.json"
    if not json_path.exists():
        print(f"  [skip] JSON file not found: {json_path}")
        return False

    # Check if already has regionalData
    with open(json_path, "r", encoding="utf-8") as f:
        facility_data = json.load(f)

    if "regionalData" in facility_data and not dry_run:
        print(f"  [skip] already has regionalData")
        return True

    if dry_run:
        print(f"  [dry-run] would process {slug}")
        return True

    try:
        extract_dir = download_zip(service_code, slug)
        count_by_pref, entity_by_pref = analyze_csv(extract_dir)

        if not count_by_pref:
            print(f"  [warn] no data found")
            return False

        regional = build_regional_data(count_by_pref, entity_by_pref)
        print(f"  [result] {regional['totalFacilities']:,} facilities in {regional['prefectureCount']} prefectures")
        print(f"  [top3] {regional['concentration']['top3Share']}% concentration")

        # Inject into facility JSON
        facility_data["regionalData"] = regional

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(facility_data, f, ensure_ascii=False, indent=2)

        print(f"  [saved] {json_path.name}")
        return True

    except Exception as e:
        print(f"  [error] {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="WAMNET regional analysis for all services")
    parser.add_argument("--service", help="Process single service slug (e.g. houkago-day)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--force", action="store_true", help="Overwrite existing regionalData")
    args = parser.parse_args()

    print("WAMNET All Services Regional Analysis")
    print("=" * 50)

    if args.service:
        services = {args.service: SERVICE_MAP.get(args.service)}
        if not services[args.service]:
            print(f"Unknown service: {args.service}")
            print(f"Available: {', '.join(sorted(SERVICE_MAP.keys()))}")
            return
    else:
        services = SERVICE_MAP

    ok = 0
    fail = 0
    for slug, code in services.items():
        if args.force:
            # Remove existing regionalData to force reprocess
            json_path = FACILITY_DIR / f"{slug}.json"
            if json_path.exists():
                with open(json_path, "r", encoding="utf-8") as f:
                    d = json.load(f)
                if "regionalData" in d:
                    del d["regionalData"]
                    with open(json_path, "w", encoding="utf-8") as f:
                        json.dump(d, f, ensure_ascii=False, indent=2)

        success = process_service(slug, code, dry_run=args.dry_run)
        if success:
            ok += 1
        else:
            fail += 1

    print(f"\nDone: {ok} OK, {fail} FAILED")


if __name__ == "__main__":
    main()
