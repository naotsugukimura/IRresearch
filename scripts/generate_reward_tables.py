"""
Generate rewardUnitTable data for all 18 facility services using Claude API.
Uses houkago-day.json as the template/example.

Usage:
  python scripts/generate_reward_tables.py           # Generate all services
  python scripts/generate_reward_tables.py shurou-a   # Generate specific service
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
TEMPLATE_REWARD = TEMPLATE_DATA["rewardUnitTable"]

# All 17 services (excluding houkago-day which already has reward table)
SERVICES = {
    "jidou-hattatsu": {
        "name": "児童発達支援",
        "service_code": "63",
        "reward_context": """令和6年度改定の児童発達支援の報酬体系:
- 基本報酬は「総合支援型」「特定プログラム特化型」の2類型
- 区分1(指標該当児50%以上)/区分2の2区分
- 定員規模: 10名以下/11-20名/21名以上
- 利用時間区分: 3時間以上/3時間未満
- 主要加算: 児童指導員等加配加算、専門的支援体制加算、個別サポート加算、送迎加算、
  処遇改善加算、家庭連携加算、関係機関連携加算、保育・教育等移行支援加算、
  延長支援加算、医療連携体制加算、看護職員加配加算
- 放課後デイと類似構造だが、未就学児向けで単価がやや異なる""",
    },
    "iryougata-jidou": {
        "name": "医療型児童発達支援",
        "service_code": "64",
        "reward_context": """令和6年度改定の医療型児童発達支援の報酬体系:
- 基本報酬は医療型のため高単価（肢体不自由児/重症心身障害児）
- 定員規模による区分
- 医療的ケア区分（スコア）による加算が重要
- 主要加算: 医療的ケア児支援加算(スコア別5段階)、看護職員加配加算、
  リハビリテーション加算(PT/OT/ST)、専門的支援体制加算、
  処遇改善加算、送迎加算、延長支援加算
- 特徴: 医師・看護師配置が必須、リハ職の加算が充実""",
    },
    "hoikusho-houmon": {
        "name": "保育所等訪問支援",
        "service_code": "67",
        "reward_context": """令和6年度改定の保育所等訪問支援の報酬体系:
- 基本報酬は1回あたりの単位（訪問型サービス）
- 訪問先: 保育所/幼稚園/学校/放課後児童クラブ等
- 専門職種別の加算（PT/OT/ST等）
- 主要加算: 訪問支援員特別加算、利用者負担上限額管理加算、
  処遇改善加算、初回加算
- 特徴: 1回あたりの報酬単位、移動時間は報酬に含まれない
- 訪問回数は月2回程度が標準""",
    },
    "kyotaku-houmon": {
        "name": "居宅訪問型児童発達支援",
        "service_code": "66",
        "reward_context": """令和6年度改定の居宅訪問型児童発達支援の報酬体系:
- 基本報酬は1回あたりの単位（居宅訪問型）
- 対象: 重度障害等で通所困難な児童への居宅訪問
- 2018年新設の比較的新しいサービス
- 主要加算: 訪問支援特別加算、処遇改善加算、
  初回加算、利用者負担上限額管理加算
- 特徴: 1日1回・1時間程度、単価は比較的高め
- 定員の概念がない（個別訪問）""",
    },
    "group-home": {
        "name": "共同生活援助（グループホーム）",
        "service_code": "35",
        "reward_context": """令和6年度改定の共同生活援助の報酬体系:
- 基本報酬は3類型: 介護サービス包括型/外部サービス利用型/日中サービス支援型
- 障害支援区分別（区分なし～区分6）で単価が大きく異なる
- 世話人配置: 6:1/5:1/4:1/3:1（配置による基本報酬差）
- 主要加算: 夜間支援等体制加算(I-VI)、重度障害者支援加算、
  医療連携体制加算(I-V)、強度行動障害者体験利用加算、
  処遇改善加算、地域生活移行個別支援特別加算、
  自立生活支援加算、帰宅時支援加算
- 特徴: 日額報酬（1日あたり）、日中サービス支援型は24時間体制で高単価""",
    },
    "shukuhaku-kunren": {
        "name": "自立訓練（宿泊型）",
        "service_code": "25",
        "reward_context": """令和6年度改定の宿泊型自立訓練の報酬体系:
