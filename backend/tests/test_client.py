"""
Tests for OpenF1Client: caching, throttling, backoff, and mock responses.
"""

import json
from pathlib import Path

import httpx

from backend.pipeline.openf1_client import OpenF1Client


def test_cache_hit_makes_no_network_call(tmp_path: Path):
    """Rule 53: Ingestion cache test (no network call on cache hit)."""
    raw_dir = tmp_path / "raw"
    client = OpenF1Client(raw_data_dir=raw_dir)

    # Pre-seed cache
    sessions_dir = raw_dir / "sessions"
    sessions_dir.mkdir(parents=True, exist_ok=True)
    fake_data = [{"session_key": 9999, "session_name": "Test Race"}]
    with open(sessions_dir / "9999.json", "w", encoding="utf-8") as f:
        json.dump(fake_data, f)

    # Mock client to fail if network is touched
    def mock_get(*args, **kwargs):
        raise AssertionError("Network was called on a cache hit!")

    client.client.get = mock_get  # type: ignore

    res = client.fetch("sessions", params={"session_key": 9999})
    assert res == fake_data


def test_404_treated_as_empty_and_cached(tmp_path: Path, monkeypatch):
    """OpenF1 returns 404 for empty query results."""
    raw_dir = tmp_path / "raw"
    client = OpenF1Client(raw_data_dir=raw_dir)

    def mock_get(url, params=None):
        return httpx.Response(status_code=404, json={"detail": "No results found."})

    client.client.get = mock_get  # type: ignore

    res = client.fetch("starting_grid", params={"session_key": 8888})
    assert res == []
    assert (raw_dir / "starting_grid" / "8888.json").exists()
