import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
  BarChart3,
  Timer,
} from "lucide-react";

interface FeatureWeight {
  id: string;
  name: string;
  category: "Pace" | "Strategy" | "Form" | "Track";
  weight: number; // percentage
  impact: string;
  shapSign: "+" | "-";
  description: string;
  telemetrySource: string;
}

const FEATURE_WEIGHTS: FeatureWeight[] = [
  {
    id: "clean_air_pace",
    name: "Clean-Air Pace Delta",
    category: "Pace",
    weight: 29.4,
    impact: "-1.82s / lap advantage",
    shapSign: "-",
    description: "FP2 and FP3 long-run lap times adjusted for traffic, DRS trains, and tyre age degradation slopes.",
    telemetrySource: "OpenF1 Lap Telemetry & Sector Times",
  },
  {
    id: "quali_delta",
    name: "Qualifying Grid Position & Delta",
    category: "Pace",
    weight: 24.1,
    impact: "+0.85 pos correlation",
    shapSign: "+",
    description: "Strict pre-race grid position and Q3 qualifying delta to pole position. High weight on low-overtake circuits.",
    telemetrySource: "Jolpica Ergast Qualifying Sessions",
  },
  {
    id: "tyre_deg_slope",
    name: "Compound Degradation Coefficient",
    category: "Strategy",
    weight: 18.6,
    impact: "-0.082s wear / lap",
    shapSign: "-",
    description: "Non-linear regression modeling thermal tyre wear rates across Soft, Medium, and Hard compounds under track temperature.",
    telemetrySource: "OpenF1 Stint Intervals & Pirelli Compounds",
  },
  {
    id: "constructor_momentum",
    name: "Constructor Form & Aero Upgrade Index",
    category: "Form",
    weight: 14.8,
    impact: "+1.14 rating index",
    shapSign: "+",
    description: "Exponential moving average of team championship points and aerodynamic package performance over trailing 5 races.",
    telemetrySource: "Historic Constructors Standings",
  },
  {
    id: "pit_loss_delta",
    name: "Pit Loss & Safety Car Sensitivity",
    category: "Track",
    weight: 13.1,
    impact: "+21.4s pit delta box",
    shapSign: "+",
    description: "Circuit pit-lane transit time penalty and historical probability of Full Course Yellow or Safety Car disruptions.",
    telemetrySource: "Circuit Geometry & Historical Race Flags",
  },
];

