"""
PaceIQ Configuration.
Contains settings, endpoints, circuit classifications, and model hyperparameters.
"""

import os
import shutil
from pathlib import Path

# Project Roots
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
LOGS_DIR = DATA_DIR / "logs"
MODELS_DIR = BACKEND_DIR / "models"

# Ensure directories exist (safely catch read-only serverless filesystems)
for d in (RAW_DATA_DIR, LOGS_DIR, MODELS_DIR):
    try:
        d.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass

# Database: In serverless environments (e.g. Vercel / AWS Lambda), the code directory is
# read-only. We copy paceiq.db to /tmp so SQLite can open and query it with shared locks.
potential_db_paths = [
    Path(os.getenv("PACEIQ_DB_PATH", "")) if os.getenv("PACEIQ_DB_PATH") else None,
    DATA_DIR / "paceiq.db",
    PROJECT_ROOT / "backend" / "data" / "paceiq.db",
    Path("/var/task/backend/data/paceiq.db"),
]

SOURCE_DB_PATH = None
for p in potential_db_paths:
    if p and p.exists():
        SOURCE_DB_PATH = p
        break

if SOURCE_DB_PATH is None:
    SOURCE_DB_PATH = DATA_DIR / "paceiq.db"

if (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")) and SOURCE_DB_PATH.exists():
    TMP_DB_PATH = Path("/tmp/paceiq.db")
    if not TMP_DB_PATH.exists():
        try:
            shutil.copy2(SOURCE_DB_PATH, TMP_DB_PATH)
        except Exception:
            pass
    DB_PATH = TMP_DB_PATH if TMP_DB_PATH.exists() else SOURCE_DB_PATH
else:
    DB_PATH = SOURCE_DB_PATH

_RAW_DB_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
if _RAW_DB_URL.startswith("postgres://"):
    _RAW_DB_URL = _RAW_DB_URL.replace("postgres://", "postgresql://", 1)
DATABASE_URL = _RAW_DB_URL

# OpenF1 Settings
OPENF1_BASE_URL = "https://api.openf1.org/v1"
OPENF1_USERNAME = os.getenv("OPENF1_USERNAME")
OPENF1_PASSWORD = os.getenv("OPENF1_PASSWORD")

# Rate Limiting (Token Bucket / Throttling)
# OpenF1 unauthenticated limit is ~30 req per 10s window. 1.2 req/s avoids hitting bucket limit.
OPENF1_REQUESTS_PER_SECOND = 1.2
OPENF1_TIMEOUT_SECONDS = 15.0
OPENF1_MAX_RETRIES = 5

# Target Seasons
SEASONS = [2024, 2025]

# Circuit Types (TECH_SPEC §6.1, rule 23)
CIRCUIT_TYPE_LOOKUP = {
    "Sakhir": "mixed",
    "Jeddah": "street",
    "Melbourne": "street",
    "Suzuka": "high-downforce",
    "Shanghai": "mixed",
    "Miami": "street",
    "Imola": "high-downforce",
    "Monaco": "street",
    "Montreal": "low-downforce",
    "Barcelona": "high-downforce",
    "Spielberg": "low-downforce",
    "Silverstone": "high-downforce",
    "Budapest": "high-downforce",
    "Spa-Francorchamps": "low-downforce",
    "Zandvoort": "high-downforce",
    "Monza": "low-downforce",
    "Baku": "street",
    "Singapore": "street",
    "Austin": "high-downforce",
    "Mexico City": "high-downforce",
    "Interlagos": "mixed",
    "Las Vegas": "street",
    "Lusail": "high-downforce",
    "Yas Marina": "mixed",
}

# Model Hyperparameters (TECH_SPEC §7, rule 24)
MODEL_HYPERPARAMS = {
    "learning_rate": 0.05,
    "n_estimators": 300,
    "num_leaves": 15,
    "min_child_samples": 10,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
}
