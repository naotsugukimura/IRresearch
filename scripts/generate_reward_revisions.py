"""
Generate reward-revisions.json: reward revision history for all 19 services.
- Extracts existing rewardRevisions from service JSONs (houkago-day has 5 entries)
- Uses Claude API to generate revision history for services without data
- Outputs data/reward-revisions.json

Usage:
  python scripts/generate_reward_revisions.py
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
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "reward-revisions.json")

# Service metadata
SERVICES = [
    {"slug": "houkago-day", "code": "65", "name": "放課後等デイサービス", "category": "child"},
    {"slug": "jidou-hattatsu", "code": "63", "name": "児童発達支援", "category": "child"},
    {"slug": "iryougata-jidou", "code": "64", "name": "医療型児童発達支援", "category": "child"},
    {"slug": "hoikusho-houmon", "code": "67", "name": "保育所等訪問支援", "category": "child"},
    {"slug": "kyotaku-houmon", "code": "66", "name": "居宅訪問型児童発達支援", "category": "child"},
    {"slug": "group-home", "code": "35", "name": "共同生活援助（グループホーム）", "category": "residential"},
    {"slug": "shukuhaku-kunren", "code": "25", "name": "自立訓練（宿泊型）", "category": "residential"},
    {"slug": "kinou-kunren", "code": "23", "name": "自立訓練（機能訓練）", "category": "employment"},
    {"slug": "seikatsu-kunren", "code": "24", "name": "自立訓練（生活訓練）", "category": "employment"},
    {"slug": "jiritsu-seikatsu", "code": "36", "name": "自立生活援助", "category": "employment"},
    {"slug": "shurou-ikou", "code": "27", "name": "就労移行支援", "category": "employment"},
    {"slug": "shurou-a", "code": "31", "name": "就労継続支援A型", "category": "employment"},
    {"slug": "shurou-b", "code": "32", "name": "就労継続支援B型", "category": "employment"},
    {"slug": "shurou-teichaku", "code": "33", "name": "就労定着支援", "category": "employment"},
    {"slug": "keikaku-soudan", "code": "46", "name": "計画相談支援", "category": "consultation"},
    {"slug": "shougaiji-soudan", "code": "47", "name": "障害児相談支援", "category": "consultation"},
    {"slug": "chiiki-ikou", "code": "53", "name": "地域移行支援", "category": "consultation"},
    {"slug": "chiiki-teichaku", "code": "54", "name": "地域定着支援", "category": "consultation"},
    {"slug": "kyotaku-kaigo", "code": "11", "name": "居宅介護", "category": "visit"},
]

# Load houkago-day template
with open(os.path.join(DATA_DIR, "houkago-day.json"), "r", encoding="utf-8") as f:
    TEMPLATE_DATA = json.load(f)
TEMPLATE_REVISIONS = TEMPLATE_DATA.get("rewardRevisions", [])

CLIENT = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a Japanese disability welfare services expert specializing in the reward revision history (報酬改定) of services under Japan's Services and Supports for Persons with Disabilities Act (障害者総合支援法) and the Child Welfare Act (児童福祉法).

Generate a comprehensive revision history for the specified service type. Each entry should document a specific reward revision year.

Requirements:
1. Follow the EXACT JSON structure as the template
2. Include ALL major revisions from the service's creation to 2024
3. type: "creation" for the year the service was first established, "revision" for subsequent changes
4. description: 2-3 sentences explaining what changed and why
5. impact: Business/market impact of the change (from a provider perspective)
6. baseReward: The approximate base reward unit value after this revision
7. keyChanges: 3-5 specific bullet points about what changed

CRITICAL:
- Be historically accurate about when services were created and revised
- 障害者自立支援法 (2006), 障害者総合支援法 (2013), and児童福祉法改正 are key milestones
- Major revision years: 2006, 2009, 2012, 2015, 2018, 2021, 2024
- Not all services existed in all years - only include years relevant to the service
- All text in Japanese
- Return ONLY valid JSON array, no markdown, no explanation"""