- 基本報酬は利用定員規模別
- 定員: 20名以下/21-40名/41-60名/61名以上
- 主要加算: 夜間支援等体制加算、通勤者生活支援加算、
  入院時支援特別加算、処遇改善加算、
  地域生活移行個別支援特別加算
- 特徴: 日額報酬、原則2年（最大3年）の期限あり
- 自立訓練（生活訓練）と組み合わせが多い""",
    },
    "shurou-ikou": {
        "name": "就労移行支援",
        "service_code": "27",
        "reward_context": """令和6年度改定の就労移行支援の報酬体系:
- 基本報酬は定員規模別（20名以下/21-40名/41-60名/61-80名/81名以上）
- 就職後6ヶ月以上定着した者の割合で基本報酬が7段階（5%未満～50%以上）
- 定着実績が報酬に直結する成果連動型
- 主要加算: 就労移行支援体制加算(I-IV)、就労支援関係研修修了加算、
  通勤訓練加算、移行準備支援体制加算(I/II)、社会生活支援特別加算、
  処遇改善加算、医療連携体制加算
- 特徴: 成果主義（定着率でランク変動）、原則2年の期限""",
    },
    "shurou-a": {
        "name": "就労継続支援A型",
        "service_code": "31",
        "reward_context": """令和6年度改定の就労継続支援A型の報酬体系:
- 基本報酬はスコア方式（令和3年度～）: 労働時間/生産活動/多様な働き方/支援力向上/地域連携活動の5評価項目
- スコア合計でI～VII（7段階）に分類
- 定員規模: 20名以下/21-40名/41-60名/61-80名/81名以上
- 主要加算: 賃金向上達成指導員配置加算、処遇改善加算、
  施設外就労加算、施設外支援加算、就労移行支援体制加算、
  重度者支援体制加算、医療連携体制加算
- 特徴: 最低賃金以上の賃金支払い義務、スコア方式で経営努力が評価される""",
    },
    "shurou-b": {
        "name": "就労継続支援B型",
        "service_code": "32",
        "reward_context": """令和6年度改定の就労継続支援B型の報酬体系:
- 基本報酬は「平均工賃月額」に連動する報酬体系
- 工賃区分: 5千円未満/5千円～1万円/1万円～1.5万円/.../4.5万円以上の8段階
- 定員規模: 20名以下/21-40名/41-60名/61-80名/81名以上
- 主要加算: 目標工賃達成指導員配置加算、処遇改善加算、
  施設外就労加算、施設外支援加算、就労移行支援体制加算、
  重度者支援体制加算、ピアサポート実施加算
- 特徴: 工賃が高いほど基本報酬も高い（成果連動型）、雇用契約なし""",
    },
    "shurou-teichaku": {
        "name": "就労定着支援",
        "service_code": "33",
        "reward_context": """令和6年度改定の就労定着支援の報酬体系:
- 基本報酬は就労定着率別（5段階: 9割以上～3割未満）
- 月額報酬（月1回以上の訪問等が要件）
- 利用期間: 就職後6ヶ月～3年6ヶ月
- 主要加算: 処遇改善加算、特別地域加算、
  利用者負担上限額管理加算
- 特徴: 定着率で大きく報酬が変動、就労移行支援等からの連携が前提
- 定着率9割以上なら月3,215単位、3割未満なら月1,045単位""",
    },
    "seikatsu-kunren": {
        "name": "自立訓練（生活訓練）",
        "service_code": "24",
        "reward_context": """令和6年度改定の自立訓練（生活訓練）の報酬体系:
- 基本報酬は定員規模別（20名以下/21-40名/41-60名/61-80名/81名以上）
- 通所型と訪問型で単価が異なる
- 主要加算: 社会生活支援特別加算、処遇改善加算、
  短期滞在加算、日中支援加算、通勤訓練加算、
  地域生活移行個別支援特別加算、医療連携体制加算
- 特徴: 原則2年（最大3年）の利用期限、食事提供体制加算あり
- 訪問による訓練も組合せ可能""",
    },
    "kinou-kunren": {
        "name": "自立訓練（機能訓練）",
        "service_code": "23",
        "reward_context": """令和6年度改定の自立訓練（機能訓練）の報酬体系:
