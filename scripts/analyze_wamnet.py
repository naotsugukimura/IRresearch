"""
WAMNET オープンデータからリタリコの事業所分析を行うスクリプト。
就労移行支援 + 児童発達支援 + 放課後等デイサービスのCSVをダウンロードし、
リタリコの事業所をエリア別に集計、市場シェアを算出する。

CSVカラム構造（全サービス共通）:
  0: 都道府県コード+市区町村コード（例: "13101"）
  1: NOシステム固有番号
  2: 指定機関名
  3: 法人の名称
  4: 法人の名称_かな
  5: 法人番号
  6: 法人住所(市区町村)
  7: 法人住所(番地以降)
  11: サービス種類
  12: 事業所の名称
  13: 事業所の名称_かな
  14: 事業所番号
  15: 事業所住所(市区町村)
  16: 事業所住所(番地以降)
"""

import csv
import json
import zipfile
from collections import defaultdict
from pathlib import Path

import httpx

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data"
DOWNLOADS_DIR = SCRIPT_DIR / "downloads" / "wamnet"

BASE_URL = "https://www.wam.go.jp"
DATASETS = {
    "就労移行支援": f"{BASE_URL}/content/files/pcpub/top/sfkopendata/202509/sfkopendata_202509_60.zip",
    "児童発達支援": f"{BASE_URL}/content/files/pcpub/top/sfkopendata/202509/sfkopendata_202509_63.zip",
    "放課後等デイサービス": f"{BASE_URL}/content/files/pcpub/top/sfkopendata/202509/sfkopendata_202509_65.zip",
}

LITALICO_PATTERNS = ["LITALICO", "リタリコ", "litalico"]

PREFECTURES = {
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


def download_zip(url: str, service_name: str) -> Path:
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DOWNLOADS_DIR / f"{service_name}.zip"

    if zip_path.exists():
        print(f"  [skip] already downloaded")
    else:
        print(f"  [download] {url}")
        with httpx.Client(timeout=60, follow_redirects=True, verify=False) as client:
            resp = client.get(url)
            resp.raise_for_status()
            zip_path.write_bytes(resp.content)
            print(f"  [done] {len(resp.content):,} bytes")

    extract_dir = DOWNLOADS_DIR / service_name
    if not extract_dir.exists():
        extract_dir.mkdir(parents=True)
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(extract_dir)

    return extract_dir


def get_pref_from_code(code_str: str) -> str | None:
    """先頭2桁の都道府県コードから都道府県名を返す"""
    if len(code_str) >= 2:
        pref_code = code_str[:2]
        return PREFECTURES.get(pref_code)
    return None


def is_litalico(text: str) -> bool:
    for pat in LITALICO_PATTERNS:
        if pat in text:
            return True
    return False


def analyze_service(service_name: str, url: str) -> dict:
    print(f"\n=== {service_name} ===")
    extract_dir = download_zip(url, service_name)
    csv_files = list(extract_dir.rglob("*.csv"))
    if not csv_files:
        print("  [error] No CSV files found")
        return {}

    total_by_pref = defaultdict(int)
    litalico_by_pref = defaultdict(int)
    litalico_facilities = []

    for csv_file in csv_files:
        print(f"  [parse] {csv_file.name}")

        with open(csv_file, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.reader(f)
            header = next(reader)  # skip header
            print(f"  [cols] {len(header)} columns")

            for cols in reader:
                if len(cols) < 16:
                    continue

                # カラム0: 都道府県+市区町村コード (例: "13101")
                area_code = cols[0].strip()
                pref = get_pref_from_code(area_code)

                # 全行のテキスト結合（LITALICO検索用）
                row_text = " ".join(cols)

                if pref:
                    total_by_pref[pref] += 1

                if is_litalico(row_text):
                    facility_name = cols[12].strip() if len(cols) > 12 else "不明"
                    address_pref = cols[15].strip() if len(cols) > 15 else ""
                    address_detail = cols[16].strip() if len(cols) > 16 else ""
                    address = f"{address_pref}{address_detail}"

                    if pref:
                        litalico_by_pref[pref] += 1

                    litalico_facilities.append({
                        "name": facility_name,
                        "prefecture": pref or "不明",
                        "address": address,
                    })

    total_all = sum(total_by_pref.values())
    litalico_all = sum(litalico_by_pref.values())
    print(f"  [result] Total: {total_all:,}, LITALICO: {litalico_all}")

    # 都道府県別シェア（LITALICO進出エリアのみ）
    pref_analysis = []
    for pref_code in sorted(PREFECTURES.keys()):
        pref_name = PREFECTURES[pref_code]
        total = total_by_pref.get(pref_name, 0)
        litalico = litalico_by_pref.get(pref_name, 0)
        if total > 0:
            pref_analysis.append({
                "prefecture": pref_name,
                "totalFacilities": total,
                "litalicoFacilities": litalico,
                "marketShare": round(litalico / total * 100, 1) if total > 0 else 0,
            })

    return {
        "serviceName": service_name,
        "totalFacilities": total_all,
        "litalicoFacilities": litalico_all,
        "marketShare": round(litalico_all / total_all * 100, 2) if total_all > 0 else 0,
        "byPrefecture": pref_analysis,
        "litalicoFacilityList": litalico_facilities,
    }


def main():
    print("WAMNET Open Data -> LITALICO Area Analysis")
    print("=" * 50)

    results = {}
    for service_name, url in DATASETS.items():
        result = analyze_service(service_name, url)
        if result:
            results[service_name] = result

    output = {
        "companyId": "litalico",
        "source": "WAMNET Open Data (2025年9月版)",
        "services": results,
        "summary": {
            "totalLitalicoFacilities": sum(
                r.get("litalicoFacilities", 0) for r in results.values()
            ),
            "prefecturesWithPresence": len(
                set(
                    f["prefecture"]
                    for r in results.values()
                    for f in r.get("litalicoFacilityList", [])
                    if f["prefecture"] != "不明"
                )
            ),
        },
    }

    output_path = DATA_DIR / "litalico-area-analysis.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[output] {output_path}")
    print(f"[summary] LITALICO total: {output['summary']['totalLitalicoFacilities']} facilities")
    print(f"[summary] Prefectures: {output['summary']['prefecturesWithPresence']}")

    # Top 10 prefectures for each service
    for svc_name, svc_data in results.items():
        print(f"\n--- {svc_name} Top 10 LITALICO prefectures ---")
        by_pref = sorted(svc_data["byPrefecture"], key=lambda x: x["litalicoFacilities"], reverse=True)
        for p in by_pref[:10]:
            if p["litalicoFacilities"] > 0:
                print(f"  {p['prefecture']}: {p['litalicoFacilities']}/{p['totalFacilities']} ({p['marketShare']}%)")


if __name__ == "__main__":
    main()
