"""
Telemetry & Strategy Simulation Generator for PaceIQ.
Generates realistic lap telemetry and tyre stint data for upcoming/simulated races,
grounded in circuit characteristics and driver pace predictions.
"""

from __future__ import annotations

import random
from typing import Any

from sqlalchemy.orm import Session as DBSession

from backend.app.db import Driver, Lap, Meeting, Prediction, Session, Stint

# Standard circuit configs (total laps & representative clean base race lap in seconds)
CIRCUIT_CONFIGS: dict[str, dict[str, Any]] = {
    "Marina Bay": {"laps": 62, "base_lap": 96.5, "s1_pct": 0.29, "s2_pct": 0.41, "s3_pct": 0.30},
    "Singapore": {"laps": 62, "base_lap": 96.5, "s1_pct": 0.29, "s2_pct": 0.41, "s3_pct": 0.30},
    "Austin": {"laps": 56, "base_lap": 97.0, "s1_pct": 0.32, "s2_pct": 0.38, "s3_pct": 0.30},
    "Mexico City": {"laps": 71, "base_lap": 80.5, "s1_pct": 0.35, "s2_pct": 0.39, "s3_pct": 0.26},
    "Sao Paulo": {"laps": 71, "base_lap": 73.0, "s1_pct": 0.26, "s2_pct": 0.48, "s3_pct": 0.26},
    "Las Vegas": {"laps": 50, "base_lap": 95.0, "s1_pct": 0.32, "s2_pct": 0.37, "s3_pct": 0.31},
    "Lusail": {"laps": 57, "base_lap": 84.0, "s1_pct": 0.35, "s2_pct": 0.35, "s3_pct": 0.30},
    "Abu Dhabi": {"laps": 58, "base_lap": 87.0, "s1_pct": 0.30, "s2_pct": 0.37, "s3_pct": 0.33},
    "Melbourne": {"laps": 58, "base_lap": 80.0, "s1_pct": 0.33, "s2_pct": 0.37, "s3_pct": 0.30},
    "Shanghai": {"laps": 56, "base_lap": 97.0, "s1_pct": 0.33, "s2_pct": 0.38, "s3_pct": 0.29},
    "Suzuka": {"laps": 53, "base_lap": 93.0, "s1_pct": 0.34, "s2_pct": 0.42, "s3_pct": 0.24},
    "Miami": {"laps": 57, "base_lap": 90.0, "s1_pct": 0.34, "s2_pct": 0.38, "s3_pct": 0.28},
    "Montreal": {"laps": 70, "base_lap": 75.0, "s1_pct": 0.30, "s2_pct": 0.36, "s3_pct": 0.34},
    "Monte Carlo": {"laps": 78, "base_lap": 74.0, "s1_pct": 0.27, "s2_pct": 0.46, "s3_pct": 0.27},
    "Silverstone": {"laps": 52, "base_lap": 89.0, "s1_pct": 0.32, "s2_pct": 0.39, "s3_pct": 0.29},
    "Spa": {"laps": 44, "base_lap": 106.0, "s1_pct": 0.30, "s2_pct": 0.44, "s3_pct": 0.26},
    "Monza": {"laps": 53, "base_lap": 82.0, "s1_pct": 0.34, "s2_pct": 0.32, "s3_pct": 0.34},
    "Zandvoort": {"laps": 72, "base_lap": 73.0, "s1_pct": 0.33, "s2_pct": 0.37, "s3_pct": 0.30},
    "Budapest": {"laps": 70, "base_lap": 79.0, "s1_pct": 0.36, "s2_pct": 0.36, "s3_pct": 0.28},
    "Spielberg": {"laps": 71, "base_lap": 68.0, "s1_pct": 0.25, "s2_pct": 0.44, "s3_pct": 0.31},
}

DEFAULT_CIRCUIT_CONFIG = {"laps": 57, "base_lap": 90.0, "s1_pct": 0.32, "s2_pct": 0.38, "s3_pct": 0.30}


