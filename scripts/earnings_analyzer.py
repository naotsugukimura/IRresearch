"""
Claude API を使用して決算説明資料PDFからKPI・市場データ・M&A情報を抽出する
"""
import base64
import json
import os
from pathlib import Path
from typing import Optional

import anthropic

from config import DATA_DIR
from db import insert_earnings_document, insert_earnings_insight

INSIGHTS_DIR = DATA_DIR / "earnings-insights"

# Claude API model
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096

EXTRACTION_PROMPT = """この決算説明資料PDFを分析し、以下の情報をJSON形式で抽出してください。
該当する情報がない場合はnullを設定してください。

抽出対象:
1. **business_kpis**: 事業KPI
   - arr: ARR（年間経常収益）
   - mrr: MRR（月次経常収益）
   - churn_rate: 解約率（%）
   - arpu: 平均顧客単価
   - cac: 顧客獲得コスト
   - ltv: 顧客生涯価値
   - user_count: ユーザー数・利用者数
   - facility_count: 事業所数・拠点数
   - employee_count: 従業員数
   - other_kpis: その他の重要KPI（配列）

2. **market_sizing**: 市場規模
   - tam: TAM（Total Addressable Market）
   - sam: SAM（Serviceable Addressable Market）
   - som: SOM（Serviceable Obtainable Market）
   - market_growth_rate: 市場成長率
   - market_notes: 市場に関する補足情報

3. **ma_info**: M&A情報（配列）
   - target: 買収対象企業名
   - date: 実施時期
   - amount: 投資額
   - synergy: シナジー効果の説明
   - status: ステータス（completed/announced/planned）

4. **midterm_plan**: 中期経営計画
   - name: 計画名称
   - period: 対象期間
   - revenue_target: 売上目標
   - profit_target: 利益目標
   - key_strategies: 重点施策（配列）

5. **fiscal_period**: この資料の対象期間（例: "2024年3月期"）
6. **summary**: 資料全体の要約（200字以内）

必ず有効なJSONのみを出力してください。説明文は不要です。
"""


def analyze_pdf(pdf_path: Path) -> Optional[dict]:
    """
    Claude APIでPDFを分析し、構造化データを抽出する。

    Args:
        pdf_path: PDFファイルパス

    Returns:
        抽出結果のdict。失敗時はNone。
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("  [ERROR] ANTHROPIC_API_KEY not set")
        return None

    # PDFをbase64エンコード
    pdf_bytes = pdf_path.read_bytes()
    pdf_size_mb = len(pdf_bytes) / (1024 * 1024)

    if pdf_size_mb > 30:
        print(f"  [WARN] PDF too large ({pdf_size_mb:.1f}MB), skipping")
        return None

    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    print(f"  Analyzing: {pdf_path.name} ({pdf_size_mb:.1f}MB)")

    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": EXTRACTION_PROMPT,
                        },
                    ],
                }
            ],
        )

        response_text = message.content[0].text

        # JSON部分を抽出（コードブロックで囲まれている場合も対応）
        json_text = response_text
        if "```json" in json_text:
            json_text = json_text.split("```json")[1].split("```")[0]
        elif "```" in json_text:
            json_text = json_text.split("```")[1].split("```")[0]

        result = json.loads(json_text.strip())
        print(f"  [OK] Analysis complete")
        return result

    except anthropic.APIError as e:
        print(f"  [ERROR] Claude API error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"  [ERROR] Failed to parse response JSON: {e}")
        return None


def analyze_company(company_id: str, pdf_paths: list[Path], save_json: bool = True) -> Optional[dict]:
    """
    1社分の全PDFを分析し、結果をDBとJSONに保存する。

    Args:
        company_id: 企業ID
        pdf_paths: PDFファイルパスのリスト
        save_json: JSONファイルも出力するか（デフォルトTrue）

    Returns:
        統合結果のdict。
    """
    if not pdf_paths:
        print(f"  [SKIP] No PDFs for {company_id}")
        return None

    INSIGHTS_DIR.mkdir(parents=True, exist_ok=True)

    all_results = []
    for pdf_path in pdf_paths:
        result = analyze_pdf(pdf_path)
        if result:
            result["source_file"] = pdf_path.name

            # DB投入
            pdf_size_mb = pdf_path.stat().st_size / (1024 * 1024)
            doc_id = insert_earnings_document(
                company_id=company_id,
                file_name=pdf_path.name,
                fiscal_period=result.get("fiscal_period"),
                file_size_mb=round(pdf_size_mb, 2),
            )
            # 各insight_typeをDB投入
            insight_types = ["business_kpis", "market_sizing", "ma_info", "midterm_plan"]
            for itype in insight_types:
                if result.get(itype):
                    insert_earnings_insight(doc_id, itype, result[itype])
            if result.get("summary"):
                insert_earnings_insight(doc_id, "summary", {"text": result["summary"]})

            print(f"  [OK] DB投入完了 (doc_id={doc_id})")
            all_results.append(result)

    if not all_results:
        return None

    output = {
        "companyId": company_id,
        "analyzedAt": __import__("datetime").datetime.now().isoformat(),
        "documents": all_results,
    }

    # JSONファイルにも保存
    if save_json:
        output_path = INSIGHTS_DIR / f"{company_id}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"  [OK] Saved to {output_path}")

    return output


if __name__ == "__main__":
    print("Use fetch_earnings.py for the full pipeline")
