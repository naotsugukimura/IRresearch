"""
Generate businessLifecycle data for all 18 facility services using Claude API.
Uses houkago-day.json as the template/example.

Usage:
  python scripts/generate_lifecycle.py           # Generate all 18 services
  python scripts/generate_lifecycle.py shurou-a   # Generate specific service
"""

import json
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

import anthropic

MAX_PARALLEL = 5

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "facility-analysis")

# Load houkago-day as template
with open(os.path.join(DATA_DIR, "houkago-day.json"), "r", encoding="utf-8") as f:
    TEMPLATE_DATA = json.load(f)
TEMPLATE_LIFECYCLE = TEMPLATE_DATA["businessLifecycle"]

# All 18 services (excluding houkago-day which already has lifecycle data)
SERVICES = {
    "jidou-hattatsu": {
        "name": "児童発達支援",
        "category": "disability_child",
        "users": "未就学児（0-6歳）の障害児・発達に遅れのある子ども",
        "key_role": "児童発達支援管理責任者（児発管）",
        "key_issues": "療育の専門性、保護者支援、就学移行支援、保育所等訪問との連携",
    },
    "iryougata-jidou": {
        "name": "医療型児童発達支援",
        "category": "disability_child",
        "users": "肢体不自由等で医療的ケアが必要な障害児",
        "key_role": "医師・看護師・児発管",
        "key_issues": "医療設備の整備費用が高い、看護師確保が困難、重症児の受入体制、医療的ケア児支援法",
    },
    "hoikusho-houmon": {
        "name": "保育所等訪問支援",
        "category": "disability_child",
        "users": "保育所・学校等に通う障害児（訪問先で支援）",
        "key_role": "訪問支援員（保育士・PT/OT/ST等）",
        "key_issues": "訪問先との関係構築、移動時間のコスト、1日の訪問件数の限界、認知度の低さ",
    },
    "group-home": {
        "name": "共同生活援助（グループホーム）",
        "category": "residential",
        "users": "障害のある成人（知的・精神・身体）で地域生活を送る方",
        "key_role": "サービス管理責任者（サビ管）・世話人・生活支援員",
        "key_issues": "物件確保と近隣理解、夜間支援体制、世話人の処遇、入居者の高齢化対応",
    },
    "shukuhaku-kunren": {
        "name": "自立訓練（宿泊型）",
        "category": "residential",
        "users": "地域生活への移行を目指す障害者（原則2年間）",
        "key_role": "サービス管理責任者・生活支援員",
        "key_issues": "2年の利用期限による回転率、卒業後の住居確保、夜間体制、グループホームとの棲み分け",
    },
    "shurou-ikou": {
        "name": "就労移行支援",
        "category": "employment",
        "users": "一般就労を目指す障害者（原則2年間）",
        "key_role": "サービス管理責任者・就労支援員・職業指導員",
        "key_issues": "就職率がKPI、2年の利用制限、企業開拓、就職後の定着支援（就労定着と連携）",
    },
    "shurou-a": {
        "name": "就労継続支援A型",
        "category": "employment",
        "users": "雇用契約を結んで働く障害者",
        "key_role": "サービス管理責任者・職業指導員・生活支援員",
        "key_issues": "最低賃金の支払い義務、事業収益で賃金を賄う必要、スコア方式導入、不正事業所の淘汰",
    },
    "shurou-b": {
        "name": "就労継続支援B型",
        "category": "employment",
        "users": "雇用契約なしで働く障害者（工賃を支給）",
        "key_role": "サービス管理責任者・職業指導員・生活支援員",
        "key_issues": "工賃向上（全国平均月額16,507円）、作業種目の開拓、工賃と報酬のバランス、利用者の高齢化",
    },
    "shurou-teichaku": {
        "name": "就労定着支援",
        "category": "employment",
        "users": "一般就労した障害者（就職後6ヶ月～3年間）",
        "key_role": "就労定着支援員",
        "key_issues": "就労移行支援からの連携が必須、定着率がKPI、企業との関係構築、3年の期限後の支援",
    },
    "seikatsu-kunren": {
        "name": "自立訓練（生活訓練）",
        "category": "employment",
        "users": "地域生活に必要なスキルを訓練する障害者（原則2年間）",
        "key_role": "サービス管理責任者・生活支援員",
        "key_issues": "2年の利用制限、卒業後の進路確保、就労移行との連携、生活スキルの評価指標",
    },
    "kinou-kunren": {
        "name": "自立訓練（機能訓練）",
        "category": "employment",
        "users": "身体障害者のリハビリ・機能回復を目指す方（原則1.5年）",
        "key_role": "サービス管理責任者・理学療法士・作業療法士",
        "key_issues": "PT/OTの確保が困難、医療リハとの棲み分け、1.5年の期限、利用者数の少なさ",
    },
    "jiritsu-seikatsu": {
        "name": "自立生活援助",
        "category": "employment",
        "users": "一人暮らし・同居家族の支援が見込めない障害者",
        "key_role": "地域生活支援員",
        "key_issues": "2018年新設サービスで認知度低い、訪問型で移動コスト大、定期巡回+随時対応、グループホームとの連携",
    },
    "kyotaku-houmon": {
        "name": "居宅介護（ホームヘルプ）",
        "category": "visit",
        "users": "在宅の障害者（入浴・排泄・食事等の介護）",
        "key_role": "サービス提供責任者・ヘルパー（介護福祉士等）",
        "key_issues": "ヘルパーの高齢化と人材不足、移動時間の非効率、低単価、介護保険との併用ルール",
    },
    "keikaku-soudan": {
        "name": "計画相談支援",
        "category": "consultation",
        "users": "障害福祉サービスの利用を希望する全ての障害者・児",
        "key_role": "相談支援専門員",
        "key_issues": "報酬単価が低い（1件あたり約16,000円）、担当件数の多さ、モニタリング頻度の適正化、セルフプラン率の高さ",
    },
    "chiiki-ikou": {
        "name": "地域移行支援",
        "category": "consultation",
        "users": "施設・病院から地域生活へ移行する障害者",
        "key_role": "相談支援専門員",
        "key_issues": "対象者が限定的で件数が少ない、長期入院者のアウトリーチ、住居確保、単独事業の採算性",
    },
    "chiiki-teichaku": {
        "name": "地域定着支援",
        "category": "consultation",
        "users": "単身で地域生活する障害者（24時間連絡体制）",
        "key_role": "相談支援専門員",
        "key_issues": "24時間対応の負担、緊急時の駆けつけ体制、件数の少なさ、計画相談との兼務",
    },
    "shougaiji-soudan": {
        "name": "障害児相談支援",
        "category": "consultation",
        "users": "障害児通所サービスの利用を希望する児童・家族",
        "key_role": "相談支援専門員",
        "key_issues": "セルフプラン率が高い（約50%）、保護者対応の負担、就学相談との連携、報酬単価の低さ",
    },
}

