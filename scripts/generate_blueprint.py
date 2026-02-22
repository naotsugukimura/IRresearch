"""
Generate serviceBlueprint data for all 18 facility services using Claude API.
Uses keikaku-soudan.json as the template/example.

Usage:
  python scripts/generate_blueprint.py              # Generate all missing
  python scripts/generate_blueprint.py shurou-a     # Generate specific service
  python scripts/generate_blueprint.py --dry-run    # Show targets only
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

# Load keikaku-soudan as template
with open(os.path.join(DATA_DIR, "keikaku-soudan.json"), "r", encoding="utf-8") as f:
    TEMPLATE_DATA = json.load(f)
TEMPLATE_BLUEPRINT = TEMPLATE_DATA["serviceBlueprint"]

# All services with their specific workflow context
SERVICES = {
    "houkago-day": {
        "name": "放課後等デイサービス",
        "category": "disability_child",
        "workflow": "利用開始から日々の療育提供まで",
        "actors": ["利用者（児童）", "保護者", "児発管", "指導員", "学校", "相談支援", "自治体", "送迎ドライバー"],
        "phases_hint": "問合せ・見学 -> アセスメント・個別支援計画作成 -> 日常の療育提供 -> モニタリング・計画見直し -> 卒業・移行支援",
        "key_issues": "送迎の調整、学校との連携、個別支援計画の質、保護者対応、加算の取得、指導員の専門性",
    },
    "jidou-hattatsu": {
        "name": "児童発達支援",
        "category": "disability_child",
        "workflow": "早期療育の開始から就学準備まで",
        "actors": ["利用者（未就学児）", "保護者", "児発管", "保育士", "PT/OT/ST", "相談支援", "自治体", "保育所"],
        "phases_hint": "問合せ・見学 -> アセスメント・個別支援計画作成 -> 療育プログラム提供 -> 保護者支援・家庭連携 -> 就学移行支援",
        "key_issues": "早期発見からの導線、保護者の障害受容支援、保育所との併行通園調整、就学先選択支援",
    },
    "iryougata-jidou": {
        "name": "医療型児童発達支援",
        "category": "disability_child",
        "workflow": "医療的ケアを伴う療育提供",
        "actors": ["利用者（障害児）", "保護者", "医師", "看護師", "児発管", "PT/OT/ST", "相談支援", "自治体"],
        "phases_hint": "医療情報収集・受入判定 -> 診察・リハ計画作成 -> 医療的ケア付き療育 -> リハビリ・機能訓練 -> 退所・移行",
        "key_issues": "医療的ケア児の受入基準、看護師配置、リハビリ機器の整備、主治医との連携、緊急時対応プロトコル",
    },
    "hoikusho-houmon": {
        "name": "保育所等訪問支援",
        "category": "disability_child",
        "workflow": "訪問先での間接支援プロセス",
        "actors": ["利用者（児童）", "保護者", "訪問支援員", "保育所/学校職員", "相談支援", "自治体"],
        "phases_hint": "依頼受付・訪問先との調整 -> アセスメント（訪問観察） -> 支援計画作成 -> 訪問支援の実施 -> 効果検証・報告",
        "key_issues": "訪問先との信頼関係構築、保育士/教師へのコンサルテーション技術、移動時間コスト、1日の訪問可能件数",
    },
    "group-home": {
        "name": "共同生活援助（グループホーム）",
        "category": "residential",
        "workflow": "入居から日常生活支援まで",
        "actors": ["入居者", "家族", "サビ管", "世話人", "生活支援員", "夜間支援員", "相談支援", "自治体", "医療機関"],
        "phases_hint": "入居相談・見学 -> アセスメント・体験利用 -> 個別支援計画作成 -> 日常生活支援 -> モニタリング・地域移行支援",
        "key_issues": "入居判定基準、金銭管理支援、夜間緊急対応、入居者間トラブル、近隣住民との関係、高齢化対応",
    },
    "shukuhaku-kunren": {
        "name": "自立訓練（宿泊型）",
        "category": "residential",
        "workflow": "地域生活移行に向けた訓練プロセス",
        "actors": ["利用者", "家族", "サビ管", "生活支援員", "夜間支援員", "相談支援", "自治体", "不動産業者"],
        "phases_hint": "入所相談・アセスメント -> 訓練計画作成 -> 生活スキル訓練 -> 外泊・一人暮らし体験 -> 退所・住居確保",
        "key_issues": "2年の利用期限内での目標達成、退所後の住居確保、夜間の自立度評価、生活費管理訓練",
    },
    "shurou-ikou": {
        "name": "就労移行支援",
        "category": "employment",
        "workflow": "就職に向けた訓練から職場定着まで",
        "actors": ["利用者", "家族", "サビ管", "就労支援員", "職業指導員", "企業担当者", "ハローワーク", "相談支援"],
        "phases_hint": "利用開始・アセスメント -> 基礎訓練（ビジネスマナー等） -> 職場実習・企業開拓 -> 就職活動支援 -> 就職・定着フォロー",
        "key_issues": "就職率KPI、企業との実習先マッチング、面接対策、就労定着支援との連携、2年期限のプレッシャー",
    },
    "shurou-a": {
        "name": "就労継続支援A型",
        "category": "employment",
        "workflow": "雇用契約に基づく就労支援",
        "actors": ["利用者", "家族", "サビ管", "職業指導員", "生活支援員", "企業（発注元）", "ハローワーク", "相談支援"],
        "phases_hint": "利用相談・選考 -> 雇用契約・個別支援計画 -> 作業訓練・生産活動 -> スキルアップ・一般就労準備 -> 一般就労移行",
        "key_issues": "最低賃金保証、生産活動の収益確保、スコア方式への対応、利用者の体調管理、一般就労への移行率",
    },
    "shurou-b": {
        "name": "就労継続支援B型",
        "category": "employment",
        "workflow": "工賃支給を伴う生産活動支援",
        "actors": ["利用者", "家族", "サビ管", "職業指導員", "生活支援員", "発注元企業", "相談支援", "自治体"],
        "phases_hint": "利用開始・アセスメント -> 作業適性評価・配置 -> 生産活動・工賃支給 -> スキルアップ・A型/一般就労準備 -> ステップアップ移行",
        "key_issues": "工賃向上（目標月額3万円）、受注先開拓、作業種目の多様化、利用者の高齢化、出席率管理",
    },
    "shurou-teichaku": {
        "name": "就労定着支援",
        "category": "employment",
        "workflow": "就職後の職場定着支援",
        "actors": ["利用者", "企業担当者", "就労定着支援員", "就労移行支援事業所", "相談支援", "家族", "医療機関"],
        "phases_hint": "利用開始・企業訪問 -> 職場環境アセスメント -> 定期面談・課題対応 -> 企業との調整・環境改善 -> 支援終了・引継ぎ",
        "key_issues": "就労移行からの切れ目ない引継ぎ、企業側の理解促進、本人の体調管理支援、3年の支援期限、定着率KPI",
    },
    "seikatsu-kunren": {
        "name": "自立訓練（生活訓練）",
        "category": "employment",
        "workflow": "地域生活に必要なスキル習得",
        "actors": ["利用者", "家族", "サビ管", "生活支援員", "看護師", "相談支援", "自治体", "地域住民"],
        "phases_hint": "利用開始・アセスメント -> 訓練計画作成 -> 生活スキル訓練（調理・金銭管理等） -> 地域参加・外出訓練 -> 卒業・次サービス移行",
        "key_issues": "2年の利用期限、卒業後の進路確保、訓練成果の客観的評価、就労移行との連携、通所と訪問の組合せ",
    },
    "kinou-kunren": {
        "name": "自立訓練（機能訓練）",
        "category": "employment",
        "workflow": "身体機能のリハビリテーション",
        "actors": ["利用者", "家族", "サビ管", "PT", "OT", "ST", "看護師", "相談支援", "医療機関"],
        "phases_hint": "利用開始・医療情報収集 -> 機能評価・訓練計画 -> リハビリ実施 -> ADL評価・環境調整 -> 卒業・社会参加",
        "key_issues": "PT/OT確保困難、医療リハとの役割分担、1.5年の利用期限、福祉用具・住宅改修との連携、利用者数の少なさ",
    },
    "jiritsu-seikatsu": {
        "name": "自立生活援助",
        "category": "visit",
        "workflow": "一人暮らしの巡回支援",
        "actors": ["利用者", "家族", "地域生活支援員", "サビ管", "相談支援", "自治体", "大家/管理会社", "医療機関"],
        "phases_hint": "利用開始・生活環境確認 -> 支援計画作成 -> 定期巡回訪問 -> 随時対応（緊急連絡） -> 支援終了・地域定着",
        "key_issues": "定期巡回と随時対応の両立、移動コスト、利用者の孤立防止、金銭管理・栄養管理支援、GHとの棲み分け",
    },
    "kyotaku-houmon": {
        "name": "居宅介護（ホームヘルプ）",
        "category": "visit",
        "workflow": "在宅での身体介護・家事援助",
        "actors": ["利用者", "家族", "サービス提供責任者", "ヘルパー", "相談支援", "自治体", "医療機関"],
        "phases_hint": "利用申請・アセスメント -> 訪問介護計画作成 -> サービス提供（身体/家事/通院） -> モニタリング・計画見直し -> サービス変更・終了",
        "key_issues": "ヘルパーの高齢化と確保困難、移動時間の非効率、身体介護と家事援助の単価差、緊急時対応、介護保険との併用",
    },
    "chiiki-ikou": {
        "name": "地域移行支援",
        "category": "consultation",
        "workflow": "施設・病院から地域生活への移行支援",
        "actors": ["利用者", "家族", "相談支援専門員", "施設/病院職員", "自治体", "不動産業者", "GH事業所", "ピアサポーター"],
        "phases_hint": "対象者把握・意向確認 -> 地域移行計画作成 -> 外出・体験宿泊 -> 住居確保・サービス調整 -> 退所・地域定着",
        "key_issues": "長期入所/入院者へのアウトリーチ、本人の不安軽減、住居確保の壁、地域の受入体制、施設/病院との連携",
    },
    "chiiki-teichaku": {
        "name": "地域定着支援",
        "category": "consultation",
        "workflow": "24時間連絡体制での見守り支援",
        "actors": ["利用者", "家族", "相談支援専門員", "自治体", "緊急対応スタッフ", "医療機関", "近隣住民"],
        "phases_hint": "利用開始・緊急連絡先登録 -> 支援計画作成 -> 定期連絡・安否確認 -> 緊急時対応・駆けつけ -> 支援終了・自立確認",
        "key_issues": "24時間対応の体制構築、緊急時の駆けつけ範囲、夜間対応スタッフの確保、件数の少なさ、計画相談との兼務負担",
    },
    "shougaiji-soudan": {
        "name": "障害児相談支援",
        "category": "consultation",
        "workflow": "障害児通所サービスの利用計画作成",
        "actors": ["利用者（児童）", "保護者", "相談支援専門員", "自治体", "児童発達支援事業所", "放課後デイ", "学校", "医療機関"],
        "phases_hint": "相談受付・情報収集 -> アセスメント -> 障害児支援利用計画案作成 -> サービス担当者会議 -> モニタリング・計画見直し",
        "key_issues": "セルフプラン率50%の高さ、保護者の期待と現実のギャップ、就学前後の移行支援、複数事業所の利用調整",
    },
}

CLIENT = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a Japanese disability welfare industry expert.
Generate serviceBlueprint data for a specific disability welfare service type.

You will be given:
1. A complete example (keikaku-soudan / consultation support) as reference
2. The target service type and its workflow context

Generate blueprint data that:
- Follows the EXACT same JSON structure as the example
- Has 4-6 phases appropriate for this service's workflow
- Each phase has 2-5 tasks
- Each task has: name, actors (array of relevant stakeholders), description (1-2 sentences)
- Some tasks (about 30-50%) should have a "challenge" field with a realistic operational pain point
- Contains service-SPECIFIC content (not generic copies from the example)
- Reflects real industry knowledge
- All text in Japanese
- The "goal" field should be a concise one-liner for this service's ultimate purpose

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.
The JSON should be: {"goal": "...", "phases": [...]}"""


