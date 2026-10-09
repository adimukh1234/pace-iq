# PaceIQ: F1 Race Outcome Predictor and Strategy Lab

PaceIQ predicts Formula 1 race results from pre-race data, explains the factors behind each prediction with tree attributions, and lets fans test their own picks against the model and the real result in the community Podium Challenge.

Data comes from the [OpenF1 API](https://openf1.org). PaceIQ is an unofficial fan project and is not affiliated with Formula 1, the FIA, or any team.

## Documents

| File | Purpose |
|---|---|
| `README.md` | Overview and setup (this file) |
| `PRD.md` | Product requirements: problem, users, scope, success criteria |
| `TECH_SPEC.md` | Architecture, stack, repository layout, API specification |
| `APP_FLOW.md` | Screens, navigation, and user flows |
| `SCHEMA.md` | Database tables, keys, and relationships (13 entities) |
| `IMPLEMENTATION_RULES.md` | Working rules for the build (leakage, caching, validation) |
| `IMPLEMENTATION_PLAN.md` | Hour-by-hour timeline, testing plan, cut list, deliverables |
| `design.md` | Visual system: colour, type, components, share cards, motion, accessibility |

## Architecture & System Overview

```
[ OpenF1 Free Tier API ]
          │ (Rate limiter bucket: 1.2 req/s, backoff on 429)
          ▼
[ data/raw/ Cache ] ────► [ SQLite: paceiq.db (13 tables) ]
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
[ Pre-Race Feature Pipeline ]                             [ Fast API Engine ]
(Strict Anti-Leakage: Quali, Practice, Prior Form)       - /api/health
    │                                                     - /api/seasons
    ▼                                                     - /api/races & /races/{id}
[ LightGBM Model A & B ]                                  - /api/races/{id}/drivers/{d}/explain
(Isotonic Calibration + Tree Attribution)                 - /api/races/{id}/laps & /stints
    │                                                     - /api/game/predictions, /leaderboard
    └───────────────────────────────┬───────────────────────────────┘
                                    ▼
                     [ React 19 + TypeScript Frontend ]
                     (Dark-first telemetry theme, Michroma/Saira/Inter fonts,
                      Accessible tyre badges, Recharts, Interactive Podium Game)
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# Run full test suite & linter:
pytest tests -v
ruff check .

# Start FastAPI server on port 8000:
python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Run TypeScript build check:
npm run build

# Start Vite dev server on port 5173:
npm run dev
```

Visit `http://localhost:5173` to explore the telemetry dashboard.

## Environment Variables

| Name | Required | Description |
|---|---|---|
| `OPENF1_USERNAME` | No | OpenF1 account (optional) |
| `OPENF1_PASSWORD` | No | Matching password (optional) |
| `PACEIQ_DB_PATH` | No | Path to SQLite file, defaults to `backend/data/paceiq.db` |
| `VITE_API_BASE_URL` | No | Backend URL for frontend, defaults to `http://localhost:8000/api` |

## Model Results

Evaluated on the out-of-sample holdout test race using pre-race features:

| Model | Spearman $\rho$ (mean per race) | Mean abs. position error (MAE) | Top-3 set accuracy | Podium Brier score |
|---|---|---|---|---|
| Grid baseline | 0.821 | 3.23 | 66.7% | n/a |
| Team form baseline | 0.353 | 5.41 | 33.3% | n/a |
| **PaceIQ v1 (LightGBM)** | **0.817** | **3.32** | **100.0%** | **0.095** |

*Evaluated metrics artifact stored at `backend/models/metrics_v1.json`.*

## Key Design & Engineering Decisions

1. **Anti-Leakage Safeguard**: Features for each driver (`grid_position`, `mean_clean_lap_time`, `teammate_lap_delta`, `form_mean_finish_prior`) strictly query sessions occurring prior to race start. Target race laps and results are never exposed during feature creation or inference (verified by `test_no_target_race_leakage`).
2. **OpenF1 Rate Limiting**: Built a token-bucket client with a sliding window (`1.2 req/sec`) and exponential backoff on HTTP 429 (`base: 10s`) ensuring zero failures against free-tier rate limits.
3. **Additive Tree Attribution Explainer**: Fast native tree attribution explainer calculates driver position deltas relative to baseline in <1ms without requiring external JIT compilation.
4. **Accessible Visual System**: Design tokens defined in `styles/tokens.css` with zero raw hex in UI components. Tyre compound chips include bold letter badges (`S`, `M`, `H`, `I`, `W`) and chart components provide accessible table view alternatives.
5. **Interactive Podium Challenge**: Enforces 3 distinct driver picks per submission, prevents duplicate submissions per user per race, and locks completed sessions.
