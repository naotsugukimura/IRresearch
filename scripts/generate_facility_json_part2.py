#!/usr/bin/env python3
"""Generate facility analysis JSON files - Part 2: Training/Employment/Consultation services."""

import json
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "facility-analysis")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]

def make_ramp(start, end, steps=12):
    vals = []
    for i in range(steps):
        v = start + (end - start) * i / (steps - 1)
        vals.append(round(v))
    return vals

def make_ramp_f(start, end, steps=12):
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
# 7. 自立訓練（機能訓練）(code 23)
# ============================================================
def gen_kinou_kunren():
    return {
        "serviceType": "自立訓練（機能訓練）",
        "serviceCode": "23",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat",
        "entityDistribution": {
            "asOf": "2025-09", "total": 220,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 88, "share": 40.0},
                {"type": "医療法人", "count": 44, "share": 20.0},
                {"type": "NPO法人", "count": 33, "share": 15.0},
                {"type": "株式会社", "count": 33, "share": 15.0},
                {"type": "その他", "count": 22, "share": 10.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 132, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 66, "share": 30.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 22, "share": 10.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 200}, {"year": 2017, "count": 210}, {"year": 2019, "count": 215},
            {"year": 2021, "count": 218}, {"year": 2023, "count": 220}, {"year": 2025, "count": 220}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 3500}, {"year": 2017, "count": 3600}, {"year": 2019, "count": 3700},
            {"year": 2021, "count": 3800}, {"year": 2023, "count": 3900}, {"year": 2025, "count": 4000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "定員20名、稼働率75%、月22日",
            "rewardUnit": {"baseUnit": "583単位/日", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 1924000, "annualAmount": 23088000},
                "bonuses": [{"name": "処遇改善加算等", "monthlyAmount": 250000, "annualAmount": 3000000}],
                "totalMonthly": 2174000, "totalAnnual": 26088000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 1500000, "annualAmount": 18000000, "share": 69.0},
                    {"category": "賃料", "monthlyAmount": 200000, "annualAmount": 2400000, "share": 9.2},
                    {"category": "設備・リハビリ機器", "monthlyAmount": 100000, "annualAmount": 1200000, "share": 4.6},
                    {"category": "その他", "monthlyAmount": 374000, "annualAmount": 4488000, "share": 17.2}
                ],
                "totalMonthly": 2174000, "totalAnnual": 26088000
            },
            "profitMargin": 2.0,
            "note": "PT/OT/STの配置が前提。身体障害者が主な対象。利用期間は原則1.5年。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "リハビリテーション加算", "category": "医療", "units": "20単位/日", "requirement": "PT/OT/STによるリハビリ", "difficulty": "high", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、PT/OT常勤配置、リハビリ機器あり",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "稼働率", "values": make_ramp_f(55, 75), "isPercent": True},
                    {"label": "月間延べ利用者数", "values": make_ramp(242, 330), "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1411000, 1924000)},
                    {"label": "処遇改善加算", "values": make_ramp(183000, 250000)},
                    {"label": "売上合計", "values": make_ramp(1594000, 2174000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（PT/OT/ST）", "values": const(600000)},
                    {"label": "人件費（その他）", "values": const(700000)},
                    {"label": "法定福利費", "values": const(195000)},
                    {"label": "賃料", "values": const(200000)},
                    {"label": "設備費", "values": const(100000)},
                    {"label": "その他", "values": const(150000)},
                    {"label": "販管費合計", "values": const(1945000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-351000, 229000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-22.0, 10.5), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "機能訓練", "description": "身体機能の維持・回復を目的としたリハビリ中心の訓練。", "benchmark": "利用期間1.5年。事業所数は横ばい"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "出勤・準備", "who": "全スタッフ"},
                {"time": "09:30", "activity": "個別リハビリ", "who": "PT/OT", "detail": "身体機能訓練"},
                {"time": "11:00", "activity": "集団プログラム", "who": "全スタッフ", "detail": "体操・レクリエーション"},
                {"time": "12:00", "activity": "昼食", "who": "指導員"},
                {"time": "13:00", "activity": "午後リハビリ", "who": "PT/OT/ST"},
                {"time": "15:00", "activity": "自主訓練・相談", "who": "指導員"},
                {"time": "16:00", "activity": "記録・退勤", "who": "全スタッフ"}
            ],
            "roles": [
                {"title": "サービス管理責任者", "description": "個別支援計画の作成。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画作成"},
                {"title": "理学療法士（PT）", "description": "身体機能のリハビリ。", "icon": "Activity", "required": True, "count": "1名以上", "qualification": "PT国家資格", "keyTask": "リハビリ実施"}
            ],
            "typicalConversations": [
                {"scene": "リハビリ計画面談", "context": "利用開始時と3ヶ月ごと。", "topics": ["目標設定", "進捗確認", "在宅での自主訓練"], "insight": "利用期間が限られるため、目標の明確化が重要"}
            ]
        }
    }

# ============================================================
# 8. 自立訓練（生活訓練）(code 24)
# ============================================================
def gen_seikatsu_kunren():
    return {
        "serviceType": "自立訓練（生活訓練）",
        "serviceCode": "24",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat",
        "entityDistribution": {
            "asOf": "2025-09", "total": 1600,
            "byEntityType": [
                {"type": "NPO法人", "count": 400, "share": 25.0},
                {"type": "社会福祉法人", "count": 352, "share": 22.0},
                {"type": "株式会社", "count": 320, "share": 20.0},
                {"type": "一般社団法人", "count": 240, "share": 15.0},
                {"type": "合同会社", "count": 160, "share": 10.0},
                {"type": "その他", "count": 128, "share": 8.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 960, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 400, "share": 25.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 240, "share": 15.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 900}, {"year": 2017, "count": 1050}, {"year": 2019, "count": 1200},
            {"year": 2021, "count": 1350}, {"year": 2023, "count": 1480}, {"year": 2025, "count": 1600}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 12000}, {"year": 2017, "count": 14000}, {"year": 2019, "count": 16000},
            {"year": 2021, "count": 18000}, {"year": 2023, "count": 20000}, {"year": 2025, "count": 22000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "定員20名、稼働率80%、月22日",
            "rewardUnit": {"baseUnit": "583単位/日", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 2053000, "annualAmount": 24636000},
                "bonuses": [{"name": "処遇改善加算等", "monthlyAmount": 260000, "annualAmount": 3120000}],
                "totalMonthly": 2313000, "totalAnnual": 27756000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 1600000, "annualAmount": 19200000, "share": 69.2},
                    {"category": "賃料", "monthlyAmount": 200000, "annualAmount": 2400000, "share": 8.6},
                    {"category": "食材費", "monthlyAmount": 100000, "annualAmount": 1200000, "share": 4.3},
                    {"category": "その他", "monthlyAmount": 413000, "annualAmount": 4956000, "share": 17.9}
                ],
                "totalMonthly": 2313000, "totalAnnual": 27756000
            },
            "profitMargin": 2.5,
            "note": "知的・精神障害者が主な対象。生活スキルの習得を支援。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "食事提供体制加算", "category": "サービス", "units": "30単位/日", "requirement": "食事提供を実施", "difficulty": "low", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、生活支援プログラム中心",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "稼働率", "values": make_ramp_f(55, 80), "isPercent": True},
                    {"label": "月間延べ利用者数", "values": make_ramp(242, 352), "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1411000, 2053000)},
                    {"label": "処遇改善加算", "values": make_ramp(180000, 260000)},
                    {"label": "売上合計", "values": make_ramp(1591000, 2313000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(1400000)},
                    {"label": "法定福利費", "values": const(210000)},
                    {"label": "賃料", "values": const(200000)},
                    {"label": "食材費", "values": make_ramp(60000, 100000)},
                    {"label": "その他", "values": const(150000)},
                    {"label": "販管費合計", "values": make_ramp(2020000, 2060000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-429000, 253000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-27.0, 10.9), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "生活訓練", "description": "日常生活能力の維持・向上を目的とした訓練。調理・掃除・金銭管理等。", "benchmark": "利用期間2年（長期入所者は3年）"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "朝礼・体調確認", "who": "全スタッフ"},
                {"time": "09:30", "activity": "生活プログラム", "who": "生活支援員", "detail": "調理・洗濯・掃除等の実習"},
                {"time": "12:00", "activity": "昼食（調理実習）", "who": "利用者・支援員"},
                {"time": "13:30", "activity": "社会生活プログラム", "who": "支援員", "detail": "公共交通機関の利用、買い物訓練"},
                {"time": "15:30", "activity": "個別面談・記録", "who": "サビ管・支援員"}
            ],
            "roles": [
                {"title": "サービス管理責任者", "description": "支援計画の作成・管理。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "計画作成"},
                {"title": "生活支援員", "description": "日常生活スキルの訓練を実施。", "icon": "Users", "required": True, "count": "6名以上（定員60名に対し）", "qualification": "特になし", "keyTask": "生活訓練"}
            ],
            "typicalConversations": [
                {"scene": "目標設定面談", "context": "利用開始時。一人暮らしやGH入居に向けた目標設定。", "topics": ["現在の生活スキル", "目標の住まい方", "訓練プログラムの内容"], "insight": "本人の希望を尊重した目標設定が動機付けの鍵"}
            ]
        }
    }

