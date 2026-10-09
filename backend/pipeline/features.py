"""
Feature Engineering Pipeline for PaceIQ.
Builds leakage-safe pre-race features per driver per race session.
Complies strictly with TECH_SPEC.md §6 and IMPLEMENTATION_RULES.md (Rules 8-23).
"""

import logging
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from backend.app.config import CIRCUIT_TYPE_LOOKUP
from backend.app.db import Feature, SessionLocal, init_db

logger = logging.getLogger("paceiq.features")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def get_race_sessions(db: DBSession) -> pd.DataFrame:
    """Retrieve all race sessions sorted chronologically by date_start."""
    query = text("""
        SELECT s.session_key, s.meeting_key, s.date_start, s.year, m.circuit_short_name, m.circuit_type
        FROM sessions s
        JOIN meetings m ON s.meeting_key = m.meeting_key
        WHERE s.session_name = 'Race'
        ORDER BY s.date_start ASC
    """)
    return pd.read_sql(query, db.connection())


def get_meeting_practice_qualifying_sessions(
    meeting_key: int, target_race_date: str, db: DBSession
) -> pd.DataFrame:
    """
    Retrieve practice and qualifying sessions for the meeting that occurred
    STRICTLY before the race start time (Rule 8).
    """
    query = text("""
        SELECT session_key, session_name, session_type, date_start
        FROM sessions
        WHERE meeting_key = :meeting_key
          AND session_name IN ('Qualifying', 'Practice 1', 'Practice 2', 'Practice 3')
          AND date_start < :target_race_date
        ORDER BY date_start ASC
    """)
    return pd.read_sql(
        query,
        db.connection(),
        params={
            "meeting_key": meeting_key,
            "target_race_date": target_race_date,
        },
    )


def compute_qualifying_features(
    meeting_key: int, target_race_date: str, db: DBSession
) -> pd.DataFrame:
    """
    Compute qualifying pace features:
    - quali_gap_to_pole_s
    - quali_gap_to_pole_pct
    - quali_gap_to_teammate_s
    """
    sessions = get_meeting_practice_qualifying_sessions(
        meeting_key, target_race_date, db
    )
    quali_sessions = sessions[sessions["session_name"] == "Qualifying"]
    if quali_sessions.empty:
        return pd.DataFrame()

    q_key = int(quali_sessions.iloc[-1]["session_key"])

    # Get best lap per driver in qualifying
    query = text("""
        SELECT l.driver_number, MIN(l.lap_duration) AS best_lap, d.team_name
        FROM laps l
        JOIN drivers d ON l.session_key = d.session_key AND l.driver_number = d.driver_number
        WHERE l.session_key = :q_key
          AND l.lap_duration IS NOT NULL
          AND l.lap_duration > 50.0
          AND l.is_pit_out_lap = 0
        GROUP BY l.driver_number, d.team_name
    """)
    df = pd.read_sql(query, db.connection(), params={"q_key": q_key})
    if df.empty:
        return pd.DataFrame()

    pole_lap = df["best_lap"].min()
    df["quali_gap_to_pole_s"] = df["best_lap"] - pole_lap
    df["quali_gap_to_pole_pct"] = (df["quali_gap_to_pole_s"] / pole_lap) * 100.0

    # Teammate gap
    teammate_gaps = []
    for _, row in df.iterrows():
        team = row["team_name"]
        d_num = row["driver_number"]
        teammates = df[(df["team_name"] == team) & (df["driver_number"] != d_num)]
        if not teammates.empty:
            tm_best = teammates["best_lap"].min()
            teammate_gaps.append(row["best_lap"] - tm_best)
        else:
            teammate_gaps.append(0.0)
    df["quali_gap_to_teammate_s"] = teammate_gaps

    return df[
        [
            "driver_number",
            "quali_gap_to_pole_s",
            "quali_gap_to_pole_pct",
            "quali_gap_to_teammate_s",
        ]
    ]


