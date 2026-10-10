import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { racesApi } from "../api/client";
import type { RaceListItem, SeasonSummary } from "../types";
import { RaceCard } from "../components/RaceCard";
import { SkeletonCard, ErrorState, EmptyState } from "../components/States";
import { HeroSection } from "../components/HeroSection";
import { NextRaceHighlight } from "../components/NextRaceHighlight";

export const RacesPage: React.FC = () => {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    async function loadSeasons() {
      try {
        const data = await racesApi.getSeasons();
        if (!isCurrent) return;
        setSeasons(data);
        if (data.length > 0 && !data.some((s: SeasonSummary) => s.year === selectedYear)) {
          setSelectedYear(data[0].year);
        }
      } catch {
        if (!isCurrent) return;
        setSeasons([
          { year: 2026, total_races: 4, completed_races: 4 },
          { year: 2025, total_races: 24, completed_races: 24 },
        ]);
      }
    }
    loadSeasons();
    return () => {
      isCurrent = false;
    };
  }, []);

  const activeRequestRef = React.useRef<number>(0);

  const loadRaces = React.useCallback(async (year: number) => {
    const requestId = ++activeRequestRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await racesApi.getRaces(year);
      if (requestId === activeRequestRef.current) {
        setRaces(data);
      }
    } catch (err: unknown) {
      if (requestId === activeRequestRef.current) {
        const msg = err instanceof Error ? err.message : "Failed to load races";
        setError(msg);
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadRaces(selectedYear);
  }, [selectedYear, loadRaces]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* High-Impact Formula 1 Hero Section */}
      <HeroSection />

      {/* Featured Unrun Race Spotlight: Singapore GP 2026 Model Predictions */}
      <NextRaceHighlight />

      {/* Season Picker Controls */}
      <div
        id="races-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          scrollMarginTop: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Calendar size={16} color="var(--color-text-muted)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            SELECT SEASON:
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {seasons.map((s) => (
              <button
                key={s.year}
                type="button"
                onClick={() => setSelectedYear(s.year)}
                style={{
                  minHeight: "44px",
                  minWidth: "54px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  backgroundColor: selectedYear === s.year ? "var(--color-accent-red)" : "var(--color-surface)",
                  backdropFilter: "var(--glass-blur)",
                  WebkitBackdropFilter: "var(--glass-blur)",
                  color: selectedYear === s.year ? "#FFFFFF" : "var(--color-text-secondary)",
                  border: "1px solid",
                  borderColor: selectedYear === s.year ? "var(--color-accent-red)" : "var(--color-surface-outline)",
                  boxShadow: selectedYear === s.year ? "0 0 16px rgba(225, 6, 0, 0.45)" : "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
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

      {/* Main Content State Rendering - With Skeleton Grid to Prevent Layout Shift */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {races.map((race) => (
            <RaceCard key={race.session_key} race={race} />
          ))}
        </div>
      )}
    </div>
  );
};
