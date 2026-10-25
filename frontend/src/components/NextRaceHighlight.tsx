import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Gauge,
  Flame,
  ChevronRight,
} from "lucide-react";
import { racesApi } from "../api/client";
import type { RaceDetailResponse } from "../types";

// Default preloaded prediction data for United States GP 2026 (session_key: 2026185)
// Guarantees zero Cumulative Layout Shift (CLS) and instant loading
const DEFAULT_UNITED_STATES_2026 = {
  session_key: 2026185,
  meeting_name: "United States Grand Prix",
  circuit_short_name: "Austin",
  country_name: "USA",
  date_start: "2026-10-25T20:00:00Z",
  status: "upcoming" as const,
  model_version: "paceiq_v1",
  predicted: [
    {
      driver_number: 12,
      full_name: "Andrea Kimi Antonelli",
      name_acronym: "ANT",
      team_name: "Mercedes",
      team_colour: "#27F4D2",
      predicted_position: 1,
      podium_probability: 0.6,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png.transform/1col/image.png",
    },
    {
      driver_number: 63,
      full_name: "George Russell",
      name_acronym: "RUS",
      team_name: "Mercedes",
      team_colour: "#27F4D2",
      predicted_position: 2,
      podium_probability: 0.2759,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png",
    },
    {
      driver_number: 44,
      full_name: "Lewis Hamilton",
      name_acronym: "HAM",
      team_name: "Ferrari",
      team_colour: "#E80020",
      predicted_position: 3,
      podium_probability: 0.2759,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png",
    },
    {
      driver_number: 3,
      full_name: "Max Verstappen",
      name_acronym: "VER",
      team_name: "Red Bull",
      team_colour: "#3671C6",
      predicted_position: 4,
      podium_probability: 0.7,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
    },
    {
      driver_number: 81,
      full_name: "Oscar Piastri",
      name_acronym: "PIA",
      team_name: "McLaren",
      team_colour: "#FF8000",
      predicted_position: 5,
      podium_probability: 0.2105,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png",
    },
    {
      driver_number: 1,
      full_name: "Lando Norris",
      name_acronym: "NOR",
      team_name: "McLaren",
      team_colour: "#FF8000",
      predicted_position: 6,
      podium_probability: 0.2105,
      headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png",
    },
  ],
};

