"""
Exploration script for OpenF1 API (Milestone 1).
Queries key endpoints with correct filters, saves sample JSON payloads to backend/tests/fixtures/,
and generates API_NOTES.md detailing findings, schema structures, and surprises.
"""

import json
import time
from pathlib import Path

import httpx

BASE_URL = "https://api.openf1.org/v1"
FIXTURES_DIR = Path(__file__).resolve().parent.parent / "tests" / "fixtures"
FIXTURES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "PaceIQ-Explorer/1.0"}


def fetch_and_save(
    client: httpx.Client, endpoint: str, params: dict, output_filename: str
):
    url = f"{BASE_URL}/{endpoint}"
    print(f"Fetching {url} with {params}...")
    resp = client.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    out_path = FIXTURES_DIR / output_filename
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    count = len(data) if isinstance(data, list) else 1
    print(f"  -> Saved {count} items to {out_path.name}")
    time.sleep(0.35)  # Respect rate limit
    return data


def main():
    print("=== OpenF1 API Exploration ===")
    with httpx.Client(timeout=15.0, headers=HEADERS) as client:
        # 1. Sessions for 2024 Race
        sessions = fetch_and_save(
            client,
            "sessions",
            {"year": 2024, "session_name": "Race"},
            "sample_sessions.json",
        )
        sample_race = sessions[0]
        session_key = sample_race["session_key"]
        meeting_key = sample_race["meeting_key"]
        print(
            f"Using race session_key={session_key}, meeting_key={meeting_key} ({sample_race.get('meeting_name', sample_race.get('country_name'))})"
        )

        # 2. Meetings for 2024
        fetch_and_save(
            client, "meetings", {"meeting_key": meeting_key}, "sample_meetings.json"
        )

        # 3. Starting grid (requires meeting_key, associated with qualifying session)
        fetch_and_save(
            client,
            "starting_grid",
            {"meeting_key": meeting_key},
            "sample_starting_grid.json",
        )

        # 4. Session result (final classification for the race)
        fetch_and_save(
            client,
            "session_result",
            {"session_key": session_key},
            "sample_session_result.json",
        )

        # 5. Stints
        fetch_and_save(
            client, "stints", {"session_key": session_key}, "sample_stints.json"
        )

        # 6. Laps (trimmed sample for driver 1 to keep fixture compact)
        fetch_and_save(
            client,
            "laps",
            {"session_key": session_key, "driver_number": 1},
            "sample_laps.json",
        )

        # 7. Drivers
        fetch_and_save(
            client, "drivers", {"session_key": session_key}, "sample_drivers.json"
        )

        # 8. Weather
        fetch_and_save(
            client, "weather", {"session_key": session_key}, "sample_weather.json"
        )

        # 9. Race control
        fetch_and_save(
            client,
            "race_control",
            {"session_key": session_key},
            "sample_race_control.json",
        )

        # 10. Position (sample first 100 entries)
        fetch_and_save(
            client,
            "position",
            {"session_key": session_key, "driver_number": 1},
            "sample_position.json",
        )

    print("\nAll fixtures saved successfully!")


if __name__ == "__main__":
    main()
