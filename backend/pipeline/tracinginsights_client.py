"""
TracingInsights Ingestion Client for PaceIQ.
Downloads FastF1/Timing telemetry archives from TracingInsights GitHub repositories.
Supports 2024, 2025, and 2026 seasons with automatic offline caching and schema normalization.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import httpx
import pandas as pd
from sqlalchemy.orm import Session as DBSession

from backend.app.config import DATA_DIR
from backend.app.db import (
    Driver,
    Lap,
    Meeting,
    Session,
    SessionResult,
    StartingGrid,
    Stint,
    Weather,
)

RAW_TI_DIR = DATA_DIR / "raw" / "tracinginsights"
RAW_TI_DIR.mkdir(parents=True, exist_ok=True)

GITHUB_RAW_BASE = "https://raw.githubusercontent.com/TracingInsights"

# Circuit metadata lookup with official 2026 Grand Prix dates
CIRCUIT_LOOKUP = {
    "Bahrain Grand Prix": {
        "short_name": "Sakhir",
        "country": "Bahrain",
        "m_key": 202601,
        "meeting_date": "2026-02-27T10:00:00+00:00",
        "race_date": "2026-03-01T15:00:00+00:00",
        "quali_date": "2026-02-28T16:00:00+00:00",
        "fp_date": "2026-02-27T11:30:00+00:00",
    },
    "Saudi Arabian Grand Prix": {
        "short_name": "Jeddah",
        "country": "Saudi Arabia",
        "m_key": 202602,
        "meeting_date": "2026-03-06T10:00:00+00:00",
        "race_date": "2026-03-08T17:00:00+00:00",
        "quali_date": "2026-03-07T17:00:00+00:00",
        "fp_date": "2026-03-06T13:30:00+00:00",
    },
    "Australian Grand Prix": {
        "short_name": "Melbourne",
        "country": "Australia",
        "m_key": 202603,
        "meeting_date": "2026-03-20T01:00:00+00:00",
        "race_date": "2026-03-22T04:00:00+00:00",
        "quali_date": "2026-03-21T05:00:00+00:00",
        "fp_date": "2026-03-20T01:30:00+00:00",
    },
    "Japanese Grand Prix": {
        "short_name": "Suzuka",
        "country": "Japan",
        "m_key": 202604,
        "meeting_date": "2026-04-03T02:00:00+00:00",
        "race_date": "2026-04-05T05:00:00+00:00",
        "quali_date": "2026-04-04T06:00:00+00:00",
        "fp_date": "2026-04-03T02:30:00+00:00",
    },
    "Chinese Grand Prix": {
        "short_name": "Shanghai",
        "country": "China",
        "m_key": 202605,
        "meeting_date": "2026-04-17T03:00:00+00:00",
        "race_date": "2026-04-19T07:00:00+00:00",
        "quali_date": "2026-04-18T07:00:00+00:00",
        "fp_date": "2026-04-17T03:30:00+00:00",
    },
}


class TracingInsightsClient:
    """Client for pulling telemetry data from TracingInsights archives."""

    def __init__(self, cache_dir: Path = RAW_TI_DIR) -> None:
        self.cache_dir = cache_dir
        self.http_client = httpx.Client(timeout=30.0)

    def fetch_file(self, year: int, gp_name: str, session_name: str, filename: str) -> dict[str, Any] | None:
        """Fetch a specific JSON file, checking local disk cache first."""
        safe_gp = gp_name.replace(" ", "_")
        safe_sess = session_name.replace(" ", "_")
        local_path = self.cache_dir / str(year) / safe_gp / safe_sess / filename

        if local_path.exists():
            try:
                with open(local_path, encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass

        # Fetch from GitHub
        encoded_gp = gp_name.replace(" ", "%20")
        encoded_sess = session_name.replace(" ", "%20")
        url = f"{GITHUB_RAW_BASE}/{year}/main/{encoded_gp}/{encoded_sess}/{filename}"

        try:
            resp = self.http_client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                local_path.parent.mkdir(parents=True, exist_ok=True)
                with open(local_path, "w", encoding="utf-8") as f:
                    json.dump(data, f)
                return data
        except Exception:
            pass

        return None

    def ingest_grand_prix(
        self,
        db: DBSession,
        year: int = 2026,
        gp_name: str = "Bahrain Grand Prix",
        meeting_key: int = 202601,
    ) -> bool:
        """Ingest complete Grand Prix weekend from TracingInsights into SQLite."""
        circuit_info = CIRCUIT_LOOKUP.get(
            gp_name, {
                "short_name": gp_name.split()[0],
                "country": "International",
                "m_key": meeting_key,
                "meeting_date": f"{year}-03-01T10:00:00+00:00",
                "race_date": f"{year}-03-02T15:00:00+00:00",
                "quali_date": f"{year}-03-01T16:00:00+00:00",
                "fp_date": f"{year}-03-01T12:00:00+00:00",
            }
        )

        meeting_date = circuit_info.get("meeting_date", f"{year}-03-01T10:00:00+00:00")
        race_date = circuit_info.get("race_date", f"{year}-03-02T15:00:00+00:00")
        quali_date = circuit_info.get("quali_date", f"{year}-03-01T16:00:00+00:00")
        fp_date = circuit_info.get("fp_date", f"{year}-03-01T12:00:00+00:00")

        # 1. Upsert Meeting
        existing_meeting = db.query(Meeting).filter(Meeting.meeting_key == meeting_key).first()
        if not existing_meeting:
            meeting = Meeting(
                meeting_key=meeting_key,
                meeting_name=gp_name,
                circuit_short_name=circuit_info["short_name"],
                country_name=circuit_info["country"],
                year=year,
                date_start=meeting_date,
            )
            db.add(meeting)
            db.commit()
        else:
            existing_meeting.date_start = meeting_date
            db.commit()

        sessions_to_load = [
            ("Practice 1", "Practice", meeting_key * 10 + 1, fp_date),
            ("Practice 2", "Practice", meeting_key * 10 + 2, fp_date),
            ("Practice 3", "Practice", meeting_key * 10 + 3, fp_date),
            ("Qualifying", "Qualifying", meeting_key * 10 + 4, quali_date),
            ("Race", "Race", meeting_key * 10 + 5, race_date),
        ]

        drivers_map: dict[int, dict[str, Any]] = {}
        race_laptimes_df: pd.DataFrame | None = None
        quali_laptimes_df: pd.DataFrame | None = None

        for sess_name, sess_type, sess_key, s_date in sessions_to_load:
            # Upsert Session record
            sess_obj = db.query(Session).filter(Session.session_key == sess_key).first()
            if not sess_obj:
                sess_obj = Session(
                    session_key=sess_key,
                    meeting_key=meeting_key,
                    session_name=sess_name,
                    session_type=sess_type,
                    date_start=s_date,
                    year=year,
                )
                db.add(sess_obj)
                db.commit()
            else:
                sess_obj.date_start = s_date
                db.commit()

            # Load drivers
            drivers_json = self.fetch_file(year, gp_name, sess_name, "drivers.json")
            if drivers_json and "drivers" in drivers_json:
                for d in drivers_json["drivers"]:
                    try:
                        d_num = int(d.get("dn", 0))
                        if d_num <= 0:
                            continue
                        drivers_map[d_num] = d

                        exist_d = (
                            db.query(Driver)
                            .filter(Driver.session_key == sess_key, Driver.driver_number == d_num)
                            .first()
                        )
                        if not exist_d:
                            db.add(
                                Driver(
                                    session_key=sess_key,
                                    meeting_key=meeting_key,
                                    driver_number=d_num,
                                    broadcast_name=f"{d.get('fn', '')} {d.get('ln', '')}".strip(),
                                    full_name=f"{d.get('fn', '')} {d.get('ln', '')}".strip(),
                                    name_acronym=d.get("driver", f"D{d_num}"),
                                    team_name=d.get("team", "Unknown"),
                                    team_colour=d.get("tc", "7C7C88"),
                                )
                            )
                    except Exception:
                        continue
                db.commit()

            # Load session laptimes
            laptimes_json = self.fetch_file(year, gp_name, sess_name, "session_laptimes.json")
            if laptimes_json:
                try:
                    df = pd.DataFrame(laptimes_json)
                    if sess_type == "Race":
                        race_laptimes_df = df
                    elif sess_type == "Qualifying":
                        quali_laptimes_df = df

                    # Ingest individual laps
                    if not df.empty and "dNum" in df.columns and "lap" in df.columns:
                        for _, row in df.iterrows():
                            try:
                                d_num = int(row["dNum"])
                                lap_num = int(row["lap"])
                                t_val = row.get("time")
                                lap_dur = float(t_val) if t_val not in (None, "None", "") else None
                                is_pout = bool(row.get("pout", False))
                                comp = str(row.get("compound", "")) if row.get("compound") not in (None, "None") else None

                                exist_lap = (
                                    db.query(Lap)
                                    .filter(
                                        Lap.session_key == sess_key,
                                        Lap.driver_number == d_num,
                                        Lap.lap_number == lap_num,
                                    )
                                    .first()
                                )
                                if not exist_lap:
                                    db.add(
                                        Lap(
                                            session_key=sess_key,
                                            meeting_key=meeting_key,
                                            driver_number=d_num,
                                            lap_number=lap_num,
                                            lap_duration=lap_dur,
                                            is_pit_out_lap=is_pout,
                                        )
                                    )
                            except Exception:
                                continue
                        db.commit()

                    # Ingest stints if available
                    if not df.empty and "stint" in df.columns:
                        stint_groups = df.groupby(["dNum", "stint"])
                        for (d_num_raw, stint_num_raw), s_df in stint_groups:
                            try:
                                d_num = int(d_num_raw)
                                stint_num = int(stint_num_raw)
                                lap_start = int(s_df["lap"].min())
                                lap_end = int(s_df["lap"].max())
                                comp = str(s_df["compound"].iloc[0]) if "compound" in s_df.columns else "MEDIUM"
                                tyre_age = int(s_df["life"].iloc[0]) if "life" in s_df.columns and pd.notna(s_df["life"].iloc[0]) else 1

                                exist_stint = (
                                    db.query(Stint)
                                    .filter(
                                        Stint.session_key == sess_key,
                                        Stint.driver_number == d_num,
                                        Stint.stint_number == stint_num,
                                    )
                                    .first()
                                )
                                if not exist_stint:
                                    db.add(
                                        Stint(
                                            session_key=sess_key,
                                            meeting_key=meeting_key,
                                            driver_number=d_num,
                                            stint_number=stint_num,
                                            lap_start=lap_start,
                                            lap_end=lap_end,
                                            compound=comp,
                                            tyre_age_at_start=tyre_age,
                                        )
                                    )
                            except Exception:
                                continue
                        db.commit()
                except Exception:
                    pass

            # Load Weather
            weather_json = self.fetch_file(year, gp_name, sess_name, "weather.json")
            if weather_json and isinstance(weather_json, dict):
                try:
                    w_df = pd.DataFrame(weather_json)
                    if not w_df.empty:
                        for idx, w_row in w_df.iterrows():
                            air_t = float(w_row.get("AirTemp", 25.0)) if pd.notna(w_row.get("AirTemp")) else 25.0
                            track_t = float(w_row.get("TrackTemp", 32.0)) if pd.notna(w_row.get("TrackTemp")) else 32.0
                            humidity = float(w_row.get("Humidity", 50.0)) if pd.notna(w_row.get("Humidity")) else 50.0
                            rainfall = bool(w_row.get("Rainfall", False))
                            db.add(
                                Weather(
                                    session_key=sess_key,
                                    date=f"{year}-03-01T{12 + int(idx)}:00:00+00:00",
                                    air_temperature=air_t,
                                    track_temperature=track_t,
                                    humidity=humidity,
                                    rainfall=rainfall,
                                )
                            )
                        db.commit()
                except Exception:
                    pass

        # 2. Derive Starting Grid from Qualifying session
        race_sess_key = meeting_key * 10 + 5
        if quali_laptimes_df is not None and not quali_laptimes_df.empty:
            clean_q = quali_laptimes_df[
                (quali_laptimes_df["time"].notna())
                & (quali_laptimes_df["time"] != "None")
            ].copy()
            clean_q["time_num"] = pd.to_numeric(clean_q["time"], errors="coerce")
            best_q = clean_q.groupby("dNum")["time_num"].min().sort_values()

            grid_pos = 1
            for d_num_val, _ in best_q.items():
                d_num = int(d_num_val)
                exist_grid = (
                    db.query(StartingGrid)
                    .filter(
                        StartingGrid.meeting_key == meeting_key,
                        StartingGrid.driver_number == d_num,
                    )
                    .first()
                )
                if not exist_grid:
                    db.add(
                        StartingGrid(
                            meeting_key=meeting_key,
                            session_key=meeting_key * 10 + 4,
                            driver_number=d_num,
                            position=grid_pos,
                        )
                    )
                grid_pos += 1
            db.commit()

        # 3. Derive Session Results from Race final classifications
        if race_laptimes_df is not None and not race_laptimes_df.empty:
            race_df = race_laptimes_df.copy()
            race_df["pos_num"] = pd.to_numeric(race_df["pos"], errors="coerce")
            last_laps = race_df.groupby("dNum").last()

            for d_num_val, r_row in last_laps.iterrows():
                d_num = int(d_num_val)
                p_val = r_row.get("pos_num")
                final_pos = int(p_val) if pd.notna(p_val) and p_val > 0 else 20
                is_dnf = pd.isna(p_val) or str(r_row.get("pos")) in ("None", "DNF", "NC")

                pts_map = {1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1}
                points = pts_map.get(final_pos, 0) if not is_dnf else 0

                exist_res = (
                    db.query(SessionResult)
                    .filter(
                        SessionResult.session_key == race_sess_key,
                        SessionResult.driver_number == d_num,
                    )
                    .first()
                )
                laps_done = int(r_row.get("lap", 57)) if pd.notna(r_row.get("lap")) else 57
                if not exist_res:
                    db.add(
                        SessionResult(
                            session_key=race_sess_key,
                            meeting_key=meeting_key,
                            driver_number=d_num,
                            position=final_pos,
                            number_of_laps=laps_done,
                            points=points,
                            dnf=is_dnf,
                        )
                    )
            db.commit()

        return True
