"""
OpenF1 API client with caching, rate limiting (token bucket), and exponential backoff.
Complies with IMPLEMENTATION_RULES.md (Rules 1-5) and TECH_SPEC.md §4.
"""

import json
import logging
import random
import sys
import time
from pathlib import Path
from typing import Any

import httpx

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import (
    OPENF1_BASE_URL,
    OPENF1_MAX_RETRIES,
    OPENF1_REQUESTS_PER_SECOND,
    OPENF1_TIMEOUT_SECONDS,
    RAW_DATA_DIR,
)

logger = logging.getLogger("paceiq.openf1_client")


class SchemaError(Exception):
    """Raised when an OpenF1 response fails critical schema validation."""


class OpenF1Client:
    def __init__(
        self,
        base_url: str = OPENF1_BASE_URL,
        raw_data_dir: Path = RAW_DATA_DIR,
        requests_per_second: float = OPENF1_REQUESTS_PER_SECOND,
        max_retries: int = OPENF1_MAX_RETRIES,
        timeout: float = OPENF1_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.raw_data_dir = raw_data_dir
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0.0
        self.max_retries = max_retries
        self.timeout = timeout
        self.client = httpx.Client(
            timeout=httpx.Timeout(self.timeout, connect=self.timeout),
            headers={"User-Agent": "PaceIQ/1.0 (Race Outcome Predictor)"},
        )

    def _wait_for_rate_limit(self) -> None:
        """Throttle requests to respect rate limit."""
        now = time.monotonic()
        elapsed = now - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.monotonic()

    def get_cached_path(self, endpoint: str, identifier: str) -> Path:
        """Returns the local path for raw cached JSON."""
        endpoint_dir = self.raw_data_dir / endpoint
        endpoint_dir.mkdir(parents=True, exist_ok=True)
        return endpoint_dir / f"{identifier}.json"

    def fetch(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
        cache_key: str | None = None,
        refresh: bool = False,
    ) -> list[dict[str, Any]]:
        """
        Fetch data from an OpenF1 endpoint.
        Uses cached raw response if available and refresh is False.
        """
        params = params or {}
        # If no explicit cache_key, build from params or query
        if not cache_key:
            if "session_key" in params:
                cache_key = str(params["session_key"])
            elif "meeting_key" in params:
                cache_key = f"meeting_{params['meeting_key']}"
            elif "year" in params:
                cache_key = f"year_{params['year']}"
            else:
                cache_key = "default"

        cache_file = self.get_cached_path(endpoint, cache_key)

        # Cache check
        if cache_file.exists() and not refresh:
            try:
                with open(cache_file, encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                logger.warning(f"Corrupt cache file {cache_file}, refetching: {e}")

        # Network request with exponential backoff and jitter
        url = f"{self.base_url}/{endpoint}"
        attempts = 0
        backoff = 10.0  # OpenF1 rate window is 10s, so backoff starts at 10s on 429

        while attempts < self.max_retries:
            attempts += 1
            self._wait_for_rate_limit()

            try:
                resp = self.client.get(url, params=params)

                # Rate limited: 429
                if resp.status_code == 429:
                    retry_after_hdr = resp.headers.get("Retry-After")
                    if retry_after_hdr and retry_after_hdr.isdigit():
                        sleep_time = float(retry_after_hdr) + 1.0
                    else:
                        jitter = random.uniform(0.5, 2.0)
                        sleep_time = backoff + jitter
                    logger.warning(
                        f"Rate limited (429) for {url}. Waiting {sleep_time:.2f}s for sliding window (attempt {attempts}/{self.max_retries})"
                    )
                    time.sleep(sleep_time)
                    backoff *= 1.5
                    continue

                # 404 No results found is considered empty valid data in OpenF1
                if resp.status_code == 404:
                    empty_data: list[dict[str, Any]] = []
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(empty_data, f, indent=2)
                    return empty_data

                # Server error: 5xx
                if resp.status_code >= 500:
                    if attempts < 3:
                        time.sleep(1.0 + random.uniform(0.1, 0.3))
                        continue
                    resp.raise_for_status()

                resp.raise_for_status()
                data = resp.json()

                if not isinstance(data, list):
                    data = [data]

                # Cache raw response as received before any parsing (Rule 1 & 2)
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)

                return data

            except httpx.RequestError as e:
                logger.error(
                    f"Network error on {url} (attempt {attempts}/{self.max_retries}): {e}"
                )
                if attempts >= self.max_retries:
                    raise
                time.sleep(backoff)
                backoff *= 1.5

        logger.error(
            f"Failed to fetch {url} after {self.max_retries} attempts; returning empty result."
        )
        return []

    def close(self) -> None:
        self.client.close()