- 基本報酬は定員規模別（20名以下/21-40名/41-60名/61名以上）
- 通所型と訪問型で単価が異なる
- PT/OT/ST等のリハ専門職の配置が基本
- 主要加算: リハビリテーション加算、処遇改善加算、
  社会生活支援特別加算、短期滞在加算、訪問訓練特別加算、
  医療連携体制加算
- 特徴: 原則1.5年（最大2年）の利用期限、身体障害中心
- 医療リハビリとの棲み分けが課題""",
    },
    "jiritsu-seikatsu": {
        "name": "自立生活援助",
        "service_code": "36",
        "reward_context": """令和6年度改定の自立生活援助の報酬体系:
- 基本報酬は月額報酬（定期訪問+随時対応）
- 利用開始月によって報酬体系が異なる（利用開始月～6ヶ月/7～12ヶ月/13ヶ月以降）
- 主要加算: 処遇改善加算、特別地域加算、
  緊急時支援加算、同行支援加算、
  利用者負担上限額管理加算
- 特徴: 2018年新設、月額報酬、定期訪問+随時対応が基本
- 原則1年（更新可能）の利用期限""",
    },
    "keikaku-soudan": {
        "name": "計画相談支援",
        "service_code": "46",
        "reward_context": """令和6年度改定の計画相談支援の報酬体系:
- 基本報酬: サービス利用支援費(初回計画作成時)/継続サービス利用支援費(モニタリング時)
- 1件あたりの報酬（月額ではない）
- モニタリング頻度: 毎月/2ヶ月/3ヶ月/6ヶ月等
- 主要加算: 初回加算、機能強化型(I-IV)相談支援体制加算、
  行動障害支援体制加算、要医療児者支援体制加算、
  精神障害者支援体制加算、ピアサポート体制加算、
  地域体制強化共同支援加算
- 特徴: 1件あたり約16,811単位（利用支援費）/約13,180単位（継続）
- 機能強化型で基本報酬が大きく変わる""",
    },
    "chiiki-ikou": {
        "name": "地域移行支援",
        "service_code": "53",
        "reward_context": """令和6年度改定の地域移行支援の報酬体系:
- 基本報酬: 地域移行支援サービス費（月額）
- 対象: 施設入所者/精神科病院長期入院者等
- 主要加算: 退院・退所月加算、初回加算、
  集中支援加算、障害福祉サービス体験利用加算、
  体験宿泊加算(I/II)、処遇改善加算、特別地域加算、
  地域体制強化共同支援加算
- 特徴: 月額報酬（約2,587単位/月）、件数が少ないため単独事業は困難
- 退院・退所が実現した月は加算あり""",
    },
    "chiiki-teichaku": {
        "name": "地域定着支援",
        "service_code": "54",
        "reward_context": """令和6年度改定の地域定着支援の報酬体系:
- 基本報酬: 体制確保費（月額）+ 緊急時支援費（緊急対応時）の2本立て
- 24時間連絡体制の確保が基本
- 主要加算: 処遇改善加算、特別地域加算、
  初回加算、利用者負担上限額管理加算
- 特徴: 体制確保費は月額約302単位（低単価）
- 緊急時支援費は1回約709単位（緊急訪問等）
- 24時間対応体制が必要だが単価が低いのが課題""",
    },
    "shougaiji-soudan": {
        "name": "障害児相談支援",
        "service_code": "47",
        "reward_context": """令和6年度改定の障害児相談支援の報酬体系:
- 基本報酬: 障害児支援利用援助費(初回計画作成)/継続障害児支援利用援助費(モニタリング)
- 1件あたりの報酬（計画相談支援と類似構造）
- 対象: 障害児通所サービス（放デイ・児発等）利用者
- 主要加算: 初回加算、機能強化型(I-IV)相談支援体制加算、
  行動障害支援体制加算、要医療児者支援体制加算、
  ピアサポート体制加算、地域体制強化共同支援加算