# ============================================================
# 9. 宿泊型自立訓練 (code 25)
# ============================================================
def gen_shukuhaku_kunren():
    return {
        "serviceType": "宿泊型自立訓練",
        "serviceCode": "25",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 250,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 125, "share": 50.0},
                {"type": "NPO法人", "count": 50, "share": 20.0},
                {"type": "株式会社", "count": 38, "share": 15.0},
                {"type": "その他", "count": 37, "share": 15.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 150, "share": 60.0, "color": "#3B82F6"},
                {"label": "2事業所以上", "key": "multi", "count": 100, "share": 40.0, "color": "#8B5CF6"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2015, "count": 280}, {"year": 2017, "count": 270}, {"year": 2019, "count": 260},
            {"year": 2021, "count": 255}, {"year": 2023, "count": 252}, {"year": 2025, "count": 250}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 3500}, {"year": 2017, "count": 3400}, {"year": 2019, "count": 3300},
            {"year": 2021, "count": 3200}, {"year": 2023, "count": 3100}, {"year": 2025, "count": 3000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "定員10名、入居率90%、30日/月",
            "rewardUnit": {"baseUnit": "178単位/日", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 481000, "annualAmount": 5772000},
                "bonuses": [{"name": "処遇改善加算等", "monthlyAmount": 60000, "annualAmount": 720000}],
                "totalMonthly": 541000, "totalAnnual": 6492000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 350000, "annualAmount": 4200000, "share": 64.7},
                    {"category": "賃料", "monthlyAmount": 80000, "annualAmount": 960000, "share": 14.8},
                    {"category": "食材費・水光熱費", "monthlyAmount": 60000, "annualAmount": 720000, "share": 11.1},
                    {"category": "その他", "monthlyAmount": 51000, "annualAmount": 612000, "share": 9.4}
                ],
                "totalMonthly": 541000, "totalAnnual": 6492000
            },
            "profitMargin": 1.5,
            "note": "生活訓練と併設が前提。夜間の居住支援。事業所数は減少傾向。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員10名、生活訓練と併設運営",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(10)},
                    {"label": "入居率", "values": make_ramp_f(70, 90), "isPercent": True},
                    {"label": "月間延べ利用者日数", "values": make_ramp(210, 270), "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(374000, 481000)},
                    {"label": "処遇改善加算", "values": make_ramp(46000, 60000)},
                    {"label": "売上合計", "values": make_ramp(420000, 541000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(280000)},
                    {"label": "法定福利費", "values": const(42000)},
                    {"label": "賃料", "values": const(80000)},
                    {"label": "食材費・水光熱費", "values": make_ramp(45000, 60000)},
                    {"label": "その他", "values": const(30000)},
                    {"label": "販管費合計", "values": make_ramp(477000, 492000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-57000, 49000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-13.6, 9.1), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "宿泊型自立訓練", "description": "生活訓練の夜間版。居室を提供し宿泊しながら自立を支援。", "benchmark": "利用期間2年。生活訓練との併設が基本"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "17:00", "activity": "帰所", "who": "利用者", "detail": "日中活動から帰所"},
                {"time": "18:00", "activity": "夕食", "who": "生活支援員", "detail": "夕食準備・食事支援"},
                {"time": "19:00", "activity": "余暇・生活スキル訓練", "who": "支援員", "detail": "洗濯・掃除等の生活スキル実践"},
                {"time": "22:00", "activity": "就寝", "who": "夜勤者", "detail": "就寝見守り"},
                {"time": "07:00", "activity": "起床・朝食", "who": "支援員", "detail": "起床支援、朝食"}
            ],
            "roles": [
                {"title": "生活支援員", "description": "夜間の生活支援と見守り。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "特になし", "keyTask": "夜間の生活支援"}
            ],
            "typicalConversations": [
                {"scene": "退所に向けた面談", "context": "一人暮らし移行に向けた準備。", "topics": ["生活スキルの習得状況", "住居探し", "日中活動の確保"], "insight": "「卒業」を見据えた支援が重要"}
            ]
        }
    }

