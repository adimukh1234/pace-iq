"""
Jolpica F1 Client for Historical Multi-Season Telemetry.
Fetches complete 2021-2025 Formula 1 seasons (qualifying, starting grids, and official race results)
with zero authentication, token-efficient caching, and schema-normalization for PaceIQ.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import httpx
from sqlalchemy.orm import Session as DBSession

from backend.app.config import DATA_DIR
from backend.app.db import (
    Driver,
    Meeting,
    Session,
    SessionResult,
    StartingGrid,
)

logger = logging.getLogger("paceiq.jolpica")

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"
RAW_JOLPICA_DIR = DATA_DIR / "raw" / "jolpica"
RAW_JOLPICA_DIR.mkdir(parents=True, exist_ok=True)

CONSTRUCTOR_COLOURS = {
    "red_bull": "#3671C6",
    "ferrari": "#E80020",
    "mclaren": "#FF8000",
    "mercedes": "#27F4D2",
    "aston_martin": "#229971",
    "alpine": "#0093CC",
    "williams": "#64C4FF",
    "rb": "#6692FF",
    "alphatauri": "#5E8FAA",
    "toro_rosso": "#469BFF",
    "sauber": "#52E252",
    "alfa": "#C92D4B",
    "haas": "#B6BABD",
    "racing_point": "#F596C8",
    "renault": "#FFF500",
    "audi": "#E30613",
    "cadillac": "#C0C0C0",
}


def parse_lap_time_to_seconds(time_str: str | None) -> float | None:
    """Convert lap time string (e.g. '1:29.179' or '89.179') to seconds."""
    if not time_str:
        return None
    time_str = time_str.strip()
    try:
        if ":" in time_str:
            parts = time_str.split(":")
            return float(parts[0]) * 60.0 + float(parts[1])
        return float(time_str)
    except (ValueError, IndexError):
        return None


class JolpicaClient:
    """Client for fetching and caching F1 historical data from Jolpica."""

    def __init__(self, cache_dir: Path = RAW_JOLPICA_DIR) -> None:
        self.cache_dir = cache_dir
        self.http_client = httpx.Client(timeout=30.0)

    def fetch_paginated(self, endpoint: str, limit: int = 100) -> list[dict[str, Any]]:
        """Fetch all results from a paginated Jolpica endpoint."""
        all_items: list[dict[str, Any]] = []
        offset = 0

        while True:
            url = f"{JOLPICA_BASE}/{endpoint}?limit={limit}&offset={offset}"
            try:
                resp = self.http_client.get(url)
                if resp.status_code != 200:
                    break
                data = resp.json()
                mr_data = data.get("MRData", {})
                table_key = [k for k in mr_data.keys() if k.endswith("Table")]
                if not table_key:
                    break

                table = mr_data[table_key[0]]
                races = table.get("Races", [])
                if not races:
                    break

                all_items.extend(races)
                total = int(mr_data.get("total", 0))
                offset += limit
                if offset >= total:
                    break
            except Exception as e:
                logger.error(f"Error fetching {url}: {e}")
                break

        return all_items

    def get_season_data(self, year: int) -> dict[str, Any]:
        """Fetch and cache race results and qualifying for an entire season."""
        season_dir = self.cache_dir / str(year)
        season_dir.mkdir(parents=True, exist_ok=True)
        results_file = season_dir / "results.json"
        quali_file = season_dir / "qualifying.json"

        # Check local cache
        results_races = None
        quali_races = None

        schedule_file = season_dir / "schedule.json"
        schedule_races = None

        if results_file.exists():
            try:
                with open(results_file, encoding="utf-8") as f:
                    results_races = json.load(f)
            except Exception:
                pass

        if quali_file.exists():
            try:
                with open(quali_file, encoding="utf-8") as f:
                    quali_races = json.load(f)
            except Exception:
                pass

        if schedule_file.exists():
            try:
                with open(schedule_file, encoding="utf-8") as f:
                    schedule_races = json.load(f)
            except Exception:
                pass

        if not results_races:
            logger.info(f"Downloading {year} race results from Jolpica...")
            results_races = self.fetch_paginated(f"{year}/results.json")
            with open(results_file, "w", encoding="utf-8") as f:
                json.dump(results_races, f)

        if not quali_races:
            logger.info(f"Downloading {year} qualifying from Jolpica...")
            quali_races = self.fetch_paginated(f"{year}/qualifying.json")
            with open(quali_file, "w", encoding="utf-8") as f:
                json.dump(quali_races, f)

        if not schedule_races:
            logger.info(f"Downloading {year} schedule from Jolpica...")
            schedule_races = self.fetch_paginated(f"{year}.json")
            with open(schedule_file, "w", encoding="utf-8") as f:
                json.dump(schedule_races, f)

        return {"results": results_races, "qualifying": quali_races, "schedule": schedule_races or []}

    def ingest_season(self, db: DBSession, year: int) -> int:
        """
        Ingest a complete historical season into SQLite.
        Returns the number of races ingested.
        """
        data = self.get_season_data(year)

        # Merge paginated results by round
        results_by_round: dict[str, dict[str, Any]] = {}
        for r in data["results"]:
            rnd_key = str(r.get("round"))
            if rnd_key not in results_by_round:
                results_by_round[rnd_key] = dict(r)
            else:
                existing_res = results_by_round[rnd_key].get("Results", [])
                new_res = r.get("Results", [])
                seen_dns = {item.get("number") for item in existing_res}
                for item in new_res:
                    if item.get("number") not in seen_dns:
                        existing_res.append(item)
                results_by_round[rnd_key]["Results"] = existing_res

        # Merge paginated qualifying by round
        quali_by_round: dict[str, dict[str, Any]] = {}
        for q in data["qualifying"]:
            rnd_key = str(q.get("round"))
            if rnd_key not in quali_by_round:
                quali_by_round[rnd_key] = dict(q)
            else:
                existing_q = quali_by_round[rnd_key].get("QualifyingResults", [])
                new_q = q.get("QualifyingResults", [])
                seen_dns = {item.get("number") for item in existing_q}
                for item in new_q:
                    if item.get("number") not in seen_dns:
                        existing_q.append(item)
                quali_by_round[rnd_key]["QualifyingResults"] = existing_q

        # Schedule lookup
        schedule_by_round: dict[str, dict[str, Any]] = {}
        for s in data.get("schedule", []):
            schedule_by_round[str(s.get("round"))] = s

        all_rounds = sorted(
            list(set(schedule_by_round.keys()) | set(results_by_round.keys()) | set(quali_by_round.keys())),
            key=lambda x: int(x) if x.isdigit() else 0,
        )

        races_count = 0
        latest_driver_roster: list[dict[str, Any]] = []

        from backend.app.config import CIRCUIT_TYPE_LOOKUP

        for rnd in all_rounds:
            res_race = results_by_round.get(rnd)
            quali_race = quali_by_round.get(rnd)
            sched_race = schedule_by_round.get(rnd)
            race_info = res_race or quali_race or sched_race
            if not race_info:
                continue

            rnd_int = int(rnd) if rnd.isdigit() else 1
            meeting_key = year * 100 + rnd_int
            session_key = meeting_key * 10 + 5  # Race session
            quali_session_key = meeting_key * 10 + 4  # Quali session

            race_name = race_info.get("raceName", f"Round {rnd}")
            circuit = race_info.get("Circuit", {})
            circuit_name = circuit.get("circuitName", "")
            location = circuit.get("Location", {})
            country = location.get("country", "")
            locality = location.get("locality", "")
            circuit_short = locality or circuit_name.split()[0]
            circuit_type = CIRCUIT_TYPE_LOOKUP.get(circuit_short, "mixed")

            race_date = race_info.get("date", f"{year}-06-01")
            race_time = race_info.get("time", "14:00:00Z")
            date_start = f"{race_date}T{race_time}"

            q_info = race_info.get("Qualifying", {})
            q_date = q_info.get("date")
            q_time = q_info.get("time", "14:00:00Z")
            if q_date:
                quali_date_start = f"{q_date}T{q_time}"
            else:
                quali_date_start = f"{race_date}T12:00:00Z"

            # 1. Upsert Meeting
            existing_meeting = db.query(Meeting).filter(Meeting.meeting_key == meeting_key).first()
            if not existing_meeting:
                meeting = Meeting(
                    meeting_key=meeting_key,
                    meeting_name=race_name,
                    circuit_short_name=circuit_short,
                    circuit_type=circuit_type,
                    country_name=country,
                    year=year,
                    date_start=date_start,
                )
                db.add(meeting)
                db.commit()
            else:
                existing_meeting.circuit_type = circuit_type
                existing_meeting.date_start = date_start
                db.commit()

            # 2. Upsert Race Session
            existing_sess = db.query(Session).filter(Session.session_key == session_key).first()
            if not existing_sess:
                sess = Session(
                    session_key=session_key,
                    meeting_key=meeting_key,
                    session_name="Race",
                    session_type="Race",
                    date_start=date_start,
                    year=year,
                )
                db.add(sess)
                db.commit()
            else:
                existing_sess.date_start = date_start
                db.commit()

            # 3. Upsert Quali Session
            existing_qsess = db.query(Session).filter(Session.session_key == quali_session_key).first()
            if not existing_qsess:
                qsess = Session(
                    session_key=quali_session_key,
                    meeting_key=meeting_key,
                    session_name="Qualifying",
                    session_type="Qualifying",
                    date_start=quali_date_start,
                    year=year,
                )
                db.add(qsess)
                db.commit()
            else:
                existing_qsess.date_start = quali_date_start
                db.commit()

            # 4. Process Qualifying times for pole gap calculation
            quali_results = quali_race.get("QualifyingResults", []) if quali_race else []
            pole_time_s: float | None = None
            best_times: dict[int, float] = {}

            for q_res in quali_results:
                d_num_str = q_res.get("number", "0")
                if not d_num_str.isdigit():
                    continue
                d_num = int(d_num_str)
                # Best time among Q3, Q2, Q1
                q3_s = parse_lap_time_to_seconds(q_res.get("Q3"))
                q2_s = parse_lap_time_to_seconds(q_res.get("Q2"))
                q1_s = parse_lap_time_to_seconds(q_res.get("Q1"))
                best_s = q3_s or q2_s or q1_s
                if best_s:
                    best_times[d_num] = best_s
                    if q_res.get("position") == "1":
                        pole_time_s = best_s

            # 5. Ingest Drivers, Grids, and Results
            race_results = res_race.get("Results", []) if res_race else []

            if race_results:
                latest_driver_roster = race_results

            # Use active roster for upcoming races so that predictions can be generated
            drivers_to_ingest = race_results if race_results else latest_driver_roster

            for r_res in drivers_to_ingest:
                d_data = r_res.get("Driver", {})
                c_data = r_res.get("Constructor", {})
                d_num_str = r_res.get("number", "0")
                if not d_num_str.isdigit():
                    continue
                d_num = int(d_num_str)
                first_name = d_data.get("givenName", "")
                last_name = d_data.get("familyName", "")
                full_name = f"{first_name} {last_name}".strip()
                code = d_data.get("code") or (last_name[:3].upper() if last_name else f"D{d_num}")
                constructor_id = c_data.get("constructorId", "unknown")
                team_name = c_data.get("name", "Unknown")
                team_colour = CONSTRUCTOR_COLOURS.get(constructor_id, "#E10600")

                grid_pos_str = r_res.get("grid", "20")
                grid_pos = int(grid_pos_str) if grid_pos_str.isdigit() and int(grid_pos_str) > 0 else 20

                fin_pos_str = r_res.get("position", "20")
                fin_pos = int(fin_pos_str) if fin_pos_str.isdigit() else 20

                points_str = r_res.get("points", "0")
                points = float(points_str) if points_str else 0.0

                laps_str = r_res.get("laps", "0")
                laps_count = int(laps_str) if laps_str.isdigit() else 50

                status_str = r_res.get("status", "Finished")
                is_dnf = status_str != "Finished" and not status_str.startswith("+")

                # Upsert Driver
                existing_d = (
                    db.query(Driver)
                    .filter(Driver.session_key == session_key, Driver.driver_number == d_num)
                    .first()
                )
                if not existing_d:
                    db.add(
                        Driver(
                            session_key=session_key,
                            meeting_key=meeting_key,
                            driver_number=d_num,
                            broadcast_name=code,
                            full_name=full_name,
                            name_acronym=code,
                            team_name=team_name,
                            team_colour=team_colour,
                            first_name=first_name,
                            last_name=last_name,
                        )
                    )

                # Upsert StartingGrid
                existing_g = (
                    db.query(StartingGrid)
                    .filter(StartingGrid.session_key == quali_session_key, StartingGrid.driver_number == d_num)
                    .first()
                )
                if not existing_g:
                    db.add(
                        StartingGrid(
                            session_key=quali_session_key,
                            meeting_key=meeting_key,
                            driver_number=d_num,
                            position=grid_pos,
                        )
                    )

                # Only upsert SessionResult IF this race actually finished (has race_results)
                if race_results:
                    existing_res = (
                        db.query(SessionResult)
                        .filter(SessionResult.session_key == session_key, SessionResult.driver_number == d_num)
                        .first()
                    )
                    if not existing_res:
                        db.add(
                            SessionResult(
                                session_key=session_key,
                                meeting_key=meeting_key,
                                driver_number=d_num,
                                position=fin_pos,
                                points=points,
                                dnf=is_dnf,
                                number_of_laps=laps_count,
                            )
                        )

            db.commit()
            races_count += 1

        return races_count
