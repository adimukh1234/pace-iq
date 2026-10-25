"""
Dedicated 2026 Season Ingestion Script.
Ingests all 23 official 2026 rounds from Jolpica (17 completed + 6 upcoming as of Oct 25, 2026).
"""

import sqlite3
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import DB_PATH
from backend.app.db import SessionLocal
from backend.pipeline.jolpica_client import JolpicaClient


def run():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Clean old mock 2026 entries
    for t in ["session_results", "starting_grids", "drivers"]:
        c.execute(f"DELETE FROM {t} WHERE session_key LIKE '2026%'")
    conn.commit()
    conn.close()
    print("Cleaned 2026 session results, grids, and drivers.")

    # Ingest full 2026 season from Jolpica
    db = SessionLocal()
    client = JolpicaClient()
    races_count = client.ingest_season(db, 2026)
    print(f"Successfully ingested {races_count} Grand Prix events for 2026.")
    db.close()


if __name__ == "__main__":
    run()

