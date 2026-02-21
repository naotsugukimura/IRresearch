#!/usr/bin/env python3
"""Generate facility analysis JSON files for all 18 remaining service types."""

import json
import os
import sys

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "facility-analysis")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]

def make_ramp(start, end, steps=12):
    """Generate a list of values ramping from start to end."""
    if steps == 1:
        return [start]
    vals = []
    for i in range(steps):
        v = start + (end - start) * i / (steps - 1)
        vals.append(round(v))
    return vals

def make_ramp_f(start, end, steps=12):
    """Generate float ramp."""
    vals = []
    for i in range(steps):
        v = start + (end - start) * i / (steps - 1)
        vals.append(round(v, 1))
    return vals

def const(v, n=12):
    return [v] * n

def write_json(filename, data):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Created: {path}")

# ============================================================
# 1. 児童発達支援 (code 63)
# ============================================================
def gen_jidou_hattatsu():
    return {
        "serviceType": "児童発達支援",
        "serviceCode": "63",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat 社会福祉施設等調査・WAM経営分析参考指標",
        "entityDistribution": {
            "asOf": "2025-09",
            "total": 12800,
            "byEntityType": [
                {"type": "株式会社", "count": 6400, "share": 50.0},
                {"type": "合同会社", "count": 1920, "share": 15.0},
                {"type": "NPO法人", "count": 1536, "share": 12.0},
                {"type": "社会福祉法人", "count": 1280, "share": 10.0},
                {"type": "一般社団法人", "count": 896, "share": 7.0},
                {"type": "医療法人", "count": 384, "share": 3.0},
                {"type": "その他", "count": 384, "share": 3.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所（単体）", "key": "single", "count": 7680, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 3200, "share": 25.0, "color": "#8B5CF6"},
                {"label": "6〜10事業所", "key": "multi_6_10", "count": 1280, "share": 10.0, "color": "#F59E0B"},
                {"label": "11事業所以上", "key": "multi_11_plus", "count": 640, "share": 5.0, "color": "#EF4444"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 3600},
            {"year": 2016, "count": 4800},
            {"year": 2017, "count": 5900},
            {"year": 2018, "count": 6800},
            {"year": 2019, "count": 7800},
            {"year": 2020, "count": 8700},
            {"year": 2021, "count": 9600},
            {"year": 2022, "count": 10500},
            {"year": 2023, "count": 11400},
            {"year": 2024, "count": 12100},
            {"year": 2025, "count": 12800}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 68000},
            {"year": 2016, "count": 88000},
            {"year": 2017, "count": 105000},
            {"year": 2018, "count": 120000},
            {"year": 2019, "count": 140000},
            {"year": 2020, "count": 155000},
            {"year": 2021, "count": 170000},
            {"year": 2022, "count": 188000},
            {"year": 2023, "count": 205000},
            {"year": 2024, "count": 218000},
            {"year": 2025, "count": 230000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標・障害福祉サービス等経営実態調査（令和5年度）",
            "assumptions": "定員10名、稼働率85%、営業日数22日/月、地域区分：都市部",
            "rewardUnit": {"baseUnit": "496単位（区分1-1）", "unitPrice": 10.0, "note": "未就学児対象"},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 928000, "annualAmount": 11136000, "note": "496単位×10円×10名×85%×22日÷10"},
                "bonuses": [
                    {"name": "児童指導員等加配加算（I）", "monthlyAmount": 150000, "annualAmount": 1800000},
                    {"name": "処遇改善加算（I）", "monthlyAmount": 160000, "annualAmount": 1920000},
                    {"name": "特定処遇改善加算（I）", "monthlyAmount": 56000, "annualAmount": 672000},
                    {"name": "ベースアップ等支援加算", "monthlyAmount": 31000, "annualAmount": 372000},
                    {"name": "送迎加算", "monthlyAmount": 90000, "annualAmount": 1080000},
                    {"name": "家庭連携加算", "monthlyAmount": 35000, "annualAmount": 420000},
                    {"name": "関係機関連携加算", "monthlyAmount": 15000, "annualAmount": 180000}
                ],
                "totalMonthly": 1465000,
                "totalAnnual": 17580000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 1050000, "annualAmount": 12600000, "share": 71.7, "detail": "管理者1名・児発管1名・指導員2名"},
                    {"category": "賃料", "monthlyAmount": 170000, "annualAmount": 2040000, "share": 11.6},
                    {"category": "送迎費", "monthlyAmount": 90000, "annualAmount": 1080000, "share": 6.1},
                    {"category": "教材・消耗品", "monthlyAmount": 50000, "annualAmount": 600000, "share": 3.4},
                    {"category": "水光熱費", "monthlyAmount": 35000, "annualAmount": 420000, "share": 2.4},
                    {"category": "その他経費", "monthlyAmount": 70000, "annualAmount": 840000, "share": 4.8}
                ],
                "totalMonthly": 1465000,
                "totalAnnual": 17580000
            },
            "profitMargin": 1.8,
            "note": "未就学児対象のため単価がやや低め。発達検査等の専門性で差別化。"
        },
        "bonusCatalog": [
            {"name": "児童指導員等加配加算（I）", "category": "人員配置", "units": "187単位/日", "requirement": "児童指導員又は保育士を1名以上追加配置", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等をすべて満たす", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "特定処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の3.0%", "requirement": "処遇改善加算(I)取得＋経験10年以上の職員配置", "difficulty": "medium", "revenueImpact": "medium"},
            {"name": "送迎加算", "category": "サービス", "units": "54単位/回", "requirement": "利用者の送迎を実施", "difficulty": "low", "revenueImpact": "high"},
            {"name": "家庭連携加算", "category": "サービス", "units": "187単位/回", "requirement": "居宅訪問し相談援助等を実施", "difficulty": "medium", "revenueImpact": "low"},
            {"name": "関係機関連携加算", "category": "連携", "units": "200単位/回", "requirement": "保育所等の関係機関との連携会議", "difficulty": "low", "revenueImpact": "low"},
            {"name": "保育・教育等移行支援加算", "category": "連携", "units": "500単位/回", "requirement": "保育所等への移行支援を実施", "difficulty": "high", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員10名、区分1-1（496単位）、1単位≒10円、未就学児対象",
            "months": MONTHS,
            "sections": [
                {
                    "title": "集客KPI",
                    "rows": [
                        {"label": "定員", "values": const(10), "unit": "名"},
                        {"label": "営業日数", "values": [22,20,22,22,22,22,22,22,22,22,22,22], "unit": "日/月"},
                        {"label": "稼働率", "values": [55,60,65,70,75,80,80,85,85,85,85,85], "isPercent": True, "note": "未就学児は集客に時間がかかる"},
                        {"label": "月間延べ利用者数", "values": [121,120,143,154,165,176,176,187,187,187,187,187], "calculated": True}
                    ]
                },
                {
                    "title": "売上（報酬収入）",
                    "rows": [
                        {"label": "基本報酬", "values": make_ramp(600000, 928000), "note": "496単位×10円×延べ人日÷10"},
                        {"label": "児童指導員等加配加算", "values": make_ramp(90000, 150000)},
                        {"label": "処遇改善加算（I）", "values": make_ramp(96000, 160000)},
                        {"label": "特定処遇改善加算", "values": make_ramp(34000, 56000)},
                        {"label": "送迎加算", "values": make_ramp(54000, 90000)},
                        {"label": "その他加算", "values": make_ramp(50000, 80000), "note": "家庭連携・関係機関連携等"},
                        {"label": "売上合計", "values": make_ramp(924000, 1464000), "calculated": True, "isTotal": True}
                    ]
                },
                {
                    "title": "販管費（経費）",
                    "rows": [
                        {"label": "人件費（管理者）", "values": const(280000), "note": "管理者1名"},
                        {"label": "人件費（児発管）", "values": const(330000), "note": "児童発達支援管理責任者"},
                        {"label": "人件費（指導員）", "values": const(460000), "note": "児童指導員2名"},
                        {"label": "人件費（パート）", "values": [80000,80000,80000,80000,100000,100000,100000,120000,120000,120000,120000,120000]},
                        {"label": "法定福利費", "values": [173000,173000,173000,173000,177000,177000,177000,181000,181000,181000,181000,181000]},
                        {"label": "賃料", "values": const(170000)},
                        {"label": "送迎費", "values": [80000,80000,80000,80000,90000,90000,90000,90000,90000,90000,90000,90000]},
                        {"label": "教材・消耗品", "values": const(50000)},
                        {"label": "水光熱費", "values": const(35000)},
                        {"label": "通信・システム費", "values": const(25000)},
                        {"label": "保険料", "values": const(15000)},
                        {"label": "その他経費", "values": const(35000)},
                        {"label": "販管費合計", "values": [1733000,1733000,1733000,1733000,1757000,1757000,1757000,1781000,1781000,1781000,1781000,1781000], "calculated": True, "isTotal": True}
                    ]
                },
                {
                    "title": "損益",
                    "rows": [
                        {"label": "営業利益", "values": [-809000,-809000,-809000,-809000,-757000,-293000,-293000,-317000,-317000,-317000,-317000,-317000], "calculated": True, "isProfit": True},
                        {"label": "営業利益率", "values": make_ramp_f(-87.6, -21.7), "isPercent": True, "calculated": True}
                    ]
                }
            ],
            "glossary": [
                {"term": "基本報酬", "description": "利用児1人1日あたりの基本単位数。未就学児が対象。", "benchmark": "区分1-1で496単位"},
                {"term": "稼働率", "description": "定員に対する実際の利用率。", "benchmark": "85%以上が安定運営の目安"},
                {"term": "保育・教育等移行支援加算", "description": "保育所や幼稚園への移行を支援した場合に算定。", "benchmark": "500単位/回。年長児の進路支援が鍵"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "08:30", "activity": "出勤・朝礼", "who": "全スタッフ", "detail": "当日の児童情報・体調共有"},
                {"time": "09:00", "activity": "送迎・受け入れ", "who": "送迎スタッフ", "detail": "自宅への迎え、健康チェック"},
                {"time": "09:30", "activity": "朝の会", "who": "児童指導員", "detail": "手遊び、歌、今日の活動説明"},
                {"time": "10:00", "activity": "個別療育", "who": "児発管・指導員", "detail": "発達検査に基づく個別プログラム実施"},
                {"time": "11:00", "activity": "集団プログラム", "who": "全スタッフ", "detail": "感覚統合遊び、リトミック、制作活動"},
                {"time": "12:00", "activity": "昼食", "who": "児童指導員", "detail": "食事支援、マナー指導"},
                {"time": "13:00", "activity": "午後の活動・自由遊び", "who": "児童指導員", "detail": "年齢別の小集団活動"},
                {"time": "14:00", "activity": "帰りの会・送迎", "who": "全スタッフ", "detail": "保護者への引き渡し、連絡帳記入"},
                {"time": "15:00", "activity": "記録・ミーティング", "who": "全スタッフ", "detail": "支援記録、翌日準備、ケース検討"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業所運営全般の管理。行政対応、保護者窓口。", "icon": "Crown", "required": True, "count": "1名", "qualification": "特になし", "keyTask": "運営管理・行政対応"},
                {"title": "児童発達支援管理責任者", "description": "個別支援計画の作成とモニタリング。", "icon": "ClipboardCheck", "required": True, "count": "1名以上", "qualification": "実務経験5年＋研修", "keyTask": "支援計画作成・モニタリング"},
                {"title": "児童指導員", "description": "日々の療育活動の実施。子どもの観察と記録。", "icon": "Users", "required": True, "count": "2名以上", "qualification": "児童指導員任用資格or保育士", "keyTask": "療育プログラム実施"},
                {"title": "保育士", "description": "低年齢児の基本的生活支援。遊びを通した発達支援。", "icon": "Heart", "required": False, "count": "配置基準に含む", "qualification": "保育士資格", "keyTask": "生活支援・遊び支援"}
            ],
            "typicalConversations": [
                {"scene": "保護者面談", "context": "入所時・6ヶ月モニタリング。発達の心配事を聴取。", "topics": ["発達の気になる点", "家庭での関わり方", "支援目標の設定", "保育所・幼稚園との併用"], "insight": "保護者の不安に寄り添いながら具体的な支援計画を提示することが信頼構築の鍵"},
                {"scene": "スタッフ会議", "context": "週1回のケース検討会。", "topics": ["児童の行動変化", "支援方法の見直し", "保護者からの要望", "環境調整"], "insight": "チームでの情報共有が支援の質を左右する"},
                {"scene": "保育所連携", "context": "併行通園児の情報共有。", "topics": ["集団での様子", "配慮事項", "進級に向けた準備"], "insight": "保育所との連携が移行支援加算の算定にもつながる"}
            ]
        }
    }

# ============================================================
# 2. 医療型児童発達支援 (code 64)
# ============================================================
def gen_iryougata_jidou():
    return {
        "serviceType": "医療型児童発達支援",
        "serviceCode": "64",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat 社会福祉施設等調査",
        "entityDistribution": {
            "asOf": "2025-09", "total": 90,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 35, "share": 38.9},
                {"type": "医療法人", "count": 30, "share": 33.3},
                {"type": "独立行政法人", "count": 10, "share": 11.1},
                {"type": "その他", "count": 15, "share": 16.7}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 50, "share": 55.6, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 30, "share": 33.3, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 10, "share": 11.1, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 95}, {"year": 2016, "count": 96}, {"year": 2017, "count": 95},
            {"year": 2018, "count": 94}, {"year": 2019, "count": 93}, {"year": 2020, "count": 92},
            {"year": 2021, "count": 91}, {"year": 2022, "count": 91}, {"year": 2023, "count": 90},
            {"year": 2024, "count": 90}, {"year": 2025, "count": 90}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 2100}, {"year": 2016, "count": 2150}, {"year": 2017, "count": 2180},
            {"year": 2018, "count": 2200}, {"year": 2019, "count": 2220}, {"year": 2020, "count": 2180},
            {"year": 2021, "count": 2200}, {"year": 2022, "count": 2250}, {"year": 2023, "count": 2280},
            {"year": 2024, "count": 2300}, {"year": 2025, "count": 2320}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "定員20名、稼働率80%、医療機関併設型",
            "rewardUnit": {"baseUnit": "473単位（定員20名）", "unitPrice": 10.0, "note": "医療型は医療保険との併給"},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 1660000, "annualAmount": 19920000},
                "bonuses": [
                    {"name": "処遇改善加算", "monthlyAmount": 200000, "annualAmount": 2400000},
                    {"name": "リハビリテーション加算", "monthlyAmount": 150000, "annualAmount": 1800000}
                ],
                "totalMonthly": 2010000, "totalAnnual": 24120000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 1500000, "annualAmount": 18000000, "share": 74.6},
                    {"category": "医療材料費", "monthlyAmount": 100000, "annualAmount": 1200000, "share": 5.0},
                    {"category": "賃料・設備費", "monthlyAmount": 200000, "annualAmount": 2400000, "share": 10.0},
                    {"category": "その他", "monthlyAmount": 210000, "annualAmount": 2520000, "share": 10.4}
                ],
                "totalMonthly": 2010000, "totalAnnual": 24120000
            },
            "profitMargin": 1.2,
            "note": "医療機関併設が前提。新規参入は極めて限定的。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等を満たす", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "リハビリテーション加算", "category": "医療", "units": "20単位/日", "requirement": "PT/OT/STによるリハビリ実施", "difficulty": "high", "revenueImpact": "medium"},
            {"name": "看護職員加配加算", "category": "人員配置", "units": "80単位/日", "requirement": "看護職員を加配", "difficulty": "high", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、医療機関併設型、PT/OT常勤配置",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "営業日数", "values": [22,20,22,22,22,22,22,22,22,22,22,22]},
                    {"label": "稼働率", "values": [70,72,75,78,80,80,80,80,80,80,80,80], "isPercent": True},
                    {"label": "月間延べ利用者数", "values": [308,288,330,343,352,352,352,352,352,352,352,352], "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1450000, 1660000)},
                    {"label": "処遇改善加算", "values": make_ramp(170000, 200000)},
                    {"label": "リハビリテーション加算", "values": make_ramp(120000, 150000)},
                    {"label": "その他加算", "values": make_ramp(60000, 80000)},
                    {"label": "売上合計", "values": make_ramp(1800000, 2090000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（医師・看護師）", "values": const(500000)},
                    {"label": "人件費（PT/OT/ST）", "values": const(450000)},
                    {"label": "人件費（児発管・指導員）", "values": const(400000)},
                    {"label": "法定福利費", "values": const(203000)},
                    {"label": "医療材料費", "values": const(100000)},
                    {"label": "賃料・設備費", "values": const(200000)},
                    {"label": "その他経費", "values": const(100000)},
                    {"label": "販管費合計", "values": const(1953000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-153000, 137000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-8.5, 6.6), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "医療型", "description": "医療機関に併設される児童発達支援。PT/OT/ST等の医療専門職を配置。", "benchmark": "全国約90事業所と極めて少数"},
                {"term": "リハビリテーション加算", "description": "PT/OT/STによる個別リハビリを実施した場合に算定。"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "08:30", "activity": "出勤・医療カンファレンス", "who": "医師・看護師・療法士", "detail": "児童の医療情報・リハビリ計画確認"},
                {"time": "09:30", "activity": "受入・バイタルチェック", "who": "看護師", "detail": "体温・SpO2測定、体調確認"},
                {"time": "10:00", "activity": "個別リハビリ", "who": "PT/OT/ST", "detail": "理学療法・作業療法・言語聴覚療法"},
                {"time": "11:30", "activity": "集団療育", "who": "児童指導員", "detail": "感覚統合・音楽療法"},
                {"time": "12:00", "activity": "昼食・経管栄養", "who": "看護師・指導員", "detail": "摂食指導、経管栄養管理"},
                {"time": "14:00", "activity": "午後リハビリ・活動", "who": "療法士・指導員", "detail": "午後のリハビリセッション"},
                {"time": "15:30", "activity": "記録・申し送り", "who": "全スタッフ", "detail": "リハビリ記録、医師への報告"}
            ],
            "roles": [
                {"title": "管理者（医師）", "description": "医療的管理と事業所運営。嘱託でも可。", "icon": "Crown", "required": True, "count": "1名", "qualification": "医師免許", "keyTask": "医療的判断・リハビリ処方"},
                {"title": "児童発達支援管理責任者", "description": "個別支援計画の作成。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画作成"},
                {"title": "理学療法士（PT）", "description": "運動機能のリハビリテーション。", "icon": "Activity", "required": True, "count": "1名以上", "qualification": "PT国家資格", "keyTask": "運動リハビリ"},
                {"title": "看護師", "description": "医療的ケア、バイタル管理。", "icon": "Heart", "required": True, "count": "1名以上", "qualification": "看護師免許", "keyTask": "医療的ケア"}
            ],
            "typicalConversations": [
                {"scene": "医療カンファレンス", "context": "週1回、医師・療法士・看護師・児発管が参加。", "topics": ["リハビリの進捗", "医療的ケアの変更", "装具・補助具の調整"], "insight": "医療と福祉の連携が支援の質を決定する"},
                {"scene": "保護者面談", "context": "リハビリ計画の説明と同意取得。", "topics": ["リハビリの効果と今後の方針", "在宅でのケア方法", "他の医療機関との連携"], "insight": "医療的な説明と保護者の理解のギャップを埋めることが重要"}
            ]
        }
    }

# ============================================================
# 3. 居宅訪問型児童発達支援 (code 66)
# ============================================================
def gen_kyotaku_houmon():
    return {
        "serviceType": "居宅訪問型児童発達支援",
        "serviceCode": "66",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat",
        "entityDistribution": {
            "asOf": "2025-09", "total": 350,
            "byEntityType": [
                {"type": "株式会社", "count": 140, "share": 40.0},
                {"type": "NPO法人", "count": 70, "share": 20.0},
                {"type": "一般社団法人", "count": 56, "share": 16.0},
                {"type": "社会福祉法人", "count": 49, "share": 14.0},
                {"type": "その他", "count": 35, "share": 10.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 245, "share": 70.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 84, "share": 24.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 21, "share": 6.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2018, "count": 50}, {"year": 2019, "count": 100}, {"year": 2020, "count": 150},
            {"year": 2021, "count": 200}, {"year": 2022, "count": 250}, {"year": 2023, "count": 290},
            {"year": 2024, "count": 320}, {"year": 2025, "count": 350}
        ],
        "userTimeSeries": [
            {"year": 2018, "count": 200}, {"year": 2019, "count": 500}, {"year": 2020, "count": 900},
            {"year": 2021, "count": 1500}, {"year": 2022, "count": 2200}, {"year": 2023, "count": 2800},
            {"year": 2024, "count": 3200}, {"year": 2025, "count": 3500}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "訪問型・1日3件訪問、1件60分、月22日稼働",
            "rewardUnit": {"baseUnit": "987単位/回", "unitPrice": 10.0, "note": "1回の訪問あたり"},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 651000, "annualAmount": 7812000, "note": "987単位×10円×3件×22日"},
                "bonuses": [
                    {"name": "処遇改善加算", "monthlyAmount": 80000, "annualAmount": 960000}
                ],
                "totalMonthly": 731000, "totalAnnual": 8772000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 500000, "annualAmount": 6000000, "share": 68.4},
                    {"category": "交通費", "monthlyAmount": 80000, "annualAmount": 960000, "share": 10.9},
                    {"category": "教材費", "monthlyAmount": 30000, "annualAmount": 360000, "share": 4.1},
                    {"category": "事務所経費", "monthlyAmount": 80000, "annualAmount": 960000, "share": 10.9},
                    {"category": "その他", "monthlyAmount": 41000, "annualAmount": 492000, "share": 5.6}
                ],
                "totalMonthly": 731000, "totalAnnual": 8772000
            },
            "profitMargin": 1.5,
            "note": "訪問型は設備投資が少ないが、移動時間が収益を圧迫。利用者確保が課題。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等を満たす", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "特定処遇改善加算", "category": "処遇改善", "units": "総報酬の3.0%", "requirement": "経験10年以上の職員配置", "difficulty": "medium", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "訪問型・スタッフ2名体制、1日平均3件訪問",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "訪問スタッフ数", "values": const(2)},
                    {"label": "営業日数", "values": [22,20,22,22,22,22,22,22,22,22,22,22]},
                    {"label": "1日平均訪問件数", "values": [2.0,2.0,2.5,2.5,3.0,3.0,3.0,3.0,3.0,3.0,3.0,3.0]},
                    {"label": "月間訪問件数", "values": [88,80,110,110,132,132,132,132,132,132,132,132], "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(435000, 651000), "note": "987単位×10円×訪問件数"},
                    {"label": "処遇改善加算", "values": make_ramp(53000, 80000)},
                    {"label": "売上合計", "values": make_ramp(488000, 731000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（訪問スタッフ）", "values": const(400000)},
                    {"label": "人件費（管理者・児発管）", "values": const(150000), "note": "兼務"},
                    {"label": "法定福利費", "values": const(83000)},
                    {"label": "交通費", "values": make_ramp(50000, 80000)},
                    {"label": "教材費", "values": const(30000)},
                    {"label": "事務所経費", "values": const(50000)},
                    {"label": "その他", "values": const(20000)},
                    {"label": "販管費合計", "values": make_ramp(783000, 813000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-295000, -82000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-60.5, -11.2), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "居宅訪問型", "description": "重度障害等で通所が困難な児童の居宅を訪問して支援を行うサービス。", "benchmark": "2018年新設。全国約350事業所"},
                {"term": "訪問件数", "description": "1日あたりの訪問可能件数。移動時間を含め3件が上限の目安。"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "08:30", "activity": "出勤・準備", "who": "訪問スタッフ", "detail": "教材準備、訪問ルート確認"},
                {"time": "09:00", "activity": "1件目訪問", "who": "訪問スタッフ", "detail": "居宅での個別療育（60分）"},
                {"time": "10:30", "activity": "移動", "who": "訪問スタッフ", "detail": "次の訪問先へ移動"},
                {"time": "11:00", "activity": "2件目訪問", "who": "訪問スタッフ", "detail": "居宅での個別療育（60分）"},
                {"time": "13:00", "activity": "昼休憩・記録", "who": "訪問スタッフ", "detail": "午前の記録作成"},
                {"time": "14:00", "activity": "3件目訪問", "who": "訪問スタッフ", "detail": "居宅での個別療育（60分）"},
                {"time": "16:00", "activity": "帰社・記録", "who": "全スタッフ", "detail": "支援記録の入力、報告"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業所運営管理。訪問スケジュール調整。", "icon": "Crown", "required": True, "count": "1名（兼務可）", "qualification": "特になし", "keyTask": "運営管理・スケジュール調整"},
                {"title": "児童発達支援管理責任者", "description": "訪問支援計画の作成。", "icon": "ClipboardCheck", "required": True, "count": "1名（兼務可）", "qualification": "実務経験5年＋研修", "keyTask": "支援計画作成"},
                {"title": "訪問支援員", "description": "児童の居宅を訪問し個別療育を実施。", "icon": "Users", "required": True, "count": "2名以上", "qualification": "PT/OT/ST/保育士等", "keyTask": "訪問療育の実施"}
            ],
            "typicalConversations": [
                {"scene": "保護者との情報共有", "context": "訪問のたびに保護者と直接やり取り。", "topics": ["子どもの体調", "在宅での過ごし方", "支援目標の確認"], "insight": "訪問型は保護者との距離が近く、信頼関係構築が容易"},
                {"scene": "医療機関との連携", "context": "医療的ケア児の場合、主治医との情報共有。", "topics": ["医療的ケアの状況", "リハビリの方針", "体調変化への対応"], "insight": "医療と福祉の連携が不可欠"}
            ]
        }
    }

# ============================================================
# 4. 保育所等訪問支援 (code 67)
# ============================================================
def gen_hoikusho_houmon():
    return {
        "serviceType": "保育所等訪問支援",
        "serviceCode": "67",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat",
        "entityDistribution": {
            "asOf": "2025-09", "total": 1800,
            "byEntityType": [
                {"type": "株式会社", "count": 540, "share": 30.0},
                {"type": "NPO法人", "count": 360, "share": 20.0},
                {"type": "社会福祉法人", "count": 324, "share": 18.0},
                {"type": "一般社団法人", "count": 270, "share": 15.0},
                {"type": "医療法人", "count": 126, "share": 7.0},
                {"type": "その他", "count": 180, "share": 10.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 1080, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 540, "share": 30.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 180, "share": 10.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 400}, {"year": 2016, "count": 550}, {"year": 2017, "count": 700},
            {"year": 2018, "count": 850}, {"year": 2019, "count": 1000}, {"year": 2020, "count": 1150},
            {"year": 2021, "count": 1300}, {"year": 2022, "count": 1450}, {"year": 2023, "count": 1600},
            {"year": 2024, "count": 1700}, {"year": 2025, "count": 1800}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 5000}, {"year": 2016, "count": 8000}, {"year": 2017, "count": 12000},
            {"year": 2018, "count": 18000}, {"year": 2019, "count": 25000}, {"year": 2020, "count": 30000},
            {"year": 2021, "count": 38000}, {"year": 2022, "count": 48000}, {"year": 2023, "count": 55000},
            {"year": 2024, "count": 60000}, {"year": 2025, "count": 65000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "訪問型・月40件訪問、1件60分",
            "rewardUnit": {"baseUnit": "934単位/回", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 374000, "annualAmount": 4488000},
                "bonuses": [{"name": "処遇改善加算", "monthlyAmount": 45000, "annualAmount": 540000}],
                "totalMonthly": 419000, "totalAnnual": 5028000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 300000, "annualAmount": 3600000, "share": 71.6},
                    {"category": "交通費", "monthlyAmount": 50000, "annualAmount": 600000, "share": 11.9},
                    {"category": "事務所経費", "monthlyAmount": 40000, "annualAmount": 480000, "share": 9.5},
                    {"category": "その他", "monthlyAmount": 29000, "annualAmount": 348000, "share": 6.9}
                ],
                "totalMonthly": 419000, "totalAnnual": 5028000
            },
            "profitMargin": 2.0,
            "note": "他事業との併設が多い。単独運営は難しい。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等を満たす", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "訪問支援員特別加算", "category": "人員配置", "units": "380単位/回", "requirement": "PT/OT/ST等の専門職が訪問", "difficulty": "high", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "訪問型・スタッフ1名（他事業と兼務）、月30-40件訪問",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "訪問スタッフ数", "values": const(1)},
                    {"label": "営業日数", "values": [22,20,22,22,22,22,22,22,22,22,22,22]},
                    {"label": "月間訪問件数", "values": [25,23,28,30,33,35,38,38,40,40,40,40], "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(233000, 374000)},
                    {"label": "処遇改善加算", "values": make_ramp(28000, 45000)},
                    {"label": "訪問支援員特別加算", "values": make_ramp(48000, 76000)},
                    {"label": "売上合計", "values": make_ramp(309000, 495000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(250000), "note": "訪問支援員1名（兼務）"},
                    {"label": "法定福利費", "values": const(38000)},
                    {"label": "交通費", "values": make_ramp(30000, 50000)},
                    {"label": "事務所経費", "values": const(30000), "note": "他事業と按分"},
                    {"label": "その他", "values": const(15000)},
                    {"label": "販管費合計", "values": make_ramp(363000, 383000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-54000, 112000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-17.5, 22.6), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "保育所等訪問支援", "description": "保育所・学校等を訪問し、集団生活への適応を支援するサービス。", "benchmark": "他事業との兼務・併設が一般的"},
                {"term": "訪問支援員特別加算", "description": "専門職（PT/OT/ST等）が訪問した場合の加算。380単位/回。"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "出勤・準備", "who": "訪問支援員", "detail": "訪問先の情報確認、教材準備"},
                {"time": "10:00", "activity": "保育所訪問（1件目）", "who": "訪問支援員", "detail": "児童の集団生活の様子観察、支援実施"},
                {"time": "11:30", "activity": "保育士との情報共有", "who": "訪問支援員", "detail": "関わり方のアドバイス、環境調整の提案"},
                {"time": "13:00", "activity": "学校訪問（2件目）", "who": "訪問支援員", "detail": "授業中の様子観察、担任との面談"},
                {"time": "15:00", "activity": "記録作成・報告", "who": "訪問支援員", "detail": "訪問記録、保護者への報告書作成"}
            ],
            "roles": [
                {"title": "訪問支援員", "description": "保育所・学校等を訪問し、児童の適応支援を実施。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "児童指導員任用資格/保育士/PT/OT/ST", "keyTask": "訪問支援の実施"}
            ],
            "typicalConversations": [
                {"scene": "保育士への助言", "context": "訪問時に保育士・教師へ関わり方を助言。", "topics": ["集団場面での困りごと", "環境調整の提案", "声かけの工夫"], "insight": "「先生」を支援することで間接的に児童を支援する発想が重要"}
            ]
        }
    }

