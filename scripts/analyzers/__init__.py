"""
IRkun Analyzers - OOP IR analysis pipeline.

Usage:
    from analyzers import TavilyAnalyzer, get_analyzers

    # Direct instantiation
    analyzer = TavilyAnalyzer("kaien", "Kaien", save_db=False)
    result = analyzer.run()

    # Factory pattern
    analyzers = get_analyzers("kaien", "Kaien", save_db=False)
    for a in analyzers:
        a.run()
"""

from .base import AnalysisResult, BaseIRAnalyzer
from .registry import get_analyzers
from .tavily import TavilyAnalyzer

__all__ = [
    "BaseIRAnalyzer",
    "AnalysisResult",
    "TavilyAnalyzer",
    "get_analyzers",
]
