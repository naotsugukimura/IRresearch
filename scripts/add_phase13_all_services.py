"""Phase 13e: Add userJourney, startupGuide, bonusAcquisitionFlow to all 18 services.

Each service gets customized data based on its service type and characteristics.
houkago-day.json is skipped (already has data).
"""
import json
import pathlib
import sys

DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "data" / "facility-analysis"

# ============================================================
# Service-specific templates
# ============================================================

def make_user_journey(service_type: str, service_id: str) -> dict:
    """Generate userJourney data tailored to service type."""

    # --- Category-based templates ---

    # Child services (disability child day services)
    CHILD_DAILY = [
        {"label": "送迎・来所", "description": "自宅や学校からの送迎、来所時の健康チェック・連絡帳確認", "duration": "15分", "keyActions": ["体温測定", "保護者からの連絡確認", "荷物整理"], "who": "児童指導員"},
        {"label": "はじまりの会", "description": "出席確認、スケジュールの共有、気持ちの確認", "duration": "10分", "keyActions": ["名前呼び", "今日の予定発表"], "who": "児童指導員"},
        {"label": "集団活動", "description": "療育プログラムや集団遊びを通じた社会性の育成", "duration": "45分", "keyActions": ["SST", "運動プログラム", "創作活動"], "who": "児童指導員・保育士"},
        {"label": "個別支援", "description": "個別支援計画に基づく個々の課題への取り組み", "duration": "30分", "keyActions": ["学習支援", "生活訓練", "言語訓練"], "who": "児童指導員"},
        {"label": "おやつ・自由時間", "description": "おやつの提供と自由遊びの時間", "duration": "20分", "keyActions": ["手洗い", "配膳", "片付け"], "who": "児童指導員"},
        {"label": "帰りの会・送迎", "description": "振り返り、明日の予告、保護者への送迎", "duration": "15分", "keyActions": ["振り返りシート記入", "持ち物確認", "送迎"], "who": "児童指導員"},
        {"label": "記録・請求業務", "description": "支援記録の入力、保護者への報告、請求データ作成", "duration": "30分", "keyActions": ["個別記録入力", "連絡帳記載", "国保連請求"], "who": "管理者・児発管"},
    ]

    CHILD_LIFECYCLE = [
        {"label": "初回問い合わせ", "description": "保護者からの電話・メール相談、相談支援専門員からの紹介", "keyActions": ["ニーズヒアリング", "空き状況確認", "見学日程調整"], "who": "管理者"},
        {"label": "見学・体験", "description": "施設見学と体験利用（1〜3回）、子どもの様子観察", "keyActions": ["施設案内", "体験プログラム実施", "アセスメント"], "who": "児発管"},
        {"label": "契約・受給者証確認", "description": "利用契約書の締結、受給者証の確認、重要事項説明", "keyActions": ["契約書作成", "受給者証コピー", "重要事項説明"], "who": "管理者"},
        {"label": "個別支援計画作成", "description": "アセスメントに基づく支援目標と具体的支援内容の策定", "keyActions": ["アセスメント面談", "目標設定", "計画書作成・同意"], "who": "児発管"},
        {"label": "支援開始", "description": "計画に基づいた日々の支援の実施", "keyActions": ["日々の支援記録", "スタッフ間情報共有"], "who": "全スタッフ"},
        {"label": "モニタリング", "description": "6ヶ月ごとの支援計画の見直しと保護者面談", "keyActions": ["モニタリング面談", "計画見直し", "サービス担当者会議"], "who": "児発管"},
        {"label": "更新・卒業", "description": "受給者証更新手続き、または卒業・移行先への引継ぎ", "keyActions": ["更新手続き支援", "移行先との連携", "サマリー作成"], "who": "児発管・相談支援"},
    ]

    # Adult day services (employment support, life training, etc.)
    ADULT_DAY_DAILY = [
        {"label": "出勤・朝礼", "description": "利用者の出勤確認、体調チェック、当日のスケジュール共有", "duration": "15分", "keyActions": ["出勤簿記入", "体調確認", "作業割り振り"], "who": "サービス管理責任者"},
        {"label": "午前の活動", "description": "訓練プログラムや作業活動の実施", "duration": "120分", "keyActions": ["個別訓練", "グループワーク", "作業指導"], "who": "職業指導員・生活支援員"},
        {"label": "昼食・休憩", "description": "昼食の提供と休憩時間", "duration": "60分", "keyActions": ["配膳・片付け", "服薬確認"], "who": "生活支援員"},
        {"label": "午後の活動", "description": "午後の訓練・作業プログラム", "duration": "120分", "keyActions": ["個別支援", "就労準備", "生活訓練"], "who": "職業指導員・生活支援員"},
        {"label": "終礼・退所", "description": "一日の振り返りと翌日の予定確認", "duration": "15分", "keyActions": ["日報記入", "振り返り", "送迎"], "who": "職業指導員"},
        {"label": "記録・事務", "description": "支援記録の入力、関係機関への連絡、請求事務", "duration": "30分", "keyActions": ["個別記録入力", "請求データ作成"], "who": "サービス管理責任者"},
    ]

    ADULT_DAY_LIFECYCLE = [
        {"label": "相談・問い合わせ", "description": "本人・家族・相談支援専門員からの問い合わせ", "keyActions": ["ニーズ確認", "空き状況確認", "見学調整"], "who": "管理者"},
        {"label": "見学・体験", "description": "施設見学と体験利用（1〜5日程度）", "keyActions": ["施設案内", "体験プログラム", "適性評価"], "who": "サービス管理責任者"},
        {"label": "契約", "description": "利用契約・重要事項説明・受給者証確認", "keyActions": ["契約書締結", "受給者証確認", "同意書取得"], "who": "管理者"},
        {"label": "個別支援計画作成", "description": "アセスメントに基づく支援目標と訓練内容の策定", "keyActions": ["アセスメント", "計画作成", "本人同意"], "who": "サービス管理責任者"},
        {"label": "支援実施", "description": "計画に基づく日々の訓練・支援の実施", "keyActions": ["日々の記録", "中間評価", "環境調整"], "who": "全スタッフ"},
        {"label": "モニタリング", "description": "6ヶ月ごとの計画見直し、目標達成度の評価", "keyActions": ["面談", "計画更新", "担当者会議"], "who": "サービス管理責任者"},
        {"label": "移行・卒業", "description": "就労移行、一般就労、他サービスへの移行支援", "keyActions": ["移行先調整", "引継ぎ", "フォローアップ"], "who": "サービス管理責任者"},
    ]

    # Residential services (group home, etc.)
    RESIDENTIAL_DAILY = [
        {"label": "起床・朝の支援", "description": "起床介助、洗面、着替え、朝食準備の支援", "duration": "60分", "keyActions": ["起床声かけ", "身支度支援", "朝食準備"], "who": "世話人・生活支援員"},
        {"label": "日中活動への送り出し", "description": "通所先への送り出し、服薬確認、持ち物確認", "duration": "15分", "keyActions": ["服薬確認", "持ち物チェック", "送迎・見送り"], "who": "世話人"},
        {"label": "日中（ホーム管理）", "description": "清掃、買い出し、夕食準備、連絡調整", "duration": "240分", "keyActions": ["居室清掃", "食材買い出し", "関係機関連絡"], "who": "世話人"},
        {"label": "帰宅・夕方の支援", "description": "帰宅時の体調確認、入浴支援、夕食", "duration": "120分", "keyActions": ["帰宅確認", "入浴支援", "夕食提供"], "who": "世話人・生活支援員"},
        {"label": "余暇・就寝支援", "description": "余暇活動の支援、就寝準備、夜間の見守り", "duration": "120分", "keyActions": ["余暇支援", "服薬確認", "就寝準備"], "who": "生活支援員・夜勤者"},
        {"label": "夜間対応", "description": "夜間の見守り・巡回、緊急時対応", "duration": "夜間", "keyActions": ["巡回", "コール対応", "記録"], "who": "夜勤者"},
    ]

    RESIDENTIAL_LIFECYCLE = [
        {"label": "相談・問い合わせ", "description": "本人・家族・相談支援からの入居相談", "keyActions": ["空室確認", "ニーズ確認", "見学日程調整"], "who": "管理者"},
        {"label": "見学・体験入居", "description": "施設見学と体験入居（1泊〜1週間）", "keyActions": ["施設見学", "体験入居", "生活アセスメント"], "who": "サービス管理責任者"},
        {"label": "入居契約", "description": "利用契約・重要事項説明・受給者証確認", "keyActions": ["契約締結", "居室準備", "日用品確認"], "who": "管理者"},
        {"label": "個別支援計画作成", "description": "生活全般のアセスメントと支援計画策定", "keyActions": ["アセスメント", "計画作成", "本人同意"], "who": "サービス管理責任者"},
        {"label": "生活支援", "description": "日々の生活支援、金銭管理支援、健康管理", "keyActions": ["生活記録", "健康チェック", "金銭管理"], "who": "世話人・生活支援員"},
        {"label": "モニタリング", "description": "6ヶ月ごとの計画見直しと家族面談", "keyActions": ["面談", "計画更新", "家族連絡"], "who": "サービス管理責任者"},
        {"label": "退居・地域移行", "description": "一人暮らし、他施設への移行支援", "keyActions": ["移行先探し", "引越し支援", "フォローアップ"], "who": "サービス管理責任者"},
    ]

    # Consultation services
    CONSULT_DAILY = [
        {"label": "朝のミーティング", "description": "新規相談の割り振り、スケジュール確認", "duration": "15分", "keyActions": ["ケース確認", "訪問スケジュール確認"], "who": "管理者"},
        {"label": "面談・アセスメント", "description": "利用者・家族との面談、ニーズアセスメント", "duration": "60分", "keyActions": ["面談", "ニーズ整理", "サービス情報提供"], "who": "相談支援専門員"},
        {"label": "計画作成・モニタリング", "description": "サービス等利用計画の作成・見直し", "duration": "90分", "keyActions": ["計画案作成", "関係機関調整"], "who": "相談支援専門員"},
        {"label": "サービス担当者会議", "description": "関係事業所との担当者会議の開催", "duration": "60分", "keyActions": ["会議進行", "議事録作成", "合意形成"], "who": "相談支援専門員"},
        {"label": "関係機関との連携", "description": "行政・医療・教育機関との連絡調整", "duration": "60分", "keyActions": ["電話連絡", "情報共有", "連携会議"], "who": "相談支援専門員"},
        {"label": "記録・事務", "description": "面談記録、計画書作成、請求事務", "duration": "60分", "keyActions": ["面談記録", "計画書入力", "請求処理"], "who": "相談支援専門員"},
    ]

    CONSULT_LIFECYCLE = [
        {"label": "初回相談", "description": "本人・家族からの相談受付、基本情報の聴取", "keyActions": ["相談受付", "基本情報収集", "緊急性判断"], "who": "相談支援専門員"},
        {"label": "アセスメント", "description": "本人の状況・ニーズ・希望の詳細な聞き取り", "keyActions": ["訪問面談", "ニーズ整理", "社会資源調査"], "who": "相談支援専門員"},
        {"label": "計画案作成", "description": "サービス等利用計画案の作成", "keyActions": ["計画案作成", "本人・家族への説明", "同意取得"], "who": "相談支援専門員"},
        {"label": "担当者会議", "description": "サービス事業所との担当者会議開催", "keyActions": ["会議招集", "計画共有", "役割分担確認"], "who": "相談支援専門員"},
        {"label": "計画確定・交付", "description": "計画の確定と市区町村への提出", "keyActions": ["計画確定", "市区町村提出", "各事業所配布"], "who": "相談支援専門員"},
        {"label": "モニタリング", "description": "定期的な利用状況の確認と計画見直し", "keyActions": ["利用者面談", "事業所確認", "計画見直し"], "who": "相談支援専門員"},
    ]

    # Visit services
    VISIT_DAILY = [
        {"label": "出勤・準備", "description": "訪問スケジュール確認、必要物品の準備", "duration": "15分", "keyActions": ["スケジュール確認", "記録用紙準備", "移動経路確認"], "who": "訪問スタッフ"},
        {"label": "訪問支援（午前）", "description": "利用者宅への訪問、支援計画に基づくサービス提供", "duration": "120分", "keyActions": ["訪問", "支援実施", "家族への助言"], "who": "訪問スタッフ"},
        {"label": "移動・昼休憩", "description": "訪問先間の移動と休憩", "duration": "60分", "keyActions": ["移動", "簡易記録"], "who": "訪問スタッフ"},
        {"label": "訪問支援（午後）", "description": "午後の訪問支援", "duration": "120分", "keyActions": ["訪問", "支援実施", "関係機関連絡"], "who": "訪問スタッフ"},
        {"label": "記録・報告", "description": "訪問記録の作成、事業所への報告", "duration": "30分", "keyActions": ["記録入力", "管理者報告", "翌日準備"], "who": "訪問スタッフ"},
    ]

    VISIT_LIFECYCLE = [
        {"label": "相談受付", "description": "相談支援専門員等からの紹介・依頼受付", "keyActions": ["ニーズ確認", "空き確認", "日程調整"], "who": "管理者"},
        {"label": "初回訪問・アセスメント", "description": "利用者宅への初回訪問、生活環境・ニーズの把握", "keyActions": ["自宅訪問", "アセスメント", "家族面談"], "who": "サービス管理責任者"},
        {"label": "契約・計画作成", "description": "利用契約と個別支援計画の策定", "keyActions": ["契約締結", "計画作成", "同意取得"], "who": "サービス管理責任者"},
        {"label": "支援実施", "description": "定期的な訪問による支援の実施", "keyActions": ["訪問記録", "支援実施", "家族連携"], "who": "訪問スタッフ"},
        {"label": "モニタリング", "description": "3〜6ヶ月ごとの計画見直し", "keyActions": ["評価面談", "計画見直し", "担当者会議"], "who": "サービス管理責任者"},
        {"label": "終了・移行", "description": "支援終了または他サービスへの引継ぎ", "keyActions": ["終了面談", "引継ぎ", "フォローアップ"], "who": "サービス管理責任者"},
    ]

    # Mapping service IDs to templates
    CHILD_SERVICES = {"jidou-hattatsu", "iryougata-jidou", "hoikusho-houmon"}
    RESIDENTIAL_SERVICES = {"group-home", "shukuhaku-kunren"}
    CONSULT_SERVICES = {"keikaku-soudan", "shougaiji-soudan", "chiiki-ikou", "chiiki-teichaku"}
    VISIT_SERVICES = {"kyotaku-houmon"}
    # Everything else is adult day service

    if service_id in CHILD_SERVICES:
        daily = CHILD_DAILY
        lifecycle = CHILD_LIFECYCLE
    elif service_id in RESIDENTIAL_SERVICES:
        daily = RESIDENTIAL_DAILY
        lifecycle = RESIDENTIAL_LIFECYCLE
    elif service_id in CONSULT_SERVICES:
        daily = CONSULT_DAILY
        lifecycle = CONSULT_LIFECYCLE
    elif service_id in VISIT_SERVICES:
        daily = VISIT_DAILY
        lifecycle = VISIT_LIFECYCLE
    else:
        daily = ADULT_DAY_DAILY
        lifecycle = ADULT_DAY_LIFECYCLE

    return {
        "dailyFlow": daily,
        "lifecycleFlow": lifecycle,
    }


