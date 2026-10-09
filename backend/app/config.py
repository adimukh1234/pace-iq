"""
PaceIQ Configuration.
Contains settings, endpoints, circuit classifications, and model hyperparameters.
"""

import os
from pathlib import Path

# Project Roots
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
LOGS_DIR = DATA_DIR / "logs"
MODELS_DIR = BACKEND_DIR / "models"

# Ensure directories exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Database
DB_PATH = Path(os.getenv("PACEIQ_DB_PATH", str(DATA_DIR / "paceiq.db")))
DATABASE_URL = f"sqlite:///{DB_PATH}"

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