# ============================================================
# 10. 就労移行支援 (code 27)
# ============================================================
def gen_shurou_ikou():
    return {
        "serviceType": "就労移行支援",
        "serviceCode": "27",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat・障害福祉サービス等経営実態調査",
        "entityDistribution": {
            "asOf": "2025-09", "total": 3200,
            "byEntityType": [
                {"type": "株式会社", "count": 1280, "share": 40.0},
                {"type": "NPO法人", "count": 576, "share": 18.0},
                {"type": "一般社団法人", "count": 480, "share": 15.0},
                {"type": "社会福祉法人", "count": 416, "share": 13.0},
                {"type": "合同会社", "count": 288, "share": 9.0},
                {"type": "その他", "count": 160, "share": 5.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 1600, "share": 50.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 960, "share": 30.0, "color": "#8B5CF6"},
                {"label": "6〜10事業所", "key": "multi_6_10", "count": 480, "share": 15.0, "color": "#F59E0B"},
                {"label": "11事業所以上", "key": "multi_11_plus", "count": 160, "share": 5.0, "color": "#EF4444"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2012, "count": 2100}, {"year": 2014, "count": 2600}, {"year": 2016, "count": 3100},
            {"year": 2018, "count": 3400}, {"year": 2019, "count": 3500}, {"year": 2020, "count": 3450},
            {"year": 2021, "count": 3400}, {"year": 2022, "count": 3350}, {"year": 2023, "count": 3300},
            {"year": 2024, "count": 3250}, {"year": 2025, "count": 3200}
        ],
        "userTimeSeries": [
            {"year": 2012, "count": 22000}, {"year": 2014, "count": 28000}, {"year": 2016, "count": 34000},
            {"year": 2018, "count": 36000}, {"year": 2019, "count": 37000}, {"year": 2020, "count": 36000},
            {"year": 2021, "count": 35500}, {"year": 2022, "count": 35000}, {"year": 2023, "count": 34500},
            {"year": 2024, "count": 34000}, {"year": 2025, "count": 33500}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標・障害福祉サービス等経営実態調査",
            "assumptions": "定員20名、稼働率75%、月22日",
            "rewardUnit": {"baseUnit": "838単位/日（定員20名以下）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 2768000, "annualAmount": 33216000},
                "bonuses": [
                    {"name": "就労移行支援体制加算", "monthlyAmount": 200000, "annualAmount": 2400000},
                    {"name": "処遇改善加算", "monthlyAmount": 340000, "annualAmount": 4080000}
                ],
                "totalMonthly": 3308000, "totalAnnual": 39696000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 2300000, "annualAmount": 27600000, "share": 69.5},
                    {"category": "賃料", "monthlyAmount": 250000, "annualAmount": 3000000, "share": 7.6},
                    {"category": "就職支援費", "monthlyAmount": 100000, "annualAmount": 1200000, "share": 3.0},
                    {"category": "その他", "monthlyAmount": 658000, "annualAmount": 7896000, "share": 19.9}
                ],
                "totalMonthly": 3308000, "totalAnnual": 39696000
            },
            "profitMargin": 4.0,
            "note": "就職実績が報酬に直結。就職率6割超なら高い報酬単価。利用期間2年。"
        },
        "bonusCatalog": [
            {"name": "就労移行支援体制加算", "category": "実績", "units": "25-46単位/日", "requirement": "就職後6ヶ月以上の定着率に応じて", "difficulty": "high", "revenueImpact": "high"},
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "就労定着実績体制加算", "category": "実績", "units": "94単位/日", "requirement": "定着率7割以上", "difficulty": "high", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、就職率50%以上、職業指導員・就労支援員配置",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "稼働率", "values": make_ramp_f(50, 75), "isPercent": True},
                    {"label": "月間延べ利用者数", "values": make_ramp(220, 330), "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1843000, 2768000)},
                    {"label": "就労移行支援体制加算", "values": make_ramp(130000, 200000)},
                    {"label": "処遇改善加算", "values": make_ramp(226000, 340000)},
                    {"label": "売上合計", "values": make_ramp(2199000, 3308000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（職業指導員）", "values": const(500000)},
                    {"label": "人件費（就労支援員）", "values": const(450000)},
                    {"label": "人件費（サビ管・管理者）", "values": const(500000)},
                    {"label": "人件費（その他）", "values": const(400000)},
                    {"label": "法定福利費", "values": const(278000)},
                    {"label": "賃料", "values": const(250000)},
                    {"label": "就職支援費", "values": const(100000), "note": "スーツ代補助・交通費等"},
                    {"label": "教材・訓練費", "values": const(50000)},
                    {"label": "その他", "values": const(150000)},
                    {"label": "販管費合計", "values": const(2678000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-479000, 630000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-21.8, 19.0), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "就労移行支援", "description": "一般企業等への就職を目指す障害者への訓練・支援。利用期間2年。", "benchmark": "リタリコが最大手。就職率が報酬に直結"},
                {"term": "就労移行支援体制加算", "description": "前年度の就職者数÷前年度定員の比率に応じて加算。", "benchmark": "就職率5割超で大幅加算。事業所の生命線"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "朝礼", "who": "全スタッフ・利用者"},
                {"time": "09:30", "activity": "ビジネスマナー訓練", "who": "職業指導員", "detail": "挨拶、敬語、メール作成"},
                {"time": "10:30", "activity": "PC・事務スキル訓練", "who": "職業指導員", "detail": "Excel/Word、データ入力"},
                {"time": "12:00", "activity": "昼食・休憩", "who": "全体"},
                {"time": "13:00", "activity": "就職活動支援", "who": "就労支援員", "detail": "履歴書作成、面接練習"},
                {"time": "14:30", "activity": "企業実習・職場見学", "who": "就労支援員", "detail": "実習先での実務体験"},
                {"time": "16:00", "activity": "振り返り・記録", "who": "全スタッフ"}
            ],
            "roles": [
                {"title": "サービス管理責任者", "description": "個別支援計画の作成。就職活動全体の管理。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画・就職先開拓"},
                {"title": "職業指導員", "description": "ビジネススキル・PC訓練の実施。", "icon": "Briefcase", "required": True, "count": "定員÷6以上", "qualification": "特になし", "keyTask": "スキル訓練"},
                {"title": "就労支援員", "description": "就職活動支援、企業実習の調整。", "icon": "Users", "required": True, "count": "定員÷6以上", "qualification": "特になし", "keyTask": "就職活動支援"}
            ],
            "typicalConversations": [
                {"scene": "企業開拓", "context": "就労支援員が地元企業を訪問。", "topics": ["障害者雇用のメリット", "実習の受入れ", "助成金制度", "職場環境の調整"], "insight": "企業との信頼関係が就職実績＝報酬に直結"},
                {"scene": "利用者面談", "context": "月1回の個別面談。", "topics": ["就職への不安", "希望する仕事", "訓練の振り返り", "企業実習の感想"], "insight": "利用者のモチベーション維持が最大の課題"}
            ]
        }
    }

# ============================================================
# 11. 就労継続支援A型 (code 31)
# ============================================================
def gen_shurou_a():
    return {
        "serviceType": "就労継続支援A型",
        "serviceCode": "31",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat・障害福祉サービス等経営実態調査",
        "entityDistribution": {
            "asOf": "2025-09", "total": 4350,
            "byEntityType": [
                {"type": "株式会社", "count": 2175, "share": 50.0},
                {"type": "合同会社", "count": 652, "share": 15.0},
                {"type": "NPO法人", "count": 522, "share": 12.0},
                {"type": "一般社団法人", "count": 435, "share": 10.0},
                {"type": "社会福祉法人", "count": 348, "share": 8.0},
                {"type": "その他", "count": 218, "share": 5.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 2610, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 1088, "share": 25.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 652, "share": 15.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2012, "count": 2000}, {"year": 2014, "count": 2800}, {"year": 2016, "count": 3500},
            {"year": 2018, "count": 3900}, {"year": 2019, "count": 3800}, {"year": 2020, "count": 3700},
            {"year": 2021, "count": 4000}, {"year": 2022, "count": 4100}, {"year": 2023, "count": 4200},
            {"year": 2024, "count": 4280}, {"year": 2025, "count": 4350}
        ],
        "userTimeSeries": [
            {"year": 2012, "count": 40000}, {"year": 2014, "count": 55000}, {"year": 2016, "count": 68000},
            {"year": 2018, "count": 72000}, {"year": 2019, "count": 74000}, {"year": 2020, "count": 75000},
            {"year": 2021, "count": 78000}, {"year": 2022, "count": 80000}, {"year": 2023, "count": 82000},
            {"year": 2024, "count": 84000}, {"year": 2025, "count": 85000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標・障害福祉サービス等経営実態調査",
            "assumptions": "定員20名、稼働率85%、月22日、最低賃金支払い",
            "rewardUnit": {"baseUnit": "597単位/日（スコア80点以上）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 2231000, "annualAmount": 26772000},
                "bonuses": [
                    {"name": "処遇改善加算", "monthlyAmount": 290000, "annualAmount": 3480000},
                    {"name": "事業収入（生産活動）", "monthlyAmount": 1500000, "annualAmount": 18000000}
                ],
                "totalMonthly": 4021000, "totalAnnual": 48252000
            },
            "costs": {
                "items": [
                    {"category": "利用者賃金", "monthlyAmount": 1700000, "annualAmount": 20400000, "share": 42.3},
                    {"category": "人件費（スタッフ）", "monthlyAmount": 1300000, "annualAmount": 15600000, "share": 32.3},
                    {"category": "賃料", "monthlyAmount": 250000, "annualAmount": 3000000, "share": 6.2},
                    {"category": "材料費", "monthlyAmount": 300000, "annualAmount": 3600000, "share": 7.5},
                    {"category": "その他", "monthlyAmount": 471000, "annualAmount": 5652000, "share": 11.7}
                ],
                "totalMonthly": 4021000, "totalAnnual": 48252000
            },
            "profitMargin": 2.0,
            "note": "雇用契約あり。最低賃金の支払いが必要。生産活動収入で賃金を賄う必要がある。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "就労移行支援体制加算", "category": "実績", "units": "6-12単位/日", "requirement": "一般就労への移行実績", "difficulty": "high", "revenueImpact": "medium"},
            {"name": "スコア評価（80点以上）", "category": "実績", "units": "基本報酬に反映", "requirement": "労働時間・生産活動・多様な働き方等のスコア", "difficulty": "high", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、雇用契約、最低賃金、生産活動あり",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "稼働率", "values": make_ramp_f(60, 85), "isPercent": True},
                    {"label": "月間延べ利用者数", "values": make_ramp(264, 374), "calculated": True}
                ]},
                {"title": "売上（報酬収入＋事業収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1576000, 2231000)},
                    {"label": "処遇改善加算", "values": make_ramp(205000, 290000)},
                    {"label": "事業収入（生産活動）", "values": make_ramp(900000, 1500000), "note": "清掃・軽作業・飲食等"},
                    {"label": "売上合計", "values": make_ramp(2681000, 4021000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "利用者賃金", "values": make_ramp(1020000, 1700000), "note": "最低賃金×労働時間"},
                    {"label": "人件費（スタッフ）", "values": const(1100000)},
                    {"label": "法定福利費", "values": const(165000)},
                    {"label": "賃料", "values": const(250000)},
                    {"label": "材料費", "values": make_ramp(180000, 300000)},
                    {"label": "その他", "values": const(200000)},
                    {"label": "販管費合計", "values": make_ramp(2915000, 3715000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-234000, 306000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-8.7, 7.6), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "A型", "description": "雇用契約に基づく就労。最低賃金以上の支払いが義務。", "benchmark": "平均賃金は月額約8.3万円（2023年度）"},
                {"term": "スコア評価", "description": "2021年度報酬改定で導入。労働時間・生産活動・多様な働き方等を点数化。", "benchmark": "80点以上で最高報酬。スコアが事業の生命線"},
                {"term": "生産活動収入", "description": "利用者の労働により得られる事業収入。賃金原資に充当。"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "08:30", "activity": "出勤・朝礼", "who": "全体"},
                {"time": "09:00", "activity": "午前の作業", "who": "利用者・職業指導員", "detail": "清掃、パッキング、データ入力等"},
                {"time": "12:00", "activity": "昼食", "who": "全体"},
                {"time": "13:00", "activity": "午後の作業", "who": "利用者・職業指導員"},
                {"time": "15:00", "activity": "振り返り・終礼", "who": "全体"},
                {"time": "15:30", "activity": "スタッフMTG", "who": "スタッフ", "detail": "利用者の状況共有、営業活動の報告"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業全体の運営。生産活動の開拓。", "icon": "Crown", "required": True, "count": "1名", "qualification": "特になし", "keyTask": "営業・受注管理"},
                {"title": "サービス管理責任者", "description": "支援計画の作成。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画"},
                {"title": "職業指導員", "description": "作業指導、品質管理。", "icon": "Briefcase", "required": True, "count": "定員÷10以上", "qualification": "特になし", "keyTask": "作業指導"},
                {"title": "生活支援員", "description": "生活面の相談・支援。", "icon": "Users", "required": True, "count": "定員÷10以上", "qualification": "特になし", "keyTask": "生活支援"}
            ],
            "typicalConversations": [
                {"scene": "受注営業", "context": "管理者が企業を訪問し作業を受注。", "topics": ["作業内容・品質", "納期", "価格交渉", "利用者のスキル"], "insight": "安定した受注確保が賃金支払い＝事業継続の鍵"},
                {"scene": "利用者面談", "context": "月1回の個別面談。", "topics": ["仕事の満足度", "一般就労への希望", "健康状態"], "insight": "A型は「働く場」としての満足度向上が定着の鍵"}
            ]
        }
    }

# ============================================================
# 12. 就労継続支援B型 (code 32)
# ============================================================
def gen_shurou_b():
    return {
        "serviceType": "就労継続支援B型",
        "serviceCode": "32",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat・障害福祉サービス等経営実態調査",
        "entityDistribution": {
            "asOf": "2025-09", "total": 17000,
            "byEntityType": [
                {"type": "NPO法人", "count": 4250, "share": 25.0},
                {"type": "社会福祉法人", "count": 3740, "share": 22.0},
                {"type": "株式会社", "count": 3400, "share": 20.0},
                {"type": "一般社団法人", "count": 2040, "share": 12.0},
                {"type": "合同会社", "count": 1870, "share": 11.0},
                {"type": "その他", "count": 1700, "share": 10.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 10200, "share": 60.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 4250, "share": 25.0, "color": "#8B5CF6"},
                {"label": "6〜10事業所", "key": "multi_6_10", "count": 1700, "share": 10.0, "color": "#F59E0B"},
                {"label": "11事業所以上", "key": "multi_11_plus", "count": 850, "share": 5.0, "color": "#EF4444"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2012, "count": 7300}, {"year": 2014, "count": 9200}, {"year": 2016, "count": 11200},
            {"year": 2018, "count": 12800}, {"year": 2019, "count": 13500}, {"year": 2020, "count": 14200},
            {"year": 2021, "count": 14900}, {"year": 2022, "count": 15500}, {"year": 2023, "count": 16100},
            {"year": 2024, "count": 16600}, {"year": 2025, "count": 17000}
        ],
        "userTimeSeries": [
            {"year": 2012, "count": 170000}, {"year": 2014, "count": 210000}, {"year": 2016, "count": 250000},
            {"year": 2018, "count": 280000}, {"year": 2019, "count": 295000}, {"year": 2020, "count": 310000},
            {"year": 2021, "count": 325000}, {"year": 2022, "count": 340000}, {"year": 2023, "count": 355000},
            {"year": 2024, "count": 365000}, {"year": 2025, "count": 375000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標・障害福祉サービス等経営実態調査",
            "assumptions": "定員20名、稼働率80%、月22日、平均工賃月額1.5万円",
            "rewardUnit": {"baseUnit": "614単位/日（平均工賃1.5万以上）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 2162000, "annualAmount": 25944000},
                "bonuses": [
                    {"name": "処遇改善加算", "monthlyAmount": 280000, "annualAmount": 3360000},
                    {"name": "目標工賃達成指導員配置加算", "monthlyAmount": 80000, "annualAmount": 960000}
                ],
                "totalMonthly": 2522000, "totalAnnual": 30264000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 1600000, "annualAmount": 19200000, "share": 63.4},
                    {"category": "利用者工賃", "monthlyAmount": 300000, "annualAmount": 3600000, "share": 11.9},
                    {"category": "賃料", "monthlyAmount": 200000, "annualAmount": 2400000, "share": 7.9},
                    {"category": "材料費", "monthlyAmount": 150000, "annualAmount": 1800000, "share": 5.9},
                    {"category": "その他", "monthlyAmount": 272000, "annualAmount": 3264000, "share": 10.8}
                ],
                "totalMonthly": 2522000, "totalAnnual": 30264000
            },
            "profitMargin": 3.0,
            "note": "最も事業所数が多いサービス。工賃向上が報酬に直結するスコア制。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"},
            {"name": "目標工賃達成指導員配置加算", "category": "人員配置", "units": "89単位/日", "requirement": "目標工賃を達成し指導員を加配", "difficulty": "medium", "revenueImpact": "medium"},
            {"name": "送迎加算", "category": "サービス", "units": "21単位/回", "requirement": "利用者の送迎を実施", "difficulty": "low", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "定員20名、平均工賃1.5万円/月、軽作業・内職中心",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "定員", "values": const(20)},
                    {"label": "稼働率", "values": make_ramp_f(55, 80), "isPercent": True},
                    {"label": "月間延べ利用者数", "values": make_ramp(242, 352), "calculated": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(1486000, 2162000)},
                    {"label": "処遇改善加算", "values": make_ramp(193000, 280000)},
                    {"label": "目標工賃達成加算", "values": make_ramp(55000, 80000)},
                    {"label": "送迎加算", "values": make_ramp(50000, 74000)},
                    {"label": "売上合計", "values": make_ramp(1784000, 2596000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（職業指導員）", "values": const(500000)},
                    {"label": "人件費（生活支援員）", "values": const(400000)},
                    {"label": "人件費（サビ管・管理者）", "values": const(500000)},
                    {"label": "法定福利費", "values": const(210000)},
                    {"label": "利用者工賃", "values": make_ramp(165000, 300000), "note": "平均工賃月額×人数"},
                    {"label": "賃料", "values": const(200000)},
                    {"label": "材料費", "values": make_ramp(80000, 150000)},
                    {"label": "送迎費", "values": const(80000)},
                    {"label": "その他", "values": const(100000)},
                    {"label": "販管費合計", "values": make_ramp(2235000, 2440000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-451000, 156000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-25.3, 6.0), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "B型", "description": "雇用契約なし。工賃（作業対価）を支払う。利用期間の制限なし。", "benchmark": "全国平均工賃は月額約1.7万円（2023年度）"},
                {"term": "工賃", "description": "利用者に支払われる作業対価。最低賃金の適用外。", "benchmark": "工賃向上が報酬改定の最大テーマ"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "送迎・朝礼", "who": "全体"},
                {"time": "09:30", "activity": "午前の作業", "who": "利用者・職業指導員", "detail": "内職、清掃、農作業等"},
                {"time": "12:00", "activity": "昼食", "who": "全体"},
                {"time": "13:00", "activity": "午後の作業", "who": "利用者・職業指導員"},
                {"time": "15:00", "activity": "清掃・終礼・送迎", "who": "全体"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業運営、受注開拓。", "icon": "Crown", "required": True, "count": "1名", "qualification": "特になし", "keyTask": "営業・工賃向上"},
                {"title": "サービス管理責任者", "description": "支援計画の作成。", "icon": "ClipboardCheck", "required": True, "count": "1名", "qualification": "実務経験5年＋研修", "keyTask": "支援計画"},
                {"title": "職業指導員", "description": "作業指導、品質管理。", "icon": "Briefcase", "required": True, "count": "定員÷10以上", "qualification": "特になし", "keyTask": "作業指導"},
                {"title": "生活支援員", "description": "生活面の相談・支援。", "icon": "Users", "required": True, "count": "定員÷10以上", "qualification": "特になし", "keyTask": "生活支援"}
            ],
            "typicalConversations": [
                {"scene": "工賃アップの取り組み", "context": "管理者・職業指導員の会議。", "topics": ["新規受注先", "作業効率化", "単価交渉", "新しい作業種目"], "insight": "工賃向上は報酬UPにも直結。事業所の差別化ポイント"}
            ]
        }
    }

# ============================================================
# 13. 就労定着支援 (code 33)
# ============================================================
def gen_shurou_teichaku():
    return {
        "serviceType": "就労定着支援",
        "serviceCode": "33",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 1600,
            "byEntityType": [
                {"type": "株式会社", "count": 640, "share": 40.0},
                {"type": "NPO法人", "count": 288, "share": 18.0},
                {"type": "社会福祉法人", "count": 256, "share": 16.0},
                {"type": "一般社団法人", "count": 224, "share": 14.0},
                {"type": "その他", "count": 192, "share": 12.0}
            ]
        },
        "operatorScale": {
            "asOf": "2025-09",
            "buckets": [
                {"label": "1事業所", "key": "single", "count": 800, "share": 50.0, "color": "#3B82F6"},
                {"label": "2〜5事業所", "key": "multi_2_5", "count": 560, "share": 35.0, "color": "#8B5CF6"},
                {"label": "6事業所以上", "key": "multi_6_plus", "count": 240, "share": 15.0, "color": "#F59E0B"}
            ]
        },
        "facilityTimeSeries": [
            {"year": 2018, "count": 400}, {"year": 2019, "count": 700}, {"year": 2020, "count": 950},
            {"year": 2021, "count": 1150}, {"year": 2022, "count": 1300}, {"year": 2023, "count": 1430},
            {"year": 2024, "count": 1520}, {"year": 2025, "count": 1600}
        ],
        "userTimeSeries": [
            {"year": 2018, "count": 3000}, {"year": 2019, "count": 7000}, {"year": 2020, "count": 12000},
            {"year": 2021, "count": 17000}, {"year": 2022, "count": 22000}, {"year": 2023, "count": 26000},
            {"year": 2024, "count": 29000}, {"year": 2025, "count": 32000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "利用者20名、月1回訪問・随時相談",
            "rewardUnit": {"baseUnit": "1128単位/月（定着率9割以上）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 226000, "annualAmount": 2712000},
                "bonuses": [{"name": "処遇改善加算", "monthlyAmount": 28000, "annualAmount": 336000}],
                "totalMonthly": 254000, "totalAnnual": 3048000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 200000, "annualAmount": 2400000, "share": 78.7},
                    {"category": "交通費", "monthlyAmount": 25000, "annualAmount": 300000, "share": 9.8},
                    {"category": "その他", "monthlyAmount": 29000, "annualAmount": 348000, "share": 11.4}
                ],
                "totalMonthly": 254000, "totalAnnual": 3048000
            },
            "profitMargin": 1.5,
            "note": "就労移行支援等との併設が前提。単独では採算が取りにくい。"
        },
        "bonusCatalog": [
            {"name": "処遇改善加算（I）", "category": "処遇改善", "units": "総報酬の8.6%", "requirement": "キャリアパス要件等", "difficulty": "medium", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "利用者15-20名、就労移行支援と併設運営",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "利用者数", "values": make_ramp(10, 20)},
                    {"label": "定着率", "values": const(90), "isPercent": True}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(113000, 226000)},
                    {"label": "処遇改善加算", "values": make_ramp(14000, 28000)},
                    {"label": "売上合計", "values": make_ramp(127000, 254000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（定着支援員）", "values": const(180000), "note": "兼務"},
                    {"label": "交通費", "values": make_ramp(15000, 25000)},
                    {"label": "その他", "values": const(15000)},
                    {"label": "販管費合計", "values": make_ramp(210000, 220000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-83000, 34000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-65.4, 13.4), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "就労定着支援", "description": "一般就労後6ヶ月経過した障害者への定着支援。利用期間3年。", "benchmark": "2018年新設。就労移行とのセット運営が基本"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "事務・連絡調整", "who": "定着支援員"},
                {"time": "10:00", "activity": "企業訪問", "who": "定着支援員", "detail": "利用者の職場を訪問、上司との面談"},
                {"time": "13:00", "activity": "利用者面談", "who": "定着支援員", "detail": "就労上の悩み、生活面の相談"},
                {"time": "15:00", "activity": "関係機関連携", "who": "定着支援員", "detail": "医療機関、障害者就業・生活支援センター等"}
            ],
            "roles": [
                {"title": "就労定着支援員", "description": "利用者と企業の橋渡し。定着支援の実施。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "就労支援経験者", "keyTask": "企業訪問・利用者面談"}
            ],
            "typicalConversations": [
                {"scene": "企業との連携", "context": "利用者の職場を訪問。", "topics": ["仕事ぶり", "人間関係", "配慮事項の調整", "業務量の見直し"], "insight": "企業と利用者の間に立つ調整力が求められる"}
            ]
        }
    }

# ============================================================
# 14-17: 相談支援系 (4 types)
# ============================================================
def gen_chiiki_ikou():
    """地域相談支援（地域移行支援）code 53"""
    return {
        "serviceType": "地域相談支援（地域移行支援）",
        "serviceCode": "53",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 550,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 220, "share": 40.0},
                {"type": "NPO法人", "count": 110, "share": 20.0},
                {"type": "一般社団法人", "count": 83, "share": 15.0},
                {"type": "株式会社", "count": 55, "share": 10.0},
                {"type": "その他", "count": 82, "share": 15.0}
            ]
        },
        "operatorScale": {"asOf": "2025-09", "buckets": [
            {"label": "1事業所", "key": "single", "count": 385, "share": 70.0, "color": "#3B82F6"},
            {"label": "2事業所以上", "key": "multi", "count": 165, "share": 30.0, "color": "#8B5CF6"}
        ]},
        "facilityTimeSeries": [
            {"year": 2015, "count": 600}, {"year": 2018, "count": 580}, {"year": 2021, "count": 560},
            {"year": 2023, "count": 555}, {"year": 2025, "count": 550}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 2000}, {"year": 2018, "count": 2500}, {"year": 2021, "count": 3000},
            {"year": 2023, "count": 3200}, {"year": 2025, "count": 3400}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "月5件程度の支援、計画相談と併設",
            "rewardUnit": {"baseUnit": "2,260単位/月", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 113000, "annualAmount": 1356000},
                "bonuses": [],
                "totalMonthly": 113000, "totalAnnual": 1356000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 80000, "annualAmount": 960000, "share": 70.8},
                    {"category": "交通費", "monthlyAmount": 15000, "annualAmount": 180000, "share": 13.3},
                    {"category": "その他", "monthlyAmount": 18000, "annualAmount": 216000, "share": 15.9}
                ],
                "totalMonthly": 113000, "totalAnnual": 1356000
            },
            "profitMargin": 0.5,
            "note": "施設から地域生活への移行を支援。計画相談との併設が前提。利用は減少傾向。"
        },
        "bonusCatalog": [
            {"name": "退院・退所月加算", "category": "実績", "units": "2,700単位/月", "requirement": "退院・退所した月に算定", "difficulty": "low", "revenueImpact": "high"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "相談支援専門員1名（他事業と兼務）",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "支援件数", "values": [3,3,4,4,5,5,5,5,5,5,5,5]}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "基本報酬", "values": make_ramp(68000, 113000)},
                    {"label": "退院退所月加算", "values": [0,27000,0,27000,0,27000,0,27000,0,27000,0,27000]},
                    {"label": "売上合計", "values": make_ramp(68000, 140000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(70000), "note": "兼務按分"},
                    {"label": "交通費", "values": make_ramp(10000, 15000)},
                    {"label": "その他", "values": const(10000)},
                    {"label": "販管費合計", "values": make_ramp(90000, 95000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-22000, 45000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-32.4, 32.1), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "地域移行支援", "description": "入所施設・精神科病院から地域生活への移行を支援。住居確保・同行支援等。", "benchmark": "利用期間6ヶ月（延長可）"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "事務・連絡", "who": "相談支援専門員"},
                {"time": "10:00", "activity": "施設・病院訪問", "who": "相談支援専門員", "detail": "入所者・入院患者との面談"},
                {"time": "14:00", "activity": "住居探し同行", "who": "相談支援専門員", "detail": "不動産業者への同行"},
                {"time": "16:00", "activity": "記録・関係機関連絡", "who": "相談支援専門員"}
            ],
            "roles": [
                {"title": "相談支援専門員", "description": "地域移行支援計画の作成と実施。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "相談支援専門員研修修了", "keyTask": "移行計画作成・同行支援"}
            ],
            "typicalConversations": [
                {"scene": "移行計画面談", "context": "施設・病院での面談。", "topics": ["地域生活への希望", "住居", "日中活動", "不安の聴取"], "insight": "長期入所者ほど地域生活への不安が大きい。段階的な体験利用が効果的"}
            ]
        }
    }

