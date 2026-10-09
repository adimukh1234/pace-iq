"""
Transform pipeline for PaceIQ.
Parses cached raw JSON files and loads tidy records into SQLite database.
Idempotent and type-safe. Prints table row counts and null rates upon completion.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from backend.app.config import CIRCUIT_TYPE_LOOKUP, RAW_DATA_DIR
from backend.app.db import (
    Driver,
    Lap,
    Meeting,
    RaceControl,
    Session,
    SessionLocal,
    SessionResult,
    StartingGrid,
    Stint,
    Weather,
    init_db,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("paceiq.transform")


def load_raw_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else [data]
    except (json.JSONDecodeError, OSError) as e:
        logger.warning(f"Error reading {path}: {e}")
        return []


def transform_and_load(db: DBSession) -> None:
    logger.info("Initializing database schema...")
    init_db()

    # 1. Meetings
    meetings_dir = RAW_DATA_DIR / "meetings"
    if meetings_dir.exists():
        logger.info("Transforming meetings...")
        for p in meetings_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                m_key = item.get("meeting_key")
                if not m_key:
                    continue
                short_circuit = item.get("circuit_short_name", "")
                ctype = CIRCUIT_TYPE_LOOKUP.get(short_circuit, "mixed")
                db.merge(
                    Meeting(
                        meeting_key=m_key,
                        meeting_name=item.get("meeting_name", "Unknown GP"),
                        circuit_key=item.get("circuit_key"),
                        circuit_short_name=short_circuit,
                        country_name=item.get("country_name"),
                        country_code=item.get("country_code"),
                        year=item.get("year", 2024),
                        date_start=item.get("date_start", ""),
                        circuit_type=ctype,
                    )
                )
        db.commit()

    # 2. Sessions
    sessions_dir = RAW_DATA_DIR / "sessions"
    if sessions_dir.exists():
        logger.info("Transforming sessions...")
        for p in sessions_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                m_key = item.get("meeting_key")
                if not s_key or not m_key:
                    continue
                db.merge(
                    Session(
                        session_key=s_key,
                        meeting_key=m_key,
                        session_name=item.get("session_name", ""),
                        session_type=item.get("session_type", ""),
                        date_start=item.get("date_start", ""),
                        date_end=item.get("date_end"),
                        year=item.get("year", 2024),
                    )
                )
        db.commit()

    # 3. Drivers
    drivers_dir = RAW_DATA_DIR / "drivers"
    if drivers_dir.exists():
        logger.info("Transforming drivers...")
        for p in drivers_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                d_num = item.get("driver_number")
                if not s_key or not d_num:
                    continue
                colour = item.get("team_colour") or "7C7C88"
                if not colour.startswith("#"):
                    colour = f"#{colour}"
                db.merge(
                    Driver(
                        session_key=s_key,
                        driver_number=d_num,
                        meeting_key=item.get("meeting_key", 0),
                        broadcast_name=item.get("broadcast_name"),
                        full_name=item.get("full_name", f"Driver {d_num}"),
                        name_acronym=item.get("name_acronym", f"D{d_num}"),
                        team_name=item.get("team_name", "Independent"),
                        team_colour=colour,
                        first_name=item.get("first_name"),
                        last_name=item.get("last_name"),
                        headshot_url=item.get("headshot_url"),
                        country_code=item.get("country_code"),
                    )
                )
        db.commit()

    # 4. Starting Grid
    grid_dir = RAW_DATA_DIR / "starting_grid"
    if grid_dir.exists():
        logger.info("Transforming starting_grid...")
        for p in grid_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                m_key = item.get("meeting_key")
                d_num = item.get("driver_number")
                pos = item.get("position")
                if not m_key or not d_num or pos is None:
                    continue
                db.merge(
                    StartingGrid(
                        meeting_key=m_key,
                        driver_number=d_num,
                        session_key=item.get("session_key", 0),
                        position=int(pos),
                        lap_duration=item.get("lap_duration"),
                    )
                )
        db.commit()

    # 5. Session Results
    results_dir = RAW_DATA_DIR / "session_result"
    if results_dir.exists():
        logger.info("Transforming session_results...")
        for p in results_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                d_num = item.get("driver_number")
                pos = item.get("position")
                if not s_key or not d_num or pos is None:
                    continue
                db.merge(
                    SessionResult(
                        session_key=s_key,
                        driver_number=d_num,
                        meeting_key=item.get("meeting_key", 0),
                        position=int(pos),
                        number_of_laps=item.get("number_of_laps", 0),
                        points=float(item.get("points") or 0.0),
                        dnf=bool(item.get("dnf", False)),
                        dns=bool(item.get("dns", False)),
                        dsq=bool(item.get("dsq", False)),
                        duration=item.get("duration"),
                        gap_to_leader=(
                            float(item.get("gap_to_leader"))
                            if isinstance(item.get("gap_to_leader"), (int, float))
                            else None
                        ),
                    )
                )
        db.commit()

    # 6. Laps (bulk batch insert for performance)
    laps_dir = RAW_DATA_DIR / "laps"
    if laps_dir.exists():
        logger.info("Transforming laps...")
        # Clear existing laps to make re-run idempotent
        db.execute(text("DELETE FROM laps"))
        db.commit()

        lap_records: list[Lap] = []
        for p in laps_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                d_num = item.get("driver_number")
                l_num = item.get("lap_number")
                if not s_key or not d_num or l_num is None:
                    continue
                lap_records.append(
                    Lap(
                        session_key=s_key,
                        meeting_key=item.get("meeting_key", 0),
                        driver_number=d_num,
                        lap_number=int(l_num),
                        lap_duration=item.get("lap_duration"),
                        duration_sector_1=item.get("duration_sector_1"),
                        duration_sector_2=item.get("duration_sector_2"),
                        duration_sector_3=item.get("duration_sector_3"),
                        is_pit_out_lap=bool(item.get("is_pit_out_lap", False)),
                        date_start=item.get("date_start"),
                    )
                )
                if len(lap_records) >= 5000:
                    db.bulk_save_objects(lap_records)
                    db.commit()
                    lap_records = []
        if lap_records:
            db.bulk_save_objects(lap_records)
            db.commit()

    # 7. Stints
    stints_dir = RAW_DATA_DIR / "stints"
    if stints_dir.exists():
        logger.info("Transforming stints...")
        for p in stints_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                d_num = item.get("driver_number")
                stint_num = item.get("stint_number")
                if not s_key or not d_num or stint_num is None:
                    continue
                l_start = item.get("lap_start")
                l_end = item.get("lap_end")
                db.merge(
                    Stint(
                        session_key=s_key,
                        driver_number=d_num,
                        stint_number=int(stint_num),
                        meeting_key=item.get("meeting_key", 0),
                        lap_start=int(l_start) if l_start is not None else 1,
                        lap_end=int(l_end) if l_end is not None else 1,
                        compound=str(item.get("compound", "UNKNOWN")).upper(),
                        tyre_age_at_start=int(item.get("tyre_age_at_start") or 0),
                    )
                )
        db.commit()

    # 8. Weather
    weather_dir = RAW_DATA_DIR / "weather"
    if weather_dir.exists():
        logger.info("Transforming weather...")
        db.execute(text("DELETE FROM weather"))
        db.commit()
        weather_records: list[Weather] = []
        for p in weather_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                date_val = item.get("date")
                if not s_key or not date_val:
                    continue
                weather_records.append(
                    Weather(
                        session_key=s_key,
                        meeting_key=item.get("meeting_key"),
                        date=date_val,
                        air_temperature=item.get("air_temperature"),
                        track_temperature=item.get("track_temperature"),
                        humidity=item.get("humidity"),
                        pressure=item.get("pressure"),
                        rainfall=int(item.get("rainfall") or 0),
                        wind_speed=item.get("wind_speed"),
                    )
                )
                if len(weather_records) >= 5000:
                    db.bulk_save_objects(weather_records)
                    db.commit()
                    weather_records = []
        if weather_records:
            db.bulk_save_objects(weather_records)
            db.commit()

    # 9. Race Control
    rc_dir = RAW_DATA_DIR / "race_control"
    if rc_dir.exists():
        logger.info("Transforming race_control...")
        db.execute(text("DELETE FROM race_control"))
        db.commit()
        rc_records: list[RaceControl] = []
        for p in rc_dir.glob("*.json"):
            items = load_raw_json(p)
            for item in items:
                s_key = item.get("session_key")
                date_val = item.get("date")
                if not s_key or not date_val:
                    continue
                rc_records.append(
                    RaceControl(
                        session_key=s_key,
                        meeting_key=item.get("meeting_key"),
                        date=date_val,
                        category=item.get("category"),
                        flag=item.get("flag"),
                        scope=item.get("scope"),
                        message=item.get("message"),
                        lap_number=item.get("lap_number"),
                    )
                )
        if rc_records:
            db.bulk_save_objects(rc_records)
            db.commit()

    logger.info("Transformation finished successfully!")


def print_table_metrics(db: DBSession) -> None:
    """Print row counts and null rates for each table as required by Milestone 3."""
    tables = [
        "meetings",
        "sessions",
        "drivers",
        "starting_grids",
        "session_results",
        "laps",
        "stints",
        "weather",
        "race_control",
    ]

    print("\n" + "=" * 55)
    print("PACEIQ DATABASE VALIDATION & ROW METRICS")
    print("=" * 55)

    for tbl in tables:
        count = db.execute(text(f"SELECT COUNT(*) FROM {tbl}")).scalar() or 0
        print(f"Table '{tbl}': {count:,} rows")
        if count > 0:
            df = pd.read_sql(f"SELECT * FROM {tbl} LIMIT 1000", db.connection())
            null_pcts = (df.isnull().mean() * 100).round(1).to_dict()
            null_summary = ", ".join(
                f"{k}: {v}%" for k, v in null_pcts.items() if v > 0
            )
            if null_summary:
                print(f"   Null rates: {null_summary}")
            else:
                print("   Null rates: 0% across all columns")
    print("=" * 55 + "\n")


def main():
    db = SessionLocal()
    try:
        transform_and_load(db)
        print_table_metrics(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
