# PaceIQ: Product Requirements Document

Version: 1.0
Status: Draft
Owner: Aditya

---

## 1. Summary

PaceIQ is a web app that predicts Formula 1 race finishing order from pre-race data, explains each prediction with the factors behind it, and gives fans a prediction game that scores their picks against the model and the actual result.

## 2. Problem

F1 fans have access to timing and telemetry, but there are few tools that:
- turn that data into forecasts before a race,
- explain why a driver is expected to finish where they do, or
- let a fan test their own knowledge against a data-driven baseline.

## 3. Goals

1. Predict finishing order and podium probability for each driver before a race starts.
2. Show the features that drive each prediction in plain language.
3. Let users make top-3 predictions and see them scored.
4. Demonstrate a sound, leakage-free ML pipeline built on public data.

## 4. Non-goals

- Predicting lap times to the millisecond.
- Live race predictions in the MVP (stretch goal only).
- User accounts, payments, or social login.
- Commercial use of timing data beyond what OpenF1 permits.
- Replacing official F1 results or timing.
- Use of official F1, team, sponsor, or driver branding or likenesses. The visual direction is inspired by fan apps and social cards, but does not reuse their marks or photos (see `design.md` §11).

## 5. Users

| Persona | Need | How PaceIQ helps |
|---|---|---|
| Casual fan | Quick sense of who is likely to score points | Predicted order with podium probabilities |
| Enthusiast | Understand why a driver is expected to do well | Driver Explainer with feature contributions |
| Analyst or student | Explore pace and tyre strategy by race | Replay page with lap times and stint timeline |
| Competitive fan | Test their own picks | Prediction Game with scoring and leaderboard |

## 6. Scope

### 6.1 MVP (must ship)

| ID | Feature | Acceptance criteria |
|---|---|---|
| F1 | Data ingestion | 2024 and 2025 race, qualifying, and practice data cached locally; reruns make no network calls for cached data |
| F2 | Feature pipeline | Pre-race features built per driver per race; leakage test passes |
| F3 | Prediction model | Model trained on 2024, validated and tested on 2025; metrics saved |
| F4 | Baseline comparison | Model reported against grid and team-form baselines on the test split |
| F5 | Races page | Lists races per season with status and predicted podium |
| F6 | Race detail page | Predicted order with probabilities; actual result shown for completed races |
| F7 | Driver Explainer | Top positive and negative contributing features for a driver in a race |
| F8 | Replay page | Lap-time chart for selected drivers; tyre stint timeline |
| F9 | Prediction Game | Submit top-3 pick; score after the race; leaderboard; shareable card styled per `design.md` §8 |

### 6.2 Stretch (only after MVP is complete)

| ID | Feature | Notes |
|---|---|---|
| S1 | Live Timing Tower | Poll or stream position and interval data during a live session |
| S2 | Lap-by-lap win probability | Same model with in-race features |
| S3 | Pit strategy simulator | Estimate one-stop versus two-stop outcomes using degradation curves |
| S4 | Share card PNG export | Render the card to an image file |

### 6.3 Out of scope

- Accounts or authentication for end users.
- Model retraining from the browser.
- Data sources other than OpenF1.
- Mobile native apps.

## 7. Functional requirements

- **FR-1** The system shall ingest data for a configured list of seasons and sessions and store raw responses before parsing.
- **FR-2** The system shall build features using only information available before the race start time.
- **FR-3** The system shall store predictions with the model version that produced them.
- **FR-4** The system shall display predicted and actual finishing order side by side for completed races.
- **FR-5** The system shall allow a user to submit one top-3 prediction per session before the session starts.
- **FR-6** The system shall score submitted predictions after results are available and update the leaderboard.
- **FR-7** The system shall show a clear empty or unavailable state when data for a session is missing.
- **FR-8** The system shall credit OpenF1 and display a disclaimer that the app is unofficial.

## 8. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | API responses under 300 ms for read endpoints on local hardware |
| Reproducibility | A fresh clone plus documented commands rebuilds data, model, and app |
| Reliability | If OpenF1 is unreachable, the app runs on cached data and shows a notice |
| Security | No secrets in the repository; all input validated |
| Accessibility | Keyboard-operable controls; sufficient colour contrast; text alternatives for charts |
| Design | Dark-first visual system defined in `design.md`; reduced-motion support; colour never the only signal |
| Maintainability | Typed frontend; linted Python; tests for features, API, and client |

## 9. Success metrics

| Metric | Target |
|---|---|
| Model rank correlation on 2025 test races | Higher than grid baseline (exact margin reported, not assumed) |
| Top-3 set accuracy | Reported against both baselines |
| End-to-end flow | A user can submit a pick and see it scored for a completed race in under 60 seconds |
| Build reproducibility | Clean-clone build succeeds with documented commands |

## 10. Assumptions and dependencies

- OpenF1 remains free and publicly accessible for historical data.
- Data availability varies by session type; the app treats missing data as a normal state.
- Unauthenticated OpenF1 requests are rate limited; the client throttles and caches accordingly.
- Qualifying and race sessions for 2024 and 2025 are complete enough to train on.

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Data gaps in some sessions | Fewer training rows | Restrict training to complete race sessions; document exclusions |
| Leakage inflates accuracy | Misleading results | Pre-race feature rule, leakage tests, time-ordered splits |
| Model only slightly beats baseline | Weak headline result | Report honestly; use feature ablations as analysis |
| Scope creep into live features | Missed deadline | Live features gated behind a checkpoint and kept as stretch |
| OpenF1 schema changes | Ingestion breaks | Fail-loud schema checks; cached raw data survives API changes |

## 12. Open questions

1. Should retirements be scored as position 20 or excluded from training? (Default: position mapped to last place among classified finishers, documented in the feature spec.)
2. Should the leaderboard be global or per season? (Default: per session, plus an all-time total.)
3. Which seasons to include beyond 2024 and 2025 once the pipeline works? (Default: none until MVP is done.)

## 13. Release plan

- **v0.1 (MVP):** Features F1 to F9, local deployment.
- **v0.2:** Optional deployment, share card export, README results finalised.
- **v0.3 (stretch):** Live timing, lap-by-lap win probability.
