import React, { useState, useEffect } from "react";
import { Calendar, Zap } from "lucide-react";
import { racesApi } from "../api/client";
import type { RaceListItem, SeasonSummary } from "../types";
import { RaceCard } from "../components/RaceCard";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

export const RacesPage: React.FC = () => {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const data = await racesApi.getSeasons();
        setSeasons(data);
        if (data.length > 0 && !data.some((s: SeasonSummary) => s.year === selectedYear)) {
          setSelectedYear(data[0].year);
        }
      } catch {
        // Fallback default
        setSeasons([{ year: 2024, total_races: 24, completed_races: 2 }]);
      }
    }
    loadSeasons();
  }, []);

  const loadRaces = async (year: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await racesApi.getRaces(year);
      setRaces(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load races";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaces(selectedYear);
  }, [selectedYear]);

  const completedCount = races.filter((r) => r.status === "completed").length;
  const upcomingCount = races.filter((r) => r.status === "upcoming").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Hero Telemetry Banner */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            background: "radial-gradient(circle at top right, rgba(225, 6, 0, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "700px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "rgba(225, 6, 0, 0.1)",
              border: "1px solid rgba(225, 6, 0, 0.3)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-red)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Zap size={12} />
            <span>AI RACE OUTCOME ENGINE</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              lineHeight: 1.2,
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-3) 0",
              letterSpacing: "-0.02em",
            }}
          >
            Predictive Grand Prix Telemetry & Strategy Lab
          </h1>

          <p
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            Pre-race finishing order probabilities and pit strategy models calibrated with isotonic regression
            and tree attribution. Pure pre-race features with zero target-race leakage.
          </p>
        </div>

        {/* Stats Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "var(--space-4)",
            marginTop: "var(--space-5)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              TOTAL ROUNDS
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700 }}>
              {races.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              COMPLETED
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-accent-green)" }}>
              {completedCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              UPCOMING
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-accent-cyan)" }}>
              {upcomingCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              ENGINE CALIBRATION
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-accent-amber)", marginTop: "4px" }}>
              LIGHTGBM v1.0
            </div>
          </div>
        </div>
      </section>

      {/* Season Picker Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Calendar size={16} color="var(--color-text-muted)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            SELECT SEASON:
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {seasons.map((s) => (
              <button
                key={s.year}
                type="button"
                onClick={() => setSelectedYear(s.year)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  backgroundColor: selectedYear === s.year ? "var(--color-accent-red)" : "var(--color-surface)",
                  color: selectedYear === s.year ? "#FFFFFF" : "var(--color-text-secondary)",
                  border: "1px solid",
                  borderColor: selectedYear === s.year ? "var(--color-accent-red)" : "var(--color-border)",
                  cursor: "pointer",
                }}
              >
                {s.year}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
          Showing {races.length} Grand Prix events
        </div>
      </div>

      {/* Main Content State Rendering */}
      {loading ? (
        <LoadingState message="Loading season schedule and telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadRaces(selectedYear)} />
      ) : races.length === 0 ? (
        <EmptyState
          title="No Races Available"
          message={`No Grand Prix sessions found for the ${selectedYear} season.`}
          actionLabel="Refresh"
          onAction={() => loadRaces(selectedYear)}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {races.map((race, idx) => (
            <RaceCard key={race.session_key} race={race} roundIndex={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
