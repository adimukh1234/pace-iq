"""
Evaluation pipeline for PaceIQ.
Evaluates PaceIQ v1 against Starting Grid and Team Form baselines on test split.
Outputs metrics comparison table and saves metrics_v1.json.
Complies with TECH_SPEC.md §7.1 and IMPLEMENTATION_RULES.md (Rules 12-13).
"""

import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.metrics import brier_score_loss, mean_absolute_error

from backend.app.config import MODELS_DIR
from backend.app.db import SessionLocal
from backend.pipeline.train import (
    FEATURE_COLS,
    load_dataset,
    split_data,
)

logger = logging.getLogger("paceiq.evaluate")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def evaluate_ranking(
    actual: list[int], predicted: list[int]
) -> dict[str, float]:
    """Calculate Spearman correlation and MAE between predicted and actual rankings."""
    if len(actual) < 2:
        return {"spearman": 1.0, "mae": 0.0, "top3_acc": 1.0}

    corr, _ = spearmanr(actual, predicted)
    if np.isnan(corr):
        corr = 0.0

    mae = float(mean_absolute_error(actual, predicted))

    # Top-3 set accuracy
    actual_top3 = {
        d for d, pos in zip(range(len(actual)), actual) if pos <= 3
    }
    pred_top3 = {
        d for d, pos in zip(range(len(predicted)), predicted) if pos <= 3
    }
    overlap = len(actual_top3.intersection(pred_top3))
    top3_acc = overlap / 3.0 if len(actual_top3) >= 3 else (overlap / max(1, len(actual_top3)))

    return {
        "spearman": float(corr),
        "mae": float(mae),
        "top3_acc": float(top3_acc),
    }


def evaluate_split(
    test_df: pd.DataFrame,
    model_bundle: dict[str, Any],
) -> dict[str, Any]:
    """Run evaluation per race on test split for model and baselines."""
    model_a = model_bundle["model_a"]
    model_b = model_bundle["model_b"]
    calibrator = model_bundle["calibrator"]

    model_metrics = []
    grid_metrics = []
    team_metrics = []

    all_podium_probs = []
    all_actual_podiums = []

    races = test_df.groupby("session_key")

    for session_key, race_df in races:
        valid_df = race_df[race_df["target_position"].notnull()]
        if len(valid_df) < 5:
            continue

        actual_pos = valid_df["target_position"].values
        actual_podium = valid_df["target_podium"].values

        # 1. Grid Baseline (ranked by grid_position)
        grid_ranks = valid_df["grid_position"].rank(method="first").values
        grid_res = evaluate_ranking(actual_pos, grid_ranks)
        grid_metrics.append(grid_res)

        # 2. Team Form Baseline (ranked by team_form_5 ascending)
        team_ranks = valid_df["team_form_5"].rank(method="first").values
        team_res = evaluate_ranking(actual_pos, team_ranks)
        team_metrics.append(team_res)

        # 3. Model Predictions
        X = valid_df[FEATURE_COLS]
        pred_pos_raw = model_a.predict(X)
        pred_pod_prob = calibrator.transform(model_b.predict_proba(X)[:, 1])

        # Model rank: sort by pred_pos_raw
        model_ranks = pd.Series(pred_pos_raw).rank(method="first").values
        model_res = evaluate_ranking(actual_pos, model_ranks)
        model_metrics.append(model_res)

        all_podium_probs.extend(pred_pod_prob)
        all_actual_podiums.extend(actual_podium)

    def mean_metric(metrics_list: list[dict[str, float]], key: str) -> float:
        vals = [m[key] for m in metrics_list]
        return float(np.mean(vals)) if vals else 0.0

    brier = (
        float(brier_score_loss(all_actual_podiums, all_podium_probs))
        if all_podium_probs
        else 0.0
    )

    results = {
        "grid_baseline": {
            "spearman": round(mean_metric(grid_metrics, "spearman"), 3),
            "mae": round(mean_metric(grid_metrics, "mae"), 2),
            "top3_accuracy": round(mean_metric(grid_metrics, "top3_acc"), 3),
            "brier_score": None,
        },
        "team_form_baseline": {
            "spearman": round(mean_metric(team_metrics, "spearman"), 3),
            "mae": round(mean_metric(team_metrics, "mae"), 2),
            "top3_accuracy": round(mean_metric(team_metrics, "top3_acc"), 3),
            "brier_score": None,
        },
        "paceiq_v1": {
            "spearman": round(mean_metric(model_metrics, "spearman"), 3),
            "mae": round(mean_metric(model_metrics, "mae"), 2),
            "top3_accuracy": round(mean_metric(model_metrics, "top3_acc"), 3),
            "brier_score": round(brier, 4),
        },
        "test_races_count": len(races),
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }

    return results


def print_comparison_table(results: dict[str, Any]) -> None:
    """Print markdown-style comparison table to stdout."""
    print("\n" + "=" * 80)
    print("PACEIQ V1 MODEL EVALUATION RESULTS (TEST SPLIT)")
    print("=" * 80)
    print(
        f"{'Model':<24} | {'Spearman':<10} | {'MAE (pos)':<10} | {'Top-3 Accuracy':<15} | {'Podium Brier':<12}"
    )
    print("-" * 80)

    g = results["grid_baseline"]
    print(
        f"{'Grid baseline':<24} | {g['spearman']:<10} | {g['mae']:<10} | {g['top3_accuracy']:<15} | {'n/a':<12}"
    )

    t = results["team_form_baseline"]
    print(
        f"{'Team form baseline':<24} | {t['spearman']:<10} | {t['mae']:<10} | {t['top3_accuracy']:<15} | {'n/a':<12}"
    )

    m = results["paceiq_v1"]
    print(
        f"{'PaceIQ v1 (LightGBM)':<24} | {m['spearman']:<10} | {m['mae']:<10} | {m['top3_accuracy']:<15} | {m['brier_score']:<12}"
    )
    print("=" * 80 + "\n")


def main():
    artefact_path = MODELS_DIR / "paceiq_v1.joblib"
    if not artefact_path.exists():
        logger.error(
            f"Artefact {artefact_path} not found. Run 'make train' first."
        )
        return

    model_bundle = joblib.load(artefact_path)
    db = SessionLocal()
    try:
        df = load_dataset(db)
        _, _, test_df = split_data(df)
        logger.info(f"Evaluating on test set ({len(test_df)} rows)...")

        metrics = evaluate_split(test_df, model_bundle)
        print_comparison_table(metrics)

        # Save metrics_v1.json
        metrics_file = MODELS_DIR / "metrics_v1.json"
        with open(metrics_file, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        logger.info(f"Metrics saved to {metrics_file}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
