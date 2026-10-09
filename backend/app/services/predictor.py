"""
Predictor and Game Service for PaceIQ.
Handles race projections, explanations, scoring calculations, and leaderboard aggregation.
Complies with IMPLEMENTATION_RULES.md (Rules 31, 34-38).
"""

import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from scipy.stats import spearmanr
from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from backend.app.db import (
    PredictionScore,
    UserPrediction,
)
from backend.app.schemas import (
    ActualOrderRow,
    DriverExplainResponse,
    FeatureContribution,
    LeaderboardEntry,
    PredictedDriverPodium,
    PredictedOrderRow,
    RaceDetailResponse,
    RaceListItem,
    SeasonSummary,
)

logger = logging.getLogger("paceiq.service")


def get_seasons_summary(db: DBSession) -> list[SeasonSummary]:
    """Retrieve distinct seasons with race counts."""
    query = text("""
        SELECT s.year,
               COUNT(DISTINCT s.session_key) AS total_races,
               COUNT(DISTINCT CASE WHEN r.position IS NOT NULL THEN s.session_key END) AS completed_races
        FROM sessions s
        JOIN drivers d ON s.session_key = d.session_key
        LEFT JOIN session_results r ON s.session_key = r.session_key
        WHERE s.session_name = 'Race'
        GROUP BY s.year
        HAVING COUNT(DISTINCT d.driver_number) >= 10
        ORDER BY s.year DESC
    """)
    rows = db.execute(query).fetchall()
    summaries = []
    for r in rows:
        summaries.append(
            SeasonSummary(
                year=int(r[0]),
                total_races=int(r[1]),
                completed_races=int(r[2] or 0),
            )
        )
    return summaries


def get_races_for_season(year: int, db: DBSession) -> list[RaceListItem]:
    """Retrieve all races for a season with predicted podium and completion status."""
    query = text("""
        SELECT s.session_key, s.meeting_key, m.meeting_name, m.circuit_short_name,
               m.country_name, s.date_start, s.year,
               COUNT(DISTINCT r.position) AS result_count,
               COUNT(DISTINCT d.driver_number) AS driver_count
        FROM sessions s
        JOIN meetings m ON s.meeting_key = m.meeting_key
        JOIN drivers d ON s.session_key = d.session_key
        LEFT JOIN session_results r ON s.session_key = r.session_key
        WHERE s.session_name = 'Race' AND s.year = :year
        GROUP BY s.session_key
        HAVING COUNT(DISTINCT d.driver_number) >= 10
        ORDER BY s.date_start ASC
    """)
    rows = db.execute(query, {"year": year}).fetchall()

    items = []
    for r in rows:
        s_key = int(r[0])
        m_key = int(r[1])
        s_date = str(r[5] or "")
        res_count = int(r[7] or 0)
        is_completed = res_count >= 10 or (int(r[6]) < 2026)

        # Predicted podium (P1, P2, P3)
        pred_query = text("""
            SELECT p.driver_number, d.name_acronym, d.team_colour
            FROM predictions p
            JOIN drivers d ON p.session_key = d.session_key AND p.driver_number = d.driver_number
            WHERE p.session_key = :s_key AND p.model_version = 'paceiq_v1'
            ORDER BY p.predicted_position ASC
            LIMIT 3
        """)
        pred_podium_rows = db.execute(pred_query, {"s_key": s_key}).fetchall()
        predicted_podium = [
            PredictedDriverPodium(
                driver_number=int(p[0]),
                name_acronym=str(p[1]),
                team_colour=str(p[2]),
            )
            for p in pred_podium_rows
        ]

        # Result status and actual podium
        actual_podium = None
        result_status = None
        if is_completed:
            act_query = text("""
                SELECT r.driver_number, d.full_name, d.name_acronym, d.team_name, d.team_colour, r.position
                FROM session_results r
                JOIN drivers d ON r.session_key = d.session_key AND r.driver_number = d.driver_number
                WHERE r.session_key = :s_key AND r.position <= 3
                ORDER BY r.position ASC
            """)
            act_rows = db.execute(act_query, {"s_key": s_key}).fetchall()
            if len(act_rows) >= 3:
                actual_podium = [
                    PredictedDriverPodium(
                        driver_number=int(a[0]),
                        full_name=str(a[1]),
                        name_acronym=str(a[2]),
                        team_name=str(a[3]),
                        team_colour=str(a[4]),
                    )
                    for a in act_rows[:3]
                ]
                if len(predicted_podium) == 3:
                    act_top3 = [a.driver_number for a in actual_podium]
                    pred_top3 = [p.driver_number for p in predicted_podium]

                    exact_count = sum(1 for p, a in zip(pred_top3, act_top3) if p == a)
                    set_overlap = len(set(pred_top3).intersection(set(act_top3)))

                    if exact_count == 3:
                        result_status = "Podium correct"
                    elif set_overlap >= 1:
                        result_status = "Partially correct"
                    else:
                        result_status = "Missed"

        items.append(
            RaceListItem(
                session_key=s_key,
                meeting_key=m_key,
                meeting_name=str(r[2]),
                circuit_short_name=str(r[3] or ""),
                country_name=str(r[4] or ""),
                date_start=str(r[5]),
                year=int(r[6]),
                status="completed" if is_completed else "upcoming",
                predicted_podium=predicted_podium,
                actual_podium=actual_podium,
                result_status=result_status,
            )
        )
    return items