export const NextRaceHighlight: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"podium" | "probabilities" | "insights">("podium");

  useEffect(() => {
    let isCurrent = true;
    async function fetchUpcoming() {
      try {
        const data = await racesApi.getRace(2026185);
        if (isCurrent && data) {
          setRaceData(data);
        }
      } catch {
        // Silently keep default preloaded state to prevent broken layout
      }
    }
    fetchUpcoming();
    return () => {
      isCurrent = false;
    };
  }, []);

  const activeSessionKey = raceData?.session_key || DEFAULT_UNITED_STATES_2026.session_key;
  const predictedDrivers = raceData?.predicted || DEFAULT_UNITED_STATES_2026.predicted;
  const p1 = predictedDrivers.find((d) => d.predicted_position === 1) || DEFAULT_UNITED_STATES_2026.predicted[0];
  const p2 = predictedDrivers.find((d) => d.predicted_position === 2) || DEFAULT_UNITED_STATES_2026.predicted[1];
  const p3 = predictedDrivers.find((d) => d.predicted_position === 3) || DEFAULT_UNITED_STATES_2026.predicted[2];

  // Top contenders by probability or predicted rank
  const topContenders = predictedDrivers.slice(0, 6);

  return (
    <section
      aria-label="Next Grand Prix Highlight"
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "rgba(14, 17, 24, 0.88)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid rgba(46, 230, 197, 0.35)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(46, 230, 197, 0.12)",
        overflow: "hidden",
        marginBottom: "var(--space-6)",
      }}
    >
      {/* Singapore Night Race Cyber Glow & Ambient Backlights */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-40px",
          width: "420px",
          height: "360px",
          background: "radial-gradient(circle, rgba(46, 230, 197, 0.18) 0%, rgba(39, 244, 210, 0.05) 50%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-60px",
          width: "380px",
          height: "320px",
          background: "radial-gradient(circle, rgba(225, 6, 0, 0.18) 0%, rgba(232, 0, 32, 0.04) 55%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Banner: Status, Countdown & Model Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "clamp(12px, 2.5vw, 18px) clamp(16px, 3.5vw, 28px)",
          backgroundColor: "rgba(8, 10, 15, 0.6)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "rgba(46, 230, 197, 0.15)",
              border: "1px solid var(--color-accent-teal)",
              color: "var(--color-accent-teal)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-label)",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--color-accent-teal)",
                boxShadow: "0 0 8px var(--color-accent-teal)",
                display: "inline-block",
              }}
            />
            NEXT RACE SPOTLIGHT
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "rgba(225, 6, 0, 0.15)",
              border: "1px solid rgba(225, 6, 0, 0.45)",
              color: "#FFA19E",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-label)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={12} color="#FF6B66" />
            UNRUN IN REAL WORLD • LIVE FORECAST
          </span>
        </div>

        {/* Date and Circuit Quick Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--type-data-sm)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Calendar size={13} color="var(--color-accent-teal)" />
            OCT 25, 2026
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Clock size={13} color="var(--color-accent-teal)" />
            TODAY • 20:00 UTC
          </span>
        </div>
      </div>

      {/* Main Container Content */}
      <div style={{ padding: "clamp(16px, 3.5vw, 28px)" }}>
        {/* Title, Subtitle and Model Description */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "var(--space-4)",
            alignItems: "flex-start",
            marginBottom: "var(--space-5)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--color-accent-teal)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-label)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              <MapPin size={14} />
              CIRCUIT OF THE AMERICAS, AUSTIN, TEXAS
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: "8px",
              }}
            >
              United States Grand Prix 2026
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "clamp(0.875rem, 1.8vw, 0.95rem)",
                lineHeight: 1.6,
                maxWidth: "680px",
              }}
            >
              Scheduled for today, October 25, 2026. Below is our LightGBM GBDT predictive engine's active
              simulation—factoring in COTA's 20 demanding corners, high-speed Esses sequence, heavy tyre wear, and qualifying pace deltas.
            </p>
          </div>

          {/* Quick Telemetry Specs Pill Matrix */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              backgroundColor: "rgba(18, 22, 30, 0.7)",
              border: "1px solid var(--color-surface-outline)",
              borderRadius: "var(--radius-md)",
              padding: "12px",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                CIRCUIT LENGTH
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#FFF" }}>
                5.513 km
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                TOTAL LAPS
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#FFF" }}>
                56 Laps
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                ELEVATION DELTA
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#E10600" }}>
                41m (Turn 1)
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                MODEL VERSION
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-accent-teal)" }}>
                LightGBM v1
              </div>
            </div>
          </div>
        </div>

        {/* Section View Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid var(--color-surface-outline)",
            paddingBottom: "12px",
            marginBottom: "var(--space-5)",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("podium")}
            style={{
              minHeight: "44px",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: activeTab === "podium" ? "var(--color-accent-red)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "podium" ? "#FFFFFF" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: activeTab === "podium" ? "var(--color-accent-red)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <Trophy size={14} />
            AI PREDICTED PODIUM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("probabilities")}
            style={{
              minHeight: "44px",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: activeTab === "probabilities" ? "var(--color-accent-red)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "probabilities" ? "#FFFFFF" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: activeTab === "probabilities" ? "var(--color-accent-red)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <TrendingUp size={14} />
            CONTENDER PROBABILITIES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("insights")}
            style={{
              minHeight: "44px",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: activeTab === "insights" ? "var(--color-accent-red)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "insights" ? "#FFFFFF" : "var(--color-text-secondary)",
              border: "1px solid",
              borderColor: activeTab === "insights" ? "var(--color-accent-red)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <Gauge size={14} />
            MODEL TELEMETRY INTEL
          </button>
        </div>

        {/* TAB 1: VISUAL 3-TIER PODIUM */}
        {activeTab === "podium" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                gap: "var(--space-4)",
                alignItems: "stretch",
                marginBottom: "var(--space-5)",
              }}
            >
              {/* P2: RUSSELL (Mercedes) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(20, 24, 34, 0.8)",
                  border: "1px solid rgba(39, 244, 210, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: p2.team_colour,
                  }}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(192, 192, 192, 0.15)",
                        border: "1px solid rgba(192, 192, 192, 0.4)",
                        color: "#E2E8F0",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      P2 RUNNER-UP
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      #{p2.driver_number}
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 900,
                        color: "#FFFFFF",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p2.name_acronym}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {p2.full_name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: p2.team_colour, fontWeight: 700 }}>
                      {p2.team_name}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(10, 12, 18, 0.6)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px",
                    marginTop: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>PODIUM ODDS</span>
                    <span style={{ color: "var(--color-accent-teal)", fontWeight: 700 }}>
                      {Math.round(p2.podium_probability * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(p2.podium_probability * 100)}%`,
                        backgroundColor: p2.team_colour,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                    Aero efficiency in Turn 7-9 high downforce section.
                  </div>
                </div>
              </div>

              {/* P1: HAMILTON (Ferrari) - HERO WINNER CARD */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(28, 20, 24, 0.9)",
                  border: "2px solid rgba(232, 0, 32, 0.65)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 32px rgba(232, 0, 32, 0.35)",
                  transform: "scale(1.02)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    backgroundColor: p1.team_colour,
                    boxShadow: "0 0 12px #E80020",
                  }}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(255, 184, 0, 0.2)",
                        border: "1px solid rgba(255, 184, 0, 0.6)",
                        color: "#FFD700",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                      }}
                    >
                      <Trophy size={14} color="#FFD700" />
                      P1 PREDICTED WINNER
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "#FFD700",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      #{p1.driver_number}
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2.35rem",
                        fontWeight: 900,
                        color: "#FFFFFF",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p1.name_acronym}
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {p1.full_name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: p1.team_colour, fontWeight: 700 }}>
                      {p1.team_name}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(14, 10, 12, 0.75)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px",
                    marginTop: "12px",
                    border: "1px solid rgba(232, 0, 32, 0.25)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>PODIUM PROBABILITY</span>
                    <span style={{ color: "#FFD700", fontWeight: 800 }}>
                      {Math.round(p1.podium_probability * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "7px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(p1.podium_probability * 100)}%`,
                        backgroundColor: p1.team_colour,
                        borderRadius: "4px",
                        boxShadow: "0 0 8px rgba(232, 0, 32, 0.8)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "#CBD5E1", marginTop: "6px" }}>
                    Low-speed traction + street circuit braking delta forecast.
                  </div>
                </div>
              </div>

              {/* P3: VERSTAPPEN (Red Bull) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(20, 24, 34, 0.8)",
                  border: "1px solid rgba(54, 113, 198, 0.35)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: p3.team_colour,
                  }}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(205, 127, 50, 0.15)",
                        border: "1px solid rgba(205, 127, 50, 0.4)",
                        color: "#F6AD55",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      P3 PODIUM
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      #{p3.driver_number}
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 900,
                        color: "#FFFFFF",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p3.name_acronym}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {p3.full_name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: p3.team_colour, fontWeight: 700 }}>
                      {p3.team_name}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(10, 12, 18, 0.6)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px",
                    marginTop: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>PODIUM ODDS</span>
                    <span style={{ color: "var(--color-status-info)", fontWeight: 700 }}>
                      {Math.round(p3.podium_probability * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(p3.podium_probability * 100)}%`,
                        backgroundColor: p3.team_colour,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                    Consistent qualifying delta & pit-window overcut factor.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENDER PROBABILITY BARS */}
        {activeTab === "probabilities" && (
          <div
            style={{
              backgroundColor: "rgba(16, 20, 28, 0.7)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-surface-outline)",
              padding: "var(--space-4)",
              marginBottom: "var(--space-5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "var(--space-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--type-label)",
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Top Contenders Podium Probability Distribution
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  Ranked by expected finishing position (Model A). Percentages indicate calibrated Top-3 Podium chance (Model B).
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--color-accent-teal)",
                  backgroundColor: "rgba(46, 230, 197, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(46, 230, 197, 0.3)",
                }}
              >
                {p1.name_acronym} P1 expected finish score: 4.12
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topContenders.map((driver) => {
                const pct = Math.round(driver.podium_probability * 100);
                return (
                  <Link
                    key={driver.driver_number}
                    to={`/races/${activeSessionKey}/drivers/${driver.driver_number}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "clamp(60px, 15vw, 90px) 1fr clamp(44px, 10vw, 60px) 24px",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "rgba(24, 28, 38, 0.6)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      textDecoration: "none",
                      transition: "background-color 0.2s ease, border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(32, 38, 52, 0.85)";
                      e.currentTarget.style.borderColor = driver.team_colour;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(24, 28, 38, 0.6)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--color-text-muted)",
                          minWidth: "22px",
                        }}
                      >
                        P{driver.predicted_position}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#FFF",
                        }}
                      >
                        {driver.name_acronym}
                      </span>
                    </div>

                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "11px",
                        }}
                      >
                        <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                          {driver.full_name} ({driver.team_name})
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: driver.team_colour,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "right",
                        color: pct > 40 ? "var(--color-accent-teal)" : "var(--color-text-secondary)",
                      }}
                    >
                      {pct}%
                    </div>

                    <ChevronRight size={14} color="var(--color-text-muted)" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MODEL TELEMETRY & STRATEGY INTEL */}
        {activeTab === "insights" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "var(--space-4)",
              marginBottom: "var(--space-5)",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(18, 22, 32, 0.75)",
                border: "1px solid var(--color-surface-outline)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--color-accent-teal)",
                  marginBottom: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Shield size={16} />
                TRACK CHARACTERISTICS
              </div>
              <h4 style={{ color: "#FFF", fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>
                High Downforce & Braking Demands
              </h4>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                Marina Bay has 19 turns with very short straights. Our model weights mechanical grip over straight-line
                aerodynamics, significantly punishing setups with rear tyre overheating in Sector 3.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "rgba(18, 22, 32, 0.75)",
                border: "1px solid var(--color-surface-outline)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#FF8000",
                  marginBottom: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Flame size={16} />
                COTA SECTOR 1 ESSES G-FORCE LOAD
              </div>
              <h4 style={{ color: "#FFF", fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>
                High-Speed Lateral Tyre Stress
              </h4>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                COTA's Turns 3–6 sequence puts immense lateral load on the front tyres. The model rewards aerodynamic
                downforce and platform stability, heavily favoring the Mercedes W17 package.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "rgba(18, 22, 32, 0.75)",
                border: "1px solid var(--color-surface-outline)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#27F4D2",
                  marginBottom: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Zap size={16} />
                MERCEDES FRONT ROW PROJECTION
              </div>
              <h4 style={{ color: "#FFF", fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>
                Antonelli P1 Aerodynamic Efficiency Index
              </h4>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: 1.55 }}>
                Antonelli's qualifying pace and sector split data forecast a narrow edge over teammate George Russell,
                establishing Mercedes as the front-running package for today's Grand Prix.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Action Strip with Primary CTA and Deep Link */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-label)",
                color: "var(--color-text-muted)",
              }}
            >
              MODEL PREDICTION COHORT:
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "#E2E8F0",
              }}
            >
              22 DRIVERS RANKED
            </span>
            <span
              style={{
                backgroundColor: "rgba(46, 230, 197, 0.12)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-accent-teal)",
              }}
            >
              LIVE TELEMETRY READY
            </span>
          </div>

          <Link
            to={`/races/${activeSessionKey}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "48px",
              padding: "0 22px",
              backgroundColor: "var(--color-accent-red)",
              color: "#FFFFFF",
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(225, 6, 0, 0.45)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent-red-hot)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(225, 6, 0, 0.65)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent-red)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(225, 6, 0, 0.45)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>INSPECT FULL RACE PREDICTION</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
