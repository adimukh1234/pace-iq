/**
 * API Client for PaceIQ.
 * Typed fetch wrapper handling URL resolution, JSON parsing, and unified error mapping.
 */

import type {
  DriverExplainResponse,
  DriverLapsResponse,
  RaceDetailResponse,
  RaceListItem,
  RaceStintsResponse,
  SeasonSummary,
} from "../types";

const RAW_API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let code = "API_ERROR";
      let message = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          code = errorData.error.code || code;
          message = errorData.error.message || message;
        }
      } catch {
        // Fallback to text status
      }
      throw new ApiError(code, message, response.status);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError("NETWORK_ERROR", message, 0);
  }
}

export const api = {
  getSeasons(): Promise<SeasonSummary[]> {
    return request<SeasonSummary[]>("/seasons");
  },

  getRaces(year: number): Promise<RaceListItem[]> {
    return request<RaceListItem[]>(`/races?year=${year}`);
  },

  getRaceDetail(sessionKey: number): Promise<RaceDetailResponse> {
    return request<RaceDetailResponse>(`/races/${sessionKey}`);
  },

  getRaceLaps(
    sessionKey: number,
    drivers: number[]
  ): Promise<DriverLapsResponse[]> {
    return request<DriverLapsResponse[]>(
      `/races/${sessionKey}/laps?drivers=${drivers.join(",")}`
    );
  },

  getRaceStints(sessionKey: number): Promise<RaceStintsResponse> {
    return request<RaceStintsResponse>(`/races/${sessionKey}/stints`);
  },

  getDriverExplanation(
    sessionKey: number,
    driverNumber: number
  ): Promise<DriverExplainResponse> {
    return request<DriverExplainResponse>(
      `/races/${sessionKey}/drivers/${driverNumber}/explain`
    );
  },
};

export const racesApi = {
  getSeasons: () => api.getSeasons(),
  getRaces: (year: number) => api.getRaces(year),
  getRace: (sessionKey: number) => api.getRaceDetail(sessionKey),
  getStints: (sessionKey: number) => api.getRaceStints(sessionKey),
};

export const driversApi = {
  getDriverLaps: async (sessionKey: number, driverNumber: number): Promise<DriverLapsResponse> => {
    const list = await api.getRaceLaps(sessionKey, [driverNumber]);
    return list[0] || { session_key: sessionKey, driver_number: driverNumber, laps: [] };
  },
  getDriverExplain: (sessionKey: number, driverNumber: number) =>
    api.getDriverExplanation(sessionKey, driverNumber),
};
