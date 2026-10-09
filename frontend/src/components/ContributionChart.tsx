import React from "react";
import type { FeatureContribution } from "../types";

export const ContributionChart: React.FC<{
  baseValue: number;
  prediction: number;
  positive: FeatureContribution[];
  negative: FeatureContribution[];
}> = ({ baseValue, prediction, positive, negative }) => {
  const allContribs = [
    ...positive.map((p) => ({ ...p, isPositive: true })),
    ...negative.map((n) => ({ ...n, isPositive: false })),
  ];

  const maxAbs = Math.max(
    ...allContribs.map((c) => Math.abs(c.contribution)),
    1.0
  );

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
          marginBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-surface-outline)",
          paddingBottom: "var(--space-3)",
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
            Feature Contributions (SHAP)
          </h4>
          <p style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)" }}>
            Base grid expectation: {baseValue.toFixed(1)} · Forecast: {prediction.toFixed(1)}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "var(--space-3)", fontSize: "var(--type-label)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "var(--color-accent-teal)",
                borderRadius: "2px",
              }}
            />
            <span style={{ color: "var(--color-text-secondary)" }}>Improves Finish</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "var(--color-accent-red)",
                borderRadius: "2px",
              }}
            />
            <span style={{ color: "var(--color-text-secondary)" }}>Pulls Back</span>
          </span>
        </div>
      </div>

      {/* Bar List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {allContribs.map((c, i) => {
          const widthPct = Math.min(100, (Math.abs(c.contribution) / maxAbs) * 100);
          const featLabel = c.feature.replace(/_/g, " ");

          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--type-label)",
                  fontFamily: "var(--font-data)",
                  marginBottom: "4px",
                }}
              >
                <span style={{ textTransform: "capitalize", color: "var(--color-text-primary)" }}>
                  {featLabel} <span style={{ color: "var(--color-text-muted)" }}>({c.value})</span>
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: c.isPositive
                      ? "var(--color-accent-teal)"
                      : "var(--color-accent-red)",
                  }}
                >
                  {c.contribution > 0 ? `+${c.contribution}` : c.contribution} pos
                </span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "var(--color-surface-2)",
                  borderRadius: "var(--radius-pill)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    backgroundColor: c.isPositive
                      ? "var(--color-accent-teal)"
                      : "var(--color-accent-red)",
                    borderRadius: "var(--radius-pill)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "var(--space-5)",
          fontSize: "var(--type-label)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          borderTop: "1px solid var(--color-surface-outline)",
          paddingTop: "var(--space-3)",
        }}
      >
        Note: Finishing position is inverted (P1 &lt; P20), so negative SHAP values improve forecast position.
      </div>
    </div>
  );
};
