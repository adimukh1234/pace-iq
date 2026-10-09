/**
 * TypeScript Interfaces mirroring backend Pydantic schemas.
 * Complies with IMPLEMENTATION_RULES.md (Rule 39) and TECH_SPEC.md §10.
 */

export interface ErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ErrorDetail;
}

export interface SeasonSummary {
  year: number;
  total_races: number;
  completed_races: number;
}

export interface PredictedDriverPodium {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
}

export interface RaceListItem {
  session_key: number;
  meeting_key: number;
  meeting_name: string;
  circuit_short_name: string;
  country_name: string;
  date_start: string;
  year: number;
  status: "upcoming" | "completed";
  predicted_podium: PredictedDriverPodium[];
  result_status?: "Podium correct" | "Partially correct" | "Missed" | null;
}

export interface PredictedOrderRow {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  predicted_position: number;
  podium_probability: number;
}

export interface ActualOrderRow {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  actual_position: number;
  predicted_position?: number | null;
  delta?: number | null;
  dnf: boolean;
  points: number;
}

export interface RaceDetailResponse {
  session_key: number;
  meeting_key: number;
  meeting_name: string;
  circuit_short_name: string;
  country_name: string;
  year: number;
  date_start: string;
  status: "upcoming" | "completed";
  model_version: string;
  spearman_correlation?: number | null;
  predicted: PredictedOrderRow[];
  actual?: ActualOrderRow[] | null;
}

export interface LapItem {
  lap_number: number;
  lap_duration: number | null;
  driver_number: number;
  compound?: string | null;
  is_pit_out_lap: boolean;
}

export interface DriverLapsResponse {
  session_key: number;
  driver_number: number;
  laps: LapItem[];
}

export interface StintItem {
  stint_number: number;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export interface RaceStintsResponse {
  session_key: number;
  stints: StintItem[];
}

export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number;
}

export interface DriverExplainResponse {
  session_key: number;
  driver_number: number;
  driver_name: string;
  team_name: string;
  team_colour: string;
  predicted_position: number;
  podium_probability: number;
  base_value: number;
  prediction: number;
  positive: FeatureContribution[];
  negative: FeatureContribution[];
  summary: string;
}

export interface PredictionSubmitRequest {
  username: string;
  session_key: number;
  p1: number;
  p2: number;
  p3: number;
}

export interface PredictionSubmitResponse {
  id: number;
  username: string;
  session_key: number;
  p1: number;
  p2: number;
  p3: number;
  submitted_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_points: number;
  exact_picks: number;
  podium_hits: number;
  submitted_at: string;
}

export interface LeaderboardResponse {
  session_key?: number | null;
  leaderboard: LeaderboardEntry[];
}

export interface CardDriverPick {
  slot?: string;
  position?: number;
  driver_number: number;
  name: string;
  acronym: string;
  team?: string;
  colour?: string;
  probability?: number;
}

export interface ShareCardResponse {
  user_prediction_id: number;
  username: string;
  session_key: number;
  race_name: string;
  circuit_name: string;
  date: string;
  score: number;
  user_picks: CardDriverPick[];
  model_picks: CardDriverPick[];
  actual_podium: CardDriverPick[];
  result_summary: string;
  model_version: string;
  generated_at: string;
}
