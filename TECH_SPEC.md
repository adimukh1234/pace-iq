# PaceIQ: Technical Specification

Version: 1.0
Related: `PRD.md`, `SCHEMA.md`, `APP_FLOW.md`

---

## 1. Architecture

```
OpenF1 API ──► ingest.py (throttled, cached) ──► data/raw/*.json
                                                    │
                                                    ▼
                                          transform.py (tidy tables)
                                                    │
                                                    ▼
                                          features.py (leakage-safe)
                                                    │
                              ┌─────────────────────┴───────────────────┐
                              ▼                                         ▼
                    train.py / evaluate.py                    SQLite: paceiq.db
                    (LightGBM, SHAP)                                    │
                              │                                         │
                              ▼                                         ▼
                    models/paceiq_v1.joblib ───► FastAPI backend (REST, JSON)
                                                           │
                                                           ▼
                                  React + Vite + TypeScript frontend (Recharts)
```

Two processes at runtime: the FastAPI server and the Vite dev server. Ingestion, transformation, feature building, and training are offline batch steps run from the command line.

## 2. Stack

| Layer | Choice | Reason |
|---|---|---|
| Language (backend) | Python 3.11 | Data and ML ecosystem |
| Web framework | FastAPI + Uvicorn | Typed routes, automatic OpenAPI docs |
| Data processing | pandas, NumPy | Standard tabular tooling |
| Model | LightGBM | Strong on small tabular data, fast to train |
| Explainability | SHAP (TreeExplainer) | Per-prediction feature contributions |
| Validation | Pydantic v2 | Request and response schemas |
| Persistence | SQLite via SQLAlchemy | Single file, zero setup |
| HTTP client | httpx | Sync client with timeouts and retries |
| Language (frontend) | TypeScript | Typed API contracts |
| UI | React 18 + Vite | Fast dev loop |
| Routing | React Router | Standard SPA routing |
| Charts | Recharts | Lap charts, bars, timelines |
| Styling | CSS custom properties (design tokens) with CSS modules | Tokens defined in `design.md` §14.1; components reference tokens only |
| Tests | pytest, Vitest | Backend and frontend coverage |
| Lint and format | Ruff (Python), ESLint and Prettier (TypeScript) | Consistency |

## 3. Repository layout

```
paceiq/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── races.py
│   │   │   ├── predictions.py
│   │   │   ├── drivers.py
│   │   │   └── game.py
│   │   └── services/
│   │       └── predictor.py
│   ├── pipeline/
│   │   ├── openf1_client.py
│   │   ├── ingest.py
│   │   ├── transform.py
│   │   ├── features.py
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── tests/
│   ├── data/            # raw cache and SQLite file (gitignored)
│   ├── models/          # trained artefacts and metrics
│   ├── requirements.txt
│   └── Makefile
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── assets/
│   │   │   ├── tracks/          # simplified circuit SVG paths
│   │   │   └── placeholders/    # neutral driver cutouts until rights are cleared
│   │   ├── pages/
│   │   ├── components/          # the 12 components in design.md §7
│   │   ├── styles/
│   │   │   └── tokens.css       # design tokens, design.md §14.1
│   │   └── types.ts
│   └── package.json
├── docs/
└── README.md
```

## 4. OpenF1 integration

### 4.1 Base facts
- Base URL: `https://api.openf1.org/v1`
- Coverage: 2023 season onward. PaceIQ uses 2024 and 2025.
- Unauthenticated use is free. Public documentation reports a limit of about 30 requests per 10 seconds per IP. Confirm this in the current docs before finalising the throttle setting, and keep it in config rather than hard-coded.
- Authenticated use: OAuth2 token from `https://api.openf1.org/token`. Removes rate limits and enables MQTT and WebSocket streaming. Required only for the live stretch goal.
- Telemetry is generally available after a session ends. The MVP does not depend on live telemetry.

### 4.2 Endpoints used

| Endpoint | Purpose | Key filters |
|---|---|---|
| `/sessions` | Session keys per meeting and type | `year`, `session_name` |
| `/meetings` | Grand Prix metadata | `year` |
| `/drivers` | Driver identity and team per session | `session_key` |
| `/laps` | Lap times, sectors, pit-out flags | `session_key`, `driver_number` |
| `/stints` | Tyre compound and stint ranges | `session_key`, `driver_number` |
| `/pit` | Pit stop data | `session_key` |
| `/position` | Position changes over time | `session_key`, `driver_number` |
| `/intervals` | Gaps to leader and car ahead | `session_key` |
| `/weather` | Track and air temperature, rainfall | `session_key` |
| `/race_control` | Flags, safety car, incidents | `session_key` |
| `/starting_grid` | Grid positions | `session_key` |
| `/session_result` | Final classification | `session_key` |

