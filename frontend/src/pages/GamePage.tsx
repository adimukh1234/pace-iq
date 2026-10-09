import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Award, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { racesApi } from "../api/client";
import type { RaceListItem, RaceDetailResponse, PredictionSubmitResponse } from "../types";
import { PickForm } from "../components/PickForm";
import { LoadingState, ErrorState } from "../components/States";

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(null);
  const [activeRaceDetail, setActiveRaceDetail] = useState<RaceDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<PredictionSubmitResponse | null>(null);

  useEffect(() => {
    async function loadRaces() {
      setLoading(true);
      setError(null);
      try {
        const list = await racesApi.getRaces(2026);
        setRaces(list);
        if (list.length > 0) {
          // Select first upcoming race, or the first race in the list
          const upcoming = list.find((r: RaceListItem) => r.status === "upcoming");
          const initialKey = upcoming ? upcoming.session_key : list[0].session_key;
          setSelectedSessionKey(initialKey);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load races";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadRaces();
  }, []);

  useEffect(() => {
    async function loadDetail() {
      if (!selectedSessionKey) return;
      setDetailLoading(true);
      try {
        const detail = await racesApi.getRace(selectedSessionKey);
        setActiveRaceDetail(detail);
      } catch {
        // Handle error silently or set fallback
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetail();
  }, [selectedSessionKey]);

  if (loading) {
    return <LoadingState message="Connecting to Podium Challenge game server..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const driverDetails =
    activeRaceDetail?.predicted.map((p) => ({
      driver_number: p.driver_number,
      full_name: p.full_name,
      name_acronym: p.name_acronym,
      team_name: p.team_name,
      team_colour: p.team_colour,
    })) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header Banner */}
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
        <div style={{ maxWidth: "650px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 8px",
              backgroundColor: "rgba(255, 184, 0, 0.1)",
              border: "1px solid rgba(255, 184, 0, 0.3)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-amber)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Trophy size={14} />
            <span>COMMUNITY PODIUM CHALLENGE</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
              margin: "0 0 var(--space-3) 0",
              color: "var(--color-text-primary)",
            }}
          >
            Predict the Top 3. Outsmart the Model.
          </h1>

          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
            Submit your P1, P2, and P3 podium predictions before lights out. Compete against other strategists
            and see how human instincts stack up against our LightGBM machine learning model.
          </p>
        </div>

        {/* Scoring Rules Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            marginTop: "var(--space-5)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
            <Award size={18} color="var(--color-accent-amber)" />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-accent-amber)" }}>
                +25 POINTS
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Exact finishing position match (P1, P2, or P3)
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
            <CheckCircle2 size={18} color="var(--color-accent-green)" />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-accent-green)" }}>
                +10 POINTS
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Driver on podium, but incorrect exact step
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
            <Shield size={18} color="var(--color-accent-cyan)" />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-accent-cyan)" }}>
                STRICT LOCK
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Submissions automatically freeze at official race start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Race Selector Dropdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            SELECT EVENT:
          </span>
          <select
            value={selectedSessionKey || ""}
            onChange={(e) => setSelectedSessionKey(Number(e.target.value))}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-surface-subtle)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              outline: "none",
            }}
          >
            {races.map((r) => (
              <option key={r.session_key} value={r.session_key}>
                {r.meeting_name} ({r.circuit_short_name}) - {r.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <Link
          to="/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-accent-amber)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <span>VIEW LEADERBOARD STANDINGS</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Main Pick Submission Area */}
      {detailLoading ? (
        <LoadingState message="Loading grid and drivers..." />
      ) : activeRaceDetail ? (
        <div style={{ maxWidth: "650px", margin: "0 auto", width: "100%" }}>
          <PickForm
            sessionKey={activeRaceDetail.session_key}
            raceName={activeRaceDetail.meeting_name}
            drivers={driverDetails}
            isCompleted={activeRaceDetail.status === "completed"}
            onSuccess={(sub) => {
              setLastSubmission(sub);
            }}
          />

          {lastSubmission && (
            <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => navigate(`/card/${lastSubmission.id}`)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>View & Share Your Prediction Card</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
