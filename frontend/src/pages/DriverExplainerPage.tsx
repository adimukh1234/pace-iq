import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Activity, Info, Cpu, ChevronRight } from "lucide-react";
import { driversApi } from "../api/client";
import type { DriverExplainResponse } from "../types";
import { ContributionChart } from "../components/ContributionChart";
import { ErrorState } from "../components/States";

export const DriverExplainerPage: React.FC = () => {
  const { sessionKey, driverNumber } = useParams<{ sessionKey: string; driverNumber: string }>();
  const [data, setData] = useState<DriverExplainResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sKey = Number(sessionKey);
  const dNum = Number(driverNumber);

  const loadData = async () => {
    if (!sKey || isNaN(sKey) || !dNum || isNaN(dNum)) {
      setError("Invalid session or driver parameter");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await driversApi.getDriverExplain(sKey, dNum);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load driver explanation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionKey, driverNumber]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div className="skeleton" style={{ height: "40px", width: "180px", borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton" style={{ height: "180px", width: "100%", borderRadius: "var(--radius-lg)" }} />
        <div className="skeleton" style={{ height: "100px", width: "100%", borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ height: "260px", width: "100%", borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || "Driver not found"} onRetry={loadData} />;
  }

  const teamColour = data.team_colour ? `#${data.team_colour}` : "var(--color-accent-red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back Link */}
      <div>
        <Link
          to={`/races/${sKey}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            minHeight: "44px",
            padding: "4px 8px",
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO RACE PREDICTION</span>
        </Link>
      </div>

      {/* Driver Hero Banner */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderLeft: `4px solid ${teamColour}`,
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ghost Number in Background */}
        <div
          style={{
            position: "absolute",
            right: "20px",
            bottom: "-20px",
            fontFamily: "var(--font-heading)",
            fontSize: "160px",
            fontWeight: 900,
            color: "rgba(255, 255, 255, 0.03)",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {data.driver_number}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            position: "relative",
            zIndex: 1,
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
                color: "var(--color-text-muted)",
                marginBottom: "var(--space-2)",
              }}
            >
              <Cpu size={14} color="var(--color-accent-cyan)" />
              <span>DRIVER TELEMETRY ATTRIBUTION</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                color: "var(--color-text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              {data.driver_name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                fontSize: "var(--text-sm)",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
              }}
            >
              <span style={{ color: teamColour, fontWeight: 700 }}>
                {data.team_name}
              </span>
              <span>•</span>
              <span>CAR #{data.driver_number}</span>
            </div>
          </div>

          {/* Predicted Metrics Cards */}
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                textAlign: "center",
                minWidth: "100px",
              }}
            >
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                PROJECTED
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  color: data.predicted_position <= 3 ? "var(--color-accent-amber)" : "var(--color-text-primary)",
                }}
              >
                P{data.predicted_position}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                textAlign: "center",
                minWidth: "100px",
              }}
            >
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                PODIUM PROB
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  color: "var(--color-accent-green)",
                }}
              >
                {Math.round(data.podium_probability * 100)}%
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                textAlign: "center",
                minWidth: "100px",
              }}
            >
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                GRID BASELINE
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                }}
              >
                P{data.base_value.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plain-English Summary Callout */}
      <div
        style={{
          backgroundColor: "rgba(0, 210, 255, 0.05)",
          border: "1px solid rgba(0, 210, 255, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-3)",
        }}
      >
        <Info size={18} color="var(--color-accent-cyan)" style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          <h4
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-accent-cyan)",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
              letterSpacing: "0.05em",
            }}
          >
            Model Synthesis
          </h4>
          <p
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: 1.5,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {data.summary}
          </p>
        </div>
      </div>

      {/* Feature Attribution Bar Chart */}
      <ContributionChart
        positive={data.positive}
        negative={data.negative}
        baseValue={data.base_value}
        prediction={data.prediction}
      />

      {/* Pre-Race Data Transparency Section */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-primary)",
              margin: "0 0 4px 0",
            }}
          >
            Strict Pre-Race Integrity Notice
          </h4>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-secondary)",
              margin: 0,
              maxWidth: "650px",
              lineHeight: 1.5,
            }}
          >
            All feature inputs are strictly derived from preceding sessions (Qualifying, Practice FP1–FP3)
            and prior championship finishes. In-race laps or pit events from this session are never exposed to the model.
          </p>
        </div>

        <Link
          to={`/races/${sKey}/replay`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
          }}
        >
          <Activity size={14} color="var(--color-accent-red)" />
          <span>Compare Laps in Replay</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