### 4.3 Client behaviour
- Every request has a connect and read timeout (10 s each).
- Requests are spaced to respect the configured rate limit. A token bucket with a conservative default is used.
- HTTP 429 triggers exponential backoff with jitter, up to 5 attempts, then the session is marked failed and skipped.
- HTTP 5xx is retried twice, then logged.
- Every successful response is written to `data/raw/{endpoint}/{session_key}.json` before any parsing.
- If the cache file exists, the client does not call the network unless `--refresh` is passed.

## 5. Data pipeline

| Stage | Input | Output | Notes |
|---|---|---|---|
| Ingest | OpenF1 endpoints | Raw JSON cache | Idempotent, throttled |
| Transform | Raw JSON | Tidy tables in SQLite | Type coercion, column renames, dedupe |
| Features | Tidy tables | `features` table | Leakage-safe, versioned schema |
| Train | `features` table | `models/paceiq_v1.joblib`, `metrics_v1.json` | Time-ordered split |
| Predict | Model and features | `predictions` table | Run once per session after features exist |

Make targets:
- `make ingest` runs ingest then transform.
- `make features` builds the feature table.
- `make train` trains and writes metrics and artefacts.
- `make evaluate` prints the comparison table.
- `make serve` starts the API.

## 6. Feature specification

Feature schema version: `v1`.

### 6.1 Pre-race features

| Name | Source | Definition |
|---|---|---|
| `grid_position` | starting_grid | Starting position in the race |
| `quali_gap_to_pole_s` | laps (qualifying) | Best qualifying lap minus pole best, seconds |
| `quali_gap_to_pole_pct` | laps (qualifying) | Same gap as a percentage of pole lap |
| `quali_gap_to_teammate_s` | laps (qualifying) | Best qualifying lap minus teammate best |
| `practice_pace_index` | laps (practice) | Driver median clean lap divided by session fastest median |
| `longrun_pace_s` | laps (practice) | Median of clean laps in stints of 5 or more laps, excluding safety car and in or out laps |
| `longrun_pace_rel_s` | derived | Long-run pace minus field median |
| `deg_slope_s_per_lap` | laps and stints (practice) | Slope of lap time versus tyre age for the primary compound |
| `driver_form_5` | results (prior races) | Driver's mean finish over the last 5 prior races |
| `team_form_5` | results (prior races) | Team's mean finish over the last 5 prior races |
| `driver_circuit_avg` | results (prior races) | Driver's mean finish at this circuit, or neutral fill |
| `team_circuit_avg` | results (prior races) | Team's mean finish at this circuit, or neutral fill |
| `track_temp_c` | weather (practice) | Mean track temperature in the final practice session |
| `rain_flag` | weather (practice) | 1 if rainfall was recorded during practice, else 0 |
| `circuit_type` | lookup table | Categorical: street, high-downforce, low-downforce, mixed |

### 6.2 Derived and missing-data rules
- Every pace and gap feature has a `_rel` or field-relative counterpart where useful.
- Missing numeric features are filled with the field median for that race, and a `<name>_missing` flag is set to 1.
- Categorical features use a fixed category list; unknown values map to `mixed`.
- Retirements and non-classified finishes: the target is the last classified position plus the number of unclassified drivers, stored in `target_position`, with `dnf` retained as a separate flag.

### 6.3 Targets
- `target_position`: integer finishing position, 1 to 20.
- `target_podium`: 1 if `target_position` ≤ 3, else 0.

## 7. Model specification

| Item | Value |
|---|---|
| Model A | LightGBM regressor on `target_position` |
| Model B | LightGBM binary classifier on `target_podium` |
| Starting hyperparameters | learning_rate 0.05, n_estimators 300, num_leaves 15, min_child_samples 10, subsample 0.8, colsample_bytree 0.8, random_state 42 |
| Training data | 2024 race sessions |
| Validation data | First half of 2025 race sessions |
| Test data | Second half of 2025 race sessions (touched once, for final reporting) |
| Ranking output | Predicted position from Model A, ties broken by Model B probability |
| Probability output | Model B, calibrated with isotonic regression on validation data |
| Explainability | SHAP TreeExplainer on Model A; top 5 positive and top 3 negative per driver stored |

### 7.1 Evaluation
- Baselines: grid order; rolling team form order.
- Metrics per race, averaged over the test set:
  - Spearman rank correlation with actual finishing order.
  - Mean absolute position error.
  - Top-3 set accuracy.
- Podium probability: Brier score and reliability plot saved to `models/`.

### 7.2 Artefacts
- `models/paceiq_v1.joblib`: model A, model B, calibrator, feature list.
- `models/metrics_v1.json`: metrics, baselines, data version, training date.
- `models/feature_schema_v1.json`: ordered feature names and types.

## 8. API specification

Base path: `/api`. JSON in and out. OpenAPI available at `/docs`.

