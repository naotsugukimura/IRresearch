"""
全28社のデータ一括生成スクリプト

既存5社（LITALICO, Welbe, Cocoruport, S-Pool, SMS）はスキップし、
残り23社について以下を生成する:
1. companies.json にセグメント定義を追加
2. financials.json に財務データ（推計）を追加
3. business-plans.json にconsolidated PLを追加

各社のビジネスモデル・公開情報に基づいた推計値を使用。
"""

import json
import copy
from config import DATA_DIR, COMPANIES_PATH, FINANCIALS_PATH, BUSINESS_PLANS_PATH

EXISTING_COMPANIES = {"litalico", "welbe", "cocoruport", "spool", "sms"}

# ============================================================
# 23社のセグメント定義
# ============================================================
SEGMENT_DEFINITIONS = {
    "persol": [
        {"name": "人材派遣", "revenueShare": 55},
        {"name": "障害者雇用支援", "revenueShare": 15},
        {"name": "人材紹介", "revenueShare": 30},
    ],
    "pasona": [
        {"name": "人材派遣", "revenueShare": 60},
        {"name": "障害者雇用支援", "revenueShare": 10},
        {"name": "人材紹介", "revenueShare": 30},
    ],
    "copel": [
        {"name": "児童発達支援", "revenueShare": 60},
        {"name": "放課後等デイサービス", "revenueShare": 40},
    ],
    "startline": [
        {"name": "障害者雇用コンサルティング", "revenueShare": 60},
        {"name": "サテライトオフィス", "revenueShare": 40},
    ],
    "nd_software": [
        {"name": "介護ソフト", "revenueShare": 55},
        {"name": "障害福祉ソフト", "revenueShare": 35},
        {"name": "クラウドサービス", "revenueShare": 10},
    ],
    "kanamic": [
        {"name": "介護クラウド", "revenueShare": 60},
        {"name": "多職種連携システム", "revenueShare": 25},
        {"name": "障害福祉システム", "revenueShare": 15},
    ],
    "wiseman": [
        {"name": "介護ソフト", "revenueShare": 55},
        {"name": "障害福祉ソフト", "revenueShare": 35},
        {"name": "保守・サポート", "revenueShare": 10},
    ],
    "hug": [
        {"name": "放デイ向けSaaS", "revenueShare": 80},
        {"name": "保守・サポート", "revenueShare": 20},
    ],
    "knowbe": [
        {"name": "就労支援向けSaaS", "revenueShare": 85},
        {"name": "保守・サポート", "revenueShare": 15},
    ],
    "zyras": [
        {"name": "障害福祉ソフト", "revenueShare": 75},
        {"name": "保守・サポート", "revenueShare": 25},
    ],
    "sorust": [
        {"name": "医療事務受託", "revenueShare": 40},
        {"name": "介護サービス", "revenueShare": 40},
        {"name": "障害福祉サービス", "revenueShare": 20},
    ],
    "care21": [
        {"name": "介護サービス", "revenueShare": 70},
        {"name": "障害福祉サービス", "revenueShare": 30},
    ],
    "saint_care": [
        {"name": "訪問介護", "revenueShare": 45},
        {"name": "訪問看護", "revenueShare": 35},
        {"name": "障害福祉サービス", "revenueShare": 20},
    ],
    "unimat": [
        {"name": "介護施設", "revenueShare": 75},
        {"name": "障害者グループホーム", "revenueShare": 25},
    ],
    "kaien": [
        {"name": "就労移行支援", "revenueShare": 65},
        {"name": "自立訓練", "revenueShare": 20},
        {"name": "障害者雇用コンサルティング", "revenueShare": 15},
    ],
    "decoboco": [
        {"name": "児童発達支援FC", "revenueShare": 55},
        {"name": "放課後等デイサービスFC", "revenueShare": 45},
    ],
    "atgp": [
        {"name": "求人プラットフォーム", "revenueShare": 50},
        {"name": "就労移行支援", "revenueShare": 30},
        {"name": "人材紹介", "revenueShare": 20},
    ],
    "manpower": [
        {"name": "人材派遣", "revenueShare": 60},
        {"name": "障害者人材紹介", "revenueShare": 20},
        {"name": "就労支援", "revenueShare": 20},
    ],
    "special_learning": [
        {"name": "eラーニング", "revenueShare": 70},
        {"name": "研修サービス", "revenueShare": 30},
    ],
    "medley": [
        {"name": "人材紹介", "revenueShare": 60},
        {"name": "メディア", "revenueShare": 15},
        {"name": "SaaS", "revenueShare": 25},
    ],
    "visional": [
        {"name": "HR Tech", "revenueShare": 80},
        {"name": "SaaS", "revenueShare": 20},
    ],
    "recruit": [
        {"name": "人材紹介", "revenueShare": 40},
        {"name": "メディア", "revenueShare": 35},
        {"name": "SaaS", "revenueShare": 25},
    ],
    "layerx": [
        {"name": "SaaS", "revenueShare": 85},
        {"name": "AI-OCR", "revenueShare": 15},
    ],
}

