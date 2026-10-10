import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Activity, Users } from "lucide-react";
import { racesApi, driversApi } from "../api/client";
import type {
  RaceDetailResponse,
  RaceStintsResponse,
  LapItem,
  DriverLapsResponse,
  PredictedOrderRow,
} from "../types";
import { LapChart } from "../components/LapChart";
import { StintTimeline } from "../components/StintTimeline";
import { ErrorState } from "../components/States";

export const ReplayPage: React.FC = () => {
  const { sessionKey } = useParams<{ sessionKey: string }>();
  const [race, setRace] = useState<RaceDetailResponse | null>(null);
  const [stintsData, setStintsData] = useState<RaceStintsResponse | null>(null);
  const [selectedDriverNums, setSelectedDriverNums] = useState<number[]>([]);
  const [driverLapsMap, setDriverLapsMap] = useState<Record<number, LapItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lapsLoading, setLapsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sKey = Number(sessionKey);

  useEffect(() => {
    async function loadRaceMeta() {
      if (!sKey || isNaN(sKey)) {
        setError("Invalid session key");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [raceData, stints] = await Promise.all([
          racesApi.getRace(sKey),
          racesApi.getStints(sKey).catch(() => null),
        ]);
        setRace(raceData);
        setStintsData(stints);

        // Default select top 2-3 drivers
        const initialSelected = raceData.predicted
          .slice(0, 2)
          .map((d: PredictedOrderRow) => d.driver_number);
        setSelectedDriverNums(initialSelected);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load race replay data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadRaceMeta();
  }, [sessionKey]);

  // Load laps for selected drivers
  useEffect(() => {
    async function loadSelectedLaps() {
      if (!sKey || selectedDriverNums.length === 0) return;

      const needed = selectedDriverNums.filter((num) => !driverLapsMap[num]);
      if (needed.length === 0) return;

      setLapsLoading(true);
      try {
        const results = await Promise.all(
          needed.map((num: number) =>
            driversApi
              .getDriverLaps(sKey, num)
              .then((resp: DriverLapsResponse) => ({ num, laps: resp.laps }))
              .catch(() => ({ num, laps: [] }))
          )
        );

        setDriverLapsMap((prev) => {
          const next = { ...prev };
          results.forEach(({ num, laps }: { num: number; laps: LapItem[] }) => {
            next[num] = laps;
          });
          return next;
        });
      } finally {
        setLapsLoading(false);
      }
    }
    loadSelectedLaps();
  }, [selectedDriverNums, sKey]);

  const toggleDriver = (driverNumber: number) => {
    if (selectedDriverNums.includes(driverNumber)) {
      if (selectedDriverNums.length > 1) {
        setSelectedDriverNums(selectedDriverNums.filter((n) => n !== driverNumber));
      }
    } else {
      if (selectedDriverNums.length < 4) {
        setSelectedDriverNums([...selectedDriverNums, driverNumber]);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div className="skeleton" style={{ height: "40px", width: "180px", borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton" style={{ height: "140px", width: "100%", borderRadius: "var(--radius-lg)" }} />
        <div className="skeleton" style={{ height: "80px", width: "100%", borderRadius: "var(--radius-lg)" }} />
        <div className="skeleton" style={{ height: "320px", width: "100%", borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  if (error || !race) {
    return <ErrorState message={error || "Session not found"} />;
  }

  const driverDetails = race.predicted.map((p) => ({
    driver_number: p.driver_number,
    name_acronym: p.name_acronym,
    team_colour: p.team_colour,
    full_name: p.full_name,
    team_name: p.team_name,
  }));

  const driverNamesMap: Record<number, string> = {};
  race.predicted.forEach((d) => {
    driverNamesMap[d.driver_number] = d.name_acronym;
  });

  const lapSeriesData: DriverLapsResponse[] = selectedDriverNums.map((num) => ({
    session_key: sKey,
    driver_number: num,
    laps: driverLapsMap[num] || [],
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back Link */}
      <div>
        <Link
          to={`/races/${sKey}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            minHeight: "44px",
            padding: "4px 8px",
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO RACE PREDICTION</span>
        </Link>
      </div>

      {/* Header Banner */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-accent-red)",
              marginBottom: "var(--space-2)",
            }}
          >
            <Activity size={14} />
            <span>SESSION REPLAY & LAP TELEMETRY</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              color: "var(--color-text-primary)",
              margin: "0 0 4px 0",
            }}
          >
            {race.meeting_name}
          </h1>

          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            {race.circuit_short_name} • {race.year} • Replay analysis & tyre life
          </div>
        </div>
      </section>

      {/* Driver Multi-Selector */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-3)",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={16} color="var(--color-accent-amber)" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              SELECT DRIVERS TO COMPARE (MAX 4):
            </span>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            {selectedDriverNums.length} / 4 selected
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {race.predicted.map((d) => {
            const isSelected = selectedDriverNums.includes(d.driver_number);
            const teamCol = d.team_colour ? `#${d.team_colour}` : "var(--color-accent-red)";

            return (
              <button
                key={d.driver_number}
                type="button"
                onClick={() => toggleDriver(d.driver_number)}
                style={{
                  minHeight: "44px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  backgroundColor: isSelected ? "var(--color-surface-raised)" : "var(--color-surface-subtle)",
                  color: isSelected ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  border: isSelected ? `2px solid ${teamCol}` : "1px solid var(--color-border)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: teamCol,
                  }}
                />
                <span>{d.name_acronym}</span>
                <span style={{ opacity: 0.6, fontSize: "10px" }}>#{d.driver_number}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lap Times Line Chart */}
      {lapsLoading && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
          Loading telemetry lap series...
        </div>
      )}

      <LapChart driverLaps={lapSeriesData} driverNames={driverNamesMap} />

      {/* Stint Timeline Strategy */}
      {stintsData && stintsData.stints.length > 0 && (
        <StintTimeline stints={stintsData.stints} drivers={driverDetails} />
      )}
    </div>
  );
};