### 8.1 Endpoints

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | Service and model status | 200 | — |
| GET | `/api/seasons` | Seasons with race counts | 200 | — |
| GET | `/api/races?year={year}` | Races for a season with status | 200 | 400 invalid year |
| GET | `/api/races/{session_key}` | Race detail, predictions, actuals if complete | 200 | 404 unknown session |
| GET | `/api/races/{session_key}/laps?drivers=1,16,44` | Lap times for selected drivers | 200 | 400 bad driver list, 404 |
| GET | `/api/races/{session_key}/stints` | Stint ranges and compounds | 200 | 404 |
| GET | `/api/races/{session_key}/drivers/{driver_number}/explain` | SHAP explanation | 200 | 404 no prediction |
| POST | `/api/game/predictions` | Submit top-3 pick | 201 | 409 duplicate, 403 session started, 422 invalid picks |
| GET | `/api/game/leaderboard?session_key={key}` | Scores for a session, or overall if omitted | 200 | 404 |
| GET | `/api/game/cards/{user_prediction_id}` | Data for share card | 200 | 404 |

### 8.2 Response shapes (abbreviated)

```json
// GET /api/races/{session_key}
{
  "session_key": 9158,
  "meeting_name": "Example Grand Prix",
  "year": 2025,
  "status": "completed",
  "model_version": "paceiq_v1",
  "predicted": [
    { "driver_number": 1, "name": "Driver A", "team": "Team X", "predicted_position": 1, "podium_probability": 0.62 }
  ],
  "actual": [
    { "driver_number": 1, "name": "Driver A", "position": 2, "dnf": false }
  ]
}
```

```json
// GET /api/races/{session_key}/drivers/{driver_number}/explain
{
  "driver_number": 1,
  "base_value": 10.4,
  "prediction": 2.1,
  "positive": [{ "feature": "grid_position", "value": 1, "contribution": -4.2 }],
  "negative": [{ "feature": "deg_slope_s_per_lap", "value": 0.09, "contribution": 1.3 }],
  "summary": "Starting P1 and strong long-run pace drive the forecast; higher tyre degradation pulls it back."
}
```

### 8.3 Validation rules
- `year` must be between 2023 and the current year.
- Driver lists contain 1 to 10 distinct integers.
- Game picks: three distinct driver numbers, each present in that session's driver list.
- A session is closed for picks once its `date_start` is in the past.
- One prediction per `username` per `session_key`.
- `username`: 3 to 24 characters, letters, numbers, and underscores only.

### 8.4 Error format

```json
{ "error": { "code": "SESSION_CLOSED", "message": "Predictions for this session are closed." } }
```

## 9. Predictor service

- Loads `paceiq_v1.joblib` once at startup and keeps it in memory.
- Predictions are generated during the pipeline, not per request. The `predictions` table is the serving source.
- Each prediction row stores `model_version`, so results for past races are never silently recomputed with a newer model.
- SHAP values are computed during the pipeline and stored as JSON in the `predictions` table to keep explain requests fast.

## 10. Frontend specification

- Built with Vite, React 18, TypeScript.
- `api/client.ts` wraps `fetch`, returns typed results, and maps error responses to a common error type.
- Data fetching uses React Query or simple hooks with loading, empty, and error states on every view.
- Team colours come from the `drivers` table.
- Username for the game is stored in `localStorage` with a visible way to change it. This is the only browser storage used.
- Charts are responsive and have text summaries for screen readers.
- Visual system follows `design.md`: dark-first, tokens only in components (no raw hex), fonts self-hosted in `frontend/public/fonts/`.
- Motion respects `prefers-reduced-motion` using the token overrides in `design.md` §14.1.
- Share cards are rendered client-side from a fixed-size component and exported as PNG (`design.md` §8 and §14.3). Fonts must finish loading before export.

## 11. Non-functional requirements

| Category | Requirement | How it is met |
|---|---|---|
| Performance | Read endpoints under 300 ms locally | Pre-computed predictions and SHAP; indexed SQLite queries |
| Reproducibility | Clean clone rebuilds everything | Pinned requirements and lockfile; Makefile targets |
| Resilience | Works offline with cache | Cache-first ingestion; UI notice when OpenF1 is unavailable |
| Security | No secrets in repo; validated input | Env vars for credentials; Pydantic validation |
| Observability | Logs for ingestion and predictions | Structured logs with session key and endpoint |
| Licensing | Attribution and disclaimer | Footer and README |

## 12. Deployment (optional)

- Backend: Render or Railway, single container, Uvicorn, SQLite file mounted or bundled, model artefact bundled.
- Frontend: Vercel or Netlify, static build, `VITE_API_BASE_URL` set to the backend URL.
- CORS: allow the frontend origin only.
- No cron jobs in v1. Ingestion is run manually after each race weekend.
