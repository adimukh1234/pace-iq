"""
Database models and connection setup for PaceIQ (SQLAlchemy + SQLite).
Complies with SCHEMA.md and TECH_SPEC.md.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from backend.app.config import DATABASE_URL, DB_PATH

DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Meeting(Base):
    __tablename__ = "meetings"

    meeting_key = Column(Integer, primary_key=True)
    meeting_name = Column(String, nullable=False)
    circuit_key = Column(Integer, nullable=True)
    circuit_short_name = Column(String, nullable=True)
    country_name = Column(String, nullable=True)
    country_code = Column(String, nullable=True)
    year = Column(Integer, nullable=False, index=True)
    date_start = Column(String, nullable=False)
    circuit_type = Column(String, default="mixed")

    sessions = relationship("Session", back_populates="meeting")


class Session(Base):
    __tablename__ = "sessions"

    session_key = Column(Integer, primary_key=True)
    meeting_key = Column(
        Integer, ForeignKey("meetings.meeting_key"), nullable=False, index=True
    )
    session_name = Column(String, nullable=False)
    session_type = Column(String, nullable=False)
    date_start = Column(String, nullable=False)
    date_end = Column(String, nullable=True)
    year = Column(Integer, nullable=False, index=True)

    meeting = relationship("Meeting", back_populates="sessions")


class Driver(Base):
    __tablename__ = "drivers"

    session_key = Column(Integer, ForeignKey("sessions.session_key"), primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    meeting_key = Column(Integer, nullable=False)
    broadcast_name = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    name_acronym = Column(String, nullable=False)
    team_name = Column(String, nullable=False)
    team_colour = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    headshot_url = Column(String, nullable=True)
    country_code = Column(String, nullable=True)


class StartingGrid(Base):
    __tablename__ = "starting_grids"

    meeting_key = Column(Integer, primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    session_key = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    lap_duration = Column(Float, nullable=True)


class SessionResult(Base):
    __tablename__ = "session_results"

    session_key = Column(Integer, ForeignKey("sessions.session_key"), primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    meeting_key = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    number_of_laps = Column(Integer, nullable=False)
    points = Column(Float, default=0.0)
    dnf = Column(Boolean, default=False)
    dns = Column(Boolean, default=False)
    dsq = Column(Boolean, default=False)
    duration = Column(Float, nullable=True)
    gap_to_leader = Column(Float, nullable=True)


class Lap(Base):
    __tablename__ = "laps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_key = Column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    meeting_key = Column(Integer, nullable=False)
    driver_number = Column(Integer, nullable=False, index=True)
    lap_number = Column(Integer, nullable=False)
    lap_duration = Column(Float, nullable=True)
    duration_sector_1 = Column(Float, nullable=True)
    duration_sector_2 = Column(Float, nullable=True)
    duration_sector_3 = Column(Float, nullable=True)
    is_pit_out_lap = Column(Boolean, default=False)
    date_start = Column(String, nullable=True)


class Stint(Base):
    __tablename__ = "stints"

    session_key = Column(Integer, ForeignKey("sessions.session_key"), primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    stint_number = Column(Integer, primary_key=True)
    meeting_key = Column(Integer, nullable=False)
    lap_start = Column(Integer, nullable=True, default=1)
    lap_end = Column(Integer, nullable=True, default=1)
    compound = Column(String, nullable=False)
    tyre_age_at_start = Column(Integer, default=0)


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_key = Column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    meeting_key = Column(Integer, nullable=True)
    date = Column(String, nullable=False)
    air_temperature = Column(Float, nullable=True)
    track_temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    rainfall = Column(Integer, default=0)
    wind_speed = Column(Float, nullable=True)


class RaceControl(Base):
    __tablename__ = "race_control"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_key = Column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    meeting_key = Column(Integer, nullable=True)
    date = Column(String, nullable=False)
    category = Column(String, nullable=True)
    flag = Column(String, nullable=True)
    scope = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    lap_number = Column(Integer, nullable=True)


class Feature(Base):
    __tablename__ = "features"

    session_key = Column(Integer, ForeignKey("sessions.session_key"), primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    meeting_key = Column(Integer, nullable=False)
    feature_schema_version = Column(String, default="v1")
    grid_position = Column(Integer, nullable=True)
    quali_gap_to_pole_s = Column(Float, nullable=True)
    quali_gap_to_pole_pct = Column(Float, nullable=True)
    quali_gap_to_teammate_s = Column(Float, nullable=True)
    practice_pace_index = Column(Float, nullable=True)
    longrun_pace_s = Column(Float, nullable=True)
    longrun_pace_rel_s = Column(Float, nullable=True)
    deg_slope_s_per_lap = Column(Float, nullable=True)
    driver_form_5 = Column(Float, nullable=True)
    team_form_5 = Column(Float, nullable=True)
    driver_circuit_avg = Column(Float, nullable=True)
    team_circuit_avg = Column(Float, nullable=True)
    track_temp_c = Column(Float, nullable=True)
    rain_flag = Column(Integer, default=0)
    circuit_type = Column(String, default="mixed")

    # Missing flags
    grid_position_missing = Column(Integer, default=0)
    quali_gap_to_pole_s_missing = Column(Integer, default=0)
    practice_pace_index_missing = Column(Integer, default=0)
    longrun_pace_s_missing = Column(Integer, default=0)
    deg_slope_s_per_lap_missing = Column(Integer, default=0)
    driver_form_5_missing = Column(Integer, default=0)
    team_form_5_missing = Column(Integer, default=0)
    driver_circuit_avg_missing = Column(Integer, default=0)
    team_circuit_avg_missing = Column(Integer, default=0)
    track_temp_c_missing = Column(Integer, default=0)

    # Targets (null for uncompleted races)
    target_position = Column(Integer, nullable=True)
    target_podium = Column(Integer, nullable=True)
    dnf = Column(Integer, default=0)


class Prediction(Base):
    __tablename__ = "predictions"

    session_key = Column(Integer, ForeignKey("sessions.session_key"), primary_key=True)
    driver_number = Column(Integer, primary_key=True)
    model_version = Column(String, primary_key=True, default="paceiq_v1")
    predicted_position = Column(Integer, nullable=False)
    podium_probability = Column(Float, nullable=False)
    shap_values = Column(Text, nullable=False)  # JSON text
    created_at = Column(String, nullable=False)


class UserPrediction(Base):
    __tablename__ = "user_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, index=True)
    session_key = Column(
        Integer, ForeignKey("sessions.session_key"), nullable=False, index=True
    )
    p1_driver = Column(Integer, nullable=False)
    p2_driver = Column(Integer, nullable=False)
    p3_driver = Column(Integer, nullable=False)
    submitted_at = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("username", "session_key", name="uq_user_session_prediction"),
    )


class PredictionScore(Base):
    __tablename__ = "prediction_scores"

    prediction_id = Column(Integer, ForeignKey("user_predictions.id"), primary_key=True)
    username = Column(String, nullable=False, index=True)
    session_key = Column(Integer, nullable=False, index=True)
    p1_exact = Column(Boolean, nullable=False)
    p2_exact = Column(Boolean, nullable=False)
    p3_exact = Column(Boolean, nullable=False)
    podium_hits = Column(Integer, nullable=False)
    total_points = Column(Integer, nullable=False)
    scored_at = Column(String, nullable=False)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
