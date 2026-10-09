import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Activity,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Flag,
} from "lucide-react";
import { racesApi } from "../api/client";
import type { RaceDetailResponse, RaceStintsResponse } from "../types";
import { PositionRow } from "../components/PositionRow";
import { PickForm } from "../components/PickForm";
import { StintTimeline } from "../components/StintTimeline";
import { LoadingState, ErrorState } from "../components/States";

export const RaceDetailPage: React.FC = () => {
  const { sessionKey } = useParams<{ sessionKey: string }>();
  const [race, setRace] = useState<RaceDetailResponse | null>(null);
  const [stintsData, setStintsData] = useState<RaceStintsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"telemetry" | "picks">("telemetry");
  const [viewMode, setViewMode] = useState<"predicted" | "actual">("predicted");

  const sKey = Number(sessionKey);

  const loadData = async () => {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load race details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionKey]);

  if (loading) {
    return <LoadingState message="Calculating grid telemetry and predictions..." />;
  }

  if (error || !race) {
    return <ErrorState message={error || "Race not found"} onRetry={loadData} />;
  }

  // Create driver map for stint timeline
  const driverDetails = race.predicted.map((p) => ({
    driver_number: p.driver_number,
    name_acronym: p.name_acronym,
    team_colour: p.team_colour,
    full_name: p.full_name,
    team_name: p.team_name,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back Link */}
      <div>
        <Link
          to="/"
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
          <span>BACK TO CALENDAR</span>
        </Link>
      </div>

      {/* Race Header Banner */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-2)",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                textTransform: "uppercase",
                backgroundColor:
                  race.status === "completed"
                    ? "rgba(57, 181, 74, 0.15)"
                    : "rgba(0, 210, 255, 0.15)",
                color:
                  race.status === "completed"
                    ? "var(--color-accent-green)"
                    : "var(--color-accent-cyan)",
              }}
            >
              {race.status}
            </span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              MODEL: {race.model_version}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              margin: "0 0 var(--space-2) 0",
              color: "var(--color-text-primary)",
            }}
          >
            {race.meeting_name}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              flexWrap: "wrap",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={14} color="var(--color-accent-red)" />
              <span>{race.circuit_short_name}, {race.country_name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={14} color="var(--color-text-muted)" />
              <span>{race.date_start ? new Date(race.date_start).toLocaleDateString() : race.year}</span>
            </div>
          </div>
        </div>

        {/* Action Button & Metric Badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            {race.spearman_correlation !== null && race.spearman_correlation !== undefined && (
              <div
                style={{
                  backgroundColor: "var(--color-surface-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 12px",
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  SPEARMAN RANK ρ
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-base)",
                    fontWeight: 700,
                    color: "var(--color-accent-amber)",
                  }}
                >
                  {race.spearman_correlation.toFixed(3)}
                </div>
              </div>
            )}

            <Link
              to={`/races/${race.session_key}/replay`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
            >
              <Activity size={14} color="var(--color-accent-red)" />
              <span>REPLAY & STRATEGY</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs / Toggle View */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border-subtle)",
          gap: "var(--space-4)",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          style={{
            padding: "8px 12px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "telemetry" ? "2px solid var(--color-accent-red)" : "2px solid transparent",
            color: activeTab === "telemetry" ? "var(--color-text-primary)" : "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <TrendingUp size={14} />
          <span>ORDER & ATTRITION</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("picks")}
          style={{
            padding: "8px 12px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "picks" ? "2px solid var(--color-accent-red)" : "2px solid transparent",
            color: activeTab === "picks" ? "var(--color-text-primary)" : "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Award size={14} />
          <span>PODIUM CHALLENGE</span>
        </button>
      </div>

      {/* Real vs Predicted Podium Benchmark Banner if completed */}
      {race.actual && race.actual.length >= 3 && race.predicted && race.predicted.length >= 3 && (
        <div
          style={{
            backgroundColor: "var(--color-surface-1)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4) var(--space-5)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-4)",
            alignItems: "center",
          }}
        >
          {/* Predicted Podium */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--type-label)",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-2)",
              }}
            >
              AI Predicted Podium
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {race.predicted.slice(0, 3).map((p, idx) => (
                <div
                  key={p.driver_number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    backgroundColor: "var(--color-surface-2)",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    borderBottom: `3px solid ${p.team_colour}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "0.8rem",
                      color: "var(--color-accent-orange)",
                      fontWeight: 700,
                    }}
                  >
                    P{idx + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--type-body-md)",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {p.name_acronym}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actual Official Podium */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--type-label)",
                color: "var(--color-status-success)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-2)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={13} />
              <span>Official Sunday Podium (Real Result)</span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {race.actual.slice(0, 3).map((a, idx) => {
                const isExact = race.predicted[idx]?.driver_number === a.driver_number;
                return (
                  <div
                    key={a.driver_number}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      backgroundColor: isExact
                        ? "rgba(52, 199, 89, 0.15)"
                        : "var(--color-surface-2)",
                      border: isExact
                        ? "1px solid rgba(52, 199, 89, 0.4)"
                        : "1px solid var(--color-surface-outline)",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-sm)",
                      borderBottom: `3px solid ${a.team_colour}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "0.8rem",
                        color: "var(--color-status-success)",
                        fontWeight: 700,
                      }}
                    >
                      P{idx + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--type-body-md)",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {a.name_acronym}
                    </span>
                    {isExact && (
                      <span style={{ fontSize: "10px", color: "var(--color-status-success)" }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "telemetry" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Order & Results Table with View Switcher */}
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
                flexWrap: "wrap",
                gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "var(--text-base)",
                    margin: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {viewMode === "predicted"
                    ? "Predicted Finishing Order"
                    : "Official Sunday Race Classification"}
                </h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                  {viewMode === "predicted"
                    ? "Click any driver to inspect feature contributions and model explainers"
                    : "Official FIA finishing positions, championship points, and accuracy deltas"}
                </span>
              </div>

              {/* View Mode Toggle */}
              {race.actual && race.actual.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "var(--color-surface-2)",
                    borderRadius: "var(--radius-sm)",
                    padding: "3px",
                    gap: "2px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("predicted")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      backgroundColor:
                        viewMode === "predicted"
                          ? "var(--color-surface-1)"
                          : "transparent",
                      color:
                        viewMode === "predicted"
                          ? "var(--color-text-primary)"
                          : "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    PREDICTED ORDER
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("actual")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      backgroundColor:
                        viewMode === "actual"
                          ? "var(--color-surface-1)"
                          : "transparent",
                      color:
                        viewMode === "actual"
                          ? "var(--color-accent-teal)"
                          : "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Flag size={11} />
                    <span>OFFICIAL RESULTS</span>
                  </button>
                </div>
              )}
            </div>

            {/* Table Content */}
            <div style={{ display: "flex", flexDirection: "column", marginTop: "var(--space-3)" }}>
              {viewMode === "predicted" ? (
                race.predicted.map((driver) => {
                  const actualMatch = race.actual?.find(
                    (a) => a.driver_number === driver.driver_number
                  );
                  return (
                    <PositionRow
                      key={driver.driver_number}
                      row={driver}
                      actualRow={actualMatch}
                      sessionKey={race.session_key}
                    />
                  );
                })
              ) : (
                race.actual &&
                race.actual.map((act) => {
                  const predMatch = race.predicted.find(
                    (p) => p.driver_number === act.driver_number
                  );
                  const isExact = predMatch?.predicted_position === act.actual_position;
                  return (
                    <Link
                      key={act.driver_number}
                      to={`/races/${race.session_key}/drivers/${act.driver_number}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "52px 1fr 100px 140px 32px",
                        alignItems: "center",
                        backgroundColor: "var(--color-surface-1)",
                        borderBottom: "1px solid var(--color-surface-outline)",
                        padding: "var(--space-3) var(--space-4)",
                        textDecoration: "none",
                        transition: "background-color var(--duration-micro) ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-surface-1)";
                      }}
                    >
                      {/* Actual Official Position */}
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: act.dnf
                            ? "var(--color-status-danger)"
                            : act.actual_position <= 3
                            ? "var(--color-accent-orange)"
                            : "var(--color-text-primary)",
                        }}
                      >
                        {act.dnf ? "DNF" : `P${act.actual_position}`}
                      </div>

                      {/* Driver & Team */}
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <div
                          style={{
                            width: "4px",
                            height: "28px",
                            backgroundColor: act.team_colour || "var(--color-accent-red)",
                            borderRadius: "2px",
                          }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-data)",
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {act.name_acronym}
                            </span>
                            <span style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-secondary)" }}>
                              {act.full_name}
                            </span>
                          </div>
                          <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)" }}>
                            {act.team_name}
                          </div>
                        </div>
                      </div>

                      {/* Championship Points */}
                      <div style={{ textAlign: "center" }}>
                        {act.points > 0 ? (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "var(--text-xs)",
                              fontWeight: 700,
                              backgroundColor: "rgba(0, 210, 255, 0.15)",
                              color: "var(--color-accent-teal)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            +{act.points} PTS
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
                            0 pts
                          </span>
                        )}
                      </div>

                      {/* Model Accuracy Comparison */}
                      <div style={{ textAlign: "right" }}>
                        {predMatch ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                              Pred: P{predMatch.predicted_position}
                            </span>
                            {isExact ? (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "var(--color-status-success)",
                                  backgroundColor: "rgba(52, 199, 89, 0.15)",
                                  padding: "1px 6px",
                                  borderRadius: "var(--radius-sm)",
                                }}
                              >
                                EXACT HIT
                              </span>
                            ) : act.delta !== null && act.delta !== undefined ? (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color:
                                    act.delta > 0
                                      ? "var(--color-accent-teal)"
                                      : "var(--color-status-danger)",
                                }}
                              >
                                {act.delta > 0 ? `+${act.delta}` : act.delta} pos vs AI
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>—</span>
                        )}
                      </div>

                      {/* Action Chevron */}
                      <div style={{ textAlign: "right", color: "var(--color-text-muted)" }}>
                        <ChevronRight size={18} />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Stint Strategy Quick Preview */}
          {stintsData && stintsData.stints.length > 0 && (
            <StintTimeline stints={stintsData.stints} drivers={driverDetails} />
          )}
        </div>
      ) : (
        /* Podium Challenge Pick View */
        <div style={{ maxWidth: "700px", margin: "0 auto", width: "100%" }}>
          <PickForm
            sessionKey={race.session_key}
            raceName={race.meeting_name}
            drivers={driverDetails}
            isCompleted={race.status === "completed"}
          />
        </div>
      )}
    </div>
  );
};
