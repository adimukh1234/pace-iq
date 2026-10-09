# PaceIQ: Database Schema Specification

Version: 1.0
Database Engine: SQLite 3 (via SQLAlchemy)
Default Path: `backend/data/paceiq.db`

---

## 1. Entity Relationship Overview

```
meetings (1) ──── (N) sessions
                     │
      ┌──────────────┼──────────────┬──────────────┬──────────────┐
      ▼              ▼              ▼              ▼              ▼
   drivers         laps          stints        session_results  features
(session_key,  (session_key, (session_key,    (session_key,  (session_key,
driver_number) driver_number) driver_number)   driver_number) driver_number)
                                                                  │
                                                                  ▼
                                                             predictions
                                                           (session_key,
                                                           driver_number,
                                                           model_version)

user_predictions (1) ──── (1) prediction_scores
(username, session_key)
```

---

## 2. Table Definitions

### 2.1 `meetings`
Represents an F1 Grand Prix event weekend.
- `meeting_key` INTEGER PRIMARY KEY
- `meeting_name` TEXT NOT NULL
- `circuit_key` INTEGER
- `circuit_short_name` TEXT
- `country_name` TEXT
- `country_code` TEXT
- `year` INTEGER NOT NULL
- `date_start` TEXT NOT NULL
- `circuit_type` TEXT DEFAULT 'mixed'

### 2.2 `sessions`
Individual track sessions (Practice 1..3, Qualifying, Sprint, Race).
- `session_key` INTEGER PRIMARY KEY
- `meeting_key` INTEGER NOT NULL REFERENCES `meetings`(`meeting_key`)
- `session_name` TEXT NOT NULL
- `session_type` TEXT NOT NULL
- `date_start` TEXT NOT NULL
- `date_end` TEXT
- `year` INTEGER NOT NULL

### 2.3 `drivers`
Driver entry per session with associated constructor and team branding.
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `driver_number` INTEGER NOT NULL
- `meeting_key` INTEGER NOT NULL
- `broadcast_name` TEXT
- `full_name` TEXT NOT NULL
- `name_acronym` TEXT NOT NULL
- `team_name` TEXT NOT NULL
- `team_colour` TEXT NOT NULL
- `first_name` TEXT
- `last_name` TEXT
- `headshot_url` TEXT
- `country_code` TEXT
- PRIMARY KEY (`session_key`, `driver_number`)

### 2.4 `starting_grids`
Starting grid positions for the race.
- `meeting_key` INTEGER NOT NULL
- `driver_number` INTEGER NOT NULL
- `session_key` INTEGER NOT NULL
- `position` INTEGER NOT NULL
- `lap_duration` REAL
- PRIMARY KEY (`meeting_key`, `driver_number`)

### 2.5 `session_results`
Official final classification for the session.
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `driver_number` INTEGER NOT NULL
- `meeting_key` INTEGER NOT NULL
- `position` INTEGER NOT NULL
- `number_of_laps` INTEGER NOT NULL
- `points` REAL DEFAULT 0.0
- `dnf` BOOLEAN NOT NULL DEFAULT 0
- `dns` BOOLEAN NOT NULL DEFAULT 0
- `dsq` BOOLEAN NOT NULL DEFAULT 0
- `duration` REAL
- `gap_to_leader` REAL
- PRIMARY KEY (`session_key`, `driver_number`)

### 2.6 `laps`
Lap timing details.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `meeting_key` INTEGER NOT NULL
- `driver_number` INTEGER NOT NULL
- `lap_number` INTEGER NOT NULL
- `lap_duration` REAL
- `duration_sector_1` REAL
- `duration_sector_2` REAL
- `duration_sector_3` REAL
- `is_pit_out_lap` BOOLEAN DEFAULT 0
- `date_start` TEXT

### 2.7 `stints`
Tyre compound stints.
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `driver_number` INTEGER NOT NULL
- `stint_number` INTEGER NOT NULL
- `meeting_key` INTEGER NOT NULL
- `lap_start` INTEGER NOT NULL
- `lap_end` INTEGER NOT NULL
- `compound` TEXT NOT NULL
- `tyre_age_at_start` INTEGER DEFAULT 0
- PRIMARY KEY (`session_key`, `driver_number`, `stint_number`)

### 2.8 `weather`
Track and atmospheric conditions.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `meeting_key` INTEGER
- `date` TEXT NOT NULL
- `air_temperature` REAL
- `track_temperature` REAL
- `humidity` REAL
- `pressure` REAL
- `rainfall` INTEGER DEFAULT 0
- `wind_speed` REAL

### 2.9 `race_control`
Track status and safety car incidents.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `meeting_key` INTEGER
- `date` TEXT NOT NULL
- `category` TEXT
- `flag` TEXT
- `scope` TEXT
- `message` TEXT
- `lap_number` INTEGER

### 2.10 `features`
Pre-race leakage-safe feature vectors for Model A and B.
- `session_key` INTEGER NOT NULL
- `driver_number` INTEGER NOT NULL
- `meeting_key` INTEGER NOT NULL
- `feature_schema_version` TEXT NOT NULL DEFAULT 'v1'
- `grid_position` INTEGER
- `quali_gap_to_pole_s` REAL
- `quali_gap_to_pole_pct` REAL
- `quali_gap_to_teammate_s` REAL
- `practice_pace_index` REAL
- `longrun_pace_s` REAL
- `longrun_pace_rel_s` REAL
- `deg_slope_s_per_lap` REAL
- `driver_form_5` REAL
- `team_form_5` REAL
- `driver_circuit_avg` REAL
- `team_circuit_avg` REAL
- `track_temp_c` REAL
- `rain_flag` INTEGER DEFAULT 0
- `circuit_type` TEXT DEFAULT 'mixed'
- Missing indicators (`*_missing`) INTEGER DEFAULT 0
- `target_position` INTEGER
- `target_podium` INTEGER
- `dnf` INTEGER DEFAULT 0
- PRIMARY KEY (`session_key`, `driver_number`)

### 2.11 `predictions`
Batch model inferences with SHAP explanations.
- `session_key` INTEGER NOT NULL
- `driver_number` INTEGER NOT NULL
- `model_version` TEXT NOT NULL DEFAULT 'paceiq_v1'
- `predicted_position` INTEGER NOT NULL
- `podium_probability` REAL NOT NULL
- `shap_values` TEXT NOT NULL -- JSON payload
- `created_at` TEXT NOT NULL
- PRIMARY KEY (`session_key`, `driver_number`, `model_version`)

### 2.12 `user_predictions`
Fan game top-3 picks.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `username` TEXT NOT NULL
- `session_key` INTEGER NOT NULL REFERENCES `sessions`(`session_key`)
- `p1_driver` INTEGER NOT NULL
- `p2_driver` INTEGER NOT NULL
- `p3_driver` INTEGER NOT NULL
- `submitted_at` TEXT NOT NULL
- UNIQUE (`username`, `session_key`)

### 2.13 `prediction_scores`
Scored predictions for completed sessions.
- `prediction_id` INTEGER PRIMARY KEY REFERENCES `user_predictions`(`id`)
- `username` TEXT NOT NULL
- `session_key` INTEGER NOT NULL
- `p1_exact` BOOLEAN NOT NULL
- `p2_exact` BOOLEAN NOT NULL
- `p3_exact` BOOLEAN NOT NULL
- `podium_hits` INTEGER NOT NULL
- `total_points` INTEGER NOT NULL
- `scored_at` TEXT NOT NULL