# ============================================================
# 23社の推計財務データ（百万円単位）
# 各社の公開情報・規模感に基づく推計
# ============================================================
FINANCIAL_DATA = {
    "persol": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 940000, "operatingProfit": 37000, "netIncome": 23000, "operatingMargin": 3.9, "employees": 60000, "segments": [{"name": "人材派遣", "revenue": 517000, "profit": 15500}, {"name": "障害者雇用支援", "revenue": 141000, "profit": 8500}, {"name": "人材紹介", "revenue": 282000, "profit": 13000}]},
            {"year": "2022年3月期", "revenue": 1060000, "operatingProfit": 47000, "netIncome": 29000, "operatingMargin": 4.4, "employees": 62000, "segments": [{"name": "人材派遣", "revenue": 583000, "profit": 19000}, {"name": "障害者雇用支援", "revenue": 159000, "profit": 11000}, {"name": "人材紹介", "revenue": 318000, "profit": 17000}]},
            {"year": "2023年3月期", "revenue": 1130000, "operatingProfit": 52000, "netIncome": 32000, "operatingMargin": 4.6, "employees": 65000, "segments": [{"name": "人材派遣", "revenue": 621500, "profit": 21000}, {"name": "障害者雇用支援", "revenue": 169500, "profit": 12500}, {"name": "人材紹介", "revenue": 339000, "profit": 18500}]},
            {"year": "2024年3月期", "revenue": 1230000, "operatingProfit": 60000, "netIncome": 37000, "operatingMargin": 4.9, "employees": 68000, "segments": [{"name": "人材派遣", "revenue": 676500, "profit": 24000}, {"name": "障害者雇用支援", "revenue": 184500, "profit": 15000}, {"name": "人材紹介", "revenue": 369000, "profit": 21000}]},
            {"year": "2025年3月期", "revenue": 1300000, "operatingProfit": 65000, "netIncome": 40000, "operatingMargin": 5.0, "employees": 70000, "segments": [{"name": "人材派遣", "revenue": 715000, "profit": 26000}, {"name": "障害者雇用支援", "revenue": 195000, "profit": 16500}, {"name": "人材紹介", "revenue": 390000, "profit": 22500}]},
        ]
    },
    "pasona": {
        "fiscalYears": [
            {"year": "2021年5月期", "revenue": 335000, "operatingProfit": 18000, "netIncome": 11000, "operatingMargin": 5.4, "employees": 22000, "segments": [{"name": "人材派遣", "revenue": 201000, "profit": 8000}, {"name": "障害者雇用支援", "revenue": 33500, "profit": 3000}, {"name": "人材紹介", "revenue": 100500, "profit": 7000}]},
            {"year": "2022年5月期", "revenue": 350000, "operatingProfit": 20000, "netIncome": 12000, "operatingMargin": 5.7, "employees": 23000, "segments": [{"name": "人材派遣", "revenue": 210000, "profit": 9000}, {"name": "障害者雇用支援", "revenue": 35000, "profit": 3500}, {"name": "人材紹介", "revenue": 105000, "profit": 7500}]},
            {"year": "2023年5月期", "revenue": 368000, "operatingProfit": 22000, "netIncome": 13500, "operatingMargin": 6.0, "employees": 24000, "segments": [{"name": "人材派遣", "revenue": 220800, "profit": 10000}, {"name": "障害者雇用支援", "revenue": 36800, "profit": 4000}, {"name": "人材紹介", "revenue": 110400, "profit": 8000}]},
            {"year": "2024年5月期", "revenue": 385000, "operatingProfit": 25000, "netIncome": 15000, "operatingMargin": 6.5, "employees": 25000, "segments": [{"name": "人材派遣", "revenue": 231000, "profit": 11500}, {"name": "障害者雇用支援", "revenue": 38500, "profit": 4500}, {"name": "人材紹介", "revenue": 115500, "profit": 9000}]},
            {"year": "2025年5月期", "revenue": 400000, "operatingProfit": 28000, "netIncome": 17000, "operatingMargin": 7.0, "employees": 26000, "segments": [{"name": "人材派遣", "revenue": 240000, "profit": 13000}, {"name": "障害者雇用支援", "revenue": 40000, "profit": 5000}, {"name": "人材紹介", "revenue": 120000, "profit": 10000}]},
        ]
    },
    "copel": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 3200, "operatingProfit": 320, "netIncome": 200, "operatingMargin": 10.0, "employees": 450, "facilities": 120, "segments": [{"name": "児童発達支援", "revenue": 1920, "profit": 210}, {"name": "放課後等デイサービス", "revenue": 1280, "profit": 110}]},
            {"year": "2022年3月期", "revenue": 3800, "operatingProfit": 400, "netIncome": 250, "operatingMargin": 10.5, "employees": 520, "facilities": 140, "segments": [{"name": "児童発達支援", "revenue": 2280, "profit": 260}, {"name": "放課後等デイサービス", "revenue": 1520, "profit": 140}]},
            {"year": "2023年3月期", "revenue": 4500, "operatingProfit": 500, "netIncome": 310, "operatingMargin": 11.1, "employees": 600, "facilities": 165, "segments": [{"name": "児童発達支援", "revenue": 2700, "profit": 320}, {"name": "放課後等デイサービス", "revenue": 1800, "profit": 180}]},
            {"year": "2024年3月期", "revenue": 5200, "operatingProfit": 600, "netIncome": 370, "operatingMargin": 11.5, "employees": 680, "facilities": 190, "segments": [{"name": "児童発達支援", "revenue": 3120, "profit": 390}, {"name": "放課後等デイサービス", "revenue": 2080, "profit": 210}]},
            {"year": "2025年3月期", "revenue": 6000, "operatingProfit": 720, "netIncome": 440, "operatingMargin": 12.0, "employees": 760, "facilities": 215, "segments": [{"name": "児童発達支援", "revenue": 3600, "profit": 460}, {"name": "放課後等デイサービス", "revenue": 2400, "profit": 260}]},
        ]
    },
    "startline": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 2500, "operatingProfit": 200, "netIncome": 120, "operatingMargin": 8.0, "employees": 300},
            {"year": "2022年3月期", "revenue": 3200, "operatingProfit": 280, "netIncome": 170, "operatingMargin": 8.8, "employees": 380},
            {"year": "2023年3月期", "revenue": 4000, "operatingProfit": 380, "netIncome": 230, "operatingMargin": 9.5, "employees": 450},
            {"year": "2024年3月期", "revenue": 4800, "operatingProfit": 480, "netIncome": 290, "operatingMargin": 10.0, "employees": 520},
            {"year": "2025年3月期", "revenue": 5500, "operatingProfit": 580, "netIncome": 350, "operatingMargin": 10.5, "employees": 580},
        ]
    },
    "nd_software": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 8500, "operatingProfit": 1100, "netIncome": 700, "operatingMargin": 12.9, "employees": 700, "segments": [{"name": "介護ソフト", "revenue": 4675, "profit": 650}, {"name": "障害福祉ソフト", "revenue": 2975, "profit": 350}, {"name": "クラウドサービス", "revenue": 850, "profit": 100}]},
            {"year": "2022年3月期", "revenue": 9200, "operatingProfit": 1250, "netIncome": 800, "operatingMargin": 13.6, "employees": 750, "segments": [{"name": "介護ソフト", "revenue": 5060, "profit": 730}, {"name": "障害福祉ソフト", "revenue": 3220, "profit": 400}, {"name": "クラウドサービス", "revenue": 920, "profit": 120}]},
            {"year": "2023年3月期", "revenue": 10000, "operatingProfit": 1400, "netIncome": 900, "operatingMargin": 14.0, "employees": 800, "segments": [{"name": "介護ソフト", "revenue": 5500, "profit": 820}, {"name": "障害福祉ソフト", "revenue": 3500, "profit": 450}, {"name": "クラウドサービス", "revenue": 1000, "profit": 130}]},
            {"year": "2024年3月期", "revenue": 10800, "operatingProfit": 1550, "netIncome": 1000, "operatingMargin": 14.4, "employees": 850, "segments": [{"name": "介護ソフト", "revenue": 5940, "profit": 900}, {"name": "障害福祉ソフト", "revenue": 3780, "profit": 500}, {"name": "クラウドサービス", "revenue": 1080, "profit": 150}]},
            {"year": "2025年3月期", "revenue": 11500, "operatingProfit": 1700, "netIncome": 1100, "operatingMargin": 14.8, "employees": 900, "segments": [{"name": "介護ソフト", "revenue": 6325, "profit": 980}, {"name": "障害福祉ソフト", "revenue": 4025, "profit": 560}, {"name": "クラウドサービス", "revenue": 1150, "profit": 160}]},
        ]
    },
    "kanamic": {
        "fiscalYears": [
            {"year": "2021年9月期", "revenue": 3000, "operatingProfit": 500, "netIncome": 330, "operatingMargin": 16.7, "employees": 200},
            {"year": "2022年9月期", "revenue": 3400, "operatingProfit": 600, "netIncome": 400, "operatingMargin": 17.6, "employees": 220},
            {"year": "2023年9月期", "revenue": 3800, "operatingProfit": 700, "netIncome": 460, "operatingMargin": 18.4, "employees": 240},
            {"year": "2024年9月期", "revenue": 4200, "operatingProfit": 800, "netIncome": 530, "operatingMargin": 19.0, "employees": 260},
            {"year": "2025年9月期", "revenue": 4600, "operatingProfit": 900, "netIncome": 600, "operatingMargin": 19.6, "employees": 280},
        ]
    },
    "wiseman": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 12000, "operatingProfit": 1800, "netIncome": 1100, "operatingMargin": 15.0, "employees": 1200},
            {"year": "2022年3月期", "revenue": 12500, "operatingProfit": 1900, "netIncome": 1200, "operatingMargin": 15.2, "employees": 1250},
            {"year": "2023年3月期", "revenue": 13000, "operatingProfit": 2000, "netIncome": 1300, "operatingMargin": 15.4, "employees": 1300},
            {"year": "2024年3月期", "revenue": 13500, "operatingProfit": 2100, "netIncome": 1350, "operatingMargin": 15.6, "employees": 1350},
            {"year": "2025年3月期", "revenue": 14000, "operatingProfit": 2200, "netIncome": 1400, "operatingMargin": 15.7, "employees": 1400},
        ]
    },
    "hug": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 800, "operatingProfit": 80, "netIncome": 50, "operatingMargin": 10.0, "employees": 60},
            {"year": "2022年3月期", "revenue": 1000, "operatingProfit": 110, "netIncome": 70, "operatingMargin": 11.0, "employees": 70},
            {"year": "2023年3月期", "revenue": 1250, "operatingProfit": 150, "netIncome": 95, "operatingMargin": 12.0, "employees": 85},
            {"year": "2024年3月期", "revenue": 1500, "operatingProfit": 200, "netIncome": 125, "operatingMargin": 13.3, "employees": 100},
            {"year": "2025年3月期", "revenue": 1800, "operatingProfit": 260, "netIncome": 165, "operatingMargin": 14.4, "employees": 115},
        ]
    },
    "knowbe": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 500, "operatingProfit": 30, "netIncome": 18, "operatingMargin": 6.0, "employees": 40},
            {"year": "2022年3月期", "revenue": 700, "operatingProfit": 50, "netIncome": 30, "operatingMargin": 7.1, "employees": 50},
            {"year": "2023年3月期", "revenue": 950, "operatingProfit": 80, "netIncome": 50, "operatingMargin": 8.4, "employees": 65},
            {"year": "2024年3月期", "revenue": 1200, "operatingProfit": 120, "netIncome": 75, "operatingMargin": 10.0, "employees": 80},
            {"year": "2025年3月期", "revenue": 1500, "operatingProfit": 170, "netIncome": 105, "operatingMargin": 11.3, "employees": 95},
        ]
    },
    "zyras": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 600, "operatingProfit": 50, "netIncome": 30, "operatingMargin": 8.3, "employees": 50},
            {"year": "2022年3月期", "revenue": 700, "operatingProfit": 60, "netIncome": 38, "operatingMargin": 8.6, "employees": 55},
            {"year": "2023年3月期", "revenue": 800, "operatingProfit": 75, "netIncome": 47, "operatingMargin": 9.4, "employees": 60},
            {"year": "2024年3月期", "revenue": 900, "operatingProfit": 90, "netIncome": 56, "operatingMargin": 10.0, "employees": 65},
            {"year": "2025年3月期", "revenue": 1000, "operatingProfit": 110, "netIncome": 68, "operatingMargin": 11.0, "employees": 70},
        ]
    },
    "sorust": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 95000, "operatingProfit": 5700, "netIncome": 3500, "operatingMargin": 6.0, "employees": 28000, "segments": [{"name": "医療事務受託", "revenue": 38000, "profit": 2800}, {"name": "介護サービス", "revenue": 38000, "profit": 2100}, {"name": "障害福祉サービス", "revenue": 19000, "profit": 800}]},
            {"year": "2022年3月期", "revenue": 105000, "operatingProfit": 6800, "netIncome": 4200, "operatingMargin": 6.5, "employees": 30000, "segments": [{"name": "医療事務受託", "revenue": 42000, "profit": 3200}, {"name": "介護サービス", "revenue": 42000, "profit": 2500}, {"name": "障害福祉サービス", "revenue": 21000, "profit": 1100}]},
            {"year": "2023年3月期", "revenue": 115000, "operatingProfit": 8000, "netIncome": 5000, "operatingMargin": 7.0, "employees": 32000, "segments": [{"name": "医療事務受託", "revenue": 46000, "profit": 3600}, {"name": "介護サービス", "revenue": 46000, "profit": 3000}, {"name": "障害福祉サービス", "revenue": 23000, "profit": 1400}]},
            {"year": "2024年3月期", "revenue": 125000, "operatingProfit": 9400, "netIncome": 5800, "operatingMargin": 7.5, "employees": 34000, "segments": [{"name": "医療事務受託", "revenue": 50000, "profit": 4200}, {"name": "介護サービス", "revenue": 50000, "profit": 3500}, {"name": "障害福祉サービス", "revenue": 25000, "profit": 1700}]},
            {"year": "2025年3月期", "revenue": 135000, "operatingProfit": 10800, "netIncome": 6700, "operatingMargin": 8.0, "employees": 36000, "segments": [{"name": "医療事務受託", "revenue": 54000, "profit": 4800}, {"name": "介護サービス", "revenue": 54000, "profit": 4000}, {"name": "障害福祉サービス", "revenue": 27000, "profit": 2000}]},
        ]
    },
    "care21": {
        "fiscalYears": [
            {"year": "2021年10月期", "revenue": 22000, "operatingProfit": 880, "netIncome": 540, "operatingMargin": 4.0, "employees": 5500, "segments": [{"name": "介護サービス", "revenue": 15400, "profit": 650}, {"name": "障害福祉サービス", "revenue": 6600, "profit": 230}]},
            {"year": "2022年10月期", "revenue": 23500, "operatingProfit": 1000, "netIncome": 620, "operatingMargin": 4.3, "employees": 5800, "segments": [{"name": "介護サービス", "revenue": 16450, "profit": 740}, {"name": "障害福祉サービス", "revenue": 7050, "profit": 260}]},
            {"year": "2023年10月期", "revenue": 25000, "operatingProfit": 1150, "netIncome": 710, "operatingMargin": 4.6, "employees": 6100, "segments": [{"name": "介護サービス", "revenue": 17500, "profit": 850}, {"name": "障害福祉サービス", "revenue": 7500, "profit": 300}]},
            {"year": "2024年10月期", "revenue": 26500, "operatingProfit": 1300, "netIncome": 800, "operatingMargin": 4.9, "employees": 6400, "segments": [{"name": "介護サービス", "revenue": 18550, "profit": 960}, {"name": "障害福祉サービス", "revenue": 7950, "profit": 340}]},
            {"year": "2025年10月期", "revenue": 28000, "operatingProfit": 1450, "netIncome": 900, "operatingMargin": 5.2, "employees": 6700, "segments": [{"name": "介護サービス", "revenue": 19600, "profit": 1080}, {"name": "障害福祉サービス", "revenue": 8400, "profit": 370}]},
        ]
    },
    "saint_care": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 45000, "operatingProfit": 2700, "netIncome": 1700, "operatingMargin": 6.0, "employees": 12000, "segments": [{"name": "訪問介護", "revenue": 20250, "profit": 1350}, {"name": "訪問看護", "revenue": 15750, "profit": 950}, {"name": "障害福祉サービス", "revenue": 9000, "profit": 400}]},
            {"year": "2022年3月期", "revenue": 47000, "operatingProfit": 2900, "netIncome": 1800, "operatingMargin": 6.2, "employees": 12500, "segments": [{"name": "訪問介護", "revenue": 21150, "profit": 1450}, {"name": "訪問看護", "revenue": 16450, "profit": 1020}, {"name": "障害福祉サービス", "revenue": 9400, "profit": 430}]},
            {"year": "2023年3月期", "revenue": 49000, "operatingProfit": 3100, "netIncome": 1950, "operatingMargin": 6.3, "employees": 13000, "segments": [{"name": "訪問介護", "revenue": 22050, "profit": 1550}, {"name": "訪問看護", "revenue": 17150, "profit": 1090}, {"name": "障害福祉サービス", "revenue": 9800, "profit": 460}]},
            {"year": "2024年3月期", "revenue": 51000, "operatingProfit": 3400, "netIncome": 2100, "operatingMargin": 6.7, "employees": 13500, "segments": [{"name": "訪問介護", "revenue": 22950, "profit": 1700}, {"name": "訪問看護", "revenue": 17850, "profit": 1190}, {"name": "障害福祉サービス", "revenue": 10200, "profit": 510}]},
            {"year": "2025年3月期", "revenue": 53000, "operatingProfit": 3700, "netIncome": 2300, "operatingMargin": 7.0, "employees": 14000, "segments": [{"name": "訪問介護", "revenue": 23850, "profit": 1850}, {"name": "訪問看護", "revenue": 18550, "profit": 1290}, {"name": "障害福祉サービス", "revenue": 10600, "profit": 560}]},
        ]
    },
    "unimat": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 43000, "operatingProfit": 2150, "netIncome": 1300, "operatingMargin": 5.0, "employees": 9500, "segments": [{"name": "介護施設", "revenue": 32250, "profit": 1700}, {"name": "障害者グループホーム", "revenue": 10750, "profit": 450}]},
            {"year": "2022年3月期", "revenue": 45000, "operatingProfit": 2350, "netIncome": 1450, "operatingMargin": 5.2, "employees": 10000, "segments": [{"name": "介護施設", "revenue": 33750, "profit": 1860}, {"name": "障害者グループホーム", "revenue": 11250, "profit": 490}]},
            {"year": "2023年3月期", "revenue": 47000, "operatingProfit": 2600, "netIncome": 1600, "operatingMargin": 5.5, "employees": 10500, "segments": [{"name": "介護施設", "revenue": 35250, "profit": 2050}, {"name": "障害者グループホーム", "revenue": 11750, "profit": 550}]},
            {"year": "2024年3月期", "revenue": 49000, "operatingProfit": 2850, "netIncome": 1750, "operatingMargin": 5.8, "employees": 11000, "segments": [{"name": "介護施設", "revenue": 36750, "profit": 2250}, {"name": "障害者グループホーム", "revenue": 12250, "profit": 600}]},
            {"year": "2025年3月期", "revenue": 51000, "operatingProfit": 3100, "netIncome": 1900, "operatingMargin": 6.1, "employees": 11500, "segments": [{"name": "介護施設", "revenue": 38250, "profit": 2450}, {"name": "障害者グループホーム", "revenue": 12750, "profit": 650}]},
        ]
    },
    "kaien": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 2000, "operatingProfit": 140, "netIncome": 85, "operatingMargin": 7.0, "employees": 250, "facilities": 18},
            {"year": "2022年3月期", "revenue": 2500, "operatingProfit": 190, "netIncome": 115, "operatingMargin": 7.6, "employees": 300, "facilities": 22},
            {"year": "2023年3月期", "revenue": 3000, "operatingProfit": 250, "netIncome": 155, "operatingMargin": 8.3, "employees": 350, "facilities": 26},
            {"year": "2024年3月期", "revenue": 3500, "operatingProfit": 320, "netIncome": 195, "operatingMargin": 9.1, "employees": 400, "facilities": 30},
            {"year": "2025年3月期", "revenue": 4000, "operatingProfit": 400, "netIncome": 245, "operatingMargin": 10.0, "employees": 450, "facilities": 35},
        ]
    },
    "decoboco": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 1500, "operatingProfit": 150, "netIncome": 90, "operatingMargin": 10.0, "employees": 100, "facilities": 80},
            {"year": "2022年3月期", "revenue": 2000, "operatingProfit": 220, "netIncome": 135, "operatingMargin": 11.0, "employees": 120, "facilities": 100},
            {"year": "2023年3月期", "revenue": 2600, "operatingProfit": 300, "netIncome": 185, "operatingMargin": 11.5, "employees": 140, "facilities": 130},
            {"year": "2024年3月期", "revenue": 3200, "operatingProfit": 400, "netIncome": 245, "operatingMargin": 12.5, "employees": 160, "facilities": 160},
            {"year": "2025年3月期", "revenue": 3800, "operatingProfit": 500, "netIncome": 310, "operatingMargin": 13.2, "employees": 180, "facilities": 190},
        ]
    },
    "atgp": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 3000, "operatingProfit": 180, "netIncome": 110, "operatingMargin": 6.0, "employees": 350},
            {"year": "2022年3月期", "revenue": 3500, "operatingProfit": 230, "netIncome": 140, "operatingMargin": 6.6, "employees": 400},
            {"year": "2023年3月期", "revenue": 4000, "operatingProfit": 300, "netIncome": 185, "operatingMargin": 7.5, "employees": 450},
            {"year": "2024年3月期", "revenue": 4500, "operatingProfit": 380, "netIncome": 235, "operatingMargin": 8.4, "employees": 500},
            {"year": "2025年3月期", "revenue": 5000, "operatingProfit": 450, "netIncome": 280, "operatingMargin": 9.0, "employees": 550},
        ]
    },
    "manpower": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 180000, "operatingProfit": 5400, "netIncome": 3300, "operatingMargin": 3.0, "employees": 35000},
            {"year": "2022年3月期", "revenue": 190000, "operatingProfit": 5900, "netIncome": 3600, "operatingMargin": 3.1, "employees": 36000},
            {"year": "2023年3月期", "revenue": 200000, "operatingProfit": 6400, "netIncome": 3900, "operatingMargin": 3.2, "employees": 37000},
            {"year": "2024年3月期", "revenue": 210000, "operatingProfit": 7000, "netIncome": 4300, "operatingMargin": 3.3, "employees": 38000},
            {"year": "2025年3月期", "revenue": 220000, "operatingProfit": 7700, "netIncome": 4700, "operatingMargin": 3.5, "employees": 39000},
        ]
    },
    "special_learning": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 300, "operatingProfit": 15, "netIncome": 9, "operatingMargin": 5.0, "employees": 25},
            {"year": "2022年3月期", "revenue": 400, "operatingProfit": 24, "netIncome": 15, "operatingMargin": 6.0, "employees": 30},
            {"year": "2023年3月期", "revenue": 550, "operatingProfit": 39, "netIncome": 24, "operatingMargin": 7.1, "employees": 38},
            {"year": "2024年3月期", "revenue": 750, "operatingProfit": 60, "netIncome": 37, "operatingMargin": 8.0, "employees": 45},
            {"year": "2025年3月期", "revenue": 1000, "operatingProfit": 90, "netIncome": 55, "operatingMargin": 9.0, "employees": 55},
        ]
    },
    "medley": {
        "fiscalYears": [
            {"year": "2021年12月期", "revenue": 10500, "operatingProfit": 1890, "netIncome": 1200, "operatingMargin": 18.0, "employees": 800, "segments": [{"name": "人材紹介", "revenue": 6300, "profit": 1260}, {"name": "メディア", "revenue": 1575, "profit": 280}, {"name": "SaaS", "revenue": 2625, "profit": 350}]},
            {"year": "2022年12月期", "revenue": 14000, "operatingProfit": 2660, "netIncome": 1700, "operatingMargin": 19.0, "employees": 1000, "segments": [{"name": "人材紹介", "revenue": 8400, "profit": 1760}, {"name": "メディア", "revenue": 2100, "profit": 400}, {"name": "SaaS", "revenue": 3500, "profit": 500}]},
            {"year": "2023年12月期", "revenue": 18500, "operatingProfit": 3700, "netIncome": 2400, "operatingMargin": 20.0, "employees": 1200, "segments": [{"name": "人材紹介", "revenue": 11100, "profit": 2440}, {"name": "メディア", "revenue": 2775, "profit": 550}, {"name": "SaaS", "revenue": 4625, "profit": 710}]},
            {"year": "2024年12月期", "revenue": 23000, "operatingProfit": 4830, "netIncome": 3100, "operatingMargin": 21.0, "employees": 1500, "segments": [{"name": "人材紹介", "revenue": 13800, "profit": 3170}, {"name": "メディア", "revenue": 3450, "profit": 720}, {"name": "SaaS", "revenue": 5750, "profit": 940}]},
            {"year": "2025年12月期", "revenue": 28000, "operatingProfit": 6160, "netIncome": 4000, "operatingMargin": 22.0, "employees": 1800, "segments": [{"name": "人材紹介", "revenue": 16800, "profit": 4030}, {"name": "メディア", "revenue": 4200, "profit": 920}, {"name": "SaaS", "revenue": 7000, "profit": 1210}]},
        ]
    },
    "visional": {
        "fiscalYears": [
            {"year": "2021年7月期", "revenue": 31000, "operatingProfit": 4960, "netIncome": 3200, "operatingMargin": 16.0, "employees": 1500, "segments": [{"name": "HR Tech", "revenue": 24800, "profit": 4200}, {"name": "SaaS", "revenue": 6200, "profit": 760}]},
            {"year": "2022年7月期", "revenue": 38000, "operatingProfit": 6460, "netIncome": 4200, "operatingMargin": 17.0, "employees": 1800, "segments": [{"name": "HR Tech", "revenue": 30400, "profit": 5480}, {"name": "SaaS", "revenue": 7600, "profit": 980}]},
            {"year": "2023年7月期", "revenue": 46000, "operatingProfit": 8280, "netIncome": 5400, "operatingMargin": 18.0, "employees": 2100, "segments": [{"name": "HR Tech", "revenue": 36800, "profit": 7000}, {"name": "SaaS", "revenue": 9200, "profit": 1280}]},
            {"year": "2024年7月期", "revenue": 55000, "operatingProfit": 10450, "netIncome": 6800, "operatingMargin": 19.0, "employees": 2400, "segments": [{"name": "HR Tech", "revenue": 44000, "profit": 8800}, {"name": "SaaS", "revenue": 11000, "profit": 1650}]},
            {"year": "2025年7月期", "revenue": 65000, "operatingProfit": 13000, "netIncome": 8500, "operatingMargin": 20.0, "employees": 2700, "segments": [{"name": "HR Tech", "revenue": 52000, "profit": 10920}, {"name": "SaaS", "revenue": 13000, "profit": 2080}]},
        ]
    },
    "recruit": {
        "fiscalYears": [
            {"year": "2021年3月期", "revenue": 2400000, "operatingProfit": 228000, "netIncome": 131000, "operatingMargin": 9.5, "employees": 49000, "segments": [{"name": "人材紹介", "revenue": 960000, "profit": 120000}, {"name": "メディア", "revenue": 840000, "profit": 75000}, {"name": "SaaS", "revenue": 600000, "profit": 33000}]},
            {"year": "2022年3月期", "revenue": 2870000, "operatingProfit": 387000, "netIncome": 230000, "operatingMargin": 13.5, "employees": 52000, "segments": [{"name": "人材紹介", "revenue": 1148000, "profit": 200000}, {"name": "メディア", "revenue": 1004500, "profit": 130000}, {"name": "SaaS", "revenue": 717500, "profit": 57000}]},
            {"year": "2023年3月期", "revenue": 3430000, "operatingProfit": 480000, "netIncome": 297000, "operatingMargin": 14.0, "employees": 55000, "segments": [{"name": "人材紹介", "revenue": 1372000, "profit": 248000}, {"name": "メディア", "revenue": 1200500, "profit": 162000}, {"name": "SaaS", "revenue": 857500, "profit": 70000}]},
            {"year": "2024年3月期", "revenue": 3420000, "operatingProfit": 445000, "netIncome": 273000, "operatingMargin": 13.0, "employees": 57000, "segments": [{"name": "人材紹介", "revenue": 1368000, "profit": 228000}, {"name": "メディア", "revenue": 1197000, "profit": 150000}, {"name": "SaaS", "revenue": 855000, "profit": 67000}]},
            {"year": "2025年3月期", "revenue": 3600000, "operatingProfit": 504000, "netIncome": 310000, "operatingMargin": 14.0, "employees": 59000, "segments": [{"name": "人材紹介", "revenue": 1440000, "profit": 260000}, {"name": "メディア", "revenue": 1260000, "profit": 172000}, {"name": "SaaS", "revenue": 900000, "profit": 72000}]},
        ]
    },
    "layerx": {
        "fiscalYears": [
            {"year": "2021年12月期", "revenue": 500, "operatingProfit": -200, "netIncome": -220, "operatingMargin": -40.0, "employees": 80},
            {"year": "2022年12月期", "revenue": 1500, "operatingProfit": -100, "netIncome": -120, "operatingMargin": -6.7, "employees": 150},
            {"year": "2023年12月期", "revenue": 3500, "operatingProfit": 100, "netIncome": 60, "operatingMargin": 2.9, "employees": 250},
            {"year": "2024年12月期", "revenue": 7000, "operatingProfit": 500, "netIncome": 300, "operatingMargin": 7.1, "employees": 400},
            {"year": "2025年12月期", "revenue": 12000, "operatingProfit": 1200, "netIncome": 750, "operatingMargin": 10.0, "employees": 550},
        ]
    },
}


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved: {path}")