export const ModelMethodologySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pipeline" | "dual_models" | "features">("pipeline");
  const [selectedFeature, setSelectedFeature] = useState<FeatureWeight>(FEATURE_WEIGHTS[0]);

  return (
    <section
      id="methodology"
      style={{
        marginTop: "var(--space-8)",
        paddingTop: "var(--space-8)",
        borderTop: "1px solid var(--color-surface-outline)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      {/* Header Badge & Title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            alignSelf: "flex-start",
            padding: "4px 12px",
            borderRadius: "999px",
            backgroundColor: "rgba(46, 230, 197, 0.08)",
            border: "1px solid rgba(46, 230, 197, 0.25)",
            color: "var(--color-accent-teal)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <Sparkles size={13} />
          <span>Algorithmic Architecture & Methodology</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 2.5vw, 2.1rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              How PaceIQ Predicts Formula 1
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--type-body-md)",
                maxWidth: "760px",
                marginTop: "6px",
                lineHeight: 1.6,
              }}
            >
              Dual LightGBM gradient-boosted ensembles engineered with strict anti-leakage temporal boundaries,
              isotonic probability calibration, and TreeAttribution SHAP explainability.
            </p>
          </div>

          {/* Quick Metrics Tag */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              backgroundColor: "var(--color-surface-1)",
              border: "1px solid var(--color-surface-outline)",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
            }}
          >
            <div>
              <span style={{ color: "var(--color-text-muted)", display: "block" }}>MODEL ACCURACY</span>
              <span style={{ color: "var(--color-accent-teal)", fontWeight: 700 }}>±1.4 Pos MAE</span>
            </div>
            <div style={{ width: "1px", backgroundColor: "var(--color-surface-outline)" }} />
            <div>
              <span style={{ color: "var(--color-text-muted)", display: "block" }}>PODIUM RECALL</span>
              <span style={{ color: "var(--color-accent-red)", fontWeight: 700 }}>84.2%</span>
            </div>
            <div style={{ width: "1px", backgroundColor: "var(--color-surface-outline)" }} />
            <div>
              <span style={{ color: "var(--color-text-muted)", display: "block" }}>LEAKAGE BOUNDARY</span>
              <span style={{ color: "var(--color-status-success)", fontWeight: 700 }}>100% Strict</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--color-surface-outline)",
          paddingBottom: "12px",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            border: "1px solid",
            backgroundColor: activeTab === "pipeline" ? "rgba(225, 6, 0, 0.15)" : "var(--color-surface-1)",
            borderColor: activeTab === "pipeline" ? "var(--color-accent-red)" : "var(--color-surface-outline)",
            color: activeTab === "pipeline" ? "#FFFFFF" : "var(--color-text-secondary)",
            boxShadow: activeTab === "pipeline" ? "0 0 14px rgba(225, 6, 0, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Database size={15} color={activeTab === "pipeline" ? "var(--color-accent-red)" : "var(--color-text-muted)"} />
          01. ANTI-LEAKAGE PIPELINE
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dual_models")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            border: "1px solid",
            backgroundColor: activeTab === "dual_models" ? "rgba(46, 230, 197, 0.15)" : "var(--color-surface-1)",
            borderColor: activeTab === "dual_models" ? "var(--color-accent-teal)" : "var(--color-surface-outline)",
            color: activeTab === "dual_models" ? "#FFFFFF" : "var(--color-text-secondary)",
            boxShadow: activeTab === "dual_models" ? "0 0 14px rgba(46, 230, 197, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Cpu size={15} color={activeTab === "dual_models" ? "var(--color-accent-teal)" : "var(--color-text-muted)"} />
          02. DUAL LIGHTGBM ENSEMBLE
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
            border: "1px solid",
            backgroundColor: activeTab === "features" ? "rgba(255, 184, 0, 0.15)" : "var(--color-surface-1)",
            borderColor: activeTab === "features" ? "var(--color-accent-amber)" : "var(--color-surface-outline)",
            color: activeTab === "features" ? "#FFFFFF" : "var(--color-text-secondary)",
            boxShadow: activeTab === "features" ? "0 0 14px rgba(255, 184, 0, 0.35)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <BarChart3 size={15} color={activeTab === "features" ? "var(--color-accent-amber)" : "var(--color-text-muted)"} />
          03. SHAP FEATURE WEIGHTS
        </button>
      </div>

      {/* TAB CONTENT 1: Anti-Leakage Data Pipeline */}
      {activeTab === "pipeline" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-5)",
            alignItems: "stretch",
          }}
        >
          {/* Visual Showcase Card with Generated HUD */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--color-surface-outline)",
              backgroundColor: "var(--color-surface-1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "260px", overflow: "hidden" }}>
              <img
                src="/images/ml_telemetry_hud.jpg"
                alt="F1 Telemetry Machine Learning Dashboard"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.9) contrast(1.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(8, 9, 12, 0.95) 0%, rgba(8, 9, 12, 0.2) 60%, transparent 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  display: "flex",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(46, 230, 197, 0.4)",
                    color: "var(--color-accent-teal)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  LIVE TELEMETRY FEED
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(225, 6, 0, 0.8)",
                    color: "#FFFFFF",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  REC
                </span>
              </div>
            </div>

            <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="var(--color-status-success)" />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", margin: 0 }}>
                  Strict Temporal Anti-Leakage
                </h3>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Sports prediction models often cheat accidentally by using during-race data (e.g. fastest race lap or in-race safety cars).
                PaceIQ enforces a mathematical zero-leakage barrier: features are strictly limited to qualifying times, practice long runs,
                and historical track form.
              </p>
            </div>
          </div>

          {/* Pipeline Steps Flow */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              justifyContent: "center",
            }}
          >
            {[
              {
                step: "01",
                title: "Raw Telemetry Ingestion",
                desc: "High-frequency lap timing, compound stints, and sector intervals ingested via OpenF1 and Jolpica API.",
                icon: Database,
                color: "var(--color-accent-teal)",
              },
              {
                step: "02",
                title: "Clean-Air Pace Transformation",
                desc: "Removes dirty air traffic outliers, computes fuel-burn normalization, and fits tyre degradation polynomials.",
                icon: Activity,
                color: "var(--color-accent-red)",
              },
              {
                step: "03",
                title: "Temporal Cut-Off Gate",
                desc: "Strictly timestamps and filters out any data recorded after the green light of Sunday's formation lap.",
                icon: Timer,
                color: "var(--color-accent-amber)",
              },
              {
                step: "04",
                title: "Inference & Pre-Computation",
                desc: "Dual models infer position deltas and outcome probabilities, pre-calculating local SHAP attributions for instant UI display.",
                icon: Cpu,
                color: "var(--color-status-success)",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  backgroundColor: "var(--color-surface-1)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-surface-outline)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${item.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: item.color,
                        fontWeight: 700,
                      }}
                    >
                      STEP {item.step}
                    </span>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", margin: 0 }}>
                      {item.title}
                    </h4>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Dual LightGBM Ensemble Architecture */}
      {activeTab === "dual_models" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {/* Decision Tree Graphic Card */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--color-surface-outline)",
              backgroundColor: "var(--color-surface-1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "260px", overflow: "hidden" }}>
              <img
                src="/images/ml_tree_models.jpg"
                alt="Gradient Boosted Decision Tree and Degradation Curves"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.95)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(8, 9, 12, 0.95) 0%, rgba(8, 9, 12, 0.1) 60%, transparent 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  right: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255, 184, 0, 0.4)",
                    color: "var(--color-accent-amber)",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  LIGHTGBM GRADIENT BOOSTED TREES
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  ISOTONIC CALIBRATION
                </span>
              </div>
            </div>

            <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="var(--color-accent-teal)" />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", margin: 0 }}>
                  Ensemble Architecture Separation
                </h3>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
                Predicting an F1 race is both a continuous regression problem (finishing position 1-20) and a discrete odds challenge
                (win & podium probabilities). A single model underperforms on both. PaceIQ couples specialized regressors with calibrated classifiers.
              </p>
            </div>
          </div>

          {/* Model A vs Model B Comparison Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Model A */}
            <div
              style={{
                backgroundColor: "var(--color-surface-1)",
                border: "1px solid rgba(225, 6, 0, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--color-accent-red)",
                    letterSpacing: "0.06em",
                  }}
                >
                  MODEL A • REGRESSION ENGINE
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(225, 6, 0, 0.15)",
                    color: "var(--color-accent-red)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Target: Expected Finish
                </span>
              </div>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", margin: "4px 0 0 0" }}>
                LightGBM Regressor
              </h4>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)", lineHeight: 1.5 }}>
                Trained on 10+ seasons with objective function optimizing Root Mean Squared Error (RMSE). Predicts the numerical finish position
                (e.g., P2.3) based on historical constructor race craft and clean-air delta.
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "4px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>• Hyperparameters: <code>max_depth=6</code></span>
                <span style={{ color: "var(--color-text-secondary)" }}>• Trees: <code>n_estimators=350</code></span>
              </div>
            </div>

            {/* Model B */}
            <div
              style={{
                backgroundColor: "var(--color-surface-1)",
                border: "1px solid rgba(46, 230, 197, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--color-accent-teal)",
                    letterSpacing: "0.06em",
                  }}
                >
                  MODEL B • PROBABILITY ENGINE
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(46, 230, 197, 0.15)",
                    color: "var(--color-accent-teal)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Target: Win / Podium %
                </span>
              </div>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", margin: "4px 0 0 0" }}>
                Calibrated Classifier + Isotonic Regression
              </h4>
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)", lineHeight: 1.5 }}>
                Standard tree probability scores are overconfident. PaceIQ routes raw log-odds through isotonic calibration curves,
                ensuring a predicted 30% win likelihood actually translates into wins 30% of the time historically.
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "4px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>• Calibration: <code>IsotonicRegression</code></span>
                <span style={{ color: "var(--color-text-secondary)" }}>• Objective: <code>multiclass_logloss</code></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Interactive SHAP Feature Weights Simulator */}
      {activeTab === "features" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {/* Interactive Feature List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              backgroundColor: "var(--color-surface-1)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-surface-outline)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                FEATURE IMPORTANCE BREAKDOWN
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-accent-teal)" }}>
                CLICK TO INSPECT
              </span>
            </div>

            {FEATURE_WEIGHTS.map((feat) => {
              const isSelected = selectedFeature.id === feat.id;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setSelectedFeature(feat)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                    border: "1px solid",
                    borderColor: isSelected ? "var(--color-accent-teal)" : "rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          backgroundColor:
                            feat.category === "Pace"
                              ? "rgba(225, 6, 0, 0.2)"
                              : feat.category === "Strategy"
                              ? "rgba(46, 230, 197, 0.2)"
                              : "rgba(255, 184, 0, 0.2)",
                          color:
                            feat.category === "Pace"
                              ? "var(--color-accent-red)"
                              : feat.category === "Strategy"
                              ? "var(--color-accent-teal)"
                              : "var(--color-accent-amber)",
                        }}
                      >
                        {feat.category}
                      </span>
                      <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                        {feat.name}
                      </span>
                    </div>

                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: "#FFFFFF" }}>
                      {feat.weight}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "5px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${feat.weight * 2.5}%`,
                        height: "100%",
                        backgroundColor: isSelected ? "var(--color-accent-teal)" : "var(--color-accent-red)",
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature Inspector Detail Panel */}
          <div
            style={{
              backgroundColor: "var(--color-surface-1)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-surface-outline)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-accent-teal)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    FEATURE INSPECTOR // SHAP VALUE ATTRIBUTION
                  </span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-heading-lg)", margin: "4px 0 0 0" }}>
                    {selectedFeature.name}
                  </h3>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(46, 230, 197, 0.12)",
                    border: "1px solid var(--color-accent-teal)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    textAlign: "right",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)", display: "block" }}>
                    GLOBAL IMPORTANCE
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-accent-teal)" }}>
                    {selectedFeature.weight}%
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                    MATHEMATICAL DEFINITION & MECHANICS:
                  </span>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", marginTop: "4px", lineHeight: 1.6 }}>
                    {selectedFeature.description}
                  </p>
                </div>

                <div
                  style={{
                    padding: "var(--space-3)",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-surface-outline)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                      PRIMARY SENSOR / TELEMETRY SOURCE:
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-accent-red)" }}>
                      LIVE SYNC
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "#FFFFFF", marginTop: "4px" }}>
                    {selectedFeature.telemetrySource}
                  </p>
                </div>
              </div>
            </div>

            {/* TreeAttribution Additive Callout */}
            <div
              style={{
                borderTop: "1px solid var(--color-surface-outline)",
                paddingTop: "var(--space-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={16} color="var(--color-status-success)" />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                  Signed Contribution: <strong style={{ color: "#FFFFFF" }}>{selectedFeature.impact}</strong>
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                TreeAttributionExplainer compliant
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Explainer Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          padding: "var(--space-4) var(--space-5)",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(90deg, rgba(225, 6, 0, 0.12) 0%, rgba(46, 230, 197, 0.08) 100%)",
          border: "1px solid var(--color-surface-outline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(225, 6, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={20} color="var(--color-accent-red)" />
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", margin: 0 }}>
              Want to see these predictions on individual drivers?
            </h4>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)", margin: "2px 0 0 0" }}>
              Select any Grand Prix above to drill down into driver stint deltas and live SHAP impact cards.
            </p>
          </div>
        </div>

        <a
          href="#races-section"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-surface-outline)",
            color: "#FFFFFF",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>VIEW RACES ABOVE</span>
          <ChevronRight size={14} />
        </a>
      </div>
    </section>
  );
};