def make_startup_guide(service_type: str, service_id: str) -> dict:
    """Generate startupGuide data."""

    RESIDENTIAL_SERVICES = {"group-home", "shukuhaku-kunren"}
    CONSULT_SERVICES = {"keikaku-soudan", "shougaiji-soudan", "chiiki-ikou", "chiiki-teichaku"}

    if service_id in RESIDENTIAL_SERVICES:
        total_cost = "2,000万〜5,000万円"
        total_duration = "8〜14ヶ月"
        steps = [
            {"label": "事業計画策定", "description": "事業の収支計画、運営方針、対象者像の明確化。グループホームは物件費用が最大の投資となるため、立地選定が重要。", "duration": "1〜2ヶ月", "cost": "0〜50万円", "documents": ["事業計画書", "収支予算書", "資金計画書"], "tips": ["自治体の総量規制を事前確認", "既存事業所の分布を調査"], "warnings": ["地域によっては新規指定を制限している場合がある"]},
            {"label": "法人設立", "description": "NPO法人、株式会社、社会福祉法人等の設立。社会福祉法人は設立に6ヶ月以上かかることも。", "duration": "1〜6ヶ月", "cost": "10万〜100万円", "documents": ["定款", "登記申請書", "役員名簿"], "tips": ["株式会社が最短で設立可能（2週間程度）"]},
            {"label": "物件選定・確保", "description": "消防法・建築基準法に適合する物件の選定。住居系の物件が必要で、用途変更が必要な場合もある。", "duration": "1〜3ヶ月", "cost": "100万〜500万円", "documents": ["賃貸借契約書", "建築確認申請"], "tips": ["近隣住民への説明を早期に実施"], "warnings": ["用途変更に時間がかかる場合がある", "近隣住民の反対で断念するケースもある"]},
            {"label": "自治体事前相談", "description": "指定権者（都道府県or政令市）への事前相談。設備基準、人員基準の確認。", "duration": "1ヶ月", "documents": ["事業計画書", "物件図面", "人員配置計画"], "tips": ["複数回の相談が必要な場合が多い"]},
            {"label": "内装工事", "description": "居室、共用スペース、バリアフリー化等の工事。消防設備の設置も必要。", "duration": "1〜3ヶ月", "cost": "200万〜1,000万円", "documents": ["工事見積書", "消防設備設置届"], "tips": ["消防署への事前相談を忘れずに"]},
            {"label": "人員確保", "description": "管理者、サービス管理責任者、世話人、生活支援員等の採用。", "duration": "1〜3ヶ月", "cost": "50万〜200万円（採用費）", "documents": ["雇用契約書", "資格証明書"], "tips": ["サービス管理責任者は実務経験要件あり"], "warnings": ["人員基準を満たさないと指定が受けられない"]},
            {"label": "指定申請", "description": "事業者指定の申請。毎月締切があり、翌月1日指定が一般的。", "duration": "1〜2ヶ月", "documents": ["指定申請書", "運営規程", "平面図", "勤務体制一覧表", "経歴書"], "tips": ["申請締切は自治体により異なる（多くは前月15日頃）"]},
            {"label": "開業準備・利用者募集", "description": "備品購入、利用者募集、相談支援事業所への周知活動。", "duration": "1〜2ヶ月", "cost": "100万〜300万円", "documents": ["パンフレット", "HP"], "tips": ["相談支援事業所との関係構築が最重要", "体験利用の仕組みを準備"]},
        ]
    elif service_id in CONSULT_SERVICES:
        total_cost = "300万〜800万円"
        total_duration = "4〜8ヶ月"
        steps = [
            {"label": "事業計画策定", "description": "相談支援事業の収支計画と運営方針の策定。相談支援は設備投資が少ないが、人材確保が最大の課題。", "duration": "1ヶ月", "cost": "0〜30万円", "documents": ["事業計画書", "収支予算書"], "tips": ["地域の相談支援の需給バランスを調査"]},
            {"label": "法人設立", "description": "NPO法人、株式会社等の設立。", "duration": "1〜3ヶ月", "cost": "10万〜50万円", "documents": ["定款", "登記申請書"]},
            {"label": "事務所確保", "description": "相談スペースを確保できる事務所の確保。プライバシーに配慮した相談室が必要。", "duration": "1ヶ月", "cost": "50万〜150万円", "documents": ["賃貸借契約書"], "tips": ["公共交通機関でアクセスしやすい立地が望ましい"]},
            {"label": "自治体事前相談", "description": "指定権者への事前相談。相談支援専門員の配置基準を確認。", "duration": "1ヶ月", "documents": ["事業計画書", "人員配置計画"], "tips": ["相談支援専門員の実務経験要件を確認"]},
            {"label": "人員確保", "description": "相談支援専門員（実務経験5年+研修修了）の確保。管理者は兼務可能。", "duration": "1〜2ヶ月", "cost": "30万〜100万円", "documents": ["雇用契約書", "研修修了証"], "tips": ["相談支援専門員は人材が非常に少ない"], "warnings": ["現任研修の受講義務あり（5年ごと）"]},
            {"label": "指定申請", "description": "市区町村への指定申請（計画相談支援）。", "duration": "1〜2ヶ月", "documents": ["指定申請書", "運営規程", "経歴書"], "tips": ["自治体によって書式が異なる"]},
            {"label": "開業・連携構築", "description": "相談支援事業の開始。サービス事業所、行政、医療機関との連携網構築。", "duration": "1ヶ月", "cost": "50万〜100万円", "documents": ["パンフレット"], "tips": ["自立支援協議会への参加が重要", "ケース獲得は行政からの委託がメイン"]},
        ]
    else:
        total_cost = "1,500万〜3,000万円"
        total_duration = "6〜12ヶ月"
        steps = [
            {"label": "事業計画策定", "description": "サービス類型の選定、収支計画、運営方針の策定。サービスの特性に合わせた事業モデルを構築する。", "duration": "1〜2ヶ月", "cost": "0〜50万円", "documents": ["事業計画書", "収支予算書", "資金計画書"], "tips": ["自治体の総量規制を事前確認", "既存事業所の分布を調査"], "warnings": ["地域によっては新規指定を制限している場合がある"]},
            {"label": "法人設立", "description": "NPO法人、株式会社、社会福祉法人等の設立。障害福祉サービスの指定には法人格が必須。", "duration": "1〜6ヶ月", "cost": "10万〜100万円", "documents": ["定款", "登記申請書", "役員名簿"], "tips": ["株式会社が最短で設立可能（2週間程度）"]},
            {"label": "物件選定", "description": "消防法・建築基準法に適合する物件の選定。利用者の通所を考慮した立地が重要。", "duration": "1〜2ヶ月", "cost": "100万〜300万円", "documents": ["賃貸借契約書", "建物検査済証"], "tips": ["バリアフリー、駐車場の確保を検討"], "warnings": ["用途変更が必要な場合は時間とコストが増加"]},
            {"label": "自治体事前相談", "description": "指定権者への事前相談。設備基準、人員基準、運営基準の確認。", "duration": "1ヶ月", "documents": ["事業計画書", "物件図面", "人員配置計画"], "tips": ["複数回の相談が必要な場合が多い"]},
            {"label": "内装工事・設備整備", "description": "訓練室、相談室、トイレ等の整備。バリアフリー化工事。", "duration": "1〜2ヶ月", "cost": "200万〜800万円", "documents": ["工事見積書", "消防設備設置届"], "tips": ["消防署への事前相談を忘れずに"]},
            {"label": "人員確保", "description": "管理者、サービス管理責任者、支援員等の採用と研修。", "duration": "1〜3ヶ月", "cost": "50万〜200万円", "documents": ["雇用契約書", "資格証明書"], "tips": ["サービス管理責任者は実務経験要件あり（3〜8年）"], "warnings": ["人員基準を満たさないと指定が受けられない"]},
            {"label": "指定申請", "description": "都道府県または政令市への事業者指定申請。", "duration": "1〜2ヶ月", "documents": ["指定申請書", "運営規程", "平面図", "勤務体制一覧表"], "tips": ["申請から指定まで1〜2ヶ月。毎月締切が一般的"]},
            {"label": "開業準備・利用者募集", "description": "備品購入、利用者募集、相談支援事業所への営業活動。", "duration": "1〜2ヶ月", "cost": "100万〜300万円", "documents": ["パンフレット", "ホームページ"], "tips": ["相談支援事業所との関係構築が利用者獲得の鍵", "体験利用を積極的に受け入れる"]},
        ]

    return {
        "totalCost": total_cost,
        "totalDuration": total_duration,
        "steps": steps,
    }