def generate_blueprint_for_service(service_id: str, service_info: dict) -> dict:
    """Call Claude API to generate blueprint data for one service."""
    template_json = json.dumps(TEMPLATE_BLUEPRINT, ensure_ascii=False, indent=2)

    user_prompt = f"""Generate serviceBlueprint JSON for: {service_info['name']} ({service_id})

Target service details:
- Service name: {service_info['name']}
- Category: {service_info['category']}
- Workflow: {service_info['workflow']}
- Key actors: {', '.join(service_info['actors'])}
- Suggested phases: {service_info['phases_hint']}
- Key issues: {service_info['key_issues']}

Here is the complete example for keikaku-soudan (consultation support planning):

{template_json}

Now generate the equivalent for {service_info['name']}.
- Use the suggested phases as a guide but adapt them to be specific and realistic
- Actors should be drawn from the key actors list provided
- Challenges should reflect REAL operational pain points for this specific service
- Goal should capture this service's core mission in one line

Return ONLY the JSON object (starting with {{"goal": "...", "phases": [...]}})."""

    for attempt in range(3):
        try:
            response = CLIENT.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=8192,
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
            assert "goal" in result, "Missing 'goal' key"
            assert "phases" in result, "Missing 'phases' key"
            assert len(result["phases"]) >= 4, f"Expected 4+ phases, got {len(result['phases'])}"
            for phase in result["phases"]:
                assert "id" in phase, "Phase missing 'id'"
                assert "name" in phase, "Phase missing 'name'"
                assert "tasks" in phase, "Phase missing 'tasks'"
                assert len(phase["tasks"]) >= 2, f"Phase {phase['id']} has <2 tasks"
                for task in phase["tasks"]:
                    assert "name" in task, "Task missing 'name'"
                    assert "actors" in task, "Task missing 'actors'"
            return result
        except (json.JSONDecodeError, AssertionError, Exception) as e:
            if attempt < 2:
                print(f"retry({attempt+1})...", end=" ", flush=True)
                time.sleep(2)
            else:
                raise


