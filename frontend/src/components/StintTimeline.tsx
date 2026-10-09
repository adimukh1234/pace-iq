import React, { useState } from "react";
import type { StintItem } from "../types";

interface StintTimelineProps {
  stints: StintItem[];
  drivers?: { driver_number: number; name_acronym: string; team_colour?: string; full_name?: string }[];
  totalLaps?: number;
}

const COMPOUND_CONFIG: Record<
  string,
  { label: string; letter: string; colorVar: string; textDark?: boolean }
> = {
  SOFT: { label: "Soft", letter: "S", colorVar: "var(--tyre-soft)", textDark: false },
  MEDIUM: { label: "Medium", letter: "M", colorVar: "var(--tyre-medium)", textDark: true },
  HARD: { label: "Hard", letter: "H", colorVar: "var(--tyre-hard)", textDark: true },
  INTERMEDIATE: { label: "Inter", letter: "I", colorVar: "var(--tyre-inter)", textDark: false },
  WET: { label: "Wet", letter: "W", colorVar: "var(--tyre-wet)", textDark: false },
  UNKNOWN: { label: "Unknown", letter: "?", colorVar: "var(--color-surface-raised)", textDark: false },
};

function getCompoundInfo(compound: string) {
  const norm = (compound || "").toUpperCase();
  return COMPOUND_CONFIG[norm] || {
    label: compound || "Unknown",
    letter: (compound ? compound[0].toUpperCase() : "?"),
    colorVar: "var(--color-surface-raised)",
    textDark: false,
  };
}

export const StintTimeline: React.FC<StintTimelineProps> = ({
  stints,
  drivers = [],
  totalLaps,
}) => {
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  if (!stints || stints.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-6)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          backgroundColor: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--color-border-subtle)",
        }}
      >
        No tyre stint data recorded for this session.
      </div>
    );
  }

  // Calculate max lap across all stints if not provided
  const maxLap = totalLaps || Math.max(...stints.map((s) => s.lap_end || 1), 50);

  // Group stints by driver
  const stintsByDriver = stints.reduce<Record<number, StintItem[]>>((acc, stint) => {
    if (!acc[stint.driver_number]) {
      acc[stint.driver_number] = [];
    }
    acc[stint.driver_number].push(stint);
    return acc;
  }, {});

  // Sort each driver's stints by lap_start
  Object.values(stintsByDriver).forEach((list) => {
    list.sort((a, b) => a.lap_start - b.lap_start);
  });

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--color-border-subtle)",
          paddingBottom: "var(--space-3)",
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Tyre Stint Strategy
          </h4>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Compound usage & lap spans across drivers
          </span>
        </div>

        {/* Legend & Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            {["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"].map((c) => {
              const info = COMPOUND_CONFIG[c];
              return (
                <div
                  key={c}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: info.colorVar,
                      color: info.textDark ? "#0A0B0E" : "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "9px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {info.letter}
                  </span>
                  <span>{info.label}</span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "visual" ? "table" : "visual")}
            style={{
              padding: "4px 10px",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--color-surface-subtle)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            {viewMode === "visual" ? "Table View" : "Visual Timeline"}
          </button>
        </div>
      </div>

      {viewMode === "visual" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {/* Lap Scale Markers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
              gap: "var(--space-3)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div>DRIVER</div>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <span>L1</span>
              <span>L{Math.round(maxLap * 0.25)}</span>
              <span>L{Math.round(maxLap * 0.5)}</span>
              <span>L{Math.round(maxLap * 0.75)}</span>
              <span>L{maxLap}</span>
            </div>
          </div>

          {/* Stint Bars for Each Driver */}
          {Object.entries(stintsByDriver).map(([driverNumStr, driverStints]) => {
            const driverNum = parseInt(driverNumStr, 10);
            const driverInfo = driverMap.get(driverNum);
            const label = driverInfo?.name_acronym || `#${driverNum}`;
            const teamColour = driverInfo?.team_colour ? `#${driverInfo.team_colour}` : "var(--color-text-muted)";

            return (
              <div
                key={driverNum}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr",
                  gap: "var(--space-3)",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: "3px",
                      height: "14px",
                      backgroundColor: teamColour,
                      borderRadius: "1px",
                    }}
                  />
                  <span>{label}</span>
                </div>

                {/* Timeline Bar */}
                <div
                  style={{
                    position: "relative",
                    height: "26px",
                    backgroundColor: "var(--color-surface-subtle)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  {driverStints.map((stint, idx) => {
                    const start = Math.max(1, stint.lap_start);
                    const end = Math.min(maxLap, stint.lap_end || maxLap);
                    const stintLaps = Math.max(1, end - start + 1);
                    const widthPercent = (stintLaps / maxLap) * 100;
                    const info = getCompoundInfo(stint.compound);

                    return (
                      <div
                        key={idx}
                        title={`Stint ${stint.stint_number}: ${info.label} (L${start}–L${end}, age ${stint.tyre_age_at_start}L)`}
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: info.colorVar,
                          color: info.textDark ? "#0A0B0E" : "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0 6px",
                          fontSize: "10px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          borderRight: idx < driverStints.length - 1 ? "2px solid var(--color-background)" : "none",
                          transition: "opacity 0.15s ease",
                          cursor: "default",
                        }}
                      >
                        <span style={{ fontSize: "11px" }}>{info.letter}</span>
                        {widthPercent > 12 && (
                          <span style={{ opacity: 0.85, fontSize: "9px" }}>
                            {stintLaps}L
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Accessible Table Mode */
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 12px" }}>Driver</th>
                <th style={{ padding: "8px 12px" }}>Stint</th>
                <th style={{ padding: "8px 12px" }}>Compound</th>
                <th style={{ padding: "8px 12px" }}>Lap Span</th>
                <th style={{ padding: "8px 12px" }}>Total Laps</th>
                <th style={{ padding: "8px 12px" }}>Tyre Age at Start</th>
              </tr>
            </thead>
            <tbody>
              {stints.map((stint, idx) => {
                const driverInfo = driverMap.get(stint.driver_number);
                const info = getCompoundInfo(stint.compound);
                const lapsCount = (stint.lap_end - stint.lap_start + 1);

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>
                      {driverInfo?.name_acronym || `#${stint.driver_number}`}
                    </td>
                    <td style={{ padding: "8px 12px" }}>#{stint.stint_number}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: info.colorVar,
                          color: info.textDark ? "#0A0B0E" : "#FFFFFF",
                          fontWeight: 700,
                        }}
                      >
                        {info.letter} {info.label}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      L{stint.lap_start} – L{stint.lap_end}
                    </td>
                    <td style={{ padding: "8px 12px" }}>{lapsCount}</td>
                    <td style={{ padding: "8px 12px" }}>{stint.tyre_age_at_start} laps</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
