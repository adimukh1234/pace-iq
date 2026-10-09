# OpenF1 API Exploration Notes (Milestone 1)

## Endpoints Verified & Sample Fixtures Saved

1. **`/sessions`** (`sample_sessions.json`)
   - **Filters**: `year=2024`, `session_name=Race` (or `Practice 1`, `Qualifying`, etc.).
   - **Key Fields**: `session_key`, `meeting_key`, `session_name`, `session_type`, `date_start`, `date_end`, `country_name`, `circuit_short_name`, `year`.
   - **Note**: A single race weekend contains multiple `session_key`s under the same `meeting_key` (e.g. Practice 1, Practice 2, Practice 3, Qualifying, Race).

2. **`/meetings`** (`sample_meetings.json`)
   - **Surprise**: Filter by `session_key` returns 404. Meetings must be queried by `meeting_key` or `year`.
   - **Key Fields**: `meeting_key`, `meeting_name`, `circuit_key`, `circuit_short_name`, `country_name`, `year`, `date_start`.

3. **`/starting_grid`** (`sample_starting_grid.json`)
   - **Surprise**: Filtering by the Race `session_key` returns 404 (`{"detail":"No results found."}`). Starting grid is linked to the Qualifying `session_key` or queried by `meeting_key`.
   - **Key Fields**: `meeting_key`, `session_key` (of qualifying), `driver_number`, `position`, `lap_duration`.

4. **`/session_result`** (`sample_session_result.json`)
   - **Filters**: `session_key`.
   - **Key Fields**: `position`, `driver_number`, `number_of_laps`, `points`, `dnf` (boolean), `dns` (boolean), `dsq` (boolean), `duration`, `gap_to_leader`.
   - **Note**: Provides clean final classification directly without needing manual lap aggregation.

5. **`/stints`** (`sample_stints.json`)
   - **Filters**: `session_key`.
   - **Key Fields**: `meeting_key`, `session_key`, `stint_number`, `driver_number`, `lap_start`, `lap_end`, `compound` (e.g. `SOFT`, `MEDIUM`, `HARD`, `INTERMEDIATE`, `WET`), `tyre_age_at_start`.

6. **`/laps`** (`sample_laps.json`)
   - **Filters**: `session_key`, optionally `driver_number`.
   - **Key Fields**: `lap_number`, `driver_number`, `lap_duration` (seconds, float), `is_pit_out_lap` (boolean), `duration_sector_1`, `duration_sector_2`, `duration_sector_3`, `date_start`.
   - **Clean Lap Check**: Must check `not is_pit_out_lap`, `lap_duration is not None`, and ensure no overlap with SC/VSC periods from `race_control`.

7. **`/drivers`** (`sample_drivers.json`)
   - **Filters**: `session_key`.
   - **Key Fields**: `driver_number`, `full_name`, `name_acronym`, `team_name`, `team_colour` (hex without `#`, e.g. `3671c6`), `first_name`, `last_name`.
   - **Note**: `team_colour` is provided natively in hex.

8. **`/weather`** (`sample_weather.json`)
   - **Filters**: `session_key`.
   - **Key Fields**: `track_temperature`, `air_temperature`, `rainfall` (0 or 1), `humidity`, `pressure`, `wind_speed`.

9. **`/race_control`** (`sample_race_control.json`)
   - **Filters**: `session_key`.
   - **Key Fields**: `flag`, `category`, `scope`, `message`, `lap_number`, `date`.

10. **`/position`** (`sample_position.json`)
    - **Filters**: `session_key`, `driver_number`.
    - **Key Fields**: `date`, `session_key`, `driver_number`, `position`.
