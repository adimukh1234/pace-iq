"""
Update 2026 Season results from Jolpica API.
Fetches the latest completed races (including Round 17 Singapore GP)
and updates the database tables (session_results, starting_grids, drivers).
"""

import json
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import DATA_DIR
from backend.app.db import SessionLocal, SessionResult, Driver, StartingGrid, Meeting, Session
from backend.pipeline.jolpica_client import JolpicaClient

def update_2026():
    client = JolpicaClient()
    year = 2026
    season_dir = client.cache_dir / str(year)
    season_dir.mkdir(parents=True, exist_ok=True)
    results_file = season_dir / "results.json"
    quali_file = season_dir / "qualifying.json"
    schedule_file = season_dir / "schedule.json"

    print("Fetching latest 2026 results from Jolpica...")
    results_races = client.fetch_paginated(f"{year}/results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(results_races, f, indent=2)
    print(f"Saved {len(results_races)} race result batches to {results_file}.")

    print("Fetching latest 2026 qualifying from Jolpica...")
    quali_races = client.fetch_paginated(f"{year}/qualifying.json")
    with open(quali_file, "w", encoding="utf-8") as f:
        json.dump(quali_races, f, indent=2)
    print(f"Saved {len(quali_races)} qualifying batches to {quali_file}.")

    print("Fetching latest 2026 schedule from Jolpica...")
    schedule_races = client.fetch_paginated(f"{year}.json")
    with open(schedule_file, "w", encoding="utf-8") as f:
        json.dump(schedule_races, f, indent=2)
    print(f"Saved {len(schedule_races)} schedule entries to {schedule_file}.")

    # Ingest into database
    db = SessionLocal()
    print("Ingesting season data into database...")
    count = client.ingest_season(db, year)
    print(f"Ingested {count} rounds for season {year}.")

    # Verify completed races in DB
    completed_q = db.query(Session.session_key).join(SessionResult, SessionResult.session_key == Session.session_key).filter(Session.year == year, Session.session_name == "Race").distinct().all()
    print(f"Total completed 2026 races in database: {len(completed_q)}")

    # Check Singapore GP results
    singapore_results = db.query(SessionResult).filter(SessionResult.session_key == 2026175).order_by(SessionResult.position).all()
    print(f"Singapore GP (2026175) results count: {len(singapore_results)}")
    for res in singapore_results[:5]:
        driver = db.query(Driver).filter(Driver.session_key == 2026175, Driver.driver_number == res.driver_number).first()
        name = driver.full_name if driver else f"Driver #{res.driver_number}"
        print(f"  P{res.position}: {name} ({res.points} pts)")

    db.close()

if __name__ == "__main__":
    update_2026()