- 特徴: 計画相談支援とほぼ同じ報酬体系・水準
- セルフプラン率が高い（約50%）""",
    },
}

CLIENT = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a Japanese disability welfare services expert, specializing in the reward (reporting unit) system under Japan's Services and Supports for Persons with Disabilities Act.

Generate a detailed rewardUnitTable JSON object for the specified service type, based on the 2024 revision (Reiwa 6).

Requirements:
1. Follow the EXACT same JSON structure as the provided template
2. baseRewards: Include ALL major categories/tiers of base rewards with accurate unit values
   - Group by meaningful categories (e.g., service types, disability support categories, staffing ratios)
   - Include capacity tiers and duration tiers where applicable
   - Aim for 8-25 rows depending on service complexity
3. mainBonuses: Include 8-15 major bonuses with accurate unit values
   - Cover staffing, treatment improvement, specialized support, and coordination bonuses
   - Use actual unit values from the 2024 revision
4. areaMultipliers: Use the standard 8-tier area classification (same as template)
5. notes: Include 3-6 service-specific calculation notes
6. unitPrice: Use the correct base unit price for this service type (usually 10.0 for most services)

CRITICAL:
- All values must be realistic and based on actual Japanese welfare service reward schedules
- Unit values should be specific numbers (not ranges), representing the most common tier
- All text must be in Japanese
- Return ONLY valid JSON, no markdown fences, no explanation"""


def generate_reward_table_for_service(service_id: str, service_info: dict) -> dict:
    """Call Claude API to generate reward table data for one service."""
    template_json = json.dumps(TEMPLATE_REWARD, ensure_ascii=False, indent=2)

    user_prompt = f"""Generate a detailed rewardUnitTable JSON for: {service_info['name']} (service code: {service_info['service_code']})

Service-specific reward context:
{service_info['reward_context']}

Here is the complete template (houkago-day / after-school daycare) - follow this EXACT JSON structure:

{template_json}

Now generate the equivalent for {service_info['name']}.
- serviceType must be "{service_info['name']}"
- revisionYear must be 2024
- Include as many detail rows as possible for baseRewards (all meaningful category/capacity/duration combinations)
- Include all major bonuses for this service type
- Use the same areaMultipliers format (8 entries)
- Add service-specific notes

Return ONLY the JSON object starting with {{"serviceType": "{service_info['name']}", "revisionYear": 2024, ...}}"""

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
            assert "serviceType" in result, "Missing 'serviceType'"
            assert "baseRewards" in result, "Missing 'baseRewards'"
            assert "mainBonuses" in result, "Missing 'mainBonuses'"
            assert "areaMultipliers" in result, "Missing 'areaMultipliers'"
            assert len(result["baseRewards"]) >= 4, f"Too few baseRewards: {len(result['baseRewards'])}"
            assert len(result["mainBonuses"]) >= 4, f"Too few mainBonuses: {len(result['mainBonuses'])}"
            return result
        except (json.JSONDecodeError, AssertionError, Exception) as e:
            if attempt < 2:
                print(f"retry({attempt+1})...", end=" ", flush=True)
                time.sleep(2)
            else:
                raise


def update_json_file(service_id: str, reward_data: dict):
    """Add rewardUnitTable to existing service JSON file."""
    filepath = os.path.join(DATA_DIR, f"{service_id}.json")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["rewardUnitTable"] = reward_data

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
        reward_data = generate_reward_table_for_service(service_id, service_info)
        update_json_file(service_id, reward_data)
        elapsed = time.time() - start
        base_ct = len(reward_data.get("baseRewards", []))
        bonus_ct = len(reward_data.get("mainBonuses", []))
        with lock:
            completed_count += 1
            msg = f"[{completed_count}/{total}] {service_info['name']} ({service_id}) OK - {base_ct} base, {bonus_ct} bonuses ({elapsed:.1f}s)"
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

    # Skip services that already have reward table data
    to_generate = {}
    for sid, sinfo in services_to_process.items():
        filepath = os.path.join(DATA_DIR, f"{sid}.json")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if "rewardUnitTable" in data:
            print(f"SKIP: {sinfo['name']} ({sid}) - already has reward table")
        else:
            to_generate[sid] = sinfo

    total = len(to_generate)
    if total == 0:
        print("All services already have reward table data!")
        return

    completed_count = 0
    print(f"Generating reward tables for {total} services (parallel={MAX_PARALLEL})...")

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
