"""
Races and session routes for PaceIQ API.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from backend.app.db import Lap, Stint, get_db
from backend.app.schemas import (
    DriverLapsResponse,
    LapItem,
    RaceDetailResponse,
    RaceListItem,
    RaceStintsResponse,
    SeasonSummary,
    StintItem,
)
from backend.app.services.predictor import (
    get_race_detail,
    get_races_for_season,
    get_seasons_summary,
)

router = APIRouter()


@router.get("/seasons", response_model=list[SeasonSummary])
def list_seasons(db: DBSession = Depends(get_db)):
    """List all available seasons with race counts."""
    return get_seasons_summary(db)


@router.get("/races", response_model=list[RaceListItem])
def list_races(
    year: int = Query(default=2026, ge=2021, le=2026),
    db: DBSession = Depends(get_db),
):
    """List races for a given season with status and predicted podium."""
    return get_races_for_season(year, db)


@router.get("/races/{session_key}", response_model=RaceDetailResponse)
def get_race(session_key: int, db: DBSession = Depends(get_db)):
    """Get race detail, predicted order, and actual results if complete."""
    race = get_race_detail(session_key, db)
    if not race:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "SESSION_NOT_FOUND",
                "message": f"Session {session_key} not found.",
            },
        )
    return race


@router.get("/races/{session_key}/laps", response_model=list[DriverLapsResponse])
def get_race_laps(
    session_key: int,
    drivers: str = Query(description="Comma-separated driver numbers (e.g. 1,16,44)"),
    db: DBSession = Depends(get_db),
):
    """Get lap times for selected drivers in a session."""
    try:
        driver_nums = [int(d.strip()) for d in drivers.split(",") if d.strip()]
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_DRIVER_LIST",
                "message": "Drivers must be comma-separated integers.",
            },
        ) from None

    if not driver_nums or len(driver_nums) > 10:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_DRIVER_COUNT",
                "message": "Driver list must contain between 1 and 10 drivers.",
            },
        )

    results = []
    for d_num in driver_nums:
        lap_rows = (
            db.query(Lap)
            .filter(Lap.session_key == session_key, Lap.driver_number == d_num)
            .order_by(Lap.lap_number.asc())
            .all()
        )
        lap_items = [
            LapItem(
                lap_number=lap.lap_number,
                lap_duration=lap.lap_duration,
                driver_number=lap.driver_number,
                is_pit_out_lap=lap.is_pit_out_lap,
            )
            for lap in lap_rows
        ]
        results.append(
            DriverLapsResponse(
                session_key=session_key,
                driver_number=d_num,
                laps=lap_items,
            )
        )
    return results


@router.get("/races/{session_key}/stints", response_model=RaceStintsResponse)
def get_race_stints(session_key: int, db: DBSession = Depends(get_db)):
    """Get stint ranges and tyre compounds for all drivers in a session."""
    stint_rows = (
        db.query(Stint)
        .filter(Stint.session_key == session_key)
        .order_by(Stint.driver_number.asc(), Stint.stint_number.asc())
        .all()
    )
    items = [
        StintItem(
            stint_number=s.stint_number,
            driver_number=s.driver_number,
            lap_start=s.lap_start or 1,
            lap_end=s.lap_end or 1,
            compound=s.compound,
            tyre_age_at_start=s.tyre_age_at_start,
        )
        for s in stint_rows
    ]
    return RaceStintsResponse(session_key=session_key, stints=items)
