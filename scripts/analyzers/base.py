"""
Base class for all IR analysis pipelines.

Subclasses implement fetch_data(), analyze(), and save().
The run() method orchestrates: fetch -> analyze -> save.
"""

import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional


@dataclass
class AnalysisResult:
    """Standardized output from any analyzer."""

    company_id: str
    analyzer_type: str  # "tavily", "pdf_earnings", "edinet", "manual", "segment"
    data: dict[str, Any]
    metadata: dict[str, Any] = field(default_factory=dict)
    analyzed_at: str = field(default_factory=lambda: datetime.now().isoformat())
    success: bool = True
    error: Optional[str] = None


class BaseIRAnalyzer(ABC):
    """
    Abstract base class for IR analysis pipelines.

    Constructor kwargs:
        company_id: Target company identifier
        company_name: Display name (used in search queries, logs)
        save_db: Write results to Supabase (default True)
        save_json: Write results to JSON files (default True)
        export_json: Run db.export_*_json() after DB write (default False)
        dry_run: Skip save entirely (default False)
    """

    def __init__(
        self,
        company_id: str,
        company_name: str,
        *,
        save_db: bool = True,
        save_json: bool = True,
        export_json: bool = False,
        dry_run: bool = False,
    ):
        self.company_id = company_id
        self.company_name = company_name
        self.save_db = save_db
        self.save_json = save_json
        self.export_json = export_json
        self.dry_run = dry_run
        self.logger = logging.getLogger(f"{self.__class__.__name__}[{company_id}]")

    @property
    @abstractmethod
    def analyzer_type(self) -> str:
        """Return a string identifier for this analyzer type."""
        ...

    @abstractmethod
    def fetch_data(self) -> Any:
        """
        Collect raw data from the source.
        Returns source-specific raw data (PDF bytes, XBRL content, Tavily response, etc.)
        Returns None if no data available.
        """
        ...

    @abstractmethod
    def analyze(self, raw_data: Any) -> Optional[AnalysisResult]:
        """
        Transform/analyze raw data into structured output.
        Returns AnalysisResult or None if analysis produced nothing.
        """
        ...

    @abstractmethod
    def save(self, result: AnalysisResult) -> None:
        """
        Persist the result to Supabase DB and/or JSON files.
        Respects self.save_db, self.save_json, self.dry_run flags.
        """
        ...

    def run(self) -> Optional[AnalysisResult]:
        """Execute the full pipeline: fetch -> analyze -> save."""
        self.logger.info("Starting %s for %s", self.__class__.__name__, self.company_id)

        # Fetch
        try:
            raw_data = self.fetch_data()
        except Exception as e:
            self.logger.error("fetch_data failed: %s", e)
            return AnalysisResult(
                company_id=self.company_id,
                analyzer_type=self.analyzer_type,
                data={},
                success=False,
                error=f"fetch failed: {e}",
            )

        if raw_data is None:
            self.logger.warning("No data fetched, skipping")
            return None

        # Analyze
        try:
            result = self.analyze(raw_data)
        except Exception as e:
            self.logger.error("analyze failed: %s", e)
            return AnalysisResult(
                company_id=self.company_id,
                analyzer_type=self.analyzer_type,
                data={},
                success=False,
                error=f"analyze failed: {e}",
            )

        if result is None:
            self.logger.warning("Analysis produced no result")
            return None

        # Save
        if not self.dry_run:
            try:
                self.save(result)
            except Exception as e:
                self.logger.error("save failed: %s", e)
                result.success = False
                result.error = f"save failed: {e}"

        self.logger.info("Completed: success=%s", result.success)
        return result

    @staticmethod
    def extract_json_from_response(response_text: str) -> dict:
        """Parse JSON from Claude API response, handling code block wrappers."""
        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json", 1)[1].split("```", 1)[0]
        elif "```" in text:
            text = text.split("```", 1)[1].split("```", 1)[0]
        return json.loads(text.strip())