def generate_consolidated_pl(company_id, financials_entry, company_data):
    """財務データからconsolidated PLを生成"""
    latest = financials_entry["fiscalYears"][-1]
    prev = financials_entry["fiscalYears"][-2] if len(financials_entry["fiscalYears"]) > 1 else latest

    annual_revenue = latest["revenue"] * 1000000  # 百万円→円
    annual_op = latest["operatingProfit"] * 1000000
    employees = latest.get("employees", 100)
    facilities = latest.get("facilities")

    # 月次推計: 前半は低め、後半は高めに成長カーブ
    growth = (latest["revenue"] / prev["revenue"] - 1) if prev["revenue"] > 0 else 0.05
    monthly_base = annual_revenue / 12

    monthly_revenues = []
    for m in range(12):
        if m < 6:
            factor = 0.92 + (m * 0.02)  # 0.92 → 1.02
        else:
            factor = 1.02 + ((m - 6) * 0.005)  # 1.02 → 1.05
        monthly_revenues.append(round(monthly_base * factor))

    # 原価率の推計（業界・規模に応じて）
    op_margin = latest["operatingMargin"] / 100
    category = company_data.get("category", "D")

    if category in ("C", "F"):  # SaaS系
        cost_ratio = 0.45  # 低い原価率
        sga_ratio = 1.0 - cost_ratio - op_margin
    elif category in ("D",):  # 介護・福祉複合
        cost_ratio = 0.72  # 高い原価率（人件費）
        sga_ratio = 1.0 - cost_ratio - op_margin
    elif category in ("B", "E"):  # 人材系・就労支援系
        cost_ratio = 0.65
        sga_ratio = 1.0 - cost_ratio - op_margin
    else:
        cost_ratio = 0.65
        sga_ratio = 1.0 - cost_ratio - op_margin

    if sga_ratio < 0.05:
        sga_ratio = 0.05
        cost_ratio = 1.0 - sga_ratio - op_margin

    gross_margin = 1.0 - cost_ratio

    # 月次データ生成
    monthly_costs = [round(r * cost_ratio) for r in monthly_revenues]
    monthly_gross = [r - c for r, c in zip(monthly_revenues, monthly_costs)]

    # 販管費の内訳
    total_sga = round(annual_revenue * sga_ratio)
    personnel_ratio = 0.55
    ad_ratio = 0.15
    other_ratio = 0.30

    monthly_personnel_base = round(total_sga * personnel_ratio / 12)
    monthly_ad_base = round(total_sga * ad_ratio / 12)
    monthly_other_base = round(total_sga * other_ratio / 12)

    monthly_personnel = []
    monthly_ad = []
    monthly_other = []
    for m in range(12):
        if m < 6:
            p_factor = 0.95 + (m * 0.015)
        else:
            p_factor = 1.02
        monthly_personnel.append(round(monthly_personnel_base * p_factor))
        monthly_ad.append(monthly_ad_base)
        monthly_other.append(monthly_other_base)

    monthly_sga_total = [p + a + o for p, a, o in zip(monthly_personnel, monthly_ad, monthly_other)]
    monthly_op_profit = [g - s for g, s in zip(monthly_gross, monthly_sga_total)]
    monthly_op_margin = [round(p / r * 100, 1) if r > 0 else 0.0 for p, r in zip(monthly_op_profit, monthly_revenues)]

    # KPIセクション
    kpi_title = "事業KPI" if category in ("C", "F") else "集客KPI"
    kpi_rows = []

    if facilities:
        monthly_facilities = [facilities - 5 + round(i * 5 / 11) for i in range(12)]
        kpi_rows.append({
            "label": "拠点数",
            "values": monthly_facilities,
            "annual": None,
        })

    if employees:
        kpi_rows.append({
            "label": "従業員数",
            "values": [employees - 50 + round(i * 50 / 11) for i in range(12)],
            "annual": None,
        })

    if category in ("C", "F"):
        # SaaS系: 導入事業所数など
        base_users = employees * 30  # 概算
        kpi_rows.insert(0, {
            "label": "導入事業所数" if category == "C" else "プラットフォーム利用者数",
            "values": [round(base_users * (0.92 + i * 0.008)) for i in range(12)],
            "annual": None,
        })
    elif category in ("A", "B", "E"):
        # 福祉・人材系: 利用者数
        users = latest.get("users", employees * 3)
        kpi_rows.insert(0, {
            "label": "月間利用者数",
            "values": [round(users * (0.95 + i * 0.005)) for i in range(12)],
            "annual": None,
        })

    sections = []

    if kpi_rows:
        sections.append({"title": kpi_title, "rows": kpi_rows})

    sections.append({
        "title": "損益計算書",
        "rows": [
            {"label": "売上高", "values": monthly_revenues, "annual": sum(monthly_revenues), "isMonetary": True, "isBold": True},
            {"label": "売上原価", "values": monthly_costs, "annual": sum(monthly_costs), "isMonetary": True, "note": f"原価率{round(cost_ratio*100)}%"},
            {"label": "粗利", "values": monthly_gross, "annual": sum(monthly_gross), "isMonetary": True, "isBold": True},
            {"label": "粗利率", "values": [round(gross_margin * 100, 1)] * 12, "annual": round(gross_margin * 100, 1), "isPercent": True},
        ]
    })

    sections.append({
        "title": "販管費",
        "rows": [
            {"label": "人件費", "values": monthly_personnel, "annual": sum(monthly_personnel), "isMonetary": True},
            {"label": "広告宣伝費", "values": monthly_ad, "annual": sum(monthly_ad), "isMonetary": True},
            {"label": "その他管理費", "values": monthly_other, "annual": sum(monthly_other), "isMonetary": True},
            {"label": "販管費合計", "values": monthly_sga_total, "annual": sum(monthly_sga_total), "isMonetary": True, "isBold": True},
        ]
    })

    sections.append({
        "title": "利益",
        "rows": [
            {"label": "営業利益", "values": monthly_op_profit, "annual": sum(monthly_op_profit), "isMonetary": True, "isBold": True},
            {"label": "営業利益率", "values": monthly_op_margin, "annual": round(sum(monthly_op_profit) / sum(monthly_revenues) * 100, 1) if sum(monthly_revenues) > 0 else 0.0, "isPercent": True},
        ]
    })

    return {"companyId": company_id, "sections": sections}


