# PaceIQ: Implementation Rules

Version: 1.0
Related: `TECH_SPEC.md`, `SCHEMA.md`, `IMPLEMENTATION_PLAN.md`

These rules govern how the code is written and how the pipeline behaves. Where a rule conflicts with speed, the rule wins unless it is explicitly waived in the README under "Known issues".

---

## 1. Data handling

1. **Cache before parse, parse before model.** Feature and training code never call the OpenF1 API. Only `ingest.py` does.
2. **Store raw responses as received.** Do not modify JSON files in `data/raw/`. Re-derive everything from them.
3. **Fail loudly on schema drift.** If a required field is missing from a response, raise `SchemaError` with the endpoint name, session key, and missing field. Do not fill it with `NaN` silently.
4. **Empty is valid.** An empty array for an endpoint and session is recorded as "no data" in ingest logs and does not stop the run.
5. **Idempotent ingestion.** Running `make ingest` twice produces identical tables. Use upserts keyed on the primary keys in `SCHEMA.md`.
6. **Session identity is `session_key`.** Never identify sessions by date, name, or meeting alone.
7. **Driver identity is `(session_key, driver_number)`.** A driver number can be reused across seasons by different people; never join across sessions on driver number alone.

## 2. Leakage and modelling

8. **Pre-race features only.** A feature for a race may use data from:
   - the same meeting's qualifying and practice sessions, and
   - any race or session whose `date_start` is earlier than the target race.

   It may never use data from the target race itself, including its laps, stints, pit stops, positions, intervals, race control, weather, or results.
9. **Leakage test is mandatory.** `tests/test_features.py::test_no_target_race_leakage` must pass before any model is trained.
10. **Time-ordered splits only.** Train on 2024, validate on the first half of 2025, test on the second half of 2025. Never shuffle races across years or within a season for the split.
11. **Test set is touched once.** Final metrics are computed once, after all modelling decisions are fixed. Tuning uses validation data only.
12. **Baselines are reported every time.** Any model result is shown next to the grid and team-form baselines.
13. **Report honestly.** If the model does not beat the grid baseline on a metric, the README says so. Do not change the metric to make the model look better.
14. **Fixed random seeds.** `random_state = 42` for all models, splits that use randomness, and SHAP sampling.
15. **Version everything.** Every prediction stores `model_version`. Every feature row stores `feature_schema_version`. Changing a feature definition requires a new version.

## 3. Feature engineering

16. **Clean laps definition.** A lap is clean if all of these hold:
    - not an in-lap or out-lap (pit-in or pit-out),
    - `lap_duration` is present,
    - the lap does not overlap a safety car, virtual safety car, or red flag period from `race_control`.
17. **Long-run pace.** The median of clean laps in stints of at least 5 clean laps. Stints shorter than 5 laps are excluded from this feature, not imputed.
18. **Tyre degradation slope.** Ordinary least squares of clean lap time against tyre age, per driver and primary compound, from practice sessions only. Require at least 5 points; otherwise missing.
19. **Field-relative features.** Each pace or gap feature has a version relative to the field median for that race (`_rel` suffix where applicable).
20. **Rolling form.** Uses the last five prior race results, excluding the target race and any race with a null position. Qualifying and sprint results are not used in form features.
21. **Missing data.** Numeric features are imputed with the field median for the race. A `*_missing` flag is recorded in `missing_flags`. Do not impute the target.
22. **Retirements.** Drivers who do not finish keep their `dnf = 1` flag. `target_position` for them is the classified finish count plus their rank among unclassified drivers, as described in `TECH_SPEC.md` §6.2. Document any change in the README.
23. **Categorical lists are fixed.** `circuit_type` values come from a hand-maintained lookup in `config.py`. Unknown circuits map to `mixed` and are logged.

## 4. Model and predictions

24. **Hyperparameters are config, not code.** Stored in `backend/app/config.py` as a single dictionary and copied into `metrics_v1.json` at training time.
25. **Calibration on validation only.** The isotonic calibrator for podium probability is fitted on the validation split, never on the test split.
26. **Predictions are batch-generated.** The API never runs the model on demand. Predictions are written during the pipeline and served from the `predictions` table.
27. **Explanations are precomputed.** SHAP values are stored with each prediction row as JSON. The explain endpoint reads them; it does not recompute.
28. **Upcoming races.** Predictions for an upcoming race are generated only after that race's qualifying and practice features exist. If they do not, the race shows "Predictions not yet available".

## 5. API