def get_race_detail(session_key: int, db: DBSession) -> RaceDetailResponse | None:
    """Retrieve full predicted order and actual results (if completed)."""
    # Fetch session and meeting info
    sess_query = text("""
        SELECT s.session_key, s.meeting_key, m.meeting_name, m.circuit_short_name,
               m.country_name, s.year, s.date_start
        FROM sessions s
        JOIN meetings m ON s.meeting_key = m.meeting_key
        WHERE s.session_key = :session_key
    """)
    s_row = db.execute(sess_query, {"session_key": session_key}).fetchone()
    if not s_row:
        return None

    # Fetch predictions
    pred_query = text("""
        SELECT p.driver_number, d.full_name, d.name_acronym, d.team_name, d.team_colour,
               p.predicted_position, p.podium_probability
        FROM predictions p
        JOIN drivers d ON p.session_key = d.session_key AND p.driver_number = d.driver_number
        WHERE p.session_key = :session_key AND p.model_version = 'paceiq_v1'
        ORDER BY p.predicted_position ASC
    """)
    pred_rows = db.execute(pred_query, {"session_key": session_key}).fetchall()
    predicted_list = [
        PredictedOrderRow(
            driver_number=int(p[0]),
            full_name=str(p[1]),
            name_acronym=str(p[2]),
            team_name=str(p[3]),
            team_colour=str(p[4]),
            predicted_position=int(p[5]),
            podium_probability=float(p[6]),
        )
        for p in pred_rows
    ]

    # Fetch actual results
    act_query = text("""
        SELECT r.driver_number, d.full_name, d.name_acronym, d.team_name, d.team_colour,
               r.position, r.dnf, r.points
        FROM session_results r
        JOIN drivers d ON r.session_key = d.session_key AND r.driver_number = d.driver_number
        WHERE r.session_key = :session_key
        ORDER BY r.position ASC
    """)
    act_rows = db.execute(act_query, {"session_key": session_key}).fetchall()

    actual_list = None
    spearman_corr = None

    if len(act_rows) >= 5:
        # Create driver_number -> predicted_position map
        pred_map = {p.driver_number: p.predicted_position for p in predicted_list}
        actual_list = []
        actual_positions = []
        predicted_positions = []

        for a in act_rows:
            d_num = int(a[0])
            act_pos = int(a[5])
            p_pos = pred_map.get(d_num)
            delta = (p_pos - act_pos) if p_pos is not None else None

            actual_list.append(
                ActualOrderRow(
                    driver_number=d_num,
                    full_name=str(a[1]),
                    name_acronym=str(a[2]),
                    team_name=str(a[3]),
                    team_colour=str(a[4]),
                    actual_position=act_pos,
                    predicted_position=p_pos,
                    delta=delta,
                    dnf=bool(a[6]),
                    points=float(a[7] or 0.0),
                )
            )
            if p_pos is not None:
                actual_positions.append(act_pos)
                predicted_positions.append(p_pos)

        if len(actual_positions) >= 5:
            corr, _ = spearmanr(actual_positions, predicted_positions)
            spearman_corr = round(float(corr), 3) if pd.notnull(corr) else 0.0

    return RaceDetailResponse(
        session_key=int(s_row[0]),
        meeting_key=int(s_row[1]),
        meeting_name=str(s_row[2]),
        circuit_short_name=str(s_row[3] or ""),
        country_name=str(s_row[4] or ""),
        year=int(s_row[5]),
        date_start=str(s_row[6]),
        status="completed" if actual_list is not None else "upcoming",
        model_version="paceiq_v1",
        spearman_correlation=spearman_corr,
        predicted=predicted_list,
        actual=actual_list,
    )


def generate_explainer_summary(
    pos_items: list[FeatureContribution], neg_items: list[FeatureContribution]
) -> str:
    """Generate plain-language explainer summary using fixed templates (TECH_SPEC §8.2)."""
    clauses = []
    if pos_items:
        top_pos = pos_items[0]
        feat_name = top_pos.feature.replace("_", " ")
        if "grid" in feat_name:
            clauses.append(
                f"Starting P{int(top_pos.value)} on the grid gives a major advantage"
            )
        elif "pace" in feat_name:
            clauses.append("Strong clean practice pace bolsters the projection")
        elif "form" in feat_name:
            clauses.append(
                "High recent form across prior races provides positive momentum"
            )
        else:
            clauses.append(f"Favorable {feat_name} drives the forecast")

    if neg_items:
        top_neg = neg_items[0]
        feat_name = top_neg.feature.replace("_", " ")
        if "deg" in feat_name:
            clauses.append("higher tyre degradation pulls it back")
        elif "gap" in feat_name:
            clauses.append("qualifying gap to pole limits the upside")
        else:
            clauses.append(f"unfavorable {feat_name} limits the ceiling")

    if clauses:
        return "; ".join(clauses) + "."
    return "Balanced metrics across pace, grid position, and rolling team form."


