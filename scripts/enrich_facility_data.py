"""
IRkun: Enrich facility data quality to match houkago-day reference level.
Target: bonusCatalog>=8, roles>=5, typicalConversations>=6, dailySchedule>=9
Uses Claude API to generate service-specific additional entries.
"""

import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path("C:/Users/81806/AIBPO/shanai_app/.env"), override=True)

from anthropic import Anthropic

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "facility-analysis"

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# Minimum targets (houkago-day reference)
TARGETS = {
    "bonusCatalog": 8,
    "roles": 5,
    "typicalConversations": 6,
    "dailySchedule": 9,
}

# Skip houkago-day (already reference level)
SKIP = {"houkago-day"}

BONUS_PROMPT = """You are an expert on Japanese disability welfare service bonus/加算 systems.

Generate {count} ADDITIONAL bonus catalog entries for: {service_name}

EXISTING bonuses (DO NOT duplicate these):
{existing}

Each bonus must have these fields:
- name: bonus name in Japanese
- category: one of "基本" | "人員" | "支援" | "体制" | "その他"
- requirement: brief requirement description
- units: string like "100単位/日" or "5%加算"
- difficulty: "低" | "中" | "高"
- revenueImpact: "低" | "中" | "高"

Return ONLY a valid JSON array of the new bonus entries. No markdown."""

ROLES_PROMPT = """You are an expert on Japanese disability welfare services staffing.

Generate {count} ADDITIONAL role entries for: {service_name}

EXISTING roles (DO NOT duplicate):
{existing}

Each role must have:
- title: role title in Japanese (e.g., "管理者", "サービス管理責任者")
- description: brief role description
- dailyTasks: array of 3-4 daily tasks
- qualifications: array of 2-3 required/preferred qualifications
- annualIncome: string like "350万〜450万円"
- jobMarketDemand: "低" | "中" | "高"
- ageRange: string like "30代〜50代"
- careerPath: string describing typical career progression
- passion: string - what motivates people in this role
- challenge: string - biggest challenge in this role

Return ONLY a valid JSON array. No markdown."""

CONVERSATION_PROMPT = """You are an expert on Japanese disability welfare service operations.

Generate {count} ADDITIONAL conversation scene entries for: {service_name}

EXISTING scenes (DO NOT duplicate):
{existing}

Each conversation must have:
- scene: scene title in Japanese
- participants: array of participant labels (e.g., ["職員", "利用者"])
- context: brief context description
- keyPoint: key takeaway from this conversation
- dialogSample: array of 3-4 dialog lines, each with "speaker" and "text" fields

Return ONLY a valid JSON array. No markdown."""

SCHEDULE_PROMPT = """You are an expert on Japanese disability welfare service daily operations.

Generate {count} ADDITIONAL daily schedule entries for: {service_name}

EXISTING schedule (DO NOT duplicate time slots):
{existing}

Each schedule item must have:
- time: time string like "09:00" or "09:30"
- activity: activity description in Japanese
- who: who is involved
- detail: brief detail about the activity
- conversation: object with "speaker" and "text" fields (a typical exchange)
- mood: brief atmosphere description

The new entries should fill gaps in the existing schedule. A typical day runs 8:30-17:30.

Return ONLY a valid JSON array. No markdown."""


def generate_additional(prompt_template, service_name, existing_items, count):
    """Generate additional entries using Claude API."""
    existing_str = json.dumps(
        [item.get("name", item.get("title", item.get("scene", item.get("time", "?"))))
         for item in existing_items],
        ensure_ascii=False
    )

    prompt = prompt_template.format(
        count=count,
        service_name=service_name,
        existing=existing_str
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]

    return json.loads(text)


def main():
    json_files = sorted(DATA_DIR.glob("*.json"))
    total = len([f for f in json_files if f.stem not in SKIP])
    done = 0
    api_calls = 0

    for json_path in json_files:
        service_id = json_path.stem
        if service_id in SKIP:
            continue

        done += 1
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        service_name = data.get("serviceType", service_id)
        modified = False

        # 1. Bonus Catalog
        bonuses = data.get("bonusCatalog", [])
        if len(bonuses) < TARGETS["bonusCatalog"]:
            need = TARGETS["bonusCatalog"] - len(bonuses)
            print(f"[{done}/{total}] {service_id}: +{need} bonuses...", end=" ", flush=True)
            try:
                new_items = generate_additional(BONUS_PROMPT, service_name, bonuses, need)
                data["bonusCatalog"] = bonuses + new_items
                print(f"OK({len(new_items)})", end=" ", flush=True)
                modified = True
                api_calls += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"ERR({e})", end=" ", flush=True)

        # 2. Roles
        roles = data.get("operationsStory", {}).get("roles", [])
        if len(roles) < TARGETS["roles"]:
            need = TARGETS["roles"] - len(roles)
            print(f"+{need} roles...", end=" ", flush=True)
            try:
                new_items = generate_additional(ROLES_PROMPT, service_name, roles, need)
                data["operationsStory"]["roles"] = roles + new_items
                print(f"OK({len(new_items)})", end=" ", flush=True)
                modified = True
                api_calls += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"ERR({e})", end=" ", flush=True)

        # 3. Conversations
        convs = data.get("operationsStory", {}).get("typicalConversations", [])
        if len(convs) < TARGETS["typicalConversations"]:
            need = TARGETS["typicalConversations"] - len(convs)
            print(f"+{need} convos...", end=" ", flush=True)
            try:
                new_items = generate_additional(CONVERSATION_PROMPT, service_name, convs, need)
                data["operationsStory"]["typicalConversations"] = convs + new_items
                print(f"OK({len(new_items)})", end=" ", flush=True)
                modified = True
                api_calls += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"ERR({e})", end=" ", flush=True)

        # 4. Daily Schedule
        schedule = data.get("operationsStory", {}).get("dailySchedule", [])
        if len(schedule) < TARGETS["dailySchedule"]:
            need = TARGETS["dailySchedule"] - len(schedule)
            print(f"+{need} schedule...", end=" ", flush=True)
            try:
                new_items = generate_additional(SCHEDULE_PROMPT, service_name, schedule, need)
                # Merge and sort by time
                all_items = schedule + new_items
                all_items.sort(key=lambda x: x.get("time", "99:99"))
                data["operationsStory"]["dailySchedule"] = all_items
                print(f"OK({len(new_items)})", end=" ", flush=True)
                modified = True
                api_calls += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"ERR({e})", end=" ", flush=True)

        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("SAVED")
        else:
            print(f"[{done}/{total}] {service_id}: already at target level")

    print(f"\nDone! {done} services processed, {api_calls} API calls made")


if __name__ == "__main__":
    main()
