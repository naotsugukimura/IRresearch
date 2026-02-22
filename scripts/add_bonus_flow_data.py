"""Add bonusAcquisitionFlow data to houkago-day.json (Phase 13d)."""
import json
import pathlib

DATA_PATH = pathlib.Path(__file__).resolve().parent.parent / "data" / "facility-analysis" / "houkago-day.json"

BONUS_FLOW = {
    "title": "処遇改善加算の段階的取得フロー",
    "description": "処遇改善加算は3種類+ベースアップ等支援加算の4段階。取得しやすい順に段階的に取り組むのが一般的",
    "nodes": [
        {
            "id": "shogu-base",
            "label": "処遇改善加算（I）",
            "description": "全職員の賃金改善に充てる加算。キャリアパス要件（資格・経験に応じた昇給）と職場環境等要件（研修・ICT等）を満たす必要がある。令和6年度報酬改定で一本化され、旧I~IIIが統合された。取得率は90%超と最も基本的な加算。",
            "units": "所定単位数×11.1%〜4.1%",
            "difficulty": "low",
            "prerequisites": [
                "キャリアパス要件: 資格・経験年数に応じた昇給の仕組みを整備",
                "職場環境等要件: 研修・ICT導入・健康管理等から2つ以上",
                "賃金改善計画書の提出（毎年度）",
                "賃金改善実績報告書の提出（年度末）"
            ]
        },
        {
            "id": "shogu-tokuteii",
            "label": "特定処遇改善加算（I）",
            "description": "経験・技能のある障害福祉人材への重点的な処遇改善。10年以上の経験者に月8万円以上の改善 or 年収440万以上を1人以上配置。グループ間の配分ルール（経験者:他の職員:その他=2:1:0.5以内）がある。",
            "units": "所定単位数×8.4%〜1.5%",
            "difficulty": "medium",
            "prerequisites": [
                "処遇改善加算（I）を取得済みであること",
                "職場環境等要件の「見える化」（HP等で公表）",
                "経験10年以上の福祉・介護職員に月8万円以上 or 年収440万円以上が1人以上",
                "3グループ間の配分ルール遵守"
            ]
        },
        {
            "id": "baseup",
            "label": "ベースアップ等支援加算",
            "description": "令和4年10月創設。基本給又は決まって毎月支払われる手当の引上げに充てる加算。処遇改善加算と異なり、一時金ではなく月額ベースでの恒久的な引上げが求められる。加算額の2/3以上を基本給等に充当する必要がある。",
            "units": "所定単位数×1.6%〜1.1%",
            "difficulty": "medium",
            "prerequisites": [
                "処遇改善加算（I〜III）のいずれかを取得済み",
                "加算額の2/3以上を基本給又は毎月の手当に充当",
                "賃金改善計画書にベースアップの内訳を記載",
                "就業規則・給与規程の改定（基本給引上げの明記）"
            ]
        },
        {
            "id": "shogu-new",
            "label": "令和6年度 新処遇改善加算（一本化）",
            "description": "令和6年6月から旧3加算が一本化。加算率は最大24.5%。4段階の区分（I〜IV）に再編され、区分Iが最も高い加算率。経過措置期間あり（令和7年3月末まで旧加算からの移行猶予）。一本化により事務負担が軽減される見込み。",
            "units": "所定単位数×最大24.5%",
            "difficulty": "high",
            "prerequisites": [
                "旧3加算の要件を統合した新要件を全て満たすこと",
                "キャリアパス要件I〜III全てを満たす（区分Iの場合）",
                "月額8万円 or 年収440万円要件",
                "職場環境等要件の区分ごとの基準を充足",
                "経過措置期間中に新体系への移行届出"
            ]
        }
    ]
}


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    data["bonusAcquisitionFlow"] = BONUS_FLOW
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Done: Added bonusAcquisitionFlow to houkago-day.json")


if __name__ == "__main__":
    main()