def generate_race_simulation(session_key: int, db: DBSession) -> bool:
    """
    Synthesize realistic lap telemetry and tyre stints for a race session
    based on predicted driver hierarchy and circuit tyre degradation dynamics.
    """
    session = db.query(Session).filter(Session.session_key == session_key).first()
    if not session:
        return False

    meeting = db.query(Meeting).filter(Meeting.meeting_key == session.meeting_key).first()
    circuit_name = meeting.circuit_short_name if meeting else ""
    cfg = CIRCUIT_CONFIGS.get(circuit_name, DEFAULT_CIRCUIT_CONFIG)

    total_laps: int = cfg["laps"]
    base_time: float = cfg["base_lap"]
    s1_pct: float = cfg["s1_pct"]
    s2_pct: float = cfg["s2_pct"]

    # Retrieve all drivers and their predicted position
    preds = (
        db.query(Prediction)
        .filter(Prediction.session_key == session_key, Prediction.model_version == "paceiq_v1")
        .all()
    )
    pred_pos_map = {p.driver_number: p.predicted_position for p in preds}

    drivers = db.query(Driver).filter(Driver.session_key == session_key).all()
    if not drivers:
        return False

    # Seed random for deterministic, reproducible simulation per session
    rng = random.Random(session_key)

    new_laps: list[Lap] = []
    new_stints: list[Stint] = []

    # Strategy variation templates (1-stop Medium->Hard, 1-stop Soft->Hard, 2-stop Medium->Hard->Soft)
    for driver in drivers:
        d_num = driver.driver_number
        pos = pred_pos_map.get(d_num, 15)  # fallback pos

        # Calculate driver pace offset relative to leader: ~0.075s per position difference
        driver_pace_delta = (pos - 1) * 0.075

        # Decide driver pit strategy
        # Top drivers mostly opt for optimal 1-stop Medium -> Hard
        # Some midpack drivers try alternate Soft -> Hard or 2-stop
        strat_rand = rng.random()
        if pos in (5, 8, 14) and strat_rand > 0.4:
            # Alternate: Soft -> Hard
            stint_plan = [
                {"stint_num": 1, "compound": "SOFT", "lap_start": 1, "lap_end": int(total_laps * 0.28), "base_bonus": -0.4, "deg": 0.085},
                {"stint_num": 2, "compound": "HARD", "lap_start": int(total_laps * 0.28) + 1, "lap_end": total_laps, "base_bonus": 0.2, "deg": 0.040},
            ]
        elif pos in (7, 11, 16) and strat_rand > 0.6:
            # Alternate: Hard -> Medium
            stint_plan = [
                {"stint_num": 1, "compound": "HARD", "lap_start": 1, "lap_end": int(total_laps * 0.58), "base_bonus": 0.25, "deg": 0.038},
                {"stint_num": 2, "compound": "MEDIUM", "lap_start": int(total_laps * 0.58) + 1, "lap_end": total_laps, "base_bonus": -0.15, "deg": 0.065},
            ]
        else:
            # Standard optimal: Medium -> Hard
            pit_window = int(total_laps * 0.40) + rng.randint(-2, 3)
            stint_plan = [
                {"stint_num": 1, "compound": "MEDIUM", "lap_start": 1, "lap_end": pit_window, "base_bonus": 0.0, "deg": 0.062},
                {"stint_num": 2, "compound": "HARD", "lap_start": pit_window + 1, "lap_end": total_laps, "base_bonus": 0.18, "deg": 0.042},
            ]

        # Record stints
        for st in stint_plan:
            new_stints.append(
                Stint(
                    session_key=session_key,
                    driver_number=d_num,
                    stint_number=st["stint_num"],
                    meeting_key=session.meeting_key,
                    lap_start=st["lap_start"],
                    lap_end=st["lap_end"],
                    compound=st["compound"],
                    tyre_age_at_start=0,
                )
            )

        # Generate individual laps
        for st in stint_plan:
            stint_start = st["lap_start"]
            stint_end = st["lap_end"]
            compound_deg = st["deg"]
            compound_bonus = st["base_bonus"]

            for lap_num in range(stint_start, stint_end + 1):
                tyre_age = lap_num - stint_start

                # Fuel burn reduction: ~0.045s lighter per lap
                fuel_effect = -(lap_num * 0.045)

                # Tyre degradation effect
                deg_effect = tyre_age * compound_deg

                # Micro lap-to-lap variance (smooth gaussian noise)
                noise = rng.gauss(0, 0.08)

                # Base lap duration calculation
                lap_dur = base_time + driver_pace_delta + compound_bonus + fuel_effect + deg_effect + noise

                # Standing start penalty on Lap 1
                if lap_num == 1:
                    lap_dur += 6.5 + (pos * 0.12)
                    is_out_lap = False
                elif lap_num == stint_start and st["stint_num"] > 1:
                    # Pit out lap (entering track from pit lane, includes pit lane transit time)
                    lap_dur += 21.0
                    is_out_lap = True
                else:
                    is_out_lap = False

                lap_dur = round(max(55.0, lap_dur), 3)

                # Calculate Sector splits
                s1 = round(lap_dur * s1_pct + rng.gauss(0, 0.03), 3)
                s2 = round(lap_dur * s2_pct + rng.gauss(0, 0.03), 3)
                s3 = round(lap_dur - s1 - s2, 3)

                new_laps.append(
                    Lap(
                        session_key=session_key,
                        meeting_key=session.meeting_key,
                        driver_number=d_num,
                        lap_number=lap_num,
                        lap_duration=lap_dur,
                        duration_sector_1=s1,
                        duration_sector_2=s2,
                        duration_sector_3=s3,
                        is_pit_out_lap=is_out_lap,
                        date_start=session.date_start,
                    )
                )

    # Bulk insert
    db.add_all(new_stints)
    db.add_all(new_laps)
    db.commit()
    return True
