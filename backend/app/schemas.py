"""
Pydantic Schemas for PaceIQ API (Pydantic v2).
Complies with TECH_SPEC.md §8 and IMPLEMENTATION_RULES.md (Rules 29, 30, 32, 33).
"""

from pydantic import BaseModel


# Standard Error Shape (Rule 30)
class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


# Health
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    database_connected: bool
    version: str = "paceiq_v1"


# Seasons
class SeasonSummary(BaseModel):
    year: int
    total_races: int
    completed_races: int


# Race Listing Item
class PredictedDriverPodium(BaseModel):
    driver_number: int
    name_acronym: str
    team_colour: str
    headshot_url: str | None = None


class RaceListItem(BaseModel):
    session_key: int
    meeting_key: int
    meeting_name: str
    circuit_short_name: str
    country_name: str
    date_start: str
    year: int
    status: str  # "upcoming" or "completed"
    predicted_podium: list[PredictedDriverPodium]
    actual_podium: list[PredictedDriverPodium] | None = None
    result_status: str | None = (
        None  # "Podium correct", "Partially correct", "Missed", or None
    )


# Race Detail
class PredictedOrderRow(BaseModel):
    driver_number: int
    full_name: str
    name_acronym: str
    team_name: str
    team_colour: str
    predicted_position: int
    podium_probability: float
    headshot_url: str | None = None


class ActualOrderRow(BaseModel):
    driver_number: int
    full_name: str
    name_acronym: str
    team_name: str
    team_colour: str
    actual_position: int
    predicted_position: int | None = None
    delta: int | None = None
    dnf: bool = False
    points: float = 0.0
    headshot_url: str | None = None


class RaceDetailResponse(BaseModel):
    session_key: int
    meeting_key: int
    meeting_name: str
    circuit_short_name: str
    country_name: str
    year: int
    date_start: str
    status: str
    model_version: str
    spearman_correlation: float | None = None
    predicted: list[PredictedOrderRow]
    actual: list[ActualOrderRow] | None = None


# Laps
class LapItem(BaseModel):
    lap_number: int
    lap_duration: float | None
    driver_number: int
    compound: str | None = None
    is_pit_out_lap: bool = False


class DriverLapsResponse(BaseModel):
    session_key: int
    driver_number: int
    laps: list[LapItem]


# Stints
class StintItem(BaseModel):
    stint_number: int
    driver_number: int
    lap_start: int
    lap_end: int
    compound: str
    tyre_age_at_start: int


class RaceStintsResponse(BaseModel):
    session_key: int
    stints: list[StintItem]


# Driver Explainer
class FeatureContribution(BaseModel):
    feature: str
    value: float
    contribution: float


class DriverExplainResponse(BaseModel):
    session_key: int
    driver_number: int
    driver_name: str
    team_name: str
    team_colour: str
    predicted_position: int
    podium_probability: float
    base_value: float
    prediction: float
    positive: list[FeatureContribution]
    negative: list[FeatureContribution]
    summary: str
    headshot_url: str | None = None

