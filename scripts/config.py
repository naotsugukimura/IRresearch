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
