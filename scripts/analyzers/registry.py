"""
Company -> Analyzer mapping and factory function.

Determines which analyzer(s) to use for a given company based on its characteristics:
- Listed companies (in COMPANY_MAP) -> EdinetAnalyzer + PdfEarningsAnalyzer (Phase 2)
- Private companies (in PRIVATE_COMPANY_IDS) -> TavilyAnalyzer
"""

import sys
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .base import BaseIRAnalyzer

# Ensure scripts/ is on path for importing existing modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def get_analyzers(
    company_id: str,
    company_name: str,
    *,
    analyzer_filter: str | None = None,
    **kwargs,
) -> "list[BaseIRAnalyzer]":
    """
    Factory: given a company, return the list of appropriate analyzer instances.

    Args:
        company_id: Target company ID
        company_name: Display name
        analyzer_filter: If set, only return analyzers of this type ("tavily", "edinet", etc.)
        **kwargs: Passed to analyzer constructors (save_db, save_json, dry_run, etc.)
    """
    from config import COMPANY_MAP
    from tavily_research import PRIVATE_COMPANY_IDS

    # Determine which analyzer types apply
    analyzer_types: list[str] = []

    if company_id in COMPANY_MAP:
        # Listed company: EDINET + PDF earnings (Phase 2 - not yet implemented)
        # analyzer_types.extend(["edinet", "pdf_earnings"])
        pass
    if company_id in PRIVATE_COMPANY_IDS:
        analyzer_types.append("tavily")

    # Apply filter
    if analyzer_filter:
        analyzer_types = [t for t in analyzer_types if t == analyzer_filter]

    # Instantiate analyzers
    analyzers = []
    for atype in analyzer_types:
        cls = _resolve_class(atype)
        if cls:
            analyzers.append(cls(company_id=company_id, company_name=company_name, **kwargs))

    return analyzers


def _resolve_class(analyzer_type: str):
    """Lazy-resolve analyzer class by type string."""
    if analyzer_type == "tavily":
        from .tavily import TavilyAnalyzer

        return TavilyAnalyzer
    # Phase 2:
    # if analyzer_type == "edinet":
    #     from .edinet import EdinetAnalyzer
    #     return EdinetAnalyzer
    # if analyzer_type == "pdf_earnings":
    #     from .pdf_earnings import PdfEarningsAnalyzer
    #     return PdfEarningsAnalyzer
    return None
