"""
XBRLパーサー — 有価証券報告書から財務データを抽出
"""
from typing import Optional
from lxml import etree


# XBRL名前空間
NAMESPACES = {
    "jppfs_cor": "http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor",
    "jpcrp_cor": "http://disclosure.edinet-fsa.go.jp/taxonomy/jpcrp/cor",
    "xbrli": "http://www.xbrl.org/2003/instance",
}

# 売上高の候補タグ（企業によって使うタグが異なる）
REVENUE_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}NetSales",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}Revenue",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OperatingRevenue1",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OperatingRevenue",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}RevenueIFRS",
]

# 営業利益の候補タグ
OPERATING_PROFIT_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OperatingIncome",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OperatingProfit",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OperatingIncomeIFRS",
]

# 経常利益
ORDINARY_PROFIT_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OrdinaryIncome",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}OrdinaryProfit",
]

# 当期純利益
NET_INCOME_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}ProfitLoss",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}ProfitLossAttributableToOwnersOfParent",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}NetIncome",
]

# 純資産
NET_ASSETS_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}NetAssets",
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jppfs/cor}EquityAttributableToOwnersOfParent",
]

# 従業員数
EMPLOYEES_TAGS = [
    "{http://disclosure.edinet-fsa.go.jp/taxonomy/jpcrp/cor}NumberOfEmployees",
]


def _parse_value(element) -> Optional[float]:
    """要素のテキストを数値に変換。"""
    if element is None or element.text is None:
        return None
    try:
        return float(element.text.replace(",", ""))
    except ValueError:
        return None


def _find_value(root: etree._Element, tags: list[str], prefer_consolidated: bool = True) -> Optional[float]:
    """
    複数の候補タグから値を探す。
    連結（CurrentYearDuration_ConsolidatedMember）を優先し、
    なければ当期（CurrentYearDuration）から取得。
    """
    for tag in tags:
        elements = root.findall(f".//{tag}", namespaces=None)
        if not elements:
            continue

        # コンテキストで絞り込み
        consolidated_val = None
        current_year_val = None
        instant_val = None

        for elem in elements:
            context_ref = elem.get("contextRef", "")
            val = _parse_value(elem)
            if val is None:
                continue

            if "CurrentYearDuration" in context_ref:
                if "Consolidated" in context_ref or "consolidat" in context_ref.lower():
                    consolidated_val = val
                elif consolidated_val is None:
                    current_year_val = val
            elif "CurrentYearInstant" in context_ref or "CurrentInstant" in context_ref:
                if "Consolidated" in context_ref or "consolidat" in context_ref.lower():
                    if instant_val is None:
                        instant_val = val
                elif instant_val is None:
                    instant_val = val

        if prefer_consolidated and consolidated_val is not None:
            return consolidated_val
        if current_year_val is not None:
            return current_year_val
        if consolidated_val is not None:
            return consolidated_val
        if instant_val is not None:
            return instant_val

    return None


def _find_instant_value(root: etree._Element, tags: list[str]) -> Optional[float]:
    """
    BS項目（残高）を取得する。Instant（時点）コンテキストを探す。
    """
    for tag in tags:
        elements = root.findall(f".//{tag}", namespaces=None)
        if not elements:
            continue

        for elem in elements:
            context_ref = elem.get("contextRef", "")
            val = _parse_value(elem)
            if val is None:
                continue
            # 期末残高: CurrentYearInstant or CurrentInstant
            if "CurrentYearInstant" in context_ref or "CurrentInstant" in context_ref:
                return val

    return None


def parse_xbrl(xbrl_content: str) -> Optional[dict]:
    """
    XBRLコンテンツから財務データを抽出する。

    Returns:
        dict with keys: revenue, operating_profit, ordinary_profit,
        net_income, employees, net_assets
        すべて円単位（百万円に変換するのは呼び出し側）
    """
    try:
        root = etree.fromstring(xbrl_content.encode("utf-8"))
    except etree.XMLSyntaxError as e:
        print(f"  [WARN] XML parse error: {e}")
        return None

    revenue = _find_value(root, REVENUE_TAGS)
    operating_profit = _find_value(root, OPERATING_PROFIT_TAGS)
    ordinary_profit = _find_value(root, ORDINARY_PROFIT_TAGS)
    net_income = _find_value(root, NET_INCOME_TAGS)
    employees = _find_value(root, EMPLOYEES_TAGS)
    net_assets = _find_instant_value(root, NET_ASSETS_TAGS)

    if revenue is None and operating_profit is None:
        return None

    return {
        "revenue": revenue,
        "operating_profit": operating_profit,
        "ordinary_profit": ordinary_profit,
        "net_income": net_income,
        "employees": employees,
        "net_assets": net_assets,
    }