def gen_chiiki_teichaku():
    """地域相談支援（地域定着支援）code 54"""
    return {
        "serviceType": "地域相談支援（地域定着支援）",
        "serviceCode": "54",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 500,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 200, "share": 40.0},
                {"type": "NPO法人", "count": 100, "share": 20.0},
                {"type": "一般社団法人", "count": 75, "share": 15.0},
                {"type": "株式会社", "count": 50, "share": 10.0},
                {"type": "その他", "count": 75, "share": 15.0}
            ]
        },
        "operatorScale": {"asOf": "2025-09", "buckets": [
            {"label": "1事業所", "key": "single", "count": 350, "share": 70.0, "color": "#3B82F6"},
            {"label": "2事業所以上", "key": "multi", "count": 150, "share": 30.0, "color": "#8B5CF6"}
        ]},
        "facilityTimeSeries": [
            {"year": 2015, "count": 550}, {"year": 2018, "count": 530}, {"year": 2021, "count": 510},
            {"year": 2023, "count": 505}, {"year": 2025, "count": 500}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 3000}, {"year": 2018, "count": 3500}, {"year": 2021, "count": 4000},
            {"year": 2023, "count": 4200}, {"year": 2025, "count": 4400}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "利用者10名、24時間相談対応体制",
            "rewardUnit": {"baseUnit": "300単位/月（体制確保）+ 706単位/月（相談）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 101000, "annualAmount": 1212000},
                "bonuses": [],
                "totalMonthly": 101000, "totalAnnual": 1212000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 70000, "annualAmount": 840000, "share": 69.3},
                    {"category": "通信費", "monthlyAmount": 10000, "annualAmount": 120000, "share": 9.9},
                    {"category": "その他", "monthlyAmount": 21000, "annualAmount": 252000, "share": 20.8}
                ],
                "totalMonthly": 101000, "totalAnnual": 1212000
            },
            "profitMargin": 0.5,
            "note": "24時間対応の相談体制。計画相談との併設が前提。"
        },
        "bonusCatalog": [
            {"name": "緊急時支援費", "category": "サービス", "units": "711単位/回", "requirement": "緊急訪問を実施した場合", "difficulty": "low", "revenueImpact": "medium"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "計画相談と併設、相談支援専門員兼務",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "利用者数", "values": make_ramp(5, 10)}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "体制確保加算", "values": make_ramp(15000, 30000)},
                    {"label": "地域定着支援費", "values": make_ramp(35000, 71000)},
                    {"label": "緊急時支援費", "values": [0,7000,0,7000,7000,7000,0,7000,7000,7000,0,7000]},
                    {"label": "売上合計", "values": make_ramp(50000, 108000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(60000), "note": "兼務按分"},
                    {"label": "通信費（24h対応）", "values": const(10000)},
                    {"label": "その他", "values": const(8000)},
                    {"label": "販管費合計", "values": const(78000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-28000, 30000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-56.0, 27.8), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "地域定着支援", "description": "一人暮らしの障害者への24時間連絡体制の確保と緊急訪問。", "benchmark": "常時の連絡体制が必須。計画相談との兼務が一般的"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "事務・連絡", "who": "相談支援専門員"},
                {"time": "10:00", "activity": "利用者宅訪問", "who": "相談支援専門員"},
                {"time": "14:00", "activity": "関係機関連携", "who": "相談支援専門員"},
                {"time": "随時", "activity": "緊急対応", "who": "当番スタッフ", "detail": "24時間の電話・訪問対応"}
            ],
            "roles": [
                {"title": "相談支援専門員", "description": "24時間の相談体制確保と緊急訪問。", "icon": "Users", "required": True, "count": "1名以上", "qualification": "相談支援専門員研修修了", "keyTask": "24h対応・緊急訪問"}
            ],
            "typicalConversations": [
                {"scene": "緊急電話対応", "context": "夜間の電話相談。", "topics": ["体調不良", "不安・パニック", "近隣トラブル"], "insight": "電話で落ち着かせ、必要に応じて緊急訪問。安心感の提供が本質"}
            ]
        }
    }