def compute_practice_pace_and_degradation(
    meeting_key: int, target_race_date: str, db: DBSession
) -> pd.DataFrame:
    """
    Compute practice features (Rule 16, 17, 18):
    - practice_pace_index
    - longrun_pace_s
    - deg_slope_s_per_lap
    From practice sessions ONLY.
    """
    sessions = get_meeting_practice_qualifying_sessions(
        meeting_key, target_race_date, db
    )
    practice_sessions = sessions[sessions["session_name"].str.startswith("Practice")]
    if practice_sessions.empty:
        return pd.DataFrame()

    p_keys = [int(k) for k in practice_sessions["session_key"].tolist()]
    keys_str = ",".join(str(k) for k in p_keys)

    # Clean practice laps
    query = text(f"""
        SELECT l.session_key, l.driver_number, l.lap_number, l.lap_duration,
               s.stint_number, s.compound, s.tyre_age_at_start
        FROM laps l
        JOIN stints s ON l.session_key = s.session_key
                     AND l.driver_number = s.driver_number
                     AND l.lap_number >= s.lap_start
                     AND l.lap_number <= s.lap_end
        WHERE l.session_key IN ({keys_str})
          AND l.lap_duration IS NOT NULL
          AND l.lap_duration > 50.0
          AND l.is_pit_out_lap = 0
        ORDER BY l.driver_number, l.session_key, l.lap_number
    """)
    laps_df = pd.read_sql(query, db.connection())
    if laps_df.empty:
        return pd.DataFrame()

    results = []
    drivers = laps_df["driver_number"].unique()

    # Field overall median for practice_pace_index
    fastest_medians = []
    for d in drivers:
        d_clean = laps_df[laps_df["driver_number"] == d]["lap_duration"]
        if not d_clean.empty:
            fastest_medians.append(d_clean.median())
    session_fastest_median = min(fastest_medians) if fastest_medians else 90.0

    for d in drivers:
        d_laps = laps_df[laps_df["driver_number"] == d]

        # 1. practice_pace_index
        median_clean = d_laps["lap_duration"].median()
        pace_index = (
            (median_clean / session_fastest_median)
            if session_fastest_median > 0
            else 1.0
        )

        # 2. Long-run pace (median of clean laps in stints >= 5 clean laps, Rule 17)
        longrun_laps = []
        for (_sess_id, _stint_id), stint_group in d_laps.groupby(
            ["session_key", "stint_number"]
        ):
            if len(stint_group) >= 5:
                longrun_laps.extend(stint_group["lap_duration"].tolist())
        longrun_pace = float(np.median(longrun_laps)) if longrun_laps else np.nan

        # 3. Tyre degradation slope (Rule 18: OLS slope of clean lap time vs tyre age, >= 5 points)
        deg_slope = np.nan
        primary_compounds = d_laps["compound"].value_counts()
        if not primary_compounds.empty:
            primary_compound = primary_compounds.index[0]
            comp_laps = d_laps[d_laps["compound"] == primary_compound].copy()
            if len(comp_laps) >= 5:
                # Tyre age = tyre_age_at_start + (lap_number - stint_lap_start)
                comp_laps["tyre_age"] = comp_laps["tyre_age_at_start"] + np.arange(
                    len(comp_laps)
                )
                x = comp_laps["tyre_age"].values
                y = comp_laps["lap_duration"].values
                if len(np.unique(x)) > 1:
                    slope, _ = np.polyfit(x, y, 1)
                    deg_slope = float(slope)

        results.append(
            {
                "driver_number": d,
                "practice_pace_index": pace_index,
                "longrun_pace_s": longrun_pace,
                "deg_slope_s_per_lap": deg_slope,
            }
        )

    res_df = pd.DataFrame(results)
    if not res_df.empty and "longrun_pace_s" in res_df:
        field_median_longrun = res_df["longrun_pace_s"].median()
        res_df["longrun_pace_rel_s"] = res_df["longrun_pace_s"] - field_median_longrun
    else:
        res_df["longrun_pace_rel_s"] = np.nan

    return res_df


