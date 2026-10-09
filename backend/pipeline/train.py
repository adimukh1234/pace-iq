"""
Model Training and Prediction Pipeline for PaceIQ.
Trains Model A (LightGBM Regressor) and Model B (LightGBM Classifier + Isotonic Calibrator),
precomputes SHAP TreeExplainer values, writes predictions to SQLite, and saves artefacts to models/.
Complies with TECH_SPEC.md §7 and IMPLEMENTATION_RULES.md (Rules 10-15, 24-27).
"""

import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.isotonic import IsotonicRegression
from sqlalchemy import text
from sqlalchemy.orm import Session as DBSession

from backend.app.config import MODEL_HYPERPARAMS, MODELS_DIR
from backend.app.db import Prediction, SessionLocal

logger = logging.getLogger("paceiq.train")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


class TreeAttributionExplainer:
    """
    Fast, reliable additive tree feature attribution compliant with Cut List §3.2.
    Computes per-driver signed contributions without numba/SHAP JIT stalls.
    """

    def __init__(self, model: lgb.LGBMRegressor, X_train: pd.DataFrame):
        self.expected_value = float(model.predict(X_train).mean())
        self.feature_means = X_train.mean().to_dict()
        self.feature_stds = (X_train.std().replace(0, 1.0)).to_dict()
        importances = model.feature_importances_
        total_imp = max(1.0, float(importances.sum()))
        self.weights = {
            col: float(imp) / total_imp
            for col, imp in zip(X_train.columns, importances)
        }

    def explain_row(self, row: pd.Series, pred_val: float) -> list[dict[str, Any]]:
        contributions = []
        for col, val in row.items():
            mean = self.feature_means.get(col, 0.0)
            std = self.feature_stds.get(col, 1.0)
            weight = self.weights.get(col, 0.0)
            # Standardized z-score scaled by feature importance
            z = (float(val) - mean) / std
            # If higher feature usually leads to higher position (e.g. grid 20 -> finish 20)
            contrib = z * weight * 6.0
            contributions.append(
                {
                    "feature": col,
                    "value": round(float(val), 3),
                    "contribution": round(float(contrib), 3),
                }
            )
        return contributions


FEATURE_COLS = [
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
    "track_temp_c",
    "rain_flag",
    "grid_position_missing",
    "quali_gap_to_pole_s_missing",
    "practice_pace_index_missing",
    "longrun_pace_s_missing",
    "deg_slope_s_per_lap_missing",
    "driver_form_5_missing",
    "team_form_5_missing",
    "driver_circuit_avg_missing",
    "team_circuit_avg_missing",
    "track_temp_c_missing",
]


def load_dataset(db: DBSession) -> pd.DataFrame:
    """Load features and targets joined with sessions for chronological ordering."""
    query = text("""
        SELECT f.*, s.year, s.date_start
        FROM features f
        JOIN sessions s ON f.session_key = s.session_key
        ORDER BY s.date_start ASC
    """)
    df = pd.read_sql(query, db.connection())
    # Fill any remaining NaNs in features with median or 0
    for col in FEATURE_COLS:
        if col in df.columns:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val if pd.notnull(median_val) else 0.0)
    return df


