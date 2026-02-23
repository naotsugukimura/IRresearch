"""
IRkun: Generate rewardRevisions for all 17 services (except houkago-day which already has it)
Uses Claude API to generate historically accurate reward revision data for each disability service.
"""

import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv

# Load API key from shanai_app .env
load_dotenv(Path("C:/Users/81806/AIBPO/shanai_app/.env"), override=True)

from anthropic import Anthropic

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "facility-analysis"

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# Services that need rewardRevisions (all except houkago-day)
SERVICES = {
    "jidou-hattatsu": {
        "name": "児童発達支援",
        "category": "child_day",
        "hint": "2012 creation from jidou day service. Major revisions: 2015, 2018, 2021, 2024. 2024: total units restructured with 5 assessment areas."
    },
    "iryougata-jidou": {
        "name": "医療型児童発達支援",
        "category": "child_day",
        "hint": "2012 creation. Medical rehab focus (PT/OT/ST). Revisions: 2015, 2018, 2021, 2024. Always lower volume than non-medical type."
    },
    "hoikusho-houmon": {
        "name": "保育所等訪問支援",
        "category": "child_visit",
        "hint": "2012 creation under child welfare law. Specialist visits nurseries/schools. Revisions: 2015, 2018, 2021, 2024."
    },
    "kyotaku-houmon": {
        "name": "居宅訪問型児童発達支援",
        "category": "child_visit",
        "hint": "2018 NEW creation for severe disability children who cannot attend facilities. Revisions: 2021, 2024."
    },
    "group-home": {
        "name": "共同生活援助(GH)",
        "category": "residential",
        "hint": "2006 JIRITSUSHIEN law creation (from old group home). Major growth service. Revisions: 2009, 2012, 2015, 2018, 2021, 2024. 2024: new external support type added."
    },
    "shukuhaku-kunren": {
        "name": "自立生活援助",
        "category": "residential",
        "hint": "2018 NEW creation for post-GH independent living support. Short history. Revisions: 2021, 2024."
    },
    "jiritsu-seikatsu": {
        "name": "自立訓練(生活訓練)",
        "category": "training",
        "hint": "2006 JIRITSUSHIEN law creation. Life skills training (2-3 year limit). Revisions: 2009, 2012, 2015, 2018, 2021, 2024."
    },
    "kinou-kunren": {
        "name": "自立訓練(機能訓練)",
        "category": "training",
        "hint": "2006 JIRITSUSHIEN law creation. Physical rehab focused (1.5 year limit). Revisions: 2009, 2012, 2015, 2018, 2021, 2024."
    },
    "seikatsu-kunren": {
        "name": "生活介護",
        "category": "day_care",
        "hint": "2006 JIRITSUSHIEN law creation. Largest service by users. Day care for severe disabilities. Revisions: 2009, 2012, 2015, 2018, 2021, 2024."
    },
    "shurou-ikou": {
        "name": "就労移行支援",
        "category": "employment",
        "hint": "2006 JIRITSUSHIEN law creation. 2-year transition to employment. Revisions: 2009, 2012, 2015, 2018, 2021, 2024. Focus on employment rate requirements increasing."
    },
    "shurou-a": {
        "name": "就労継続支援A型",
        "category": "employment",
        "hint": "2006 JIRITSUSHIEN law creation. Employment contract type. Minimum wage required. Revisions: 2009, 2012, 2015, 2018 (scoreboard), 2021, 2024. Strict profitability requirements."
    },
    "shurou-b": {
        "name": "就労継続支援B型",
        "category": "employment",
        "hint": "2006 JIRITSUSHIEN law creation. No employment contract. Largest by facilities. Revisions: 2009, 2012, 2015, 2018, 2021 (average wage linkage), 2024."
    },
    "shurou-teichaku": {
        "name": "就労定着支援",
        "category": "employment",
        "hint": "2018 NEW creation. Post-employment follow-up for 3 years. Revisions: 2021, 2024. Employment retention rate incentives."
    },
    "keikaku-soudan": {
        "name": "計画相談支援",
        "category": "consultation",
        "hint": "2012 creation (mandatory service plan). Revisions: 2015 (mandatory for all), 2018, 2021, 2024. Chronic shortage of planners."
    },
    "shougaiji-soudan": {
        "name": "障害児相談支援",
        "category": "consultation",
        "hint": "2012 creation alongside keikaku-soudan but for children. Revisions: 2015, 2018, 2021, 2024."
    },
    "chiiki-ikou": {
        "name": "地域移行支援",
        "category": "consultation",
        "hint": "2012 creation. Hospital/institution to community transition. Revisions: 2015, 2018, 2021, 2024. Very low utilization."
    },
    "chiiki-teichaku": {
        "name": "地域定着支援",
        "category": "consultation",
        "hint": "2012 creation. 24h emergency support for community living. Revisions: 2015, 2018, 2021, 2024. Very low utilization."
    },
}

SYSTEM_PROMPT = """You are an expert on Japanese disability welfare services (shougai fukushi service).
Generate historically accurate rewardRevisions data for a specific service type.

IMPORTANT RULES:
- Use REAL historical data about Japanese disability welfare reward revisions
- The 障害者自立支援法 was enacted in 2006
- The 障害者総合支援法 replaced it in 2013
- Child welfare services (児童福祉法) were reorganized in 2012
- Major revision years: 2009, 2012, 2015, 2018, 2021, 2024
- Each service has different creation dates and revision histories
- baseReward must include actual unit values (単位) as close to real as possible
- The first entry should be type:"creation", all others type:"revision"
- keyChanges should have 3-4 items each
- description and impact should be 1-2 sentences in Japanese
- Return ONLY valid JSON array, no markdown

Output format (JSON array):
[
  {
    "year": 2006,
    "title": "...",
    "type": "creation",
    "description": "...",
    "impact": "...",
    "baseReward": "...",
    "keyChanges": ["...", "...", "..."]
  }
]"""


def generate_revisions(service_id, service_info):
    """Generate rewardRevisions for a single service using Claude API."""
    prompt = f"""Generate the rewardRevisions array for: {service_info['name']} ({service_id})

Historical context: {service_info['hint']}

Requirements:
- Include the creation event and ALL major revision years for this specific service
- baseReward should show realistic unit values (e.g., "基本報酬: 570単位/日（定員20人以下）")
- description: 1-2 sentences explaining what changed
- impact: 1-2 sentences on market/business impact
- keyChanges: 3-4 specific changes per revision
- All text in Japanese
- Return ONLY the JSON array"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]

    return json.loads(text)


def main():
    total = len(SERVICES)
    done = 0
    errors = []

    for service_id, service_info in SERVICES.items():
        done += 1
        json_path = DATA_DIR / f"{service_id}.json"

        if not json_path.exists():
            print(f"[{done}/{total}] SKIP {service_id} - file not found")
            continue

        # Load existing data
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Skip if already has rewardRevisions
        if data.get("rewardRevisions") and len(data["rewardRevisions"]) > 0:
            print(f"[{done}/{total}] SKIP {service_id} - already has rewardRevisions")
            continue

        print(f"[{done}/{total}] Generating for {service_id} ({service_info['name']})...")

        try:
            revisions = generate_revisions(service_id, service_info)
            data["rewardRevisions"] = revisions

            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"  -> OK: {len(revisions)} revisions added")
            time.sleep(1)  # Rate limiting

        except Exception as e:
            print(f"  -> ERROR: {e}")
            errors.append(service_id)
            time.sleep(2)

    print(f"\nDone! {done - len(errors)}/{total} succeeded")
    if errors:
        print(f"Errors: {errors}")


if __name__ == "__main__":
    main()
