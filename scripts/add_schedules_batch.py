"""
Batch add monthlySchedule and annualSchedule to all 17 facility JSON files.
Houkago-day already has the data; this script generates service-specific versions.

Service categories:
- child_day: jidou-hattatsu, iryougata-jidou (children's day services)
- residential: group-home, shukuhaku-kunren (residential/overnight)
- work_day: shurou-b, shurou-a, shurou-ikou, shurou-teichaku,
            seikatsu-kunren, kinou-kunren, jiritsu-seikatsu (day work/training)
- home_visit: kyotaku-houmon, hoikusho-houmon (home visit)
- consultation: keikaku-soudan, shougaiji-soudan, chiiki-ikou, chiiki-teichaku (consultation)
"""

import json
import os

DATA_DIR = "data/facility-analysis"

# Service -> category mapping
SERVICE_CATEGORIES = {
    "jidou-hattatsu": "child_day",
    "iryougata-jidou": "child_day",
    "group-home": "residential",
    "shukuhaku-kunren": "residential",
    "shurou-b": "work_day",
    "shurou-a": "work_day",
    "shurou-ikou": "work_day",
    "shurou-teichaku": "work_day",
    "seikatsu-kunren": "work_day",
    "kinou-kunren": "work_day",
    "jiritsu-seikatsu": "work_day",
    "kyotaku-houmon": "home_visit",
    "hoikusho-houmon": "home_visit",
    "keikaku-soudan": "consultation",
    "shougaiji-soudan": "consultation",
    "chiiki-ikou": "consultation",
    "chiiki-teichaku": "consultation",
}


def make_monthly(category):
    """Generate monthly schedule based on service category."""
    # Common items for all services
    common = [
        {
            "period": "month_end",
            "activity": "利用実績の整理・確定",
            "who": "サビ管・管理者",
            "detail": "サービス提供実績記録票の整理。利用者の確認印チェック。加算の記載漏れがないか確認。業務日誌の月次まとめ。",
            "importance": "critical",
        },
        {
            "period": "month_end",
            "activity": "翌月シフト・利用予約調整",
            "who": "管理者",
            "detail": "人員基準を満たすシフト作成。利用者の通所予定を集約し定員内で調整。",
            "importance": "high",
        },
        {
            "period": "next_1_5",
            "activity": "上限額管理の整理",
            "who": "事務・管理者",
            "detail": "複数事業所利用者の「利用者負担額一覧表」のやり取り。他事業所の請求に影響するため最優先で処理。",
            "deadline": "翌月5日目安",
            "importance": "critical",
        },
        {
            "period": "next_1_10",
            "activity": "国保連請求データ作成・送信",
            "who": "事務・管理者",
            "detail": "実績記録票・上限額管理結果票・給付費請求書を作成し国保連に電子請求。期限を過ぎると当月請求不可。返戻データの確認と再請求処理も実施。",
            "deadline": "翌月10日（厳守）",
            "importance": "critical",
        },
        {
            "period": "next_11",
            "activity": "利用者への請求書・領収書発行",
            "who": "事務",
            "detail": "国保連請求確定後、利用者自己負担分の請求書を発行。前々月分の領収書・代理受領通知書も発行。",
            "importance": "medium",
        },
        {
            "period": "next_mid",
            "activity": "スタッフ会議",
            "who": "全員",
            "detail": "個別支援計画の検討、ケース共有、支援方針の確認。処遇改善加算の計画周知。議事録は必ず作成・保管。",
            "importance": "high",
        },
    ]

    # Category-specific items
    if category == "child_day":
        common[0]["who"] = "児発管・管理者"
        common.append({
            "period": "next_mid",
            "activity": "モニタリング面談（該当児童）",
            "who": "児発管",
            "detail": "6ヶ月到来分の児童について保護者面談を実施。家庭での様子をヒアリングし個別支援計画の見直しを検討。",
            "importance": "high",
        })
    elif category == "residential":
        common.append({
            "period": "next_mid",
            "activity": "モニタリング（該当利用者）",
            "who": "サビ管",
            "detail": "6ヶ月到来分の利用者についてモニタリングを実施。生活状況・健康状態の変化を確認し個別支援計画の見直しを検討。",
            "importance": "high",
        })
        common.append({
            "period": "month_end",
            "activity": "夜勤・宿直体制の確認",
            "who": "管理者",
            "detail": "翌月の夜勤・宿直シフトの確定。夜間支援体制加算の算定要件確認。",
            "importance": "high",
        })
    elif category == "work_day":
        common.append({
            "period": "next_mid",
            "activity": "モニタリング面談（該当利用者）",
            "who": "サビ管",
            "detail": "6ヶ月到来分の利用者についてモニタリングを実施。訓練・就労状況の確認と個別支援計画の見直しを検討。",
            "importance": "high",
        })
        common.append({
            "period": "next_mid",
            "activity": "工賃・賃金の計算・支払い",
            "who": "事務・管理者",
            "detail": "就労系サービスでの生産活動に基づく工賃・賃金の計算と支払い処理。工賃向上計画との照合。",
            "importance": "high",
        })
    elif category == "home_visit":
        common.append({
            "period": "next_mid",
            "activity": "モニタリング（該当利用者）",
            "who": "サビ管",
            "detail": "定期モニタリングの実施。訪問先での支援状況の確認と個別支援計画の見直しを検討。",
            "importance": "high",
        })
        common.append({
            "period": "month_end",
            "activity": "訪問スケジュール調整",
            "who": "管理者",
            "detail": "翌月の訪問日程を利用者・家族と調整。訪問ルートの効率化。移動時間を考慮したスケジュール作成。",
            "importance": "high",
        })
    elif category == "consultation":
        common.append({
            "period": "next_mid",
            "activity": "モニタリング（該当利用者）",
            "who": "相談支援専門員",
            "detail": "サービス等利用計画のモニタリング。サービス利用状況の確認と計画変更の必要性を検討。関係機関との連絡調整。",
            "importance": "high",
        })
        common.append({
            "period": "month_end",
            "activity": "サービス担当者会議の調整",
            "who": "相談支援専門員",
            "detail": "翌月のサービス担当者会議の日程調整。関係事業所・利用者・家族への連絡。",
            "importance": "high",
        })

    common.append({
        "period": "next_next_15",
        "activity": "国保連からの入金確認",
        "who": "管理者",
        "detail": "サービス提供月から約45日後に給付費が入金。入金確認後、代理受領通知書を利用者へ送付。",
        "importance": "medium",
    })

    return common


