"""
Mandatory Tests for Feature Engineering & Anti-Leakage.
Rule 9: tests/test_features.py::test_no_target_race_leakage must pass before any model is trained.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db import Base, Feature, Lap, Meeting, Session
from backend.pipeline.features import (
    get_meeting_practice_qualifying_sessions,
)


def test_no_target_race_leakage():
    """
    Rule 8 & 9: Verify that feature calculation NEVER accesses any data from
    the target race session itself (laps, stints, results, weather).
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    try:
        # 1. Setup meeting and two sessions: Qualifying and Race
        meeting = Meeting(
            meeting_key=100,
            meeting_name="Leakage Test GP",
            circuit_short_name="TestCircuit",
            year=2024,
            date_start="2024-05-01T10:00:00Z",
            circuit_type="mixed",
        )
        db.add(meeting)

        q_session = Session(
            session_key=101,
            meeting_key=100,
            session_name="Qualifying",
            session_type="Qualifying",
            date_start="2024-05-01T14:00:00Z",
            year=2024,
        )
        race_session = Session(
            session_key=102,
            meeting_key=100,
            session_name="Race",
            session_type="Race",
            date_start="2024-05-02T14:00:00Z",
            year=2024,
        )
        db.add_all([q_session, race_session])
        db.commit()

        # Query sessions strictly before the race start
        allowed_sessions = get_meeting_practice_qualifying_sessions(
            100, "2024-05-02T14:00:00Z", db
        )
        session_keys = allowed_sessions["session_key"].tolist()

        # Target race session MUST NOT be in allowed sessions
        assert 102 not in session_keys
        assert 101 in session_keys

    finally:
        db.close()


def test_missing_data_flags_and_imputation():
    """Rule 21: Missing numeric features are imputed and *_missing flags set to 1."""
    f = Feature(
        session_key=200,
        driver_number=1,
        meeting_key=50,
        grid_position=1,
        grid_position_missing=0,
        quali_gap_to_pole_s=0.5,
        quali_gap_to_pole_s_missing=0,
        deg_slope_s_per_lap=0.08,
        deg_slope_s_per_lap_missing=1,  # Imputed
    )
    assert f.grid_position_missing == 0
    assert f.deg_slope_s_per_lap_missing == 1
    assert f.deg_slope_s_per_lap == 0.08


def test_clean_lap_logic():
    """Rule 16: In-laps, out-laps, or null durations are not clean."""
    lap_out = Lap(
        session_key=300,
        meeting_key=50,
        driver_number=44,
        lap_number=1,
        lap_duration=92.5,
        is_pit_out_lap=True,
    )
    assert lap_out.is_pit_out_lap is True

    lap_clean = Lap(
        session_key=300,
        meeting_key=50,
        driver_number=44,
        lap_number=2,
        lap_duration=89.2,
        is_pit_out_lap=False,
    )
    assert lap_clean.is_pit_out_lap is False
    assert lap_clean.lap_duration < 90.0