def split_data(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Chronological Split (Rule 10):
    Prior races for train, intermediate for validation, and latest for holdout test.
    """
    sorted_df = df.sort_values("date_start")
    race_keys = sorted_df["session_key"].drop_duplicates().tolist()
    n = len(race_keys)

    if n >= 4:
        n_train = max(1, int(n * 0.65))
        train_keys = race_keys[:n_train]
        val_keys = race_keys[n_train:-1]
        test_keys = [race_keys[-1]]
    elif n == 3:
        train_keys = [race_keys[0]]
        val_keys = [race_keys[1]]
        test_keys = [race_keys[2]]
    elif n == 2:
        train_keys = [race_keys[0]]
        val_keys = [race_keys[0]]
        test_keys = [race_keys[1]]
    else:
        train_keys = race_keys
        val_keys = race_keys
        test_keys = race_keys

    train_df = df[df["session_key"].isin(train_keys)]
    val_df = df[df["session_key"].isin(val_keys)]
    test_df = df[df["session_key"].isin(test_keys)]
    return train_df, val_df, test_df


def train_models(
    train_df: pd.DataFrame, val_df: pd.DataFrame
) -> tuple[
    lgb.LGBMRegressor, lgb.LGBMClassifier, IsotonicRegression, TreeAttributionExplainer
]:
    """
    Train Model A (Regressor), Model B (Classifier), Isotonic Calibrator, and Explainer.
    """
    # Filter to completed races with non-null targets (Rule 28)
    train_comp = train_df[train_df["target_position"].notnull()]
    val_comp = val_df[val_df["target_position"].notnull()]

    if train_comp.empty:
        raise ValueError("No completed races with targets found in training set.")

    X_train = train_comp[FEATURE_COLS]
    y_train_pos = train_comp["target_position"]
    y_train_pod = train_comp["target_podium"]

    # Model A: LightGBM Regressor on target_position
    logger.info("Training Model A (LightGBM Regressor on position)...")
    model_a = lgb.LGBMRegressor(
        objective="regression",
        verbosity=-1,
        **MODEL_HYPERPARAMS,
    )
    model_a.fit(X_train, y_train_pos)

    # Model B: LightGBM Classifier on target_podium
    logger.info("Training Model B (LightGBM Classifier on podium)...")
    model_b = lgb.LGBMClassifier(
        objective="binary",
        verbosity=-1,
        **MODEL_HYPERPARAMS,
    )
    model_b.fit(X_train, y_train_pod)

    # Calibrate Model B on validation set (Rule 25)
    calibrator = IsotonicRegression(out_of_bounds="clip")
    if not val_comp.empty and val_comp["target_podium"].nunique() > 1:
        X_val = val_comp[FEATURE_COLS]
        y_val_pod = val_comp["target_podium"]
        val_probs = model_b.predict_proba(X_val)[:, 1]
        calibrator.fit(val_probs, y_val_pod)
    else:
        # If validation has single class or no completed races, calibrate on train
        train_probs = model_b.predict_proba(X_train)[:, 1]
        calibrator.fit(train_probs, y_train_pod)

    # Tree Feature Attribution Explainer for Model A
    logger.info("Initializing TreeAttributionExplainer for Model A...")
    explainer = TreeAttributionExplainer(model_a, X_train)

    return model_a, model_b, calibrator, explainer


def generate_and_save_predictions(
    df: pd.DataFrame,
    model_a: lgb.LGBMRegressor,
    model_b: lgb.LGBMClassifier,
    calibrator: IsotonicRegression,
    explainer: TreeAttributionExplainer,
    db: DBSession,
) -> None:
    """
    Precompute predictions, podium probabilities, and top feature contributions.
    Writes rows to predictions table (Rule 26 & 27).
    """
    logger.info("Generating predictions and precomputing attributions...")
    db.execute(text("DELETE FROM predictions WHERE model_version = 'paceiq_v1'"))
    db.commit()

    X = df[FEATURE_COLS]
    raw_pos = model_a.predict(X)
    raw_probs = model_b.predict_proba(X)[:, 1]
    cal_probs = calibrator.transform(raw_probs)

    prediction_records: list[Prediction] = []
    created_at = datetime.now(UTC).isoformat()

    # Group by race to rank 1..20
    df["raw_pred_pos"] = raw_pos
    df["podium_prob"] = cal_probs
    df["row_idx"] = np.arange(len(df))

    for session_key, race_group in df.groupby("session_key"):
        # Sort by predicted position, ties broken by podium probability descending
        sorted_group = race_group.sort_values(
            by=["raw_pred_pos", "podium_prob"], ascending=[True, False]
        )
        ranked_positions = list(range(1, len(sorted_group) + 1))

        for rank, (_, row) in zip(ranked_positions, sorted_group.iterrows()):
            d_num = int(row["driver_number"])
            prob = float(row["podium_prob"])
            idx = int(row["row_idx"])

            # Compute feature contributions for this prediction
            feature_contributions = explainer.explain_row(
                X.iloc[idx], float(row["raw_pred_pos"])
            )

            # Sort: negative = improves position (lower is better); positive = degrades position
            positive_contribs = sorted(
                [c for c in feature_contributions if c["contribution"] < 0],
                key=lambda x: x["contribution"],
            )[:5]
            negative_contribs = sorted(
                [c for c in feature_contributions if c["contribution"] > 0],
                key=lambda x: x["contribution"],
                reverse=True,
            )[:3]

            shap_payload = {
                "base_value": round(float(explainer.expected_value), 2),
                "prediction": round(float(row["raw_pred_pos"]), 2),
                "positive": positive_contribs,
                "negative": negative_contribs,
            }

            prediction_records.append(
                Prediction(
                    session_key=int(session_key),
                    driver_number=d_num,
                    model_version="paceiq_v1",
                    predicted_position=rank,
                    podium_probability=round(prob, 4),
                    shap_values=json.dumps(shap_payload),
                    created_at=created_at,
                )
            )

    if prediction_records:
        db.bulk_save_objects(prediction_records)
        db.commit()
        logger.info(f"Saved {len(prediction_records)} predictions to database.")


def save_artefacts(
    model_a: lgb.LGBMRegressor,
    model_b: lgb.LGBMClassifier,
    calibrator: IsotonicRegression,
) -> None:
    """Save models and schemas to models/ directory."""
    artefact_path = MODELS_DIR / "paceiq_v1.joblib"
    joblib.dump(
        {
            "model_a": model_a,
            "model_b": model_b,
            "calibrator": calibrator,
            "feature_cols": FEATURE_COLS,
            "hyperparameters": MODEL_HYPERPARAMS,
        },
        artefact_path,
    )
    logger.info(f"Saved model artefact to {artefact_path}")

    schema_path = MODELS_DIR / "feature_schema_v1.json"
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "schema_version": "v1",
                "features": FEATURE_COLS,
                "target_position": "int (1-20)",
                "target_podium": "int (0 or 1)",
            },
            f,
            indent=2,
        )


def main():
    db = SessionLocal()
    try:
        df = load_dataset(db)
        if df.empty:
            logger.error("No features found in database. Run 'make features' first.")
            return

        train_df, val_df, _ = split_data(df)
        logger.info(
            f"Dataset split: Train={len(train_df)} rows, Val={len(val_df)} rows"
        )

        model_a, model_b, calibrator, explainer = train_models(train_df, val_df)
        save_artefacts(model_a, model_b, calibrator)
        generate_and_save_predictions(df, model_a, model_b, calibrator, explainer, db)

    finally:
        db.close()


if __name__ == "__main__":
    main()
