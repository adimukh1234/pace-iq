import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Award,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { RaceDetailResponse } from "../types";

interface RaceStatsVisualizerProps {
  race: RaceDetailResponse;
}

export const RaceStatsVisualizer: React.FC<RaceStatsVisualizerProps> = ({ race }) => {
  const isCompleted = race.status === "completed" && Boolean(race.actual && race.actual.length > 0);
  const [activeTab, setActiveTab] = useState<"podium" | "delta" | "constructors">("podium");

  // Top 10 predicted drivers by podium probability (Rule 42: team colours come from data)
  const podiumProbData = [...race.predicted]
    .sort((a, b) => b.podium_probability - a.podium_probability)
    .slice(0, 10)
    .map((d) => ({
      name: d.name_acronym,
      fullName: d.full_name,
      team: d.team_name,
      colour: d.team_colour || "var(--color-accent-teal)",
      probability: Math.round(d.podium_probability * 100),
      predictedPos: d.predicted_position,
    }));

  // Position Delta Data: Actual vs Predicted (Rule 64: deltas carry a sign and text)
  const deltaData = isCompleted && race.actual
    ? race.actual
        .map((act) => {
          const pred = race.predicted.find((p) => p.driver_number === act.driver_number);
          const delta = act.delta ?? (pred ? pred.predicted_position - act.actual_position : 0);
          return {
            name: act.name_acronym,
            fullName: act.full_name,
            team: act.team_name,
            colour: act.team_colour || "var(--color-accent-red)",
            delta: act.dnf ? 0 : delta,
            actualPos: act.actual_position,
            predictedPos: pred?.predicted_position ?? null,
            dnf: act.dnf,
            points: act.points,
          };
        })
        .sort((a, b) => b.delta - a.delta)
    : [];

  // Constructor Aggregate Data
  const constructorMap = new Map<
    string,
    { name: string; colour: string; points: number; top10Count: number; avgPredPos: number; totalDrivers: number }
  >();

  race.predicted.forEach((d) => {
    const existing = constructorMap.get(d.team_name) || {
      name: d.team_name,
      colour: d.team_colour || "var(--color-text-muted)",
      points: 0,
      top10Count: 0,
      avgPredPos: 0,
      totalDrivers: 0,
    };
    existing.avgPredPos += d.predicted_position;
    existing.totalDrivers += 1;
    if (d.predicted_position <= 10) existing.top10Count += 1;
    constructorMap.set(d.team_name, existing);
  });

  if (isCompleted && race.actual) {
    race.actual.forEach((act) => {
      const existing = constructorMap.get(act.team_name);
      if (existing) {
        existing.points += act.points || 0;
      }
    });
  }

  const constructorData = Array.from(constructorMap.values())
    .map((c) => ({
      ...c,
      avgPredPos: Number((c.avgPredPos / c.totalDrivers).toFixed(1)),
    }))
    .sort((a, b) => (isCompleted ? b.points - a.points : a.avgPredPos - b.avgPredPos));

  // Key KPI Calculations
  const topForecast = race.predicted[0];
  const dnfCount = isCompleted && race.actual ? race.actual.filter((a) => a.dnf).length : 0;
  const totalStarters = race.actual ? race.actual.length : race.predicted.length;
  const finishRate = totalStarters > 0 ? Math.round(((totalStarters - dnfCount) / totalStarters) * 100) : 100;

  const avgVolatility = deltaData.length > 0
    ? (
        deltaData.filter((d) => !d.dnf).reduce((sum, d) => sum + Math.abs(d.delta), 0) /
        Math.max(1, deltaData.filter((d) => !d.dnf).length)
      ).toFixed(1)
    : null;

  return (
    <section
      aria-label="Race Statistics and Visualizations"
      style={{
        backgroundColor: "var(--color-surface-1)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--color-surface-outline)",
        borderRadius: "var(--radius-lg)",
        padding: "clamp(var(--space-3), 3.5vw, var(--space-5))",
        boxShadow: "var(--glass-shadow)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(var(--space-3), 3vw, var(--space-5))",
      }}
    >
      {/* Header & Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          borderBottom: "1px solid var(--color-surface-outline)",
          paddingBottom: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-accent-teal)",
            }}
          >
            <BarChart3 size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--type-body-lg)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "0.02em",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span>RACE TELEMETRY & ANALYTICS</span>
              <span
                style={{
                  fontSize: "var(--type-label)",
                  fontFamily: "var(--font-mono)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-accent-red)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                LIVE METRICS
              </span>
            </div>
            <div
              style={{
                fontSize: "var(--type-label)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-data)",
              }}
            >
              Machine-learning projections and track performance visualizer
            </div>
          </div>
        </div>

        {/* View Switcher Controls (Rule 44: Keyboard operable) */}
        <div
          role="tablist"
          aria-label="Analytics Views"
          style={{
            display: "flex",
            backgroundColor: "var(--color-surface-2)",
            borderRadius: "var(--radius-sm)",
            padding: "4px",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <button
            role="tab"
            aria-selected={activeTab === "podium"}
            type="button"
            onClick={() => setActiveTab("podium")}
            style={{
              minHeight: "44px",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "podium" ? "var(--color-surface-1)" : "transparent",
              color: activeTab === "podium" ? "var(--color-accent-teal)" : "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-label)",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all var(--duration-micro) ease",
            }}
          >
            <Award size={14} />
            <span>PODIUM ODDS</span>
          </button>

          {isCompleted && (
            <button
              role="tab"
              aria-selected={activeTab === "delta"}
              type="button"
              onClick={() => setActiveTab("delta")}
              style={{
                minHeight: "44px",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: activeTab === "delta" ? "var(--color-surface-1)" : "transparent",
                color: activeTab === "delta" ? "var(--color-accent-red)" : "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-label)",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all var(--duration-micro) ease",
              }}
            >
              <Zap size={14} />
              <span>FORECAST VS REALITY</span>
            </button>
          )}

          <button
            role="tab"
            aria-selected={activeTab === "constructors"}
            type="button"
            onClick={() => setActiveTab("constructors")}
            style={{
              minHeight: "44px",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeTab === "constructors" ? "var(--color-surface-1)" : "transparent",
              color: activeTab === "constructors" ? "var(--color-accent-orange)" : "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-label)",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all var(--duration-micro) ease",
            }}
          >
            <Layers size={14} />
            <span>CONSTRUCTORS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="kpi-cards-grid">
        {/* Card 1: Forecast Favorite */}
        <div
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            position: "relative",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "3px",
              height: "100%",
              backgroundColor: topForecast?.team_colour || "var(--color-accent-teal)",
            }}
          />
          <div
            style={{
              fontSize: "var(--type-label)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            FORECAST FAVORITE
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--type-heading-md)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                letterSpacing: "0.02em",
              }}
            >
              {topForecast?.name_acronym || "N/A"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-body-sm)",
                fontWeight: 700,
                color: "var(--color-accent-teal)",
              }}
            >
              {Math.round((topForecast?.podium_probability || 0) * 100)}% PODIUM
            </span>
          </div>
          <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.4 }}>
            {topForecast?.full_name} · {topForecast?.team_name}
          </div>
        </div>

        {/* Card 2: Attrition & Finish Rate */}
        <div
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "var(--type-label)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            <span>GRID ATTRITION</span>
            {isCompleted && (
              <span style={{ color: dnfCount > 0 ? "var(--color-status-danger)" : "var(--color-accent-teal)", fontWeight: 700 }}>
                {dnfCount} DNF
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-heading-md)",
                fontWeight: 800,
                color: isCompleted && dnfCount > 2 ? "var(--color-accent-amber)" : "var(--color-accent-teal)",
              }}
            >
              {finishRate}%
            </span>
            <span style={{ fontSize: "var(--type-label)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
              {totalStarters - dnfCount} / {totalStarters} FINISHED
            </span>
          </div>
          <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.4 }}>
            {isCompleted ? "Full race distance telemetry logged" : "Starting grid positions locked"}
          </div>
        </div>

        {/* Card 3: Model Rank Correlation (Spearman rho) */}
        <div
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "var(--type-label)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            MODEL CORRELATION ρ
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-heading-md)",
                fontWeight: 800,
                color:
                  race.spearman_correlation && race.spearman_correlation >= 0.7
                    ? "var(--color-accent-teal)"
                    : race.spearman_correlation && race.spearman_correlation >= 0.5
                    ? "var(--color-accent-amber)"
                    : "var(--color-text-primary)",
              }}
            >
              {race.spearman_correlation !== null && race.spearman_correlation !== undefined
                ? race.spearman_correlation.toFixed(3)
                : "PRE-RACE"}
            </span>
            <span
              style={{
                fontSize: "var(--type-label)",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              v1.0 ENGINE
            </span>
          </div>
          <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.4 }}>
            {race.spearman_correlation && race.spearman_correlation >= 0.7
              ? "High fidelity predictive match"
              : race.spearman_correlation
              ? "Statistically significant rank order"
              : "Pre-computed LightGBM model"}
          </div>
        </div>

        {/* Card 4: Volatility or Grid Size */}
        <div
          style={{
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "var(--type-label)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {isCompleted ? "GRID VOLATILITY" : "DATA CHANNELS"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--type-heading-md)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              {avgVolatility !== null ? `±${avgVolatility}` : "10 FEATURES"}
            </span>
            <span style={{ fontSize: "var(--type-label)", fontFamily: "var(--font-mono)", color: "var(--color-accent-teal)" }}>
              {isCompleted ? "AVG POS DELTA" : "LEAKAGE-SAFE"}
            </span>
          </div>
          <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-muted)", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.4 }}>
            {isCompleted ? "Mean positional swing across grid" : "Pre-race timing & telemetry factors"}
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "1px solid var(--color-surface-outline)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          minHeight: "310px",
        }}
      >
        {/* Tab 1: Podium Probability */}
        {activeTab === "podium" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "3px",
                    height: "12px",
                    backgroundColor: "var(--color-accent-teal)",
                    transform: "skewX(-20deg)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--type-label)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--color-text-primary)",
                    textTransform: "uppercase",
                  }}
                >
                  TOP 10 PODIUM PROBABILITY FORECAST (%)
                </span>
              </div>
              {/* Rule 41: Visible text summary */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--type-label)",
                  color: "var(--color-text-muted)",
                }}
              >
                Top contender {podiumProbData[0]?.fullName} leads at {podiumProbData[0]?.probability}% probability.
              </span>
            </div>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={podiumProbData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-outline)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as typeof podiumProbData[0];
                        return (
                          <div
                            style={{
                              backgroundColor: "var(--color-surface-2)",
                              backdropFilter: "var(--glass-blur)",
                              border: `1px solid ${data.colour}`,
                              borderRadius: "var(--radius-sm)",
                              padding: "var(--space-2) var(--space-3)",
                              boxShadow: "var(--elevation-2)",
                              maxWidth: "min(280px, 85vw)",
                              pointerEvents: "none",
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
                              <span
                                aria-hidden="true"
                                style={{
                                  display: "inline-block",
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: data.colour,
                                }}
                              />
                              <span style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "var(--type-body-sm)" }}>
                                {data.fullName} ({data.name})
                              </span>
                            </div>
                            <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                              {data.team} · Forecast P{data.predictedPos}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "var(--type-body-md)",
                                fontWeight: 700,
                                color: "var(--color-accent-teal)",
                              }}
                            >
                              {data.probability}% Podium Probability
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="probability"
                    radius={[4, 4, 0, 0]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {podiumProbData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.colour}
                        fillOpacity={index < 3 ? 1 : 0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Forecast vs Reality Position Delta (Completed Races) */}
        {activeTab === "delta" && isCompleted && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "3px",
                    height: "12px",
                    backgroundColor: "var(--color-accent-red)",
                    transform: "skewX(-20deg)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--type-label)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--color-text-primary)",
                    textTransform: "uppercase",
                  }}
                >
                  POSITION DELTA: OVERPERFORMED (+) VS UNDERPERFORMED (−)
                </span>
              </div>
              {/* Rule 41: Visible text summary & Rule 64: text with sign */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--type-label)", color: "var(--color-accent-teal)" }}>
                  <ArrowUpRight size={12} /> Gained vs Model (+)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--type-label)", color: "var(--color-status-danger)" }}>
                  <ArrowDownRight size={12} /> Lost vs Model (−)
                </span>
              </div>
            </div>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deltaData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="16%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-outline)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                  />
                  <ReferenceLine y={0} stroke="var(--color-text-muted)" strokeWidth={1} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as typeof deltaData[0];
                        return (
                          <div
                            style={{
                              backgroundColor: "var(--color-surface-2)",
                              backdropFilter: "var(--glass-blur)",
                              border: `1px solid ${data.delta >= 0 ? "var(--color-accent-teal)" : "var(--color-status-danger)"}`,
                              borderRadius: "var(--radius-sm)",
                              padding: "var(--space-2) var(--space-3)",
                              boxShadow: "var(--elevation-2)",
                              maxWidth: "min(280px, 85vw)",
                              pointerEvents: "none",
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "var(--type-body-sm)", marginBottom: "4px" }}>
                              {data.fullName} ({data.name})
                            </div>
                            <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                              {data.team}
                            </div>
                            <div style={{ display: "flex", gap: "var(--space-3)", fontSize: "var(--type-label)", fontFamily: "var(--font-mono)" }}>
                              <span>Pred: P{data.predictedPos}</span>
                              <span>Actual: {data.dnf ? "DNF" : `P${data.actualPos}`}</span>
                            </div>
                            <div
                              style={{
                                marginTop: "4px",
                                fontFamily: "var(--font-mono)",
                                fontSize: "var(--type-label)",
                                fontWeight: 700,
                                color: data.delta > 0 ? "var(--color-accent-teal)" : data.delta < 0 ? "var(--color-status-danger)" : "var(--color-text-primary)",
                              }}
                            >
                              {data.dnf ? "Did Not Finish (DNF)" : data.delta > 0 ? `+${data.delta} Positions Gained` : data.delta < 0 ? `${data.delta} Positions Lost` : "Exact Match (0)"}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="delta"
                    radius={[4, 4, 4, 4]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {deltaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.dnf
                            ? "var(--color-status-danger)"
                            : entry.delta > 0
                            ? "var(--color-accent-teal)"
                            : entry.delta < 0
                            ? "var(--color-status-danger)"
                            : "var(--color-surface-outline)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Constructors */}
        {activeTab === "constructors" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "3px",
                    height: "12px",
                    backgroundColor: "var(--color-accent-orange)",
                    transform: "skewX(-20deg)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--type-label)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--color-text-primary)",
                    textTransform: "uppercase",
                  }}
                >
                  {isCompleted ? "CONSTRUCTOR CHAMPIONSHIP POINTS EARNED" : "CONSTRUCTOR AVERAGE PREDICTED FINISH (LOWER = BETTER)"}
                </span>
              </div>
              {/* Rule 41: Visible text summary */}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--type-label)",
                  color: "var(--color-text-muted)",
                }}
              >
                Top constructor: {constructorData[0]?.name} ({isCompleted ? `${constructorData[0]?.points} PTS` : `Avg P${constructorData[0]?.avgPredPos}`})
              </span>
            </div>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={constructorData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-outline)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-muted)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                    interval={0}
                    tickFormatter={(val: string) => val.split(" ")[0]}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as typeof constructorData[0];
                        return (
                          <div
                            style={{
                              backgroundColor: "var(--color-surface-2)",
                              backdropFilter: "var(--glass-blur)",
                              border: `1px solid ${data.colour}`,
                              borderRadius: "var(--radius-sm)",
                              padding: "var(--space-2) var(--space-3)",
                              boxShadow: "var(--elevation-2)",
                              maxWidth: "min(280px, 85vw)",
                              pointerEvents: "none",
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "var(--type-body-sm)", marginBottom: "4px" }}>
                              {data.name}
                            </div>
                            <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)" }}>
                              Avg Predicted Finish: P{data.avgPredPos}
                            </div>
                            <div style={{ fontSize: "var(--type-label)", color: "var(--color-text-secondary)" }}>
                              Top 10 Contenders: {data.top10Count} drivers
                            </div>
                            {isCompleted && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "var(--type-body-sm)",
                                  fontWeight: 700,
                                  color: "var(--color-accent-teal)",
                                }}
                              >
                                {data.points} Race Points Scored
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={isCompleted ? "points" : "avgPredPos"}
                    radius={[4, 4, 0, 0]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {constructorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Model Disclaimer (Rule 45) */}
      <div
        style={{
          borderTop: "1px solid var(--color-surface-outline)",
          paddingTop: "var(--space-2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--type-label)",
            color: "var(--color-text-muted)",
          }}
        >
          Model estimate. Not a guarantee.
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--type-label)",
            color: "var(--color-accent-teal)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          PACEIQ v1.0 TELEMETRY ENGINE
        </span>
      </div>
    </section>
  );
};
