"""
Tests for Prediction Game Scoring (Rule 36 & 53).
Rule 36:
- Exact position match: 3 points
- In actual top 3 but different position: 1 point
- Max score: 9 points
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db import Base, SessionResult, UserPrediction
from backend.app.services.predictor import score_and_store_prediction


def test_scoring_exact_podium():
    """Exact match of P1, P2, P3 gets 9 points."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    try:
        # Actual results: 1->P1, 16->P2, 55->P3
        for pos, d_num in [(1, 1), (2, 16), (3, 55)]:
            db.add(
                SessionResult(
                    session_key=500,
                    driver_number=d_num,
                    meeting_key=10,
                    position=pos,
                    number_of_laps=50,
                )
            )

        # User predicted exactly 1, 16, 55
        user_pred = UserPrediction(
            id=1,
            username="f1_guru",
            session_key=500,
            p1_driver=1,
            p2_driver=16,
            p3_driver=55,
            submitted_at="2024-03-01T10:00:00Z",
        )
        db.add(user_pred)
        db.commit()

        score = score_and_store_prediction(user_pred, db)
        assert score is not None
        assert score.total_points == 9
        assert score.p1_exact is True
        assert score.p2_exact is True
        assert score.p3_exact is True
        assert score.podium_hits == 3

    finally:
        db.close()


def test_scoring_partial_podium_and_misses():
    """P1 exact (3 pts), P2 in podium but wrong slot (1 pt), P3 missed (0 pts) = 4 pts."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    try:
        # Actual results: 1->P1, 16->P2, 55->P3
        for pos, d_num in [(1, 1), (2, 16), (3, 55)]:
            db.add(
                SessionResult(
                    session_key=500,
                    driver_number=d_num,
                    meeting_key=10,
                    position=pos,
                    number_of_laps=50,
                )
            )

        # User predicted P1=1 (exact 3pts), P2=55 (podium hit 1pt), P3=44 (miss 0pts)
        user_pred = UserPrediction(
            id=2,
            username="casual_fan",
            session_key=500,
            p1_driver=1,
            p2_driver=55,
            p3_driver=44,
            submitted_at="2024-03-01T10:00:00Z",
        )
        db.add(user_pred)
        db.commit()

        score = score_and_store_prediction(user_pred, db)
        assert score is not None
        assert score.total_points == 4
        assert score.p1_exact is True
        assert score.p2_exact is False
        assert score.p3_exact is False
        assert score.podium_hits == 2

    finally:
        db.close()
