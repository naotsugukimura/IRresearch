"""
Fix enriched facility data to match TypeScript interfaces.
The enrich_facility_data.py script generated data with wrong field schemas.
This script fixes:
1. typicalConversations: add topics[], rename keyPoint->insight, convert dialogSample objects->strings
2. roles: convert wrong schema (qualifications/dailyTasks/annualIncome/passion/challenge) to RoleInfo
3. dailySchedule: convert conversation objects to strings
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "facility-analysis"

ROLE_ICONS = ["User", "Shield", "Heart", "BookOpen", "Stethoscope",
              "Brain", "Users", "ClipboardList", "Briefcase", "Activity"]


def fix_conversation(conv, idx):
    """Fix ConversationExample to match TypeScript interface."""
    fixed = {
        "scene": conv.get("scene", ""),
        "context": conv.get("context", ""),
        "topics": conv.get("topics", []),
        "insight": conv.get("insight", conv.get("keyPoint", "")),
    }

    # If topics is missing/empty, generate from context
    if not fixed["topics"]:
        ctx = fixed["context"]
        if ctx:
            # Create topics from context keywords
            fixed["topics"] = [ctx[:20] + "..." if len(ctx) > 20 else ctx]
        else:
            fixed["topics"] = ["support"]

    # Fix dialogSample: convert objects to strings
    ds = conv.get("dialogSample", [])
    if ds and isinstance(ds, list):
        fixed_ds = []
        for item in ds:
            if isinstance(item, dict):
                speaker = item.get("speaker", "")
                text = item.get("text", "")
                fixed_ds.append(f"{speaker}: {text}")
            elif isinstance(item, str):
                fixed_ds.append(item)
        if fixed_ds:
            fixed["dialogSample"] = fixed_ds
    elif "dialogSample" in conv and isinstance(conv["dialogSample"], list):
        fixed["dialogSample"] = conv["dialogSample"]

    return fixed


def fix_role(role, idx):
    """Fix RoleInfo to match TypeScript interface."""
    # Check if it already has the correct schema
    if "count" in role and "qualification" in role and "keyTask" in role:
        return role  # Already correct

    # Convert from enriched schema to RoleInfo
    fixed = {
        "title": role.get("title", ""),
        "description": role.get("description", ""),
        "icon": role.get("icon", ROLE_ICONS[idx % len(ROLE_ICONS)]),
        "required": role.get("required", False),
        "count": role.get("count", "1-2 staff"),
    }

    # qualification: from qualifications array or single string
    quals = role.get("qualifications", role.get("qualification", ""))
    if isinstance(quals, list):
        fixed["qualification"] = ", ".join(quals) if quals else ""
    else:
        fixed["qualification"] = str(quals)

    # keyTask: from dailyTasks array or single string
    tasks = role.get("dailyTasks", role.get("keyTask", ""))
    if isinstance(tasks, list):
        fixed["keyTask"] = tasks[0] if tasks else ""
    else:
        fixed["keyTask"] = str(tasks)

    # Optional fields
    salary = role.get("annualSalary", role.get("annualIncome", ""))
    if salary:
        fixed["annualSalary"] = str(salary)

    age = role.get("ageRange", "")
    if age:
        fixed["ageRange"] = str(age)

    ratio = role.get("jobOpeningRatio", role.get("jobMarketDemand", ""))
    if ratio:
        fixed["jobOpeningRatio"] = str(ratio)

    career = role.get("careerPath", "")
    if career:
        fixed["careerPath"] = str(career)

    motivation = role.get("motivation", role.get("passion", ""))
    if motivation:
        fixed["motivation"] = str(motivation)

    # challenges: ensure it's string array
    challenges = role.get("challenges", role.get("challenge", None))
    if challenges:
        if isinstance(challenges, str):
            fixed["challenges"] = [challenges]
        elif isinstance(challenges, list):
            fixed["challenges"] = [str(c) for c in challenges]

    return fixed


def fix_schedule_item(item):
    """Fix DailyScheduleItem conversation field."""
    if "conversation" in item and isinstance(item["conversation"], dict):
        conv = item["conversation"]
        speaker = conv.get("speaker", "")
        text = conv.get("text", "")
        item["conversation"] = f"{speaker}: {text}"
    return item


def main():
    json_files = sorted(DATA_DIR.glob("*.json"))
    total_fixes = 0

    for json_path in json_files:
        service_id = json_path.stem
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        fixes = 0

        # Fix typicalConversations
        convs = data.get("operationsStory", {}).get("typicalConversations", [])
        fixed_convs = []
        for i, conv in enumerate(convs):
            # Check if needs fix (missing topics or has keyPoint instead of insight)
            needs_fix = (
                "topics" not in conv
                or "keyPoint" in conv
                or (conv.get("dialogSample") and isinstance(conv["dialogSample"], list)
                    and conv["dialogSample"] and isinstance(conv["dialogSample"][0], dict))
            )
            if needs_fix:
                fixed_convs.append(fix_conversation(conv, i))
                fixes += 1
            else:
                fixed_convs.append(conv)
        if "operationsStory" in data:
            data["operationsStory"]["typicalConversations"] = fixed_convs

        # Fix roles
        roles = data.get("operationsStory", {}).get("roles", [])
        fixed_roles = []
        for i, role in enumerate(roles):
            needs_fix = (
                "qualifications" in role
                or "dailyTasks" in role
                or "annualIncome" in role
                or "passion" in role
                or ("challenge" in role and "challenges" not in role)
                or "icon" not in role
            )
            if needs_fix:
                fixed_roles.append(fix_role(role, i))
                fixes += 1
            else:
                fixed_roles.append(role)
        if "operationsStory" in data:
            data["operationsStory"]["roles"] = fixed_roles

        # Fix dailySchedule conversation objects
        schedule = data.get("operationsStory", {}).get("dailySchedule", [])
        for item in schedule:
            if isinstance(item.get("conversation"), dict):
                fix_schedule_item(item)
                fixes += 1

        if fixes > 0:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"{service_id}: {fixes} fixes applied")
            total_fixes += fixes
        else:
            print(f"{service_id}: OK")

    print(f"\nTotal: {total_fixes} fixes across {len(json_files)} files")


if __name__ == "__main__":
    main()