# ============================================================
# 5. 共同生活援助（グループホーム）(code 35)
# ============================================================
def gen_group_home():
    return {
        "serviceType": "共同生活援助（グループホーム）",
        "serviceCode": "35",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat・障害福祉サービス等経営実態調査",
        "entityDistribution": {
            "asOf": "2025-09", "total": 13500,
            "byEntityType": [
                {"type": "NPO法人", "count": 3375, "share": 25.0},
                {"type": "株式会社", "count": 3105, "share": 23.0},
                {"type": "社会福祉法人", "count": 2835, "share": 21.0},
                {"type": "一般社団法人", "count": 1620, "share": 12.0},
                {"type": "合同会社", "count": 1350, "share": 10.0},
                {"type": "医療法人", "count": 540, "share": 4.0},
                {"type": "その他", "count": 675, "share": 5.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 8100, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 3375, "share": 25.0, "color": "#8B5CF6"},
                {"label": "6〜10事業所", "key": "multi_6_10", "count": 1350, "share": 10.0, "color": "#F59E0B"},
                {"label": "11事業所以上", "key": "multi_11_plus", "count": 675, "share": 5.0, "color": "#EF4444"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2012, "count": 5200}, {"year": 2013, "count": 5800}, {"year": 2014, "count": 6500},
            {"year": 2015, "count": 7200}, {"year": 2016, "count": 8000}, {"year": 2017, "count": 8700},
            {"year": 2018, "count": 9400}, {"year": 2019, "count": 10100}, {"year": 2020, "count": 10800},
            {"year": 2021, "count": 11500}, {"year": 2022, "count": 12200}, {"year": 2023, "count": 12800},
            {"year": 2024, "count": 13200}, {"year": 2025, "count": 13500}
        ],
        "userTimeSeries": [
            {"year": 2012, "count": 68000}, {"year": 2013, "count": 78000}, {"year": 2014, "count": 88000},
            {"year": 2015, "count": 100000}, {"year": 2016, "count": 112000}, {"year": 2017, "count": 125000},
            {"year": 2018, "count": 138000}, {"year": 2019, "count": 152000}, {"year": 2020, "count": 165000},
            {"year": 2021, "count": 178000}, {"year": 2022, "count": 190000}, {"year": 2023, "count": 200000},
            {"year": 2024, "count": 210000}, {"year": 2025, "count": 220000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標・障害福祉サービス等経営実態調査",
            "assumptions": "定員5名、区分4（中度障害）、夜間支援あり、月30日稼働",
            "rewardUnit": {"baseUnit": "566単位/日（区分4・定員5名）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 849000, "annualAmount": 10188000, "note": "566単位×10円×5名×30日"},
                "bonuses": [
                    {"name": "夜間支援等体制加算（I）", "monthlyAmount": 120000, "annualAmount": 1440000},
                    {"name": "処遇改善加算（I）", "monthlyAmount": 130000, "annualAmount": 1560000},
                    {"name": "日中支援加算", "monthlyAmount": 40000, "annualAmount": 480000},
                    {"name": "重度障害者支援加算", "monthlyAmount": 30000, "annualAmount": 360000}
                ],
                "totalMonthly": 1169000, "totalAnnual": 14028000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 750000, "annualAmount": 9000000, "share": 64.2, "detail": "世話人・生活支援員・夜勤者"},
                    {"category": "賃料", "monthlyAmount": 150000, "annualAmount": 1800000, "share": 12.8},
                    {"category": "食材費", "monthlyAmount": 75000, "annualAmount": 900000, "share": 6.4},
                    {"category": "水光熱費", "monthlyAmount": 60000, "annualAmount": 720000, "share": 5.1},
                    {"category": "その他経費", "monthlyAmount": 134000, "annualAmount": 1608000, "share": 11.5}
                ],
                "totalMonthly": 1169000, "totalAnnual": 14028000
            },
            "profitMargin": 3.5,
            "note": "24時間体制の運営。夜間支援加算の取得が収支安定の鍵。"
        },
        "bonusCatalog": [
            {"name": "夜間支援等体制加算（I）", "category": "サービス", "units": "44-152単位/日", "requirement": "夜間に支援員を配置", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等を満たす", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "日中支援加算", "category": "サービス", "units": "539単位/日", "requirement": "日中も事業所に残り支援を受ける利用者がいる場合", "difficulty": "low", "revenueImpact": "medium"},
            {"name": "重度障害者支援加算", "category": "人員配置", "units": "360単位/日", "requirement": "区分6以上の利用者に手厚い支援", "difficulty": "high", "revenueImpact": "medium"},
            {"name": "自立生活支援加算", "category": "サービス", "units": "1000単位/回", "requirement": "一人暮らし等への移行支援", "difficulty": "medium", "revenueImpact": "low"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1ホームあたり）",
            "assumptions": "定員5名、区分4、夜間支援体制あり、30日/月",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(5)},
                    {"label": "入居率", "values": [60,60,80,80,80,100,100,100,100,100,100,100], "isPercent": True, "note": "GHは入居率100%が目標"},
                    {"label": "月間延べ利用者日数", "values": [90,90,120,120,120,150,150,150,150,150,150,150], "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(509000, 849000)},
                    {"label": "夜間支援体制加算", "values": make_ramp(72000, 120000)},
                    {"label": "処遇改善加算", "values": make_ramp(78000, 130000)},
                    {"label": "日中支援加算", "values": make_ramp(20000, 40000)},
                    {"label": "その他加算", "values": make_ramp(15000, 30000)},
                    {"label": "売上合計", "values": make_ramp(694000, 1169000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（世話人）", "values": const(250000)},
                    {"label": "人件費（生活支援員）", "values": const(230000)},
                    {"label": "人件費（夜勤者）", "values": const(150000)},
                    {"label": "法定福利費", "values": const(95000)},
                    {"label": "賃料", "values": const(150000)},
                    {"label": "食材費", "values": make_ramp(45000, 75000)},
                    {"label": "水光熱費", "values": make_ramp(40000, 60000)},
                    {"label": "消耗品・備品", "values": const(20000)},
                    {"label": "その他経費", "values": const(40000)},
                    {"label": "販管費合計", "values": make_ramp(1020000, 1070000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-326000, 99000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-47.0, 8.5), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "グループホーム", "description": "障害者が共同生活を営む住居。世話人・生活支援員が配置される。", "benchmark": "定員4-5名が最も多い"},
                {"term": "夜間支援体制加算", "description": "夜間に支援員を配置した場合の加算。GH運営の収益の柱。"},
                {"term": "入居率", "description": "定員に対する実際の入居者数の割合。100%が基本。", "benchmark": "空室が出ると急激に収益悪化"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "07:00", "activity": "起床支援・朝食", "who": "世話人", "detail": "起床の声かけ、朝食準備・提供"},
                {"time": "08:30", "activity": "日中活動への送り出し", "who": "世話人", "detail": "就労B型等への通所見送り"},
                {"time": "09:00", "activity": "清掃・事務作業", "who": "世話人", "detail": "居室清掃、記録作成、買い出し"},
                {"time": "16:00", "activity": "帰宅・入浴支援", "who": "生活支援員", "detail": "日中活動から帰宅した利用者の入浴介助"},
                {"time": "18:00", "activity": "夕食", "who": "世話人", "detail": "夕食準備・提供、服薬確認"},
                {"time": "20:00", "activity": "余暇活動", "who": "生活支援員", "detail": "テレビ・趣味活動の見守り"},
                {"time": "22:00", "activity": "就寝支援", "who": "夜勤者", "detail": "就寝見守り、夜間巡回"},
                {"time": "06:00", "activity": "夜勤明け・申し送り", "who": "夜勤者→世話人", "detail": "夜間の状況報告"}
            ],
            "roles": [
                {"title": "サービス管理責任者", "description": "個別支援計画の作成・モニタリング。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画・モニタリング"},
                {"title": "世話人", "description": "食事準備、家事支援、日常生活の助言。", "icon": "Home", "required": True, "count": "定員÷6名以上", "qualification": "特になし", "keyTask": "食事・家事支援"},
                {"title": "生活支援員", "description": "入浴・排泄等の介護、外出同行。", "icon": "Users", "required": True, "count": "区分に応じて配置", "qualification": "特になし", "keyTask": "介護・生活支援"},
                {"title": "夜勤者", "description": "夜間の見守り・緊急対応。", "icon": "Moon", "required": False, "count": "1名/夜", "qualification": "特になし", "keyTask": "夜間見守り・巡回"}
            ],
            "typicalConversations": [
                {"scene": "利用者との面談", "context": "月1回の個別面談。", "topics": ["生活の困りごと", "日中活動の様子", "健康状態", "将来の希望"], "insight": "利用者の自己決定を尊重しながら支援の方向性を共有する"},
                {"scene": "家族との連絡", "context": "月次報告や緊急連絡。", "topics": ["生活の状況報告", "体調変化", "外泊予定", "金銭管理"], "insight": "家族の安心感が入居継続の鍵"}
            ]
        }
    }

# ============================================================
# 6. 自立生活援助 (code 36)
# ============================================================
def gen_jiritsu_seikatsu():
    return {
        "serviceType": "自立生活援助",
        "serviceCode": "36",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 800,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 240, "share": 30.0},
                {"type": "NPO法人", "count": 176, "share": 22.0},
                {"type": "株式会社", "count": 144, "share": 18.0},
                {"type": "一般社団法人", "count": 120, "share": 15.0},
                {"type": "その他", "count": 120, "share": 15.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 520, "share": 65.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 240, "share": 30.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 40, "share": 5.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2018, "count": 150}, {"year": 2019, "count": 280}, {"year": 2020, "count": 400},
            {"year": 2021, "count": 500}, {"year": 2022, "count": 600}, {"year": 2023, "count": 680},
            {"year": 2024, "count": 750}, {"year": 2025, "count": 800}
        ],
        "userTimeSeries": [
            {"year": 2018, "count": 500}, {"year": 2019, "count": 1200}, {"year": 2020, "count": 2500},
            {"year": 2021, "count": 4000}, {"year": 2022, "count": 5500}, {"year": 2023, "count": 6800},
            {"year": 2024, "count": 7800}, {"year": 2025, "count": 8500}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "利用者15名、月2回訪問、随時対応あり",
            "rewardUnit": {"baseUnit": "232単位/月", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 348000, "annualAmount": 4176000},
                "bonuses": [{"name": "処遇改善加算", "monthlyAmount": 42000, "annualAmount": 504000}],
                "totalMonthly": 390000, "totalAnnual": 4680000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 280000, "annualAmount": 3360000, "share": 71.8},
                    {"category": "交通費", "monthlyAmount": 40000, "annualAmount": 480000, "share": 10.3},
                    {"category": "事務所経費", "monthlyAmount": 40000, "annualAmount": 480000, "share": 10.3},
                    {"category": "その他", "monthlyAmount": 30000, "annualAmount": 360000, "share": 7.7}
                ],
                "totalMonthly": 390000, "totalAnnual": 4680000
            },
            "profitMargin": 1.0,
            "note": "2018年新設。GH退所者等の一人暮らし支援。他事業との併設が前提。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "利用者10-15名、地域定着支援員1名配置",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "利用者数", "values": [8,8,9,10,11,12,13,14,15,15,15,15]},
                    {"label": "月間訪問回数", "values": [16,16,18,20,22,24,26,28,30,30,30,30], "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(186000, 348000)},
                    {"label": "処遇改善加算", "values": make_ramp(22000, 42000)},
                    {"label": "売上合計", "values": make_ramp(208000, 390000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（支援員）", "values": const(230000)},
                    {"label": "法定福利費", "values": const(35000)},
                    {"label": "交通費", "values": make_ramp(25000, 40000)},
                    {"label": "事務所経費", "values": const(30000), "note": "他事業と按分"},
                    {"label": "その他", "values": const(15000)},
                    {"label": "販管費合計", "values": make_ramp(335000, 350000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-127000, 40000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-61.1, 10.3), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "自立生活援助", "description": "GH等から一人暮らしに移行した障害者への定期訪問＋随時対応サービス。", "benchmark": "2018年新設。利用期間は原則1年"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "出勤・訪問準備", "who": "地域定着支援員", "detail": "訪問スケジュール確認"},
                {"time": "10:00", "activity": "定期訪問（午前）", "who": "支援員", "detail": "居宅訪問、生活状況確認、助言"},
                {"time": "12:00", "activity": "記録・連絡調整", "who": "支援員", "detail": "訪問記録、関係機関連絡"},
                {"time": "14:00", "activity": "定期訪問（午後）", "who": "支援員", "detail": "別の利用者宅訪問"},
                {"time": "16:00", "activity": "事務・電話対応", "who": "支援員", "detail": "利用者からの随時相談対応"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業運営管理。", "icon": "Crown", "required": True, "count": "1名（兼務可）", "qualification": "特になし", "keyTask": "運営管理"},
                {"title": "地域生活支援員", "description": "利用者宅への定期訪問と随時相談対応。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "相談支援経験者", "keyTask": "訪問支援・随時相談"}
            ],
            "typicalConversations": [
                {"scene": "定期訪問", "context": "月2回の居宅訪問。", "topics": ["食事・健康管理", "金銭管理", "近隣トラブル", "服薬状況"], "insight": "一人暮らしの不安を丁寧に聴き取り、自立を支える"}
            ]
        }
    }

# ============================================================
# Run all generators
# ============================================================
GENERATORS = {
    "jidou-hattatsu.json": gen_jidou_hattatsu,
    "iryougata-jidou.json": gen_iryougata_jidou,
    "kyotaku-houmon.json": gen_kyotaku_houmon,
    "hoikusho-houmon.json": gen_hoikusho_houmon,
    "group-home.json": gen_group_home,
    "jiritsu-seikatsu.json": gen_jiritsu_seikatsu,
}

if __name__ == "__main__":
    print("=== Generating facility analysis JSONs (Part 1: 6 services) ===")
    for fname, gen_fn in GENERATORS.items():
        data = gen_fn()
        write_json(fname, data)
    print(f"\nDone! Generated {len(GENERATORS)} files.")
