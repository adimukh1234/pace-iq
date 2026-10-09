import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft, RefreshCw } from "lucide-react";
import { gameApi, racesApi } from "../api/client";
import type { LeaderboardEntry, RaceListItem } from "../types";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { LoadingState, ErrorState } from "../components/States";

export const LeaderboardPage: React.FC = () => {
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number | "all">("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUsername = localStorage.getItem("paceiq_username") || undefined;

  useEffect(() => {
    async function loadRaces() {
      try {
        const list = await racesApi.getRaces(2026);
        setRaces(list);
      } catch {
        // Fallback
      }
    }
    loadRaces();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const param = selectedSessionKey === "all" ? undefined : selectedSessionKey;
      const resp = await gameApi.getLeaderboard(param);
      setLeaderboard(resp.leaderboard);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load leaderboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedSessionKey]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back Link */}
      <div>
        <Link
          to="/game"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>BACK TO PODIUM CHALLENGE</span>
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
              color: "var(--color-accent-amber)",
              marginBottom: "var(--space-2)",
            }}
          >
            <Trophy size={14} />
            <span>COMMUNITY STANDINGS</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
              margin: "0 0 4px 0",
              color: "var(--color-text-primary)",
            }}
          >
            Paddock Leaderboard
          </h1>

          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>
            Ranked by accumulated accuracy across 2024 Formula 1 race predictions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLeaderboard}
          style={{
            padding: "8px 14px",
            backgroundColor: "var(--color-surface-subtle)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </section>

      {/* Filter Options */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          VIEW STANDINGS FOR:
        </span>

        <button
          type="button"
          onClick={() => setSelectedSessionKey("all")}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            backgroundColor: selectedSessionKey === "all" ? "var(--color-accent-red)" : "var(--color-surface)",
            color: selectedSessionKey === "all" ? "#FFFFFF" : "var(--color-text-secondary)",
            border: "1px solid",
            borderColor: selectedSessionKey === "all" ? "var(--color-accent-red)" : "var(--color-border)",
            cursor: "pointer",
          }}
        >
          Overall Championship
        </button>

        <select
          value={selectedSessionKey === "all" ? "" : selectedSessionKey}
          onChange={(e) => {
            if (e.target.value === "") {
              setSelectedSessionKey("all");
            } else {
              setSelectedSessionKey(Number(e.target.value));
            }
          }}
          aria-label="Filter by Grand Prix"
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            outline: "none",
          }}
        >
          <option value="">Specific Grand Prix...</option>
          {races.map((r) => (
            <option key={r.session_key} value={r.session_key}>
              {r.meeting_name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Fetching current leaderboard positions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadLeaderboard} />
      ) : (
        <LeaderboardTable
          leaderboard={leaderboard}
          currentUsername={currentUsername}
          isLoading={loading}
        />
      )}
    </div>
  );
};
