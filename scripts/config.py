"""
IRkun EDINET データ取得 — 設定・企業マッピング
"""
import os
from pathlib import Path

# ============================================================
# Supabase
# ============================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# プロジェクトルート
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
FINANCIALS_PATH = DATA_DIR / "financials.json"
COMPANIES_PATH = DATA_DIR / "companies.json"
BUSINESS_PLANS_PATH = DATA_DIR / "business-plans.json"

# EDINET API
EDINET_API_BASE = "https://api.edinet-fsa.go.jp/api/v2"
EDINET_API_KEY = os.environ.get("EDINET_API_KEY", "")

# レート制限（秒）
REQUEST_DELAY = 2.0

# 取得年数のデフォルト
DEFAULT_YEARS = 5

# 企業マッピング: IRkun ID → 証券コード
# EDINETコードはスクリプト実行時にAPI経由で自動解決する
COMPANY_MAP = {
    # --- 既存17社 ---
    "litalico":    {"stock_code": "7366", "name": "LITALICO"},
    "welbe":       {"stock_code": "6556", "name": "ウェルビー"},
    "cocoruport":  {"stock_code": "9346", "name": "ココルポート"},
    "spool":       {"stock_code": "2471", "name": "エスプール"},
    "sms":         {"stock_code": "2175", "name": "SMS"},
    "persol":      {"stock_code": "2181", "name": "パーソルホールディングス"},
    "pasona":      {"stock_code": "2168", "name": "パソナグループ"},
    "copel":       {"stock_code": "9726", "name": "コペル"},
    "nd_software": {"stock_code": "3794", "name": "NDソフトウェア"},
    "kanamic":     {"stock_code": "3939", "name": "カナミックネットワーク"},
    "sorust":      {"stock_code": "6197", "name": "ソラスト"},
    "care21":      {"stock_code": "2373", "name": "ケア21"},
    "saint_care":  {"stock_code": "9014", "name": "セントケア・ホールディング"},
    "unimat":      {"stock_code": "9707", "name": "ユニマット リタイアメント・コミュニティ"},
    "medley":      {"stock_code": "4480", "name": "メドレー"},
    "visional":    {"stock_code": "4194", "name": "ビジョナル"},
    "recruit":     {"stock_code": "6098", "name": "リクルートホールディングス"},
    # --- 追加40社 ---
    "ai_inside":     {"stock_code": "4488", "name": "AI inside"},
    "aidemy":        {"stock_code": "5765", "name": "アイデミー"},
    "ami":           {"stock_code": "7350", "name": "アミーダホールディングス"},
    "benefit_one":   {"stock_code": "2412", "name": "ベネフィット・ワン"},
    "benesse":       {"stock_code": "9783", "name": "ベネッセホールディングス"},
    "care_net":      {"stock_code": "2150", "name": "ケアネット"},
    "charm_care":    {"stock_code": "6062", "name": "チャーム・ケア・コーポレーション"},
    "crowd_works":   {"stock_code": "3900", "name": "クラウドワークス"},
    "curebito":      {"stock_code": "9158", "name": "CUCグループ"},
    "cybozu":        {"stock_code": "4776", "name": "サイボウズ"},
    "dip":           {"stock_code": "2379", "name": "ディップ"},
    "en_japan":      {"stock_code": "4849", "name": "エン・ジャパン"},
    "ewell":         {"stock_code": "5038", "name": "E-well"},
    "freee":         {"stock_code": "4478", "name": "freee"},
    "genda":         {"stock_code": "9166", "name": "GENDA"},
    "global_kids":   {"stock_code": "6189", "name": "グローバルキッズCOMPANY"},
    "jmdc":          {"stock_code": "4483", "name": "JMDC"},
    "lancers":       {"stock_code": "4484", "name": "ランサーズ"},
    "lifedrink":     {"stock_code": "2585", "name": "ライフドリンクカンパニー"},
    "m3":            {"stock_code": "2413", "name": "エムスリー"},
    "medpeer":       {"stock_code": "6095", "name": "メドピア"},
    "money_forward": {"stock_code": "3994", "name": "マネーフォワード"},
    "obic":          {"stock_code": "4684", "name": "オービック"},
    "outsourcing":   {"stock_code": "2427", "name": "アウトソーシング"},
    "phc":           {"stock_code": "6523", "name": "PHCホールディングス"},
    "progrit":       {"stock_code": "9560", "name": "プログリット"},
    "proto":         {"stock_code": "4298", "name": "プロトコーポレーション"},
    "qubell":        {"stock_code": "9446", "name": "クベル"},
    "rakus":         {"stock_code": "3923", "name": "ラクス"},
    "sakura_cs":     {"stock_code": "4761", "name": "さくらケーシーエス"},
    "sansan":        {"stock_code": "4443", "name": "Sansan"},
    "shift":         {"stock_code": "3697", "name": "SHIFT"},
    "silverii":      {"stock_code": "9262", "name": "シルバーライフ"},
    "sun_welfare":   {"stock_code": "9229", "name": "サンウェルズ"},
    "surala":        {"stock_code": "3998", "name": "すららネット"},
    "tryt":          {"stock_code": "9164", "name": "トライト"},
    "tsukui":        {"stock_code": "2398", "name": "ツクイホールディングス"},
    "ut_group":      {"stock_code": "2146", "name": "UTグループ"},
    "uzabase":       {"stock_code": "3966", "name": "ユーザベース"},
    "visasq":        {"stock_code": "4490", "name": "ビザスク"},
}

# 有価証券報告書の提出が多い月（3月決算→6月提出が多い）
FILING_SEARCH_MONTHS = [6, 7, 8, 9]  # 6〜9月に集中

# 共通HTTP設定
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

# ダウンロードディレクトリ
DOWNLOADS_DIR = PROJECT_ROOT / "scripts" / "downloads"
