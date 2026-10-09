# PaceIQ: Implementation Plan

Version: 1.0
Target: one working day (about 10 focused hours)
Related: `PRD.md`, `TECH_SPEC.md`, `IMPLEMENTATION_RULES.md`

---

## 1. Timeline

| Time | Milestone | Deliverables | Done when |
|---|---|---|---|
| 0:00–0:45 | Setup and API exploration | Repo scaffolded; Python venv; Vite app created with `styles/tokens.css` from `design.md` §14.1; self-hosted fonts in place; manual calls to `/sessions`, `/laps`, `/stints`, `/starting_grid`, `/session_result` | One sample JSON saved per endpoint, with notes on surprises |
| 0:45–1:45 | Ingestion | `openf1_client.py` with throttling, retries, cache; `ingest.py` for 2024 and 2025 race, qualifying, and practice sessions | `make ingest` completes; rerun makes no network calls |
| 1:45–2:45 | Transform and database | `transform.py`; SQLite schema from `SCHEMA.md`; row-count and null checks | Tables populated; check script prints counts and null rates |
| 2:45–4:15 | Feature engineering | `features.py`: qualifying, practice pace, degradation, rolling form, relative encodings; leakage test green | Feature table written; leakage test passes |
| 4:15–5:15 | Model and evaluation | `train.py`, `evaluate.py`; LightGBM and baselines; SHAP; calibration | `metrics_v1.json` shows model against baselines |
| 5:15–6:00 | Backend API | Routes for races, laps, stints, explain, health; Pydantic schemas; predictions written during pipeline | Read endpoints return data; `/docs` loads |
| 6:00–7:00 | Frontend core | Races, Race Detail, Driver Explainer wired to API | Browse 2025 races; see predictions and actuals |
| 7:00–8:00 | Replay and Game | Replay (lap chart, stint timeline); Game (submit, score, leaderboard, share card) | Pick submitted and scored end to end |
| 8:00–8:30 | Buffer and stretch decision | Fix blockers; decide on live-timing stretch | Decision recorded in README |
| 8:30–9:30 | Polish and tests | Empty and error states; backend tests; frontend component tests or manual checklist | `pytest` passes; manual checklist complete |
| 9:30–10:00 | Docs and release | README results table, screenshots, known issues, disclaimer; optional deploy | Clean clone runs with documented commands |

Hour 9 is the feature freeze (see `IMPLEMENTATION_RULES.md` rule 61).

## 2. Definition of done

### 2.1 MVP
- A new developer can clone the repo, run the documented commands, and see the app working.
- The metrics table in the README reports model results next to both baselines on the 2025 test split.
- Every page has loading, empty, and error states.
- The leakage test and at least one API test pass.
- A user can submit a pick for a race and see it scored once results exist.
- OpenF1 credit and the unofficial disclaimer are visible.

### 2.2 Stretch (only after MVP)
- Live Timing Tower (position and interval polling during a live session).
- Lap-by-lap win probability.
- Share card PNG export.
- Pit strategy simulator.

## 3. Cut list

If behind schedule, cut in this order, least valuable first:

1. Share card PNG export (keep copy-link).
2. SHAP chart on Driver Explainer (show global feature importance instead).
3. Stint timeline on Replay (keep lap chart).
4. Deployment step.
5. Global leaderboard (keep per-race leaderboard).

Never cut:
- The leakage test.
- The time-ordered split.
- The baseline comparison.
- The disclaimer and attribution.

## 4. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Rate limiting slows ingestion | Medium | Medium | Cache first; throttle below documented limit; run ingest once in background; consider authenticated access if needed |
| Some sessions lack endpoints | High | Medium | Train only on complete race sessions; log exclusions; optional practice features with missing flags |
| Response shapes differ from expectations | Medium | High | Hour-zero samples saved; fail-loud schema checks |
| Leakage inflates accuracy | Medium | High | Leakage test; time-ordered split; pre-race rule |
| Model only slightly beats grid baseline | Medium | Low | Report honestly; use ablations as analysis |
| Scope creep into live features | High | High | Stretch gated behind hour-8 checkpoint |
| Frontend polish consumes the day | High | Medium | Fixed component list; freeze at hour 9 |
| Retirement handling is inconsistent | Medium | Low | Decide rule at hour 2; document in TECH_SPEC §6.2 |

