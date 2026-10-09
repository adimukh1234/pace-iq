import React from "react";
import { Link } from "react-router-dom";
import { MapPin, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { RaceListItem } from "../types";

export const RaceCard: React.FC<{ race: RaceListItem; roundIndex?: number }> = ({
  race,
}) => {
  const isCompleted = race.status === "completed";

  // Result Badge icon and color
  const renderResultStrip = () => {
    if (!race.result_status) return null;

    let bg = "var(--color-surface-2)";
    let textCol = "var(--color-text-secondary)";
    let Icon = AlertTriangle;

    if (race.result_status === "Podium correct") {
      bg = "rgba(52, 199, 89, 0.15)";
      textCol = "var(--color-status-success)";
      Icon = CheckCircle;
    } else if (race.result_status === "Partially correct") {
      bg = "rgba(255, 184, 0, 0.15)";
      textCol = "var(--color-accent-amber)";
      Icon = AlertTriangle;
    } else if (race.result_status === "Missed") {
      bg = "rgba(255, 69, 58, 0.15)";
      textCol = "var(--color-status-danger)";
      Icon = XCircle;
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          backgroundColor: bg,
          color: textCol,
          padding: "var(--space-1) var(--space-3)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--type-label)",
          fontWeight: 700,
          marginTop: "var(--space-3)",
        }}
      >
        <Icon size={14} />
        <span>{race.result_status}</span>
      </div>
    );
  };

  return (
    <Link
      to={`/races/${race.session_key}`}
      style={{
        display: "block",
        backgroundColor: "var(--color-surface-1)",
        border: "1px solid var(--color-surface-outline)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        textDecoration: "none",
        position: "relative",
        transition: "transform var(--duration-micro) ease, border-color var(--duration-micro) ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-accent-red)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-surface-outline)";
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
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {race.predicted_podium.map((p, idx) => (
                <div
                  key={p.driver_number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-1)",
                    backgroundColor: "var(--color-surface-2)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    borderBottom: `2px solid ${p.team_colour}`,
                  }}
                >
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
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {race.actual_podium.map((a, idx) => {
                const isExactHit = race.predicted_podium?.[idx]?.driver_number === a.driver_number;
                return (
                  <div
                    key={a.driver_number}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
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