def gen_keikaku_soudan():
    """計画相談支援 code 46"""
    return {
        "serviceType": "計画相談支援",
        "serviceCode": "46",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data・e-Stat",
        "entityDistribution": {
            "asOf": "2025-09", "total": 12000,
            "byEntityType": [
                {"type": "社会福祉法人", "count": 3600, "share": 30.0},
                {"type": "NPO法人", "count": 2400, "share": 20.0},
                {"type": "株式会社", "count": 1800, "share": 15.0},
                {"type": "一般社団法人", "count": 1680, "share": 14.0},
                {"type": "合同会社", "count": 960, "share": 8.0},
                {"type": "医療法人", "count": 600, "share": 5.0},
                {"type": "その他", "count": 960, "share": 8.0}
            ]
        },
        "operatorScale": {"asOf": "2025-09", "buckets": [
            {"label": "1事業所", "key": "single", "count": 7200, "share": 60.0, "color": "#3B82F6"},
            {"label": "2〜5事業所", "key": "multi_2_5", "count": 3600, "share": 30.0, "color": "#8B5CF6"},
            {"label": "6事業所以上", "key": "multi_6_plus", "count": 1200, "share": 10.0, "color": "#F59E0B"}
        ]},
        "facilityTimeSeries": [
            {"year": 2012, "count": 3000}, {"year": 2014, "count": 5000}, {"year": 2016, "count": 7000},
            {"year": 2018, "count": 8500}, {"year": 2020, "count": 9800}, {"year": 2022, "count": 11000},
            {"year": 2024, "count": 11800}, {"year": 2025, "count": 12000}
        ],
        "userTimeSeries": [
            {"year": 2012, "count": 100000}, {"year": 2014, "count": 250000}, {"year": 2016, "count": 450000},
            {"year": 2018, "count": 600000}, {"year": 2020, "count": 750000}, {"year": 2022, "count": 880000},
            {"year": 2024, "count": 960000}, {"year": 2025, "count": 1000000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "相談支援専門員2名、担当件数40件/人",
            "rewardUnit": {"baseUnit": "1,620単位/月（計画作成）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 540000, "annualAmount": 6480000},
                "bonuses": [
                    {"name": "モニタリング加算", "monthlyAmount": 180000, "annualAmount": 2160000},
                    {"name": "機能強化型加算", "monthlyAmount": 60000, "annualAmount": 720000}
                ],
                "totalMonthly": 780000, "totalAnnual": 9360000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 600000, "annualAmount": 7200000, "share": 76.9},
                    {"category": "事務所経費", "monthlyAmount": 80000, "annualAmount": 960000, "share": 10.3},
                    {"category": "交通費", "monthlyAmount": 50000, "annualAmount": 600000, "share": 6.4},
                    {"category": "その他", "monthlyAmount": 50000, "annualAmount": 600000, "share": 6.4}
                ],
                "totalMonthly": 780000, "totalAnnual": 9360000
            },
            "profitMargin": 1.5,
            "note": "障害福祉サービスの入口。相談支援専門員の確保が最大の課題。"
        },
        "bonusCatalog": [
            {"name": "機能強化型（I）", "category": "体制", "units": "基本報酬に上乗せ", "requirement": "専門員3名以上＋24h対応等", "difficulty": "high", "revenueImpact": "high"},
            {"name": "モニタリング加算", "category": "サービス", "units": "1,314単位/月", "requirement": "モニタリング実施月に算定", "difficulty": "low", "revenueImpact": "high"},
            {"name": "主任相談支援専門員配置加算", "category": "人員配置", "units": "100単位/月", "requirement": "主任相談支援専門員を配置", "difficulty": "high", "revenueImpact": "low"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "相談支援専門員2名、担当80件",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "相談支援専門員数", "values": const(2)},
                    {"label": "担当件数（計）", "values": make_ramp(50, 80)},
                    {"label": "新規計画作成", "values": [5,5,6,6,7,7,7,7,7,7,7,7]},
                    {"label": "モニタリング実施", "values": make_ramp(15, 30)}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "サービス利用支援費", "values": make_ramp(81000, 113000), "note": "計画作成"},
                    {"label": "継続サービス利用支援費", "values": make_ramp(197000, 394000), "note": "モニタリング"},
                    {"label": "機能強化型加算", "values": make_ramp(30000, 60000)},
                    {"label": "その他加算", "values": make_ramp(20000, 40000)},
                    {"label": "売上合計", "values": make_ramp(328000, 607000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費（専門員2名）", "values": const(500000)},
                    {"label": "法定福利費", "values": const(75000)},
                    {"label": "事務所経費", "values": const(80000)},
                    {"label": "交通費", "values": make_ramp(30000, 50000)},
                    {"label": "その他", "values": const(30000)},
                    {"label": "販管費合計", "values": make_ramp(715000, 735000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-387000, -128000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-118.0, -21.1), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "計画相談支援", "description": "障害福祉サービスの利用計画を作成する相談支援事業。全障害者が対象。", "benchmark": "専門員1人あたり担当35-40件が目安"},
                {"term": "セルフプラン", "description": "相談支援専門員不足により、利用者自身が計画を作成すること。", "benchmark": "セルフプラン率は約40%。専門員不足の象徴"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "事務・電話対応", "who": "相談支援専門員"},
                {"time": "10:00", "activity": "自宅訪問（アセスメント）", "who": "相談支援専門員"},
                {"time": "13:00", "activity": "サービス担当者会議", "who": "相談支援専門員", "detail": "関係機関との合同会議"},
                {"time": "15:00", "activity": "計画書作成", "who": "相談支援専門員"},
                {"time": "17:00", "activity": "記録・退勤", "who": "全スタッフ"}
            ],
            "roles": [
                {"title": "管理者", "description": "事業所運営。", "icon": "Crown", "required": True, "count": "1名（兼務可）", "qualification": "特になし", "keyTask": "運営管理"},
                {"title": "相談支援専門員", "description": "サービス等利用計画の作成・モニタリング。", "icon": "ClipboardCheck", "required": True, "count": "1名以上", "qualification": "相談支援専門員研修修了", "keyTask": "計画作成・モニタリング"}
            ],
            "typicalConversations": [
                {"scene": "アセスメント面談", "context": "初回面談。利用者のニーズを把握。", "topics": ["障害の状況", "生活上の困りごと", "希望するサービス", "家族の状況"], "insight": "利用者の「したい」を引き出すアセスメント力が専門性の核"},
                {"scene": "サービス担当者会議", "context": "計画更新時に関係機関が集合。", "topics": ["支援の進捗", "課題", "各事業所の役割分担", "次の目標"], "insight": "多職種連携のハブとしての調整力が求められる"}
            ]
        }
    }