29. **Validate at the boundary.** All request bodies and query parameters use Pydantic models. Reject unknown fields on POST bodies.
30. **Consistent error shape.** Every error response is `{ "error": { "code": string, "message": string } }`. Codes are uppercase snake case, for example `SESSION_CLOSED`.
31. **No business logic in routes.** Routes validate, call a service, and shape the response. Scoring, feature lookup, and prediction retrieval live in `services/`.
32. **Status codes.** 200 for reads, 201 for created picks, 400 for malformed input, 403 for closed sessions, 404 for unknown resources, 409 for duplicates, 422 for validation failures.
33. **Time is UTC.** All API timestamps are ISO 8601 UTC with a `Z` suffix. The frontend converts to local time for display.

## 6. Game and scoring

34. **One pick per user per session.** Enforced by the unique constraint on `(username, session_key)`.
35. **Picks close at session start.** A pick is accepted only if the current UTC time is before the session's `date_start`.
36. **Scoring rule (v1).**
    - Exact position match for P1, P2, or P3: 3 points each.
    - Each pick that finishes in the actual top 3 but not in the exact position: 1 point.
    - Maximum per pick is 3 points; maximum total is 9 points.
    - Scoring is computed once after results are ingested and stored in `prediction_scores`. Re-scoring is allowed only by running a documented command.
37. **Usernames are not authenticated.** The game is a fun, low-stakes feature. Do not store anything sensitive against a username. Document this in the UI.
38. **Leaderboard ties** are broken by earlier pick submission time.

## 7. Frontend

39. **Typed contracts.** Every API response has a TypeScript type in `types.ts` that mirrors the Pydantic schema. Update both together.
40. **Every view has three states.** Loading, empty, and error. No view renders a blank area.
41. **No charts without a text equivalent.** Each chart has a visible summary line or table fallback.
42. **Team colours come from data.** Never hard-code team colours in components.
43. **Browser storage limited to username.** Only `localStorage` key `paceiq.username` is used. No tokens, no cached API responses.
44. **Keyboard operable.** All interactive controls reachable by Tab and operable with Enter or Space.
45. **Model disclaimer.** Every prediction view shows "Model estimate. Not a guarantee."

## 8. Code quality

46. **Python formatting and linting.** `ruff format` and `ruff check` must pass before commit.
47. **TypeScript strictness.** `"strict": true` in `tsconfig.json`. No `any` without a comment explaining why.
48. **Type hints on all public Python functions.** Return types included.
49. **No secrets in code or commits.** Credentials come from environment variables. A pre-commit check scans for common key patterns.
50. **Small, named functions.** A function longer than about 40 lines should be split.
51. **Comments explain why, not what.** Especially around leakage rules and scoring.
52. **One commit per milestone.** Message format: `area: short description`, for example `features: add long-run pace with clean-lap filter`.

## 9. Testing

53. **Minimum tests before MVP sign-off:**
    - Leakage test (features).
    - Clean-lap filter test with a synthetic lap set.
    - Ingestion cache test (no network call on cache hit).
    - API tests: picks validation, duplicate submission, closed session.
    - Scoring test with known picks and results.
54. **Tests run offline.** No test calls the real OpenF1 API. Use recorded fixtures in `tests/fixtures/`.
55. **Fixtures are small.** Each fixture is a trimmed real response, not a full session dump.

## 10. Operations

56. **Ingestion is manual.** Run after each race weekend. No scheduler in v1.
57. **Document every run.** `make ingest` writes a summary to `data/logs/ingest_{date}.txt` with session counts and failures.
58. **Backups.** Copy `paceiq.db` and `models/` before retraining. Retraining never overwrites a previous `model_version`; it writes a new version.
59. **Attribution.** The footer and README credit OpenF1. The disclaimer states the app is unofficial and not affiliated with Formula 1 or any team.

## 11. Scope discipline

60. **MVP first.** Stretch items start only after the MVP definition of done in `IMPLEMENTATION_PLAN.md` §6.1 is met.
61. **Freeze at hour 9.** After the freeze point, only bug fixes and documentation changes are allowed.
62. **Known issues are recorded, not hidden.** Anything waived from these rules is listed in the README with a reason.

## 12. Design system

63. **Tokens only.** Components reference CSS custom properties from `frontend/src/styles/tokens.css`. No raw hex, pixel font stacks, or radius values inside component files. Add a token first if one is missing.
64. **Status is never colour alone.** Tyre compounds carry their letter (S, M, H, I, W). Deltas carry a sign. Statuses carry text.
65. **Decorative elements are hidden from assistive tech.** Ghost numbers, halftone, sunburst, and sticker shapes use `aria-hidden="true"`.
66. **Reduced motion is honoured.** Any new animation must read the reduced-motion token overrides; do not hard-code durations.
67. **No official branding or likeness.** Do not use official F1 logos, team logos, sponsor marks, or real driver photos without written permission. Use the placeholder set in `frontend/src/assets/placeholders/` until rights are cleared (`design.md` §11).
68. **Design changes go through the document.** If a visual decision changes, update `design.md` in the same commit as the code.
