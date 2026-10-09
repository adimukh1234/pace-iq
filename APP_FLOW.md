# PaceIQ: App Flow

Version: 1.0
Related: `PRD.md`, `TECH_SPEC.md`

This document describes screens, navigation, and user flows. Visual treatment for each screen (colour, type, components, motion) is defined in `design.md`. Component names used below match `design.md` §7.

---

## 1. Navigation map

```
┌──────────────┐
│   Races      │  (home, /)
└──────┬───────┘
       │
       ├──► Race Detail (/races/:sessionKey)
       │         ├──► Driver Explainer (/races/:sessionKey/drivers/:driverNumber)
       │         └──► Replay (/races/:sessionKey/replay)
       │
       └──► Game (/game)
                 ├── Make a pick (upcoming races)
                 ├── Scores (completed races)
                 ├── Leaderboard (/game/leaderboard)
                 └── Share card (/game/cards/:id)
```

Global navigation: Races, Game. A persistent footer carries the OpenF1 credit and the unofficial-project disclaimer.

## 2. Screens

### 2.1 Races (home, `/`)

Purpose: find a race and see the model's outlook at a glance.

Content:
- Season selector (defaults to the latest season with data).
- List of race cards in chronological order.
- Each card shows: Grand Prix name, circuit, date, status badge (Upcoming or Completed), predicted podium (three driver acronyms), and for completed races a result indicator ("Podium correct", "Partially correct", or "Missed").

Actions:
- Select a season.
- Select a race card to open Race Detail.

States:
- Loading: skeleton cards.
- Empty: "No races found for this season yet."
- Error: message with retry button; if the cache is available, a notice that data may be out of date.

### 2.2 Race Detail (`/races/:sessionKey`)

Purpose: show the full predicted order and, after the race, compare it to the result.

Content:
- Header: Grand Prix name, date, circuit, status, model version.
- Predicted order table: position, driver, team, podium probability bar.
- For completed races, an actual-result column and a delta column (difference between predicted and actual position), with a summary line showing Spearman correlation for this race.
- Links to Replay and to the Driver Explainer for each row.

Actions:
- Open Driver Explainer for a driver.
- Open Replay.
- Go to Game to make or view a pick for this race.

States:
- Upcoming race: actual column replaced with "Results after the race".
- Missing predictions: "Predictions are not available for this race."
- Missing results: "Results are not available yet."

### 2.3 Driver Explainer (`/races/:sessionKey/drivers/:driverNumber`)

Purpose: explain why the model expects a driver to finish where they do.

Content:
- Driver name, team, predicted position, podium probability.
- Contribution chart: positive and negative contributions with feature names and values.
- Plain-language summary generated from the top three contributors using fixed templates.
- A short glossary for each feature, shown on hover or in an expandable section.

Actions:
- Switch driver using a dropdown of drivers in the same race.
- Return to Race Detail.

States:
- No prediction for the driver: explain that the driver was not in the training data for this race (for example, a late substitute).

### 2.4 Replay (`/races/:sessionKey/replay`)

Purpose: compare how drivers' pace and tyre strategy evolved during the race.

Content:
- Driver multi-select (up to 6 drivers, defaults to top 3 finishers).
- Lap-time line chart across laps, with safety car and red flag laps shaded.
- Stint timeline: one horizontal bar per driver, coloured by tyre compound, with pit stops marked.
- Legend for compounds.

Actions:
- Add or remove drivers from the selection.
- Hover a point to see lap number, time, and compound.

States:
- No lap data: "Lap data is not available for this session."
- Partial stint data: stints shown where available, with a notice.

### 2.5 Game (`/game`)

Purpose: let users make predictions and see how they score.

Content:
- Username card at top. If not set, prompt to choose one. Editable at any time.
- Upcoming races list. Each opens a pick form.
- Completed races list. Each shows the user's score if they picked, otherwise "No pick submitted".

Pick form:
- Three dropdowns (P1, P2, P3), each listing drivers for that session. The same driver cannot be selected twice.
- Submit button disabled until all three are set.
- Once submitted, the picks are shown read-only with the submission time.

Actions:
- Choose a username.
- Submit a pick for an upcoming race.
- Open a leaderboard for a race or overall.
- Open the share card for a scored pick.

States:
- Race started: pick form replaced with "Predictions are closed for this race."
- Duplicate submission attempt: message "You have already submitted a pick for this race."
- Username invalid: inline validation message.

### 2.6 Leaderboard (`/game/leaderboard`)

Purpose: rank users by points.

Content:
- Toggle: this race, or all races.
- Ranked table: rank, username, points, exact picks, podium hits.
- The current user's row is highlighted if present.

Scoring (defined in `IMPLEMENTATION_RULES.md`): points for exact position matches and podium members, with the rule shown beside the table.

### 2.7 Share card (`/game/cards/:id`)

Purpose: give users a clean image or page they can share.

Content:
- PaceIQ header and race name.
- The user's picks, the model's picks, and the actual podium.
- Score and a short result line.
- OpenF1 credit and the disclaimer.

Actions:
- Copy link to the card.
- Download as PNG (stretch S4; MVP ships with copy link only).

## 3. Core user flows

### 3.1 Browse a race and understand the prediction
1. User opens Races, which defaults to the latest season.
2. User selects a completed race.
3. Race Detail shows predicted order and actual result with the deltas.
4. User selects a driver with a large delta.
5. Driver Explainer shows the top contributing factors.
6. User returns to Race Detail or opens Replay for the same race.

### 3.2 Make a pick before a race
1. User opens Game.
2. If no username is set, user sets one and returns to the Game page.
3. User selects an upcoming race.
4. User chooses P1, P2, and P3 from the driver list.
5. User submits. The app confirms the pick and shows it as read-only.

### 3.3 See how a pick scored
1. After the race is complete, the user opens Game.
2. The completed race shows the score for their pick.
3. User opens the leaderboard for that race to compare with others.
4. User opens the share card and copies the link.

### 3.4 Compare tyre strategies
1. User opens Race Detail and selects Replay.
2. User selects drivers to compare.
3. The lap chart and stint timeline update together.
4. User hovers a lap to see the compound and lap time.

## 4. Error and offline behaviour

| Condition | User sees |
|---|---|
| Backend unreachable | Full-page message with retry; cached views still work if already loaded |
| Session has no predictions | Empty state on Race Detail with explanation |
| Session has no lap data | Empty state on Replay with explanation |
| Pick submission fails validation | Inline error next to the relevant field |
| Pick submission conflicts (duplicate) | Toast: already submitted |
| Session started before submission | Form disabled with explanation |

## 5. Content rules
- Use driver acronyms (for example, VER, HAM) in tables and driver numbers in URLs.
- Show times in the user's local timezone with the session's local time in parentheses.
- Use "predicted" and "expected" language, never "will finish", since the model produces estimates.
- Every prediction view carries a short line: "Model estimate. Not a guarantee."
