"""
TavilyAnalyzer: Web research for private (unlisted) companies.
Uses Tavily Search API for data collection and Claude API for structuring.

Wraps logic from tavily_research.py without modifying it.
"""

import json
import os
import time
from pathlib import Path
from typing import Any, Optional

from .base import AnalysisResult, BaseIRAnalyzer

# Reuse constants from existing script
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tavily_research import ANALYSIS_PROMPT, QUERY_MAP

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
WEB_RESEARCH_DIR = DATA_DIR / "web-research"


class TavilyAnalyzer(BaseIRAnalyzer):
    """
    Web research analyzer for private (unlisted) companies.

    fetch_data(): Tavily Search API (4 research types)
    analyze(): Claude API structured extraction
    save(): db.upsert_company_web_research() + JSON file
    """

    MODEL = "claude-sonnet-4-20250514"
    MAX_TOKENS = 4096

    def __init__(
        self,
        company_id: str,
        company_name: str,
        *,
        research_types: Optional[list[str]] = None,
        save_db: bool = True,
        save_json: bool = True,
        export_json: bool = False,
        dry_run: bool = False,
    ):
        super().__init__(
            company_id,
            company_name,
            save_db=save_db,
            save_json=save_json,
            export_json=export_json,
            dry_run=dry_run,
        )
        self.research_types = research_types or list(QUERY_MAP.keys())
        self._tavily_client = None
        self._anthropic_client = None

    @property
    def analyzer_type(self) -> str:
        return "tavily"

    def _get_tavily_client(self):
        if self._tavily_client is None:
            from tavily import TavilyClient

            api_key = os.environ.get("TAVILY_API_KEY", "")
            if not api_key:
                raise RuntimeError("TAVILY_API_KEY not set")
            self._tavily_client = TavilyClient(api_key=api_key)
        return self._tavily_client

    def _get_anthropic_client(self):
        if self._anthropic_client is None:
            import anthropic

            api_key = os.environ.get("ANTHROPIC_API_KEY", "")
            if not api_key:
                raise RuntimeError("ANTHROPIC_API_KEY not set")
            self._anthropic_client = anthropic.Anthropic(api_key=api_key)
        return self._anthropic_client

    def fetch_data(self) -> Any:
        """Fetch web search results for each research type via Tavily API."""
        results = {}
        client = self._get_tavily_client()

        for rtype in self.research_types:
            query_suffix = QUERY_MAP.get(rtype, "")
            query = f'"{self.company_name}" {query_suffix}'
            self.logger.info("[%s] Searching: %s", rtype, query)

            try:
                response = client.search(
                    query=query,
                    max_results=8,
                    search_depth="advanced",
                    topic="general",
                    include_answer=True,
                )
                search_results = response.get("results", [])
                if search_results:
                    results[rtype] = {
                        "query": query,
                        "response": response,
                        "source_urls": [r.get("url", "") for r in search_results],
                    }
                    self.logger.info("[%s] %d results found", rtype, len(search_results))
                else:
                    self.logger.info("[%s] No results", rtype)
            except Exception as e:
                self.logger.error("[%s] Tavily search failed: %s", rtype, e)

            time.sleep(1)

        return results if results else None

    def analyze(self, raw_data: Any) -> Optional[AnalysisResult]:
        """Analyze each research type's Tavily results using Claude API."""
        analyzed = {}
        all_source_urls = {}
        client = self._get_anthropic_client()

        for rtype, search_data in raw_data.items():
            tavily_response = search_data["response"]
            query = search_data["query"]

            # Build web results text (same logic as existing tavily_research.py)
            results = tavily_response.get("results", [])
            web_results_text = ""
            for i, r in enumerate(results[:10]):
                web_results_text += f"\n[{i + 1}] {r.get('title', 'N/A')}\n"
                web_results_text += f"URL: {r.get('url', 'N/A')}\n"
                content = r.get("content", "")[:600]
                web_results_text += f"Content: {content}\n"
            answer = tavily_response.get("answer")
            if answer:
                web_results_text += f"\n[Tavily AI Summary]\n{answer}\n"

            prompt = ANALYSIS_PROMPT.format(
                company_name=self.company_name,
                research_type=rtype,
                query=query,
                web_results=web_results_text,
            )

            try:
                message = client.messages.create(
                    model=self.MODEL,
                    max_tokens=self.MAX_TOKENS,
                    messages=[{"role": "user", "content": prompt}],
                )
                response_text = message.content[0].text
                analysis = self.extract_json_from_response(response_text)
                analyzed[rtype] = analysis
                all_source_urls[rtype] = search_data["source_urls"]
                self.logger.info(
                    "[%s] OK (confidence: %s)",
                    rtype,
                    analysis.get("confidence", "unknown"),
                )
            except Exception as e:
                self.logger.error("[%s] Claude analysis failed: %s", rtype, e)

        if not analyzed:
            return None

        return AnalysisResult(
            company_id=self.company_id,
            analyzer_type=self.analyzer_type,
            data=analyzed,
            metadata={"source_urls": all_source_urls},
        )

    def save(self, result: AnalysisResult) -> None:
        """Save to Supabase DB and/or JSON files."""
        # DB save
        if self.save_db:
            try:
                from db import upsert_company_web_research

                for rtype, analysis in result.data.items():
                    source_urls = result.metadata.get("source_urls", {}).get(rtype, [])
                    query = f'"{self.company_name}" {QUERY_MAP.get(rtype, "")}'
                    rid = upsert_company_web_research(
                        company_id=self.company_id,
                        research_type=rtype,
                        query_terms=query,
                        source_urls=source_urls,
                        data=analysis,
                    )
                    self.logger.info("[%s] DB saved (id=%s)", rtype, rid)
            except Exception as e:
                self.logger.error("DB save failed: %s", e)

        # JSON save (same format as tavily_research.py)
        if self.save_json and result.data:
            WEB_RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
            output = {
                "companyId": self.company_id,
                "research": [
                    {
                        "type": rtype,
                        "queryTerms": f'"{self.company_name}" {QUERY_MAP.get(rtype, "")}',
                        "data": data,
                        "sourceUrls": result.metadata.get("source_urls", {}).get(
                            rtype, []
                        ),
                        "searchedAt": result.analyzed_at,
                    }
                    for rtype, data in result.data.items()
                ],
            }
            output_path = WEB_RESEARCH_DIR / f"{self.company_id}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            self.logger.info("Saved: %s", output_path)

        # Export from DB
        if self.export_json and self.save_db:
            try:
                from db import export_web_research_json

                export_web_research_json()
                self.logger.info("DB -> JSON export complete")
            except Exception as e:
                self.logger.error("JSON export failed: %s", e)