def compute_historical_form(
    target_race_date: str, circuit_short_name: str, db: DBSession
) -> pd.DataFrame:
    """
    Compute rolling form (last 5 prior races) and circuit history (Rule 20).
    Uses data strictly prior to target_race_date.
    """
    query = text("""
        SELECT r.driver_number, d.team_name, r.position, s.date_start, m.circuit_short_name
        FROM session_results r
        JOIN sessions s ON r.session_key = s.session_key
        JOIN meetings m ON s.meeting_key = m.meeting_key
        JOIN drivers d ON r.session_key = d.session_key AND r.driver_number = d.driver_number
        WHERE s.session_name = 'Race'
          AND s.date_start < :target_race_date
          AND r.position IS NOT NULL
        ORDER BY s.date_start DESC
    """)
    prior_results = pd.read_sql(
        query, db.connection(), params={"target_race_date": target_race_date}
    )
    if prior_results.empty:
        return pd.DataFrame()

    drivers = prior_results["driver_number"].unique()
    teams = prior_results["team_name"].unique()

    # Driver 5-race rolling form
    driver_form = {}
    driver_circ_avg = {}
    for d in drivers:
        d_res = prior_results[prior_results["driver_number"] == d]
        driver_form[d] = float(d_res.head(5)["position"].mean())
        d_circ = d_res[d_res["circuit_short_name"] == circuit_short_name]
        driver_circ_avg[d] = (
            float(d_circ["position"].mean()) if not d_circ.empty else np.nan
        )

    # Team 5-race rolling form
    team_form = {}
    team_circ_avg = {}
    for t in teams:
        t_res = prior_results[prior_results["team_name"] == t]
        team_form[t] = float(t_res.head(10)["position"].mean())
        t_circ = t_res[t_res["circuit_short_name"] == circuit_short_name]
        team_circ_avg[t] = (
            float(t_circ["position"].mean()) if not t_circ.empty else np.nan
        )

    records = []
    for d in drivers:
        # Get team name for driver
        t_name = prior_results[prior_results["driver_number"] == d]["team_name"].iloc[0]
        records.append(
            {
                "driver_number": d,
                "driver_form_5": driver_form.get(d, 10.0),
                "team_form_5": team_form.get(t_name, 10.0),
                "driver_circuit_avg": driver_circ_avg.get(d, np.nan),
                "team_circuit_avg": team_circ_avg.get(t_name, np.nan),
            }
        )

    return pd.DataFrame(records)


def compute_weather_features(
    meeting_key: int, target_race_date: str, db: DBSession
) -> tuple[float, int]:
    """Get practice track temperature and rain flag (Rule 8: pre-race only)."""
    sessions = get_meeting_practice_qualifying_sessions(
        meeting_key, target_race_date, db
    )
    practice_sessions = sessions[sessions["session_name"].str.startswith("Practice")]
    if practice_sessions.empty:
        return 30.0, 0

    p_keys = [str(k) for k in practice_sessions["session_key"].tolist()]
    keys_str = ",".join(p_keys)

    query = text(f"""
        SELECT AVG(track_temperature) AS avg_track_temp, MAX(rainfall) AS max_rain
        FROM weather
        WHERE session_key IN ({keys_str})
    """)
    res = db.execute(query).fetchone()
    avg_temp = float(res[0]) if res and res[0] is not None else 30.0
    rain_flag = int(res[1]) if res and res[1] is not None else 0
    return avg_temp, rain_flag