def get_driver_explanation(
    session_key: int, driver_number: int, db: DBSession
) -> DriverExplainResponse | None:
    """Retrieve precomputed SHAP attribution and summary for a driver prediction."""
    query = text("""
        SELECT p.predicted_position, p.podium_probability, p.shap_values,
               d.full_name, d.team_name, d.team_colour
        FROM predictions p
        JOIN drivers d ON p.session_key = d.session_key AND p.driver_number = d.driver_number
        WHERE p.session_key = :session_key
          AND p.driver_number = :driver_number
          AND p.model_version = 'paceiq_v1'
    """)
    row = db.execute(
        query,
        {"session_key": session_key, "driver_number": driver_number},
    ).fetchone()
    if not row:
        return None

    shap_data = json.loads(row[2])
    pos_contribs = [FeatureContribution(**c) for c in shap_data.get("positive", [])]
    neg_contribs = [FeatureContribution(**c) for c in shap_data.get("negative", [])]
    summary_text = generate_explainer_summary(pos_contribs, neg_contribs)

    return DriverExplainResponse(
        session_key=session_key,
        driver_number=driver_number,
        driver_name=str(row[3]),
        team_name=str(row[4]),
        team_colour=str(row[5]),
        predicted_position=int(row[0]),
        podium_probability=float(row[1]),
        base_value=float(shap_data.get("base_value", 10.5)),
        prediction=float(shap_data.get("prediction", row[0])),
        positive=pos_contribs,
        negative=neg_contribs,
        summary=summary_text,
    )


def score_and_store_prediction(
    user_pred: UserPrediction, db: DBSession
) -> PredictionScore | None:
    """
    Score a user pick against actual results using Rule 36:
    - Exact match for P1, P2, P3: 3 points each
    - In actual top 3 but different position: 1 point each
    - Max score: 9 points
    """
    act_query = text("""
        SELECT driver_number, position
        FROM session_results
        WHERE session_key = :session_key AND position <= 3
        ORDER BY position ASC
    """)
    results = db.execute(act_query, {"session_key": user_pred.session_key}).fetchall()
    if len(results) < 3:
        return None  # Results not complete yet

    actual_map = {int(r[0]): int(r[1]) for r in results}
    actual_top3 = set(actual_map.keys())

    p1 = user_pred.p1_driver
    p2 = user_pred.p2_driver
    p3 = user_pred.p3_driver

    p1_exact = actual_map.get(p1) == 1
    p2_exact = actual_map.get(p2) == 2
    p3_exact = actual_map.get(p3) == 3

    points = 0
    podium_hits = 0

    for pick, exact in [(p1, p1_exact), (p2, p2_exact), (p3, p3_exact)]:
        if exact:
            points += 3
            podium_hits += 1
        elif pick in actual_top3:
            points += 1
            podium_hits += 1

    score = PredictionScore(
        prediction_id=user_pred.id,
        username=user_pred.username,
        session_key=user_pred.session_key,
        p1_exact=p1_exact,
        p2_exact=p2_exact,
        p3_exact=p3_exact,
        podium_hits=podium_hits,
        total_points=points,
        scored_at=datetime.now(UTC).isoformat(),
    )
    db.merge(score)
    db.commit()
    return score


def get_leaderboard(session_key: int | None, db: DBSession) -> list[LeaderboardEntry]:
    """
    Rank users by total points. Ties broken by earlier submission time (Rule 38).
    Scores any unscored completed predictions on the fly.
    """
    # Auto-score any pending user predictions for completed sessions
    unscored = (
        db.query(UserPrediction)
        .outerjoin(PredictionScore, UserPrediction.id == PredictionScore.prediction_id)
        .filter(PredictionScore.prediction_id.is_(None))
        .all()
    )
    for p in unscored:
        score_and_store_prediction(p, db)

    filter_clause = "WHERE s.session_key = :session_key" if session_key else ""
    query = text(f"""
        SELECT s.username,
               SUM(s.total_points) AS total_points,
               SUM(CASE WHEN s.p1_exact THEN 1 ELSE 0 END +
                   CASE WHEN s.p2_exact THEN 1 ELSE 0 END +
                   CASE WHEN s.p3_exact THEN 1 ELSE 0 END) AS exact_picks,
               SUM(s.podium_hits) AS podium_hits,
               MIN(u.submitted_at) AS submitted_at
        FROM prediction_scores s
        JOIN user_predictions u ON s.prediction_id = u.id
        {filter_clause}
        GROUP BY s.username
        ORDER BY total_points DESC, submitted_at ASC
    """)
    params = {"session_key": session_key} if session_key else {}
    rows = db.execute(query, params).fetchall()

    entries = []
    for rank, r in enumerate(rows, start=1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                username=str(r[0]),
                total_points=int(r[1]),
                exact_picks=int(r[2]),
                podium_hits=int(r[3]),
                submitted_at=str(r[4]),
            )
        )
    return entries
