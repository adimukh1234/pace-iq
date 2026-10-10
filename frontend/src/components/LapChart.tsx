import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DriverLapsResponse } from "../types";

const MULTI_SERIES_PALETTE = [
  "#2EE6C5", // Teal
  "#FF3B30", // Red Hot
  "#FFD12B", // Yellow
  "#3671C6", // Blue
  "#A855F7", // Purple
  "#FF8000", // Orange
];

export const LapChart: React.FC<{
  driverLaps: DriverLapsResponse[];
  driverNames?: Record<number, string>;
}> = ({ driverLaps, driverNames = {} }) => {
  const [showTable, setShowTable] = useState(false);

  // Group lap times by lap_number
  const maxLaps = Math.max(
    ...driverLaps.map((d) => (d.laps.length > 0 ? d.laps[d.laps.length - 1].lap_number : 0)),
    1
  );

  const chartData = [];
  for (let lapNum = 1; lapNum <= maxLaps; lapNum++) {
    const point: Record<string, any> = { lap: lapNum };
    for (const d of driverLaps) {
      const match = d.laps.find((l) => l.lap_number === lapNum && !l.is_pit_out_lap);
      if (match && match.lap_duration && match.lap_duration > 50 && match.lap_duration < 150) {
        point[`driver_${d.driver_number}`] = Number(match.lap_duration.toFixed(3));
      }
    }
    chartData.push(point);
  }

  return (
    <div
      className="corner-brackets"
      style={{
        backgroundColor: "var(--color-surface-1)",
        border: "1px solid var(--color-surface-outline)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--type-heading-md)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Lap Time Progression
          </h4>
          <p style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)" }}>
            Clean racing lap times across stint duration (excluding pit in/out)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          style={{
            backgroundColor: "var(--color-surface-2)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-sm)",
            minHeight: "44px",
            padding: "6px 14px",
            fontSize: "var(--type-label)",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showTable ? "View Chart" : "Table View (Accessible)"}
        </button>
      </div>

      {!showTable ? (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="lap"
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
                unit="s"
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: "none", maxWidth: "min(280px, 85vw)" }}
                contentStyle={{
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-surface-outline)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-data)",
                  fontSize: "12px",
                }}
              />
              {driverLaps.map((d, idx) => {
                const color = MULTI_SERIES_PALETTE[idx % MULTI_SERIES_PALETTE.length];
                const dName = driverNames[d.driver_number] || `#${d.driver_number}`;
                return (
                  <Line
                    key={d.driver_number}
                    type="monotone"
                    dataKey={`driver_${d.driver_number}`}
                    name={dName}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-data)",
              fontSize: "var(--type-data-sm)",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-surface-outline)", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>Lap</th>
                {driverLaps.map((d) => (
                  <th key={d.driver_number} style={{ padding: "8px", textAlign: "right" }}>
                    {driverNames[d.driver_number] || `#${d.driver_number}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.slice(0, 50).map((row) => (
                <tr key={row.lap} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "6px 8px" }}>Lap {row.lap}</td>
                  {driverLaps.map((d) => (
                    <td key={d.driver_number} style={{ padding: "6px 8px", textAlign: "right" }}>
                      {row[`driver_${d.driver_number}`] ? `${row[`driver_${d.driver_number}`]}s` : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