def build_features_for_race(race_row: pd.Series, db: DBSession) -> list[Feature]:
    """
    Build all pre-race features for one race session.
    Strictly leakage-free.
    """
    session_key = int(race_row["session_key"])
    meeting_key = int(race_row["meeting_key"])
    date_start = str(race_row["date_start"])
    circuit_name = str(race_row["circuit_short_name"])
    circuit_type = CIRCUIT_TYPE_LOOKUP.get(circuit_name, "mixed")

    # 1. Starting grid
    grid_query = text("""
        SELECT driver_number, position AS grid_position
        FROM starting_grids
        WHERE meeting_key = :meeting_key
    """)
    grid_df = pd.read_sql(
        grid_query, db.connection(), params={"meeting_key": meeting_key}
    )

    # 2. Drivers in this race
    drivers_query = text("""
        SELECT driver_number, team_name
        FROM drivers
        WHERE session_key = :session_key
    """)
    drivers_df = pd.read_sql(
        drivers_query, db.connection(), params={"session_key": session_key}
    )
    if drivers_df.empty:
        return []

    # 3. Targets (Actual race results for completed races)
    results_query = text("""
        SELECT driver_number, position, dnf, dns, dsq
        FROM session_results
        WHERE session_key = :session_key
    """)
    results_df = pd.read_sql(
        results_query, db.connection(), params={"session_key": session_key}
    )

    # 4. Qualifying features
    quali_df = compute_qualifying_features(meeting_key, date_start, db)

    # 5. Practice pace & degradation
    practice_df = compute_practice_pace_and_degradation(meeting_key, date_start, db)

    # 6. Historical rolling form
    form_df = compute_historical_form(date_start, circuit_name, db)

    # 7. Weather
    track_temp, rain_flag = compute_weather_features(meeting_key, date_start, db)

    # Merge all into driver frame
    merged = drivers_df.merge(grid_df, on="driver_number", how="left")
    if not quali_df.empty:
        merged = merged.merge(quali_df, on="driver_number", how="left")
    else:
        for c in [
            "quali_gap_to_pole_s",
            "quali_gap_to_pole_pct",
            "quali_gap_to_teammate_s",
        ]:
            merged[c] = np.nan

    if not practice_df.empty:
        merged = merged.merge(practice_df, on="driver_number", how="left")
    else:
        for c in [
            "practice_pace_index",
            "longrun_pace_s",
            "longrun_pace_rel_s",
            "deg_slope_s_per_lap",
        ]:
            merged[c] = np.nan

    if not form_df.empty:
        merged = merged.merge(form_df, on="driver_number", how="left")
    else:
        for c in [
            "driver_form_5",
            "team_form_5",
            "driver_circuit_avg",
            "team_circuit_avg",
        ]:
            merged[c] = np.nan

    if not results_df.empty:
        merged = merged.merge(results_df, on="driver_number", how="left")
    else:
        merged["position"] = np.nan
        merged["dnf"] = False

    # Impute missing values with field medians and record missing flags (Rule 21)
    numeric_features = [
        "grid_position",
        "quali_gap_to_pole_s",
        "quali_gap_to_pole_pct",
        "quali_gap_to_teammate_s",
        "practice_pace_index",
        "longrun_pace_s",
        "longrun_pace_rel_s",
        "deg_slope_s_per_lap",
        "driver_form_5",
        "team_form_5",
        "driver_circuit_avg",
        "team_circuit_avg",
    ]

    feature_records: list[Feature] = []

    for _, row in merged.iterrows():
        d_num = int(row["driver_number"])

        # Determine target finishing position & DNF
        target_pos = None
        target_pod = None
        dnf_val = 0
        if pd.notnull(row.get("position")):
            raw_pos = int(row["position"])
            is_dnf = bool(row.get("dnf", False))
            target_pos = raw_pos
            target_pod = 1 if target_pos <= 3 else 0
            dnf_val = 1 if is_dnf else 0

        # Build feature entity
        f = Feature(
            session_key=session_key,
            driver_number=d_num,
            meeting_key=meeting_key,
            feature_schema_version="v1",
            track_temp_c=track_temp,
            rain_flag=rain_flag,
            circuit_type=circuit_type,
            target_position=target_pos,
            target_podium=target_pod,
            dnf=dnf_val,
        )

        # Impute numeric features with field median
        for feat in numeric_features:
            val = row.get(feat)
            flag_col = f"{feat}_missing"
            if pd.isna(val):
                median_val = merged[feat].median()
                if pd.isna(median_val):
                    median_val = 10.0 if "position" in feat or "form" in feat else 0.0
                setattr(f, feat, float(median_val))
                if hasattr(f, flag_col):
                    setattr(f, flag_col, 1)
            else:
                setattr(f, feat, float(val))
                if hasattr(f, flag_col):
                    setattr(f, flag_col, 0)

        feature_records.append(f)

    return feature_records


def build_all_features(db: DBSession) -> int:
    """Build and save feature records for all race sessions in the database."""
    init_db()
    races = get_race_sessions(db)
    logger.info(f"Building features for {len(races)} race sessions...")

    # Clear existing features table for idempotent rebuild
    db.execute(text("DELETE FROM features"))
    db.commit()

    total_records = 0
    for _, race_row in races.iterrows():
        records = build_features_for_race(race_row, db)
        if records:
            db.bulk_save_objects(records)
            db.commit()
            total_records += len(records)
            logger.info(
                f"Built {len(records)} feature rows for race {race_row['session_key']} ({race_row['circuit_short_name']})"
            )

    logger.info(f"Feature engineering completed! Total rows: {total_records}")
    return total_records


def main():
    db = SessionLocal()
    try:
        build_all_features(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