def make_bonus_flow(service_type: str, service_id: str) -> dict:
    """Generate bonusAcquisitionFlow data.

    The treatment improvement bonus flow is largely the same across all services,
    but with different unit rates.
    """
    CHILD_SERVICES = {"jidou-hattatsu", "iryougata-jidou", "hoikusho-houmon"}
    CONSULT_SERVICES = {"keikaku-soudan", "shougaiji-soudan", "chiiki-ikou", "chiiki-teichaku"}

    if service_id in CONSULT_SERVICES:
        return {
            "title": "処遇改善加算の段階的取得フロー",
            "description": "相談支援事業は処遇改善加算の対象外。特定事業所加算等の加算体系となる",
            "nodes": [
                {
                    "id": "tokutei-base",
                    "label": "特定事業所加算（I〜IV）",
                    "description": "相談支援の質の向上を図る加算。常勤専従の相談支援専門員3名以上配置（I）等の要件がある。区分に応じて基本報酬に300〜500単位を加算。",
                    "units": "+300〜500単位/月",
                    "difficulty": "medium",
                    "prerequisites": ["常勤専従の相談支援専門員を基準以上配置", "24時間連絡体制の確保", "定期的な事例検討会の実施（月1回以上）"],
                },
                {
                    "id": "kikan-soudan",
                    "label": "機関相談支援加算",
                    "description": "基幹相談支援センターとしての役割を担う事業所への加算。地域の相談支援体制の中核として機能することが求められる。",
                    "units": "+500単位/月",
                    "difficulty": "high",
                    "prerequisites": ["基幹相談支援センターの指定を受けていること", "総合的・専門的な相談支援の実施", "地域の相談支援体制の強化に関する取組"],
                },
                {
                    "id": "taiin-kanyo",
                    "label": "入院時情報連携加算",
                    "description": "利用者が入院した際に医療機関と情報連携を行った場合の加算。早期退院に向けた連携が目的。",
                    "units": "+200単位/回",
                    "difficulty": "low",
                    "prerequisites": ["利用者入院時に医療機関を訪問または情報提供", "入院から3日以内の情報提供が望ましい"],
                },
            ],
        }

    # Common treatment improvement bonus flow for most services
    if service_id in CHILD_SERVICES:
        units1 = "所定単位数x12.3%~4.5%"
        units2 = "所定単位数x9.0%~1.6%"
        units3 = "所定単位数x1.7%~1.2%"
        units4 = "所定単位数x最大25.4%"
    else:
        units1 = "所定単位数x11.1%~4.1%"
        units2 = "所定単位数x8.4%~1.5%"
        units3 = "所定単位数x1.6%~1.1%"
        units4 = "所定単位数x最大24.5%"

    return {
        "title": "処遇改善加算の段階的取得フロー",
        "description": "処遇改善加算は3種類+ベースアップ等支援加算の4段階。取得しやすい順に段階的に取り組むのが一般的",
        "nodes": [
            {
                "id": "shogu-base",
                "label": "処遇改善加算（I）",
                "description": "全職員の賃金改善に充てる加算。キャリアパス要件（資格・経験に応じた昇給）と職場環境等要件（研修・ICT等）を満たす必要がある。取得率は90%超と最も基本的な加算。",
                "units": units1,
                "difficulty": "low",
                "prerequisites": ["キャリアパス要件: 資格・経験年数に応じた昇給の仕組みを整備", "職場環境等要件: 研修・ICT導入・健康管理等から2つ以上", "賃金改善計画書の提出（毎年度）", "賃金改善実績報告書の提出（年度末）"],
            },
            {
                "id": "shogu-tokutei",
                "label": "特定処遇改善加算（I）",
                "description": "経験・技能のある職員への重点的な処遇改善。10年以上の経験者に月8万円以上の改善 or 年収440万以上を1人以上配置。グループ間の配分ルールがある。",
                "units": units2,
                "difficulty": "medium",
                "prerequisites": ["処遇改善加算（I）を取得済み", "職場環境等要件の「見える化」（HP等で公表）", "経験10年以上の職員に月8万円以上 or 年収440万円以上", "3グループ間の配分ルール遵守"],
            },
            {
                "id": "baseup",
                "label": "ベースアップ等支援加算",
                "description": "基本給又は毎月の手当の引上げに充てる加算。一時金ではなく月額ベースでの恒久的な引上げが求められる。",
                "units": units3,
                "difficulty": "medium",
                "prerequisites": ["処遇改善加算のいずれかを取得済み", "加算額の2/3以上を基本給等に充当", "就業規則・給与規程の改定"],
            },
            {
                "id": "shogu-new",
                "label": "令和6年度 新処遇改善加算（一本化）",
                "description": "令和6年6月から旧3加算が一本化。4段階の区分（I〜IV）に再編。一本化により事務負担が軽減される見込み。",
                "units": units4,
                "difficulty": "high",
                "prerequisites": ["旧3加算の要件を統合した新要件を全て満たす", "キャリアパス要件I〜III全てを満たす（区分Iの場合）", "月額8万円 or 年収440万円要件", "経過措置期間中に新体系への移行届出"],
            },
        ],
    }


def main():
    files = sorted(DATA_DIR.glob("*.json"))
    updated = 0
    for f in files:
        if f.name == "houkago-day.json":
            continue  # already has data

        data = json.loads(f.read_text(encoding="utf-8"))
        service_id = f.stem
        service_type = data.get("serviceType", service_id)

        # Add userJourney
        data["userJourney"] = make_user_journey(service_type, service_id)

        # Add startupGuide
        data["startupGuide"] = make_startup_guide(service_type, service_id)

        # Add bonusAcquisitionFlow
        data["bonusAcquisitionFlow"] = make_bonus_flow(service_type, service_id)

        f.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        updated += 1
        print(f"  Updated: {f.name}")

    print(f"Done: Updated {updated} service files with Phase 13 data")


if __name__ == "__main__":
    main()