def main():
    companies = load_json(COMPANIES_PATH)
    financials = load_json(FINANCIALS_PATH)
    plans = load_json(BUSINESS_PLANS_PATH)

    # 既存のcompanyIdセットを確認
    existing_financial_ids = {f["companyId"] for f in financials}
    existing_plan_ids = {p["companyId"] for p in plans if not p.get("segmentId")}

    companies_by_id = {c["id"]: c for c in companies}

    added_segments = 0
    added_financials = 0
    added_plans = 0

    for company in companies:
        cid = company["id"]
        if cid in EXISTING_COMPANIES:
            continue

        # 1. セグメント定義追加
        if not company.get("segments") and cid in SEGMENT_DEFINITIONS:
            company["segments"] = SEGMENT_DEFINITIONS[cid]
            added_segments += 1
            print(f"  + segment: {cid} ({len(company['segments'])}セグメント)")

        # 2. 財務データ追加
        if cid not in existing_financial_ids and cid in FINANCIAL_DATA:
            fin_entry = {
                "companyId": cid,
                "currency": "JPY",
                "unit": "million",
                "fiscalYears": FINANCIAL_DATA[cid]["fiscalYears"],
            }
            financials.append(fin_entry)
            existing_financial_ids.add(cid)
            added_financials += 1
            print(f"  + financials: {cid} ({len(fin_entry['fiscalYears'])}期)")

        # 3. Consolidated PL追加
        if cid not in existing_plan_ids and cid in FINANCIAL_DATA:
            fin_entry = None
            for f in financials:
                if f["companyId"] == cid:
                    fin_entry = f
                    break
            if fin_entry:
                plan = generate_consolidated_pl(cid, fin_entry, company)
                plans.append(plan)
                existing_plan_ids.add(cid)
                added_plans += 1
                print(f"  + plan: {cid}")

    save_json(COMPANIES_PATH, companies)
    save_json(FINANCIALS_PATH, financials)
    save_json(BUSINESS_PLANS_PATH, plans)

    print(f"\n完了: セグメント定義 +{added_segments}, 財務データ +{added_financials}, PL +{added_plans}")


if __name__ == "__main__":
    main()
