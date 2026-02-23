"""
Generate disability sub-type detail JSON files for all 13 remaining categories.
(mental is already done manually)
Uses Claude API for data generation.
"""
import json
import os
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add scripts dir to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env", override=True)

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed")
    sys.exit(1)

DATA_DIR = Path(__file__).parent.parent / "data"
SUBTYPES_DIR = DATA_DIR / "disability-subtypes"
SUBTYPES_DIR.mkdir(exist_ok=True)

# Load existing disability knowledge
with open(DATA_DIR / "disability-knowledge.json", "r", encoding="utf-8") as f:
    knowledge = json.load(f)

# Skip mental (already done)
SKIP = {"mental"}

# Map category IDs to their data
CATEGORIES = {cat["id"]: cat for cat in knowledge["categories"] if cat["id"] not in SKIP}

client = anthropic.Anthropic()

def generate_subtype_data(cat_id, cat_data):
    """Generate sub-type detail JSON for one category."""
    title = cat_data["title"]
    subtypes = cat_data.get("subTypes", [])

    if not subtypes:
        print(f"  SKIP {cat_id}: no subtypes defined")
        return None

    subtype_names = [s["name"] for s in subtypes]

    prompt = f"""You are a disability welfare expert in Japan. Generate detailed sub-type data for the disability category "{title}" ({cat_id}).

The sub-types to cover are: {json.dumps(subtype_names, ensure_ascii=False)}

For each sub-type, generate a JSON object with this EXACT structure:
{{
  "id": "<slug in English, lowercase, hyphens>",
  "name": "<Japanese name>",
  "parentId": "{cat_id}",
  "color": "<hex color, different shade for each>",
  "overview": "<200-300 chars overview in Japanese>",
  "estimatedPopulation": "<e.g. 約80万人>",
  "prevalence": "<e.g. 人口の約0.7%>",
  "onsetAge": "<e.g. 10代後半〜30代前半>",
  "symptoms": [
    {{ "category": "<symptom group name>", "items": ["<symptom 1>", "<symptom 2>", ...] }}
  ],
  "dailyChallenges": ["<challenge 1>", "<challenge 2>", ...],
  "treatments": [
    {{ "type": "<treatment name>", "description": "<description>", "effectiveness": "<effectiveness note>" }}
  ],
  "progression": [
    {{ "stage": "<stage name>", "description": "<description>" }}
  ],
  "livingWith": [
    {{ "tip": "<tip title>", "description": "<description>" }}
  ],
  "relatedServices": ["<service 1>", "<service 2>", ...],
  "misconceptions": [
    {{ "myth": "<common misconception>", "reality": "<actual fact>" }}
  ],
  "sources": ["<source 1>", "<source 2>", ...]
}}

Requirements:
- All text in Japanese
- symptoms: 2-4 categories with 3-5 items each
- dailyChallenges: 5-6 items
- treatments: 3-5 types with effectiveness notes
- progression: 4-5 stages
- livingWith: 3-4 tips with descriptions
- relatedServices: 4-6 disability welfare services
- misconceptions: 3-4 myth/reality pairs
- sources: 2-4 reliable sources
- Use realistic Japanese statistics and medical/welfare information
- Each sub-type should have a unique color (hex) within the same color family

Return ONLY the complete JSON object:
{{
  "parentId": "{cat_id}",
  "parentTitle": "{title}",
  "lastUpdated": "2026-02-23",
  "subTypes": [ ... all sub-types ... ]
}}

Return ONLY valid JSON, no markdown, no explanation."""

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=16000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = resp.content[0].text.strip()
        # Clean up markdown fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]

        data = json.loads(text)

        # Validate structure
        assert "subTypes" in data, "Missing subTypes"
        assert len(data["subTypes"]) == len(subtypes), f"Expected {len(subtypes)} subtypes, got {len(data['subTypes'])}"

        return data
    except Exception as e:
        print(f"  ERROR {cat_id}: {e}")
        return None


def process_category(cat_id, cat_data):
    """Process one category: generate + save."""
    out_file = SUBTYPES_DIR / f"{cat_id}.json"
    if out_file.exists():
        print(f"  SKIP {cat_id}: already exists")
        return cat_id, True

    print(f"  Generating {cat_id} ({cat_data['title']})...")
    data = generate_subtype_data(cat_id, cat_data)

    if data:
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  OK {cat_id}: {len(data['subTypes'])} subtypes saved")
        return cat_id, True
    else:
        return cat_id, False


def main():
    print(f"Generating sub-type data for {len(CATEGORIES)} categories...")
    print(f"Output dir: {SUBTYPES_DIR}")

    results = {}

    # Process in batches of 3 (parallel)
    cat_items = list(CATEGORIES.items())

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for cat_id, cat_data in cat_items:
            future = executor.submit(process_category, cat_id, cat_data)
            futures[future] = cat_id
            time.sleep(0.5)  # Slight stagger

        for future in as_completed(futures):
            cat_id = futures[future]
            try:
                cid, success = future.result()
                results[cid] = success
            except Exception as e:
                print(f"  FATAL {cat_id}: {e}")
                results[cat_id] = False

    # Summary
    ok = sum(1 for v in results.values() if v)
    fail = sum(1 for v in results.values() if not v)
    print(f"\nDone: {ok} OK, {fail} FAILED")

    if fail > 0:
        print("Failed categories:")
        for cid, success in results.items():
            if not success:
                print(f"  - {cid}")


if __name__ == "__main__":
    main()
