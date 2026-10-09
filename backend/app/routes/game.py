"""
Game and leaderboard routes for PaceIQ API.
Complies with IMPLEMENTATION_RULES.md (Rules 34-38).
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session as DBSession

from backend.app.db import (
    Driver,
    Meeting,
    Prediction,
    PredictionScore,
    Session,
    SessionResult,
    UserPrediction,
    get_db,
)
from backend.app.schemas import (
    LeaderboardResponse,
    PredictionSubmitRequest,
    PredictionSubmitResponse,
    ShareCardResponse,
)
from backend.app.services.predictor import (
    get_leaderboard,
    score_and_store_prediction,
)

router = APIRouter()


@router.post(
    "/game/predictions",
    response_model=PredictionSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_prediction(
    req: PredictionSubmitRequest,
    db: DBSession = Depends(get_db),
):
    """Submit a top-3 pick for an upcoming race."""
    # 1. Check session existence
    session_obj = (
        db.query(Session).filter(Session.session_key == req.session_key).first()
    )
    if not session_obj:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "SESSION_NOT_FOUND",
                "message": f"Session {req.session_key} not found.",
            },
        )

    now_utc = datetime.now(UTC)
    # 2. Check if session has concluded results or started
    has_results = (
        db.query(SessionResult)
        .filter(SessionResult.session_key == req.session_key)
        .count()
        >= 10
    )
    if has_results:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "SESSION_CLOSED",
                "message": "Predictions for this session are closed.",
            },
        )

    # 3. Check for duplicate submission by this username (Rule 34)
    existing = (
        db.query(UserPrediction)
        .filter(
            UserPrediction.username == req.username,
            UserPrediction.session_key == req.session_key,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "DUPLICATE_PREDICTION",
                "message": f"User '{req.username}' has already submitted a pick for this session.",
            },
        )

    # 4. Check that picked drivers exist in this session
    session_drivers = {
        d.driver_number
        for d in db.query(Driver.driver_number)
        .filter(Driver.session_key == req.session_key)
        .all()
    }
    for pick in [req.p1, req.p2, req.p3]:
        if session_drivers and pick not in session_drivers:
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "INVALID_PICKS",
                    "message": f"Driver {pick} is not participating in this session.",
                },
            )

    # 5. Save submission
    now_iso = now_utc.isoformat()
    user_pred = UserPrediction(
        username=req.username,
        session_key=req.session_key,
        p1_driver=req.p1,
        p2_driver=req.p2,
        p3_driver=req.p3,
        submitted_at=now_iso,
    )
    db.add(user_pred)
    db.commit()
    db.refresh(user_pred)

    return PredictionSubmitResponse(
        id=user_pred.id,
        username=user_pred.username,
        session_key=user_pred.session_key,
        p1=user_pred.p1_driver,
        p2=user_pred.p2_driver,
        p3=user_pred.p3_driver,
        submitted_at=user_pred.submitted_at,
    )


@router.get("/game/leaderboard", response_model=LeaderboardResponse)
def view_leaderboard(
    session_key: int | None = Query(default=None),
    db: DBSession = Depends(get_db),
):
    """Retrieve scored user rankings for a session or overall."""
    entries = get_leaderboard(session_key, db)
    return LeaderboardResponse(session_key=session_key, leaderboard=entries)


@router.get("/game/cards/{user_prediction_id}", response_model=ShareCardResponse)
def get_share_card(
    user_prediction_id: int,
    db: DBSession = Depends(get_db),
):
    """Retrieve full data needed to render a social share card (Reference 3)."""
    user_pred = (
        db.query(UserPrediction).filter(UserPrediction.id == user_prediction_id).first()
    )
    if not user_pred:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "CARD_NOT_FOUND",
                "message": f"Prediction ID {user_prediction_id} not found.",
            },
        )

    # Score if not scored yet
    score_obj = (
        db.query(PredictionScore)
        .filter(PredictionScore.prediction_id == user_prediction_id)
        .first()
    )
    if not score_obj:
        score_obj = score_and_store_prediction(user_pred, db)

    # Session & Meeting details
    sess = (
        db.query(Session).filter(Session.session_key == user_pred.session_key).first()
    )
    meet = (
        db.query(Meeting)
        .filter(Meeting.meeting_key == (sess.meeting_key if sess else 0))
        .first()
    )

    # User picks details
    driver_rows = {
        d.driver_number: d
        for d in db.query(Driver)
        .filter(Driver.session_key == user_pred.session_key)
        .all()
    }

    user_picks = []
    for rank_str, d_num in [
        ("P1", user_pred.p1_driver),
        ("P2", user_pred.p2_driver),
        ("P3", user_pred.p3_driver),
    ]:
        d = driver_rows.get(d_num)
        user_picks.append(
            {
                "slot": rank_str,
                "driver_number": d_num,
                "name": d.full_name if d else f"Driver {d_num}",
                "acronym": d.name_acronym if d else f"D{d_num}",
                "team": d.team_name if d else "",
                "colour": d.team_colour if d else "#7C7C88",
            }
        )

    # Model picks
    model_rows = (
        db.query(Prediction)
        .filter(
            Prediction.session_key == user_pred.session_key,
            Prediction.model_version == "paceiq_v1",
        )
        .order_by(Prediction.predicted_position.asc())
        .limit(3)
        .all()
    )
    model_picks = []
    for p in model_rows:
        d = driver_rows.get(p.driver_number)
        model_picks.append(
            {
                "position": p.predicted_position,
                "driver_number": p.driver_number,
                "name": d.full_name if d else f"Driver {p.driver_number}",
                "acronym": d.name_acronym if d else f"D{p.driver_number}",
                "probability": p.podium_probability,
            }
        )

    # Actual podium
    actual_rows = (
        db.query(SessionResult)
        .filter(
            SessionResult.session_key == user_pred.session_key,
            SessionResult.position <= 3,
        )
        .order_by(SessionResult.position.asc())
        .all()
    )
    actual_podium = []
    for a in actual_rows:
        d = driver_rows.get(a.driver_number)
        actual_podium.append(
            {
                "position": a.position,
                "driver_number": a.driver_number,
                "name": d.full_name if d else f"Driver {a.driver_number}",
                "acronym": d.name_acronym if d else f"D{a.driver_number}",
            }
        )

    total_pts = score_obj.total_points if score_obj else 0
    result_summary = (
        "PERFECT PICK"
        if total_pts == 9
        else ("PODIUM HIT" if total_pts >= 3 else "RACE FINISH")
    )

    return ShareCardResponse(
        user_prediction_id=user_pred.id,
        username=user_pred.username,
        session_key=user_pred.session_key,
        race_name=meet.meeting_name if meet else "Grand Prix",
        circuit_name=meet.circuit_short_name if meet else "",
        date=sess.date_start if sess else "",
        score=total_pts,
        user_picks=user_picks,
        model_picks=model_picks,
        actual_podium=actual_podium,
        result_summary=result_summary,
        model_version="paceiq_v1",
        generated_at=datetime.now(UTC).isoformat(),
    )
