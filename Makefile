# PaceIQ Makefile

PYTHON = .\backend\.venv\Scripts\python
PYTEST = .\backend\.venv\Scripts\pytest
UVICORN = .\backend\.venv\Scripts\uvicorn

.PHONY: help install ingest transform features train evaluate serve test lint

help:
	@echo "PaceIQ Commands:"
	@echo "  make install    - Install backend dependencies"
	@echo "  make ingest     - Ingest OpenF1 data (cached, idempotent)"
	@echo "  make transform  - Transform raw data into tidy SQLite tables"
	@echo "  make features   - Build leakage-safe feature tables"
	@echo "  make train      - Train LightGBM model and write metrics"
	@echo "  make evaluate   - Evaluate model against grid and team baselines"
	@echo "  make serve      - Start FastAPI backend server"
	@echo "  make test       - Run test suite"
	@echo "  make lint       - Run ruff linter"

install:
	pip install -r backend/requirements.txt

ingest:
	$(PYTHON) backend/pipeline/ingest.py

transform:
	$(PYTHON) backend/pipeline/transform.py

features:
	$(PYTHON) backend/pipeline/features.py

train:
	$(PYTHON) backend/pipeline/train.py

evaluate:
	$(PYTHON) backend/pipeline/evaluate.py

serve:
	$(UVICORN) backend.app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	$(PYTEST) backend/tests

lint:
	.\backend\.venv\Scripts\ruff check backend/
	.\backend\.venv\Scripts\ruff format --check backend/