def update_json_file(service_id: str, blueprint_data: dict):
    """Add serviceBlueprint to existing service JSON file."""
    filepath = os.path.join(DATA_DIR, f"{service_id}.json")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["serviceBlueprint"] = blueprint_data

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
        blueprint_data = generate_blueprint_for_service(service_id, service_info)
        update_json_file(service_id, blueprint_data)
        n_phases = len(blueprint_data["phases"])
        n_tasks = sum(len(p["tasks"]) for p in blueprint_data["phases"])
        elapsed = time.time() - start
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service_info['name']} ({service_id}) OK - {n_phases} phases, {n_tasks} tasks ({elapsed:.1f}s)"
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

    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    # Filter to specific service if provided
    if args:
        target = args[0]
        if target not in SERVICES:
            print(f"Unknown service: {target}")
            print(f"Available: {', '.join(SERVICES.keys())}")
            sys.exit(1)
        services_to_process = {target: SERVICES[target]}
    else:
        services_to_process = SERVICES

    # Skip services that already have blueprint data (except keikaku-soudan template)
    to_generate = {}
    for sid, sinfo in services_to_process.items():
        filepath = os.path.join(DATA_DIR, f"{sid}.json")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "serviceBlueprint" in data:
            print(f"SKIP: {sinfo['name']} ({sid}) - already has blueprint data")
        else:
            to_generate[sid] = sinfo

    total = len(to_generate)
    if total == 0:
        print("All services already have blueprint data!")
        return

    print(f"Target: {total} services")
    est_cost = total * 0.02
    print(f"Estimated API cost: ~${est_cost:.2f}")

    if dry_run:
        for sid, sinfo in to_generate.items():
            print(f"  {sid}: {sinfo['name']}")
        return

    completed_count = 0
    print(f"Generating blueprint data (parallel={MAX_PARALLEL})...")

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