def generate_revisions_for_service(service: dict) -> list:
    """Call Claude API to generate revision history for one service."""
    template_json = json.dumps(TEMPLATE_REVISIONS, ensure_ascii=False, indent=2)

    user_prompt = f"""Generate the reward revision history for: {service['name']} (service code: {service['code']})

Category: {service['category']}

Here is the complete example for houkago-day (放課後等デイサービス) - follow this EXACT structure for each entry:

{template_json}

Now generate the equivalent array for {service['name']}.
Include all revisions from the service's creation through 2024.
Return ONLY a JSON array of revision objects (not wrapped in another object)."""

    for attempt in range(3):
        try:
            response = CLIENT.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )

            text = response.content[0].text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]
            if text.startswith("json"):
                text = text[4:].strip()

            result = json.loads(text)
            assert isinstance(result, list), "Expected a JSON array"
            assert len(result) >= 2, f"Expected at least 2 revisions, got {len(result)}"
            for r in result:
                assert "year" in r, "Missing 'year' field"
                assert "title" in r, "Missing 'title' field"
                assert "keyChanges" in r, "Missing 'keyChanges' field"
            return result
        except (json.JSONDecodeError, AssertionError, Exception) as e:
            if attempt < 2:
                print(f"retry({attempt+1})...", end=" ", flush=True)
                time.sleep(2)
            else:
                raise


lock = threading.Lock()
completed_count = 0


def process_one(service: dict, total: int) -> dict:
    """Process one service. Returns entry dict."""
    global completed_count
    slug = service["slug"]
    start = time.time()

    # Check if service JSON already has rewardRevisions
    json_path = os.path.join(DATA_DIR, f"{slug}.json")
    existing_revisions = None
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if data.get("rewardRevisions") and len(data["rewardRevisions"]) > 0:
            existing_revisions = data["rewardRevisions"]

    try:
        if existing_revisions:
            revisions = existing_revisions
            source = "existing"
        else:
            revisions = generate_revisions_for_service(service)
            source = "generated"

        elapsed = time.time() - start
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service['name']} ({slug}) {source} - {len(revisions)} revisions ({elapsed:.1f}s)"
            print(msg, flush=True)

        return {
            "serviceType": service["name"],
            "serviceCode": service["code"],
            "serviceSlug": slug,
            "category": service["category"],
            "revisions": revisions,
        }
    except Exception as e:
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service['name']} ({slug}) ERROR: {e}"
            print(msg, flush=True)
        return {
            "serviceType": service["name"],
            "serviceCode": service["code"],
            "serviceSlug": slug,
            "category": service["category"],
            "revisions": [],
        }


def main():
    global completed_count

    # Filter out kyotaku-kaigo if no JSON file exists
    services_to_process = []
    for s in SERVICES:
        json_path = os.path.join(DATA_DIR, f"{s['slug']}.json")
        if os.path.exists(json_path) or s["slug"] == "kyotaku-kaigo":
            services_to_process.append(s)

    # Remove kyotaku-kaigo if it has no JSON (it's a standalone service without facility page)
    services_to_process = [s for s in services_to_process if os.path.exists(os.path.join(DATA_DIR, f"{s['slug']}.json")) or s["slug"] not in [ss["slug"] for ss in SERVICES if not os.path.exists(os.path.join(DATA_DIR, f"{ss['slug']}.json"))]]

    # Simpler: just use services that have JSON files
    services_to_process = []
    for s in SERVICES:
        json_path = os.path.join(DATA_DIR, f"{s['slug']}.json")
        if os.path.exists(json_path):
            services_to_process.append(s)

    total = len(services_to_process)
    completed_count = 0
    print(f"Processing {total} services (parallel={MAX_PARALLEL})...")

    results = []
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        futures = {
            executor.submit(process_one, s, total): s
            for s in services_to_process
        }
        for future in as_completed(futures):
            results.append(future.result())

    # Sort by category then service code
    category_order = {"child": 0, "residential": 1, "employment": 2, "visit": 3, "consultation": 4}
    results.sort(key=lambda x: (category_order.get(x["category"], 99), x["serviceCode"]))

    output = {
        "lastUpdated": "2026-02-22",
        "source": "厚生労働省 障害福祉サービス等報酬改定 告示",
        "services": results,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        f.write("\n")

    ok = sum(1 for r in results if len(r["revisions"]) > 0)
    err = sum(1 for r in results if len(r["revisions"]) == 0)
    total_revisions = sum(len(r["revisions"]) for r in results)
    print(f"\nDone! Services={ok}, Failed={err}, Total revisions={total_revisions}")
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
