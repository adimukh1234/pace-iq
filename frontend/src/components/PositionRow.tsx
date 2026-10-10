import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { PredictedOrderRow, ActualOrderRow } from "../types";
import { DriverAvatar } from "./DriverAvatar";

export const PositionRow: React.FC<{
  sessionKey: number;
  row: PredictedOrderRow;
  actualRow?: ActualOrderRow | null;
}> = ({ sessionKey, row, actualRow }) => {
  const probPct = Math.round(row.podium_probability * 100);
  const delta = actualRow?.delta;

  const renderDelta = () => {
    if (delta === undefined || delta === null) return null;
    let bg = "var(--color-surface-2)";
    let color = "var(--color-text-secondary)";
    let sign = "";

    if (delta > 0) {
      bg = "rgba(46, 230, 197, 0.15)";
      color = "var(--color-accent-teal)";
      sign = "+";
    } else if (delta < 0) {
      bg = "rgba(255, 69, 58, 0.15)";
      color = "var(--color-status-danger)";
    }

    return (
      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--type-data-sm)",
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
          padding: "2px 8px",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {sign}{delta}
      </span>
    );
  };

  return (
    <Link
      to={`/races/${sessionKey}/drivers/${row.driver_number}`}
      className="position-row-link"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-surface-1)";
      }}
    >
      {/* Position */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
          color:
            row.predicted_position <= 3
              ? "var(--color-accent-orange)"
              : "var(--color-text-primary)",
        }}
      >
        P{row.predicted_position}
      </div>

      {/* Driver & Team */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
        <DriverAvatar
          url={row.headshot_url}
          name={row.name_acronym}
          driverNumber={row.driver_number}
          teamColour={row.team_colour}
          size="md"
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {row.name_acronym}
            </span>
            <span
              style={{
                fontSize: "var(--type-body-sm)",
                color: "var(--color-text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.full_name}
            </span>
          </div>
          <div
            style={{
              fontSize: "var(--type-label)",
              color: "var(--color-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.team_name}
          </div>

          {/* Mobile-Only Podium Probability Indicator */}
          <div
            className="position-row-prob-mobile"
            style={{
              alignItems: "center",
              gap: "6px",
              marginTop: "4px",
              fontSize: "10px",
              fontFamily: "var(--font-data)",
              color: "var(--color-text-muted)",
            }}
          >
            <span>Podium: {probPct}%</span>
            <div
              style={{
                width: "48px",
                height: "4px",
                backgroundColor: "var(--color-surface-2)",
                borderRadius: "var(--radius-pill)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${probPct}%`,
                  height: "100%",
                  backgroundColor: probPct >= 50 ? "var(--color-accent-teal)" : "var(--color-accent-teal-dim)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-Only Podium Probability Bar */}
      <div className="position-row-prob-desktop">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "var(--type-data-sm)",
            fontFamily: "var(--font-data)",
            marginBottom: "4px",
            color: "var(--color-text-secondary)",
          }}
        >
          <span>Podium</span>
          <span>{probPct}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--color-surface-2)",
            borderRadius: "var(--radius-pill)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${probPct}%`,
              height: "100%",
              backgroundColor:
                probPct >= 50
                  ? "var(--color-accent-teal)"
                  : "var(--color-accent-teal-dim)",
              borderRadius: "var(--radius-pill)",
              transition: "width var(--duration-chart) ease",
            }}
          />
        </div>
      </div>

      {/* Actual Result & Delta (if available) */}
      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        {actualRow ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--type-data-sm)", color: "var(--color-text-muted)" }}>
              {actualRow.dnf ? "DNF" : `P${actualRow.actual_position}`}
            </span>
            {renderDelta()}
          </div>
        ) : (
          <span style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)" }}>—</span>
        )}
      </div>

      {/* Action Chevron */}
      <div style={{ textAlign: "right", color: "var(--color-text-muted)" }}>
        <ChevronRight size={18} />
      </div>
    </Link>
  );
};