def make_annual(category):
    """Generate annual schedule based on service category."""

    schedule = [
        {
            "month": 4,
            "events": [
                {"title": "新年度体制スタート", "category": "operations", "detail": "3月15日までに提出した体制届に基づく新体制。加算算定の開始。"},
                {"title": "新規利用者受入・契約", "category": "operations", "detail": "新規利用者の契約、アセスメント、個別支援計画の新規作成。"},
                {"title": "年間事業計画・安全計画策定", "category": "planning", "detail": "年間の活動計画、研修計画、安全計画（義務）の策定。"},
                {"title": "WAMNET情報公表報告", "category": "compliance", "detail": "障害福祉サービス等情報公表システムへの年次報告。"},
            ],
        },
        {
            "month": 5,
            "events": [
                {"title": "虐待防止委員会（第1回）", "category": "compliance", "detail": "虐待防止＋身体拘束適正化委員会。年1回以上義務。", "penalty": "未実施: 1%減算"},
                {"title": "虐待防止・身体拘束適正化研修", "category": "training", "detail": "全従業員対象。新規採用者は入職時にも実施。年1回以上義務。", "penalty": "未実施: 各1%減算"},
            ],
        },
        {
            "month": 6,
            "events": [
                {"title": "感染症対策研修＋訓練（第1回）", "category": "training", "detail": "嘔吐物処理手順等の確認。年2回以上義務。"},
                {"title": "感染症BCP研修（第1回）", "category": "training", "detail": "感染症事業継続計画の研修。年1回以上義務。", "penalty": "未実施: 1%減算"},
                {"title": "消防訓練（第1回）", "category": "training", "detail": "初期消火訓練＋避難訓練。年2回以上義務。"},
                {"title": "職員健康診断", "category": "compliance", "detail": "労働安全衛生法に基づく定期健康診断。年1回義務。"},
            ],
        },
        {
            "month": 7,
            "events": [
                {"title": "処遇改善加算 実績報告", "category": "compliance", "detail": "前年度分の賃金改善実績の報告書を提出。", "deadline": "7月末（厳守）", "penalty": "未報告: 加算全額返還"},
            ],
        },
        {
            "month": 8,
            "events": [],
        },
        {
            "month": 9,
            "events": [
                {"title": "前期振り返り", "category": "planning", "detail": "上半期の支援実績・利用状況の分析。"},
                {"title": "自然災害BCP研修＋訓練", "category": "training", "detail": "自然災害事業継続計画の研修・訓練。年1回以上義務。", "penalty": "未実施: 1%減算"},
                {"title": "消防訓練（第2回）", "category": "training", "detail": "年2回義務の2回目。"},
                {"title": "モニタリング集中期", "category": "operations", "detail": "4月作成分の個別支援計画が6ヶ月経過。対象利用者のモニタリングが集中。"},
            ],
        },
        {
            "month": 10,
            "events": [
                {"title": "自己評価の実施", "category": "compliance", "detail": "従業者の自己評価を実施。"},
                {"title": "運営適正化自己点検", "category": "compliance", "detail": "指定基準（人員・設備・運営）の自己点検チェックリスト実施。"},
            ],
        },
        {
            "month": 11,
            "events": [
                {"title": "感染症対策研修＋訓練（第2回）", "category": "training", "detail": "冬季の感染症流行前に実施。年2回義務の2回目。"},
                {"title": "次年度計画の検討開始", "category": "planning", "detail": "来年度の方針、新規加算の取得検討、人員計画。"},
            ],
        },
        {
            "month": 12,
            "events": [
                {"title": "BCP見直し", "category": "planning", "detail": "感染症/自然災害BCPの年次見直し。"},
                {"title": "次年度予算策定", "category": "planning", "detail": "収支見通しの作成。"},
            ],
        },
        {
            "month": 1,
            "events": [
                {"title": "受給者証更新手続き支援", "category": "operations", "detail": "3月末期限切れ利用者の受給者証更新をリマインド。申請書類の案内・支援。"},
                {"title": "次年度の体制届準備", "category": "compliance", "detail": "4月からの加算体制の変更がある場合、3月15日までに体制届を提出。", "deadline": "3月15日"},
            ],
        },
        {
            "month": 2,
            "events": [
                {"title": "処遇改善加算計画書の作成・提出", "category": "compliance", "detail": "次年度の処遇改善加算を算定するための計画書・体制届の提出。"},
                {"title": "新年度シフト策定", "category": "planning", "detail": "4月からの職員配置計画、採用活動。"},
            ],
        },
        {
            "month": 3,
            "events": [
                {"title": "体制届提出", "category": "compliance", "detail": "新年度の加算算定に必要な体制届の提出。", "deadline": "3月15日（厳守）"},
                {"title": "年度末実績集計・事業報告書", "category": "compliance", "detail": "年間の利用実績・収支実績のまとめ。法人格に応じた所轄庁への報告。"},
                {"title": "個別支援計画の年度更新", "category": "operations", "detail": "長期目標の見直し、新年度の支援計画原案作成。"},
            ],
        },
    ]

    # Category-specific additions
    if category == "child_day":
        # April: school-related
        schedule[0]["events"].append(
            {"title": "進級・進学対応", "category": "operations", "detail": "小学校入学や中学校進学に伴う支援内容の見直し。学校との引継ぎ。"}
        )
        # July/August: summer
        schedule[3]["events"].append(
            {"title": "夏休み対応開始（終日受入）", "category": "seasonal", "detail": "午前からの終日受入。特別活動プログラムの実施。シフト体制の変更。"}
        )
        schedule[4]["events"].append(
            {"title": "夏休み特別プログラム継続", "category": "seasonal", "detail": "終日型の受入継続。生活リズム維持支援。支給量超過の確認管理。"}
        )
        # October: parent evaluation (mandatory for houkago-day/jidou-hattatsu)
        schedule[6]["events"].append(
            {"title": "保護者評価の実施", "category": "compliance", "detail": "保護者等向け評価表を配布・回収。"}
        )
        # November: publish results
        schedule[7]["events"].insert(0,
            {"title": "自己評価・保護者評価の公表", "category": "compliance", "detail": "評価結果の集計、改善内容の検討、HP等での公表。年1回義務。", "penalty": "未公表: 15%減算"}
        )
        # December: winter
        schedule[8]["events"].insert(0,
            {"title": "冬休み対応", "category": "seasonal", "detail": "年末年始の開所日程決定、長期休暇用プログラム作成。"}
        )
        # March: graduation, spring break
        schedule[11]["events"].append(
            {"title": "卒業・退所対応", "category": "operations", "detail": "退所児童のファイル整理、支援記録の保管（5年間保存義務）。成人サービスへの引継ぎ。"}
        )
        schedule[11]["events"].append(
            {"title": "春休み対応", "category": "seasonal", "detail": "長期休暇プログラムの実施（終日受入）。"}
        )

    elif category == "residential":
        # 24h care specifics
        schedule[0]["events"].append(
            {"title": "夜間支援体制の年度更新", "category": "operations", "detail": "夜勤・宿直体制の見直し。夜間支援等体制加算の算定要件確認。"}
        )
        schedule[3]["events"].append(
            {"title": "防災備蓄品の点検・補充", "category": "operations", "detail": "食料・水・医薬品等の備蓄品の消費期限確認と補充。居住施設としての防災対策強化。"}
        )
        schedule[8]["events"].insert(0,
            {"title": "年末年始の特別体制準備", "category": "seasonal", "detail": "年末年始の夜勤体制、食事提供、外出・帰省対応の調整。"}
        )

    elif category == "work_day":
        schedule[0]["events"].append(
            {"title": "工賃向上計画の策定", "category": "planning", "detail": "年間の工賃向上計画の策定。生産活動の見直しと目標設定。"}
        )
        schedule[5]["events"].append(
            {"title": "就労先企業との連携強化", "category": "operations", "detail": "実習先・就職先企業への訪問。職場定着支援の状況確認。"}
        )
        # October: job fair season
        schedule[6]["events"].append(
            {"title": "就労フェア・企業説明会参加", "category": "operations", "detail": "障害者雇用促進月間（10月）に合わせた就労フェアへの参加支援。"}
        )
        schedule[11]["events"].append(
            {"title": "工賃実績の年度集計", "category": "compliance", "detail": "年間の工賃支払実績の集計。平均工賃の算出と報告準備。"}
        )

    elif category == "home_visit":
        schedule[0]["events"].append(
            {"title": "訪問計画の年度更新", "category": "planning", "detail": "年間の訪問計画策定。新規利用者の訪問頻度・内容の決定。"}
        )
        schedule[3]["events"].append(
            {"title": "訪問車両・機材の点検", "category": "operations", "detail": "訪問に使用する車両の定期点検。携帯する支援機材・衛生用品の確認。"}
        )

    elif category == "consultation":
        schedule[0]["events"].append(
            {"title": "サービス等利用計画の年度更新", "category": "operations", "detail": "年度切替に伴うサービス等利用計画の見直し。関係機関への情報提供。"}
        )
        schedule[5]["events"].append(
            {"title": "地域自立支援協議会への参加", "category": "operations", "detail": "自治体主催の地域自立支援協議会への参加。地域課題の共有と連携強化。"}
        )
        schedule[7]["events"].append(
            {"title": "セルフプラン利用者の状況確認", "category": "operations", "detail": "セルフプランの利用者について支援状況を確認。計画相談への切替の必要性を検討。"}
        )

    # Remove empty month entries
    schedule = [m for m in schedule if m["events"]]

    return schedule


def main():
    updated = 0
    skipped = 0

    for service_id, category in SERVICE_CATEGORIES.items():
        filepath = os.path.join(DATA_DIR, f"{service_id}.json")
        if not os.path.exists(filepath):
            print(f"SKIP: {filepath} not found")
            skipped += 1
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if "operationsStory" not in data:
            print(f"SKIP: {service_id} has no operationsStory")
            skipped += 1
            continue

        data["operationsStory"]["monthlySchedule"] = make_monthly(category)
        data["operationsStory"]["annualSchedule"] = make_annual(category)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        m_count = len(data["operationsStory"]["monthlySchedule"])
        a_count = len(data["operationsStory"]["annualSchedule"])
        print(f"OK: {service_id} ({category}) - monthly:{m_count} annual:{a_count}")
        updated += 1

    print(f"\nDone! Updated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