CLIENT = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a Japanese welfare industry expert. Generate businessLifecycle data for a specific disability welfare service type.

You will be given:
1. A complete example (houkago-day / after-school daycare) as reference
2. The target service type and its key characteristics

Generate lifecycle data that:
- Follows the EXACT same JSON structure as the example
- Has 4 phases: pre-opening, year-1, year-2-3, growth
- Contains service-SPECIFIC challenges, tips, external services (not generic copy)
- Reflects real industry knowledge (actual company names, real costs, real regulations)
- All text in Japanese
- Each phase has 3-5 challenges with severity (high/medium/low) and 2-3 tips each
- successFailure (year-1, year-2-3, growth only): 2-4 scenarios per phase
- externalServices: 3-6 per phase with real company/service examples
- entityTypes: always 2 entries (minkan/shafuku)
- franchise: applicable=true/false depending on the service type

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object."""


def generate_lifecycle_for_service(service_id: str, service_info: dict) -> dict:
    """Call Claude API to generate lifecycle data for one service."""
    template_json = json.dumps(TEMPLATE_LIFECYCLE, ensure_ascii=False, indent=2)

    user_prompt = f"""Generate businessLifecycle JSON for: {service_info['name']} ({service_id})

Target service details:
- Service name: {service_info['name']}
- Category: {service_info['category']}
- Target users: {service_info['users']}
- Key role: {service_info['key_role']}
- Key issues: {service_info['key_issues']}

Here is the complete example for houkago-day (after-school daycare) - follow this EXACT structure:

{template_json}

Now generate the equivalent for {service_info['name']}. The serviceType should be "{service_id}".
Return ONLY the JSON object (the businessLifecycle object, starting with {{"serviceType": "{service_id}", "phases": [...]}})."""

    for attempt in range(3):
        try:
            response = CLIENT.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=16384,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )

            text = response.content[0].text.strip()
            # Remove markdown fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]
            if text.startswith("json"):
                text = text[4:].strip()

            result = json.loads(text)
            # Validate basic structure
            assert "phases" in result, "Missing 'phases' key"
            assert len(result["phases"]) == 4, f"Expected 4 phases, got {len(result['phases'])}"
            return result
        except (json.JSONDecodeError, AssertionError, Exception) as e:
            if attempt < 2:
                print(f"retry({attempt+1})...", end=" ", flush=True)
                time.sleep(2)
            else:
                raise


def update_json_file(service_id: str, lifecycle_data: dict):
    """Add businessLifecycle to existing service JSON file."""
    filepath = os.path.join(DATA_DIR, f"{service_id}.json")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["businessLifecycle"] = lifecycle_data

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


lock = threading.Lock()
completed_count = 0


def process_one(service_id: str, service_info: dict, total: int) -> str:
    """Process a single service. Returns status string."""
    global completed_count
    start = time.time()
    try:
        lifecycle_data = generate_lifecycle_for_service(service_id, service_info)
        update_json_file(service_id, lifecycle_data)
        elapsed = time.time() - start
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service_info['name']} ({service_id}) OK ({elapsed:.1f}s)"
            print(msg, flush=True)
        return f"OK: {service_id}"
    except Exception as e:
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service_info['name']} ({service_id}) ERROR: {e}"
            print(msg, flush=True)
        return f"ERROR: {service_id}: {e}"


def main():
    global completed_count

    # Filter to specific service if provided
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target not in SERVICES:
            print(f"Unknown service: {target}")
            print(f"Available: {', '.join(SERVICES.keys())}")
            sys.exit(1)
        services_to_process = {target: SERVICES[target]}
    else:
        services_to_process = SERVICES

    # Skip services that already have lifecycle data
    to_generate = {}
    for sid, sinfo in services_to_process.items():
        filepath = os.path.join(DATA_DIR, f"{sid}.json")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "businessLifecycle" in data:
            print(f"SKIP: {sinfo['name']} ({sid}) - already has lifecycle data")
        else:
            to_generate[sid] = sinfo

    total = len(to_generate)
    if total == 0:
        print("All services already have lifecycle data!")
        return

    completed_count = 0
    print(f"Generating lifecycle data for {total} services (parallel={MAX_PARALLEL})...")

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        futures = {
            executor.submit(process_one, sid, sinfo, total): sid
            for sid, sinfo in to_generate.items()
        }
        results = []
        for future in as_completed(futures):
            results.append(future.result())

    ok = sum(1 for r in results if r.startswith("OK"))
    err = sum(1 for r in results if r.startswith("ERROR"))
    print(f"\nDone! OK={ok}, Errors={err}")


if __name__ == "__main__":
    main()
