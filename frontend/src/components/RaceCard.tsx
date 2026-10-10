import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Trophy, Flame, Sparkles, XCircle } from "lucide-react";
import type { RaceListItem } from "../types";
import { DriverAvatar } from "./DriverAvatar";

export const RaceCard: React.FC<{ race: RaceListItem; roundIndex?: number }> = ({
  race,
}) => {
  const isCompleted = race.status === "completed";

  // Result Badge icon and styling (Flashy, celebrating podium hits as wins)
  const renderResultStrip = () => {
    if (!race.result_status && !race.actual_podium) return null;

    // Detect hits from result_status or compute from actual vs predicted podium
    let hits = 0;
    let isExactAll = false;
    const status = race.result_status || "";

    if (status.includes("3/3") || status === "Podium correct") {
      hits = 3;
      isExactAll = status.includes("Exact");
    } else if (status.includes("2/3")) {
      hits = 2;
    } else if (status.includes("1/3")) {
      hits = 1;
    } else if (race.actual_podium && race.predicted_podium) {
      const predNums = race.predicted_podium.map((p) => p.driver_number);
      const actNums = race.actual_podium.map((a) => a.driver_number);
      hits = predNums.filter((n) => actNums.includes(n)).length;
      isExactAll = predNums.length === 3 && predNums.every((n, i) => n === actNums[i]);
    }

    if (hits === 3) {
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.18) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.65)",
            boxShadow: "0 0 14px rgba(16, 185, 129, 0.35)",
            color: "#34D399",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--type-label)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            marginTop: "var(--space-3)",
            width: "fit-content",
          }}
        >
          <Trophy size={14} color="#34D399" />
          <span>{isExactAll ? "3/3 EXACT PODIUM LOCK" : "3/3 PODIUM LOCK"}</span>
        </div>
      );
    }

    if (hits === 2) {
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.24) 0%, rgba(59, 130, 246, 0.2) 100%)",
            border: "1px solid rgba(6, 182, 212, 0.65)",
            boxShadow: "0 0 14px rgba(6, 182, 212, 0.32)",
            color: "#22D3EE",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--type-label)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            marginTop: "var(--space-3)",
            width: "fit-content",
          }}
        >
          <Flame size={14} color="#22D3EE" />
          <span>2/3 PODIUM HIT</span>
        </div>
      );
    }

    if (hits === 1) {
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.6)",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.28)",
            color: "#C084FC",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--type-label)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            marginTop: "var(--space-3)",
            width: "fit-content",
          }}
        >
          <Sparkles size={14} color="#C084FC" />
          <span>1/3 PODIUM HIT</span>
        </div>
      );
    }

    if (race.status === "completed") {
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "var(--color-text-muted)",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--type-label)",
            fontWeight: 700,
            marginTop: "var(--space-3)",
            width: "fit-content",
          }}
        >
          <XCircle size={14} color="var(--color-status-danger)" />
          <span>MISSED</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Link
      to={`/races/${race.session_key}`}
      style={{
        display: "block",
        backgroundColor: "var(--color-surface-1)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--color-surface-outline)",
        borderRadius: "var(--radius-md)",
        padding: "clamp(var(--space-3), 3.5vw, var(--space-5))",
        textDecoration: "none",
        position: "relative",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        transition:
          "transform var(--duration-micro) ease, border-color var(--duration-micro) ease, box-shadow var(--duration-micro) ease, background-color var(--duration-micro) ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(24, 28, 38, 0.94)";
        e.currentTarget.style.borderColor = "var(--color-accent-red)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(225, 6, 0, 0.25)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-surface-1)";
        e.currentTarget.style.borderColor = "var(--color-surface-outline)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top Row: Status Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "var(--space-2)",
        }}
      >
        <span
          style={{
            fontSize: "var(--type-label)",
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: isCompleted
              ? "var(--color-surface-2)"
              : "rgba(225, 6, 0, 0.2)",
            color: isCompleted
              ? "var(--color-text-secondary)"
              : "var(--color-accent-red-hot)",
            border: isCompleted
              ? "1px solid var(--color-surface-outline)"
              : "1px solid var(--color-accent-red)",
          }}
        >
          {isCompleted ? "COMPLETED" : "UPCOMING"}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--type-heading-md)",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-1)",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {race.meeting_name}
      </h3>

      {/* Subtitle: Circuit Location Only */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--type-body-md)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={14} color="var(--color-accent-teal)" />
          {race.circuit_short_name || race.country_name}
        </span>
      </div>

      {/* Predicted & Actual Podiums */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
        {race.predicted_podium && race.predicted_podium.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "var(--type-label)",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "var(--space-1)",
              }}
            >
              Predicted Podium
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {race.predicted_podium.map((p, idx) => (
                <div
                  key={p.driver_number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "var(--color-surface-2)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    borderBottom: `2px solid ${p.team_colour}`,
                  }}
                >
                  <DriverAvatar
                    url={p.headshot_url}
                    name={p.name_acronym}
                    driverNumber={p.driver_number}
                    teamColour={p.team_colour}
                    size="xs"
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "0.75rem",
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
        )}

        {/* Real / Actual Results if completed */}
        {race.actual_podium && race.actual_podium.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "var(--type-label)",
                color: "var(--color-status-success)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "var(--space-1)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Actual Podium (Official)</span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {race.actual_podium.map((a, idx) => {
                const isExactHit = race.predicted_podium?.[idx]?.driver_number === a.driver_number;
                return (
                  <div
                    key={a.driver_number}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: isExactHit
                        ? "rgba(52, 199, 89, 0.12)"
                        : "var(--color-surface-2)",
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: isExactHit
                        ? "1px solid rgba(52, 199, 89, 0.3)"
                        : "1px solid var(--color-surface-outline)",
                      borderBottom: `2px solid ${a.team_colour}`,
                    }}
                  >
                    <DriverAvatar
                      url={a.headshot_url}
                      name={a.name_acronym}
                      driverNumber={a.driver_number}
                      teamColour={a.team_colour}
                      size="xs"
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "0.75rem",
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Result Indicator Strip */}
      {renderResultStrip()}
    </Link>
  );
};
