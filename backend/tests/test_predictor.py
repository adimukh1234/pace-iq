"""
Tests for loaded model predictor consistency (Rule 53 & Plan §5.1).
"""

import joblib
import numpy as np
import pandas as pd

from backend.app.config import MODELS_DIR
from backend.pipeline.train import FEATURE_COLS


def test_predictor_determinism():
    """Verify loaded model gives identical outputs for identical inputs."""
    artefact_path = MODELS_DIR / "paceiq_v1.joblib"
    assert artefact_path.exists(), "Model artefact must exist"

    bundle = joblib.load(artefact_path)
    model_a = bundle["model_a"]
    model_b = bundle["model_b"]
    calibrator = bundle["calibrator"]

    sample_x = pd.DataFrame(
        [[1.0] * len(FEATURE_COLS)], columns=FEATURE_COLS
    )

    pred1 = model_a.predict(sample_x)
    pred2 = model_a.predict(sample_x)
    assert np.allclose(pred1, pred2)

    prob1 = calibrator.transform(model_b.predict_proba(sample_x)[:, 1])
    prob2 = calibrator.transform(model_b.predict_proba(sample_x)[:, 1])
    assert np.allclose(prob1, prob2)
