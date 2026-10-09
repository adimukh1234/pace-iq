# PaceIQ: F1 Race Outcome Predictor and Strategy Lab

PaceIQ predicts Formula 1 race results from pre-race data, explains the factors behind each prediction, and lets fans test their own picks against the model and the real result.

Data comes from the [OpenF1 API](https://openf1.org). PaceIQ is an unofficial fan project and is not affiliated with Formula 1, the FIA, or any team.

## Documents

| File | Purpose |
|---|---|
| `README.md` | Overview and setup (this file) |
| `PRD.md` | Product requirements: problem, users, scope, success criteria |
| `TECH_SPEC.md` | Architecture, stack, repository layout, API specification |
| `APP_FLOW.md` | Screens, navigation, and user flows |
| `SCHEMA.md` | Database tables, keys, and relationships |
| `IMPLEMENTATION_RULES.md` | Working rules for the build (leakage, caching, validation) |
| `IMPLEMENTATION_PLAN.md` | Hour-by-hour timeline, testing plan, cut list, deliverables |
| `design.md` | Visual system: colour, type, components, share cards, motion, accessibility |

Open design decisions (display font, driver imagery, share card language) are listed in `design.md` §15.

## Quick start (target state)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
make ingest        # fetch and cache OpenF1 data for 2024-2025 (idempotent)
make train         # build features, train model, write metrics
make serve         # start FastAPI on :8000

# Frontend
cd frontend
npm install
npm run dev        # start Vite on :5173
```

## Environment variables

| Name | Required | Description |
|---|---|---|
| `OPENF1_USERNAME` | No | OpenF1 account, only needed for authenticated access (stretch: live data) |
| `OPENF1_PASSWORD` | No | Matching password, read from environment only, never committed |
| `PACEIQ_DB_PATH` | No | Path to SQLite file, defaults to `backend/data/paceiq.db` |
| `VITE_API_BASE_URL` | No | Backend URL for the frontend, defaults to `http://localhost:8000/api` |

## Model results

To be filled in after training. Compare the model against the grid-position and team-form baselines on the 2025 test split.

| Model | Spearman (mean per race) | Mean abs. position error | Top-3 set accuracy | Podium Brier score |
|---|---|---|---|---|
| Grid baseline | TBD | TBD | TBD | n/a |
| Team form baseline | TBD | TBD | TBD | n/a |
| PaceIQ v1 (LightGBM) | TBD | TBD | TBD | TBD |

## Known issues

Listed here at the end of the build. Empty at project start.

## Acknowledgements

- [OpenF1](https://openf1.org) for free, public Formula 1 timing and telemetry data.