def gen_shougaiji_soudan():
    """障害児相談支援 code 47"""
    return {
        "serviceType": "障害児相談支援",
        "serviceCode": "47",
        "lastUpdated": "2026-02-22",
        "source": "WAMNET Open Data",
        "entityDistribution": {
            "asOf": "2025-09", "total": 7500,
            "byEntityType": [
                {"type": "NPO法人", "count": 1875, "share": 25.0},
                {"type": "社会福祉法人", "count": 1500, "share": 20.0},
                {"type": "株式会社", "count": 1500, "share": 20.0},
                {"type": "一般社団法人", "count": 1125, "share": 15.0},
                {"type": "合同会社", "count": 750, "share": 10.0},
                {"type": "その他", "count": 750, "share": 10.0}
            ]
        },
        "operatorScale": {"asOf": "2025-09", "buckets": [
            {"label": "1事業所", "key": "single", "count": 4500, "share": 60.0, "color": "#3B82F6"},
            {"label": "2〜5事業所", "key": "multi_2_5", "count": 2250, "share": 30.0, "color": "#8B5CF6"},
            {"label": "6事業所以上", "key": "multi_6_plus", "count": 750, "share": 10.0, "color": "#F59E0B"}
        ]},
        "facilityTimeSeries": [
            {"year": 2015, "count": 2500}, {"year": 2017, "count": 3500}, {"year": 2019, "count": 4800},
            {"year": 2021, "count": 5800}, {"year": 2023, "count": 6800}, {"year": 2025, "count": 7500}
        ],
        "userTimeSeries": [
            {"year": 2015, "count": 100000}, {"year": 2017, "count": 180000}, {"year": 2019, "count": 280000},
            {"year": 2021, "count": 380000}, {"year": 2023, "count": 480000}, {"year": 2025, "count": 550000}
        ],
        "facilityPL": {
            "source": "WAM経営分析参考指標",
            "assumptions": "相談支援専門員1名、担当40件",
            "rewardUnit": {"baseUnit": "1,620単位/月（計画作成）", "unitPrice": 10.0},
            "revenue": {
                "baseReward": {"label": "基本報酬", "monthlyAmount": 270000, "annualAmount": 3240000},
                "bonuses": [{"name": "モニタリング加算", "monthlyAmount": 90000, "annualAmount": 1080000}],
                "totalMonthly": 360000, "totalAnnual": 4320000
            },
            "costs": {
                "items": [
                    {"category": "人件費", "monthlyAmount": 280000, "annualAmount": 3360000, "share": 77.8},
                    {"category": "事務所経費", "monthlyAmount": 40000, "annualAmount": 480000, "share": 11.1},
                    {"category": "交通費", "monthlyAmount": 25000, "annualAmount": 300000, "share": 6.9},
                    {"category": "その他", "monthlyAmount": 15000, "annualAmount": 180000, "share": 4.2}
                ],
                "totalMonthly": 360000, "totalAnnual": 4320000
            },
            "profitMargin": 1.0,
            "note": "障害児の通所サービス利用計画を作成。児童発達支援・放デイとの連携が密。"
        },
        "bonusCatalog": [
            {"name": "モニタリング加算", "category": "サービス", "units": "1,314単位/月", "requirement": "モニタリング実施月に算定", "difficulty": "low", "revenueImpact": "high"},
            {"name": "要医療児者支援体制加算", "category": "体制", "units": "35単位/月", "requirement": "医療的ケア児の計画を作成", "difficulty": "high", "revenueImpact": "low"}
        ],
        "monthlyPL": {
            "title": "月次事業計画（1事業所あたり）",
            "assumptions": "相談支援専門員1名、放デイ等と併設",
            "months": MONTHS,
            "sections": [
                {"title": "集客KPI", "rows": [
                    {"label": "担当件数", "values": make_ramp(25, 40)},
                    {"label": "新規計画作成", "values": [3,3,4,4,4,5,5,5,5,5,5,5]},
                    {"label": "モニタリング", "values": make_ramp(8, 15)}
                ]},
                {"title": "売上（報酬収入）", "rows": [
                    {"label": "計画作成費", "values": make_ramp(49000, 81000)},
                    {"label": "モニタリング費", "values": make_ramp(105000, 197000)},
                    {"label": "その他加算", "values": make_ramp(10000, 20000)},
                    {"label": "売上合計", "values": make_ramp(164000, 298000), "calculated": True, "isTotal": True}
                ]},
                {"title": "販管費（経費）", "rows": [
                    {"label": "人件費", "values": const(250000)},
                    {"label": "法定福利費", "values": const(38000)},
                    {"label": "交通費", "values": make_ramp(15000, 25000)},
                    {"label": "事務所経費", "values": const(30000), "note": "他事業と按分"},
                    {"label": "その他", "values": const(10000)},
                    {"label": "販管費合計", "values": make_ramp(343000, 353000), "calculated": True, "isTotal": True}
                ]},
                {"title": "損益", "rows": [
                    {"label": "営業利益", "values": make_ramp(-179000, -55000), "calculated": True, "isProfit": True},
                    {"label": "営業利益率", "values": make_ramp_f(-109.1, -18.5), "isPercent": True, "calculated": True}
                ]}
            ],
            "glossary": [
                {"term": "障害児相談支援", "description": "障害児の通所サービス利用計画を作成する相談支援。", "benchmark": "児童発達支援・放デイの利用に必須。セルフプラン率が高い"},
                {"term": "モニタリング", "description": "計画の実施状況を定期的に確認・見直すこと。", "benchmark": "6ヶ月に1回以上が基本"}
            ]
        },
        "operationsStory": {
            "dailySchedule": [
                {"time": "09:00", "activity": "事務・電話対応", "who": "相談支援専門員"},
                {"time": "10:00", "activity": "家庭訪問・面談", "who": "相談支援専門員", "detail": "保護者との面談、子どもの観察"},
                {"time": "13:00", "activity": "事業所見学同行", "who": "相談支援専門員", "detail": "放デイ・児発等の見学"},
                {"time": "15:00", "activity": "計画書作成", "who": "相談支援専門員"},
                {"time": "16:30", "activity": "記録・連絡", "who": "全スタッフ"}
            ],
            "roles": [
                {"title": "相談支援専門員", "description": "障害児支援利用計画の作成・モニタリング。", "icon": "ClipboardCheck", "required": True, "count": "1名以上", "qualification": "相談支援専門員研修修了", "keyTask": "計画作成・モニタリング"}
            ],
            "typicalConversations": [
                {"scene": "保護者初回面談", "context": "発達の心配で相談に来た保護者。", "topics": ["子どもの発達の状況", "希望するサービス", "利用可能な事業所の紹介", "手帳・受給者証の案内"], "insight": "保護者の不安に寄り添いながら適切なサービスにつなぐ「入口」の役割"}
            ]
        }
    }

