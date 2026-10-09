"""
Data Ingestion Pipeline for PaceIQ.
Fetches and caches OpenF1 sessions, meetings, laps, stints, results, and telemetry.
Complies with IMPLEMENTATION_RULES.md (Rules 1-7, 56-57) and TECH_SPEC.md §4.
"""

import argparse
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import (
    LOGS_DIR,
    RAW_DATA_DIR,
    SEASONS,
)
from backend.pipeline.openf1_client import OpenF1Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("paceiq.ingest")


def ingest_all(
    seasons: list[int] = SEASONS,
    refresh: bool = False,
    limit_races: int | None = None,
) -> None:
    """
    Main ingestion routine. Idempotent: checks cache before making any HTTP requests.
    """
    run_timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    log_file = LOGS_DIR / f"ingest_{run_timestamp}.txt"
    log_lines: list[str] = []

    def log(msg: str):
        logger.info(msg)
        log_lines.append(f"{datetime.now(UTC).isoformat()} - {msg}")

    log(f"Starting PaceIQ Ingestion for seasons: {seasons}")
    client = OpenF1Client(raw_data_dir=RAW_DATA_DIR)

    total_sessions_processed = 0
    total_endpoints_called = 0

    try:
        for year in seasons:
            log(f"--- Processing Season {year} ---")

            # 1. Meetings for year
            meetings = client.fetch(
                "meetings",
                params={"year": year},
                cache_key=f"year_{year}",
                refresh=refresh,
            )
            total_endpoints_called += 1
            log(f"Season {year}: Ingested {len(meetings)} meetings")

            # 2. All sessions for year
            all_sessions = client.fetch(
                "sessions",
                params={"year": year},
                cache_key=f"year_{year}",
                refresh=refresh,
            )
            total_endpoints_called += 1
            log(f"Season {year}: Ingested {len(all_sessions)} total sessions")

            # Filter race sessions
            race_sessions = [s for s in all_sessions if s.get("session_name") == "Race"]
            if limit_races:
                race_sessions = race_sessions[:limit_races]
                log(f"Limiting race sessions to first {limit_races}")

            for race in race_sessions:
                race_session_key = race["session_key"]
                meeting_key = race["meeting_key"]
                country = race.get("country_name", "Unknown")
                log(f"-> Ingesting Race {race_session_key} ({country})")

                # Meeting sessions (qualifying, practice, race)
                meeting_sessions = [
                    s for s in all_sessions if s.get("meeting_key") == meeting_key
                ]

                # Ingest Starting Grid (using meeting_key)
                client.fetch(
                    "starting_grid",
                    params={"meeting_key": meeting_key},
                    cache_key=f"meeting_{meeting_key}",
                    refresh=refresh,
                )
                total_endpoints_called += 1

                # Ingest Race-specific endpoints
                for ep in [
                    "session_result",
                    "drivers",
                    "laps",
                    "stints",
                    "weather",
                    "race_control",
                    "pit",
                ]:
                    client.fetch(
                        ep,
                        params={"session_key": race_session_key},
                        cache_key=str(race_session_key),
                        refresh=refresh,
                    )
                    total_endpoints_called += 1

                # Ingest Practice and Qualifying sessions for this meeting
                for session in meeting_sessions:
                    s_key = session["session_key"]
                    s_name = session.get("session_name", "")
                    if s_name in [
                        "Qualifying",
                        "Practice 1",
                        "Practice 2",
                        "Practice 3",
                    ]:
                        client.fetch(
                            "laps",
                            params={"session_key": s_key},
                            cache_key=str(s_key),
                            refresh=refresh,
                        )
                        client.fetch(
                            "drivers",
                            params={"session_key": s_key},
                            cache_key=str(s_key),
                            refresh=refresh,
                        )
                        client.fetch(
                            "weather",
                            params={"session_key": s_key},
                            cache_key=str(s_key),
                            refresh=refresh,
                        )
                        if "Practice" in s_name:
                            client.fetch(
                                "stints",
                                params={"session_key": s_key},
                                cache_key=str(s_key),
                                refresh=refresh,
                            )
                        total_endpoints_called += 3

                total_sessions_processed += 1

    except Exception as e:
        log(f"ERROR during ingestion: {e}")
        raise
    finally:
        client.close()
        log(
            f"Ingestion finished. Total race meetings processed: {total_sessions_processed}. Endpoint queries: {total_endpoints_called}"
        )
        with open(log_file, "w", encoding="utf-8") as f:
            f.write("\n".join(log_lines) + "\n")
        log(f"Summary log saved to {log_file}")


def main():
    parser = argparse.ArgumentParser(description="PaceIQ OpenF1 Data Ingestion")
    parser.add_argument(
        "--seasons",
        nargs="+",
        type=int,
        default=SEASONS,
        help="Seasons to ingest (default: 2024 2025)",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Bypass cache and re-fetch from OpenF1",
    )
    parser.add_argument(
        "--limit-races",
        type=int,
        default=None,
        help="Optional limit on number of races per season",
    )
    args = parser.parse_args()

    ingest_all(
        seasons=args.seasons,
        refresh=args.refresh,
        limit_races=args.limit_races,
    )


if __name__ == "__main__":
    main()