## 5. Testing plan

### 5.1 Backend automated tests

| File | Covers |
|---|---|
| `tests/test_features.py` | Leakage (no target-race rows used); clean-lap filter; relative encodings; missing-data flags |
| `tests/test_client.py` | Throttling; 429 backoff; cache hit makes no HTTP call (mocked httpx) |
| `tests/test_transform.py` | Column mapping and type coercion on fixture data |
| `tests/test_api.py` | Route shapes; invalid picks return 422; duplicate returns 409; closed session returns 403 |
| `tests/test_scoring.py` | Known picks and results produce expected points (including ties and DNFs) |
| `tests/test_predictor.py` | Same input gives same output for the loaded model |

All backend tests run offline against fixtures in `backend/tests/fixtures/`.

### 5.2 Frontend tests
- Vitest component tests for `PositionTable` and `ShareCard` with sample fixtures.
- Rendering test for each empty and error state.

### 5.3 Manual checklist

- [ ] Races page loads for 2024 and 2025; season switch works.
- [ ] Race Detail shows predicted order; completed races show actuals and deltas.
- [ ] Driver Explainer shows contributions and a summary sentence.
- [ ] Replay lap chart updates when drivers are added or removed.
- [ ] Stint timeline colours match the compound legend.
- [ ] Username can be set, changed, and persists after reload.
- [ ] Pick form blocks duplicate drivers and disables submit until complete.
- [ ] Submitted pick shows as read-only with its timestamp.
- [ ] Closed session shows the closed message and no form.
- [ ] Scored pick shows points on the Game page.
- [ ] Leaderboard highlights the current user.
- [ ] Share card copy-link works.
- [ ] Backend offline: cached views still render, notice appears.
- [ ] Keyboard-only navigation reaches every control.
- [ ] Footer shows OpenF1 credit and disclaimer on every page.
- [ ] No raw hex values in components; all colours come from tokens (`design.md` §14.1).
- [ ] Tyre compounds and deltas show letters or signs, not colour alone.
- [ ] Reduced-motion setting removes count-ups, shimmer, and pulses.
- [ ] Share card exports with the intended fonts (not fallbacks) and includes the footer disclaimer.
- [ ] No official F1, team, sponsor, or driver branding or likeness appears (`design.md` §11).

### 5.4 Model validation
- Run `make evaluate` from a clean cache and compare to `metrics_v1.json`. Results should match within a small tolerance.
- Check the calibration plot is saved in `models/`.
- Confirm the test split was not used during tuning (review the training log).

## 6. Daily rhythm

- Start each milestone by reading its row in the timeline and its acceptance check.
- End each milestone with a commit using the message format in `IMPLEMENTATION_RULES.md` rule 52.
- At each checkpoint (hours 4, 6, 8), decide whether to keep, cut, or defer. Record the decision in a short `docs/worklog.md` entry.

## 7. Deliverables checklist

- [ ] Repository with backend, frontend, pipeline, tests, and docs
- [ ] Cached raw OpenF1 data, or documented regeneration steps
- [ ] Trained model artefact and metrics file
- [ ] Working API with OpenAPI docs at `/docs`
- [ ] Working web app with the five MVP screens, styled per `design.md`
- [ ] Share card component and template in place (`design.md` §8)
- [ ] README with setup, architecture summary, metrics table, screenshots, known issues, and disclaimer
- [ ] Short demo GIF or video of the pick-to-score flow
- [ ] Optional: deployed frontend and backend URLs

## 8. Post-day next steps

- Add new seasons as OpenF1 data is available and retrain as `paceiq_v2`.
- Run a feature ablation study and write up the results.
- Implement the live timing stretch once authenticated access is set up.
- Revisit the scoring rule after a few race weekends of user data.
- Resolve the open design decisions in `design.md` §15 (display font, driver imagery, share card language, wordmark) and update the tokens file to match.
- Replace placeholder driver cutouts with licensed imagery once rights are confirmed.