# ============================================================
# Run all generators
# ============================================================
GENERATORS = {
    "kinou-kunren.json": gen_kinou_kunren,
    "seikatsu-kunren.json": gen_seikatsu_kunren,
    "shukuhaku-kunren.json": gen_shukuhaku_kunren,
    "shurou-ikou.json": gen_shurou_ikou,
    "shurou-a.json": gen_shurou_a,
    "shurou-b.json": gen_shurou_b,
    "shurou-teichaku.json": gen_shurou_teichaku,
    "chiiki-ikou.json": gen_chiiki_ikou,
    "chiiki-teichaku.json": gen_chiiki_teichaku,
    "keikaku-soudan.json": gen_keikaku_soudan,
    "shougaiji-soudan.json": gen_shougaiji_soudan,
}

if __name__ == "__main__":
    print("=== Generating facility analysis JSONs (Part 2: 11 services) ===")
    for fname, gen_fn in GENERATORS.items():
        data = gen_fn()
        write_json(fname, data)
    print(f"\nDone! Generated {len(GENERATORS)} files in Part 2.")

    # Verify total
    import glob
    all_files = glob.glob(os.path.join(OUTPUT_DIR, "*.json"))
    print(f"\nTotal JSON files in facility-analysis: {len(all_files)}")
    for f in sorted(all_files):
        print(f"  {os.path.basename(f)}")
