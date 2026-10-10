import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onExploreRaces?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreRaces }) => {
  const [hoveredCta, setHoveredCta] = useState<boolean>(false);

  const handleExploreClick = () => {
    if (onExploreRaces) {
      onExploreRaces();
    } else {
      const el = document.getElementById("races-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "rgba(16, 18, 24, 0.78)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--color-surface-outline)",
        boxShadow: "var(--glass-shadow)",
        overflow: "hidden",
        marginBottom: "var(--space-6)",
      }}
    >
      {/* Cinematic Red & Dark Tech Atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 18% 28%, rgba(225, 6, 0, 0.28) 0%, rgba(92, 12, 12, 0.18) 42%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Dot-Matrix Pattern in Top Right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "360px",
          height: "240px",
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Giant Ghost Watermark in Background */}
      <div
        style={{
          position: "absolute",
          right: "-30px",
          bottom: "-40px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(12rem, 20vw, 22rem)",
          fontWeight: 900,
          color: "rgba(255, 255, 255, 0.025)",
          letterSpacing: "-0.05em",
          lineHeight: 0.8,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        F1
      </div>

      {/* Main Two-Column Content Grid */}
      <div
        className="hero-grid"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Column: Brand, Value Proposition & Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Pre-header Kicker */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "3px",
                height: "14px",
                backgroundColor: "var(--color-accent-red)",
                transform: "skewX(-20deg)",
                marginRight: "8px",
              }}
            />
            <span>2024–2026 SEASONS · OPENF1 TIMING DATA</span>
          </div>

          {/* PACEIQ Main Wordmark */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.75rem, 5.5vw, 4.4rem)",
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              minHeight: "clamp(2.9rem, 5.8vw, 4.6rem)",
              margin: 0,
              display: "block",
            }}
          >
            <span style={{ color: "#FFFFFF" }}>PACE</span>
            <span
              style={{
                color: "var(--color-accent-teal)",
                textShadow: "0 0 24px rgba(46, 230, 197, 0.45)",
              }}
            >
              IQ
            </span>
          </h1>

          {/* Secondary Tagline */}
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.25rem, 2.2vw, 1.85rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            Predict the podium. Understand the pace.
          </h2>

          {/* Sub-description */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              maxWidth: "520px",
              margin: 0,
            }}
          >
            Race outcome forecasts built from pre-race data, with the factors behind every prediction.
          </p>

          {/* Dual Action Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "var(--space-3)",
              marginTop: "var(--space-2)",
            }}
          >
            <button
              onClick={handleExploreClick}
              onMouseEnter={() => setHoveredCta(true)}
              onMouseLeave={() => setHoveredCta(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 26px",
                backgroundColor:
                  hoveredCta ? "var(--color-accent-red-hot)" : "var(--color-accent-red)",
                color: "#FFFFFF",
                fontFamily: "var(--font-heading)",
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  hoveredCta
                    ? "0 0 24px rgba(225, 6, 0, 0.65)"
                    : "0 4px 18px rgba(225, 6, 0, 0.4)",
                transform: hoveredCta ? "translateY(-1px)" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <span>EXPLORE RACES</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("methodology");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 22px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-heading)",
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-surface-outline)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(46, 230, 197, 0.12)";
                e.currentTarget.style.borderColor = "var(--color-accent-teal)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "var(--color-surface-outline)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <span>ML METHODOLOGY</span>
            </button>
          </div>

          {/* Key Metrics / Stat Counters Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-4)",
              marginTop: "var(--space-5)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid rgba(255, 255, 255, 0.10)",
              maxWidth: "520px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  color: "var(--color-accent-teal)",
                  lineHeight: 1,
                  textShadow: "0 0 16px rgba(46, 230, 197, 0.3)",
                }}
              >
                20
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.06em",
                  marginTop: "6px",
                  lineHeight: 1.3,
                }}
              >
                DRIVERS SCORED PER RACE
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  color: "var(--color-accent-teal)",
                  lineHeight: 1,
                  textShadow: "0 0 16px rgba(46, 230, 197, 0.3)",
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.06em",
                  marginTop: "6px",
                  lineHeight: 1.3,
                }}
              >
                SEASONS ANALYZED (2024–2026)
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  color: "var(--color-accent-teal)",
                  lineHeight: 1,
                  textShadow: "0 0 16px rgba(46, 230, 197, 0.3)",
                }}
              >
                0
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.06em",
                  marginTop: "6px",
                  lineHeight: 1.3,
                }}
              >
                POST-RACE FEATURES USED
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Podium Forecast Card + Circuit Mini-Track */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "460px",
            minHeight: "440px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Podium Forecast Card with Glowing Corner Brackets */}
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "330px",
              boxSizing: "border-box",
              contain: "layout style",
              backgroundColor: "rgba(10, 12, 17, 0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              borderRadius: "var(--radius-md)",
              padding: "clamp(14px, 3.5vw, 22px)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.65)",
            }}
          >
            {/* Tech Corner Brackets */}
            <div
              style={{
                position: "absolute",
                top: "-1px",
                left: "-1px",
                width: "14px",
                height: "14px",
                borderTop: "2px solid var(--color-accent-teal)",
                borderLeft: "2px solid var(--color-accent-teal)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-1px",
                right: "-1px",
                width: "14px",
                height: "14px",
                borderTop: "2px solid var(--color-accent-teal)",
                borderRight: "2px solid var(--color-accent-teal)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: "-1px",
                width: "14px",
                height: "14px",
                borderBottom: "2px solid var(--color-accent-teal)",
                borderLeft: "2px solid var(--color-accent-teal)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                right: "-1px",
                width: "14px",
                height: "14px",
                borderBottom: "2px solid var(--color-accent-teal)",
                borderRight: "2px solid var(--color-accent-teal)",
                pointerEvents: "none",
              }}
            />

            {/* Forecast Card Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "3px",
                    height: "12px",
                    backgroundColor: "var(--color-accent-red)",
                    transform: "skewX(-20deg)",
                    marginRight: "8px",
                  }}
                />
                <span>PODIUM FORECAST</span>
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  paddingLeft: "11px",
                }}
              >
                SAMPLE OUTPUT · ILLUSTRATIVE
              </div>
            </div>

            {/* Forecast Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Driver 1 */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#FFFFFF", fontWeight: 700, width: "12px" }}>1</span>
                    <span style={{ color: "#FFFFFF", fontWeight: 600, letterSpacing: "0.04em" }}>
                      DRIVER A
                    </span>
                  </div>
                  <span
                    style={{
                      color: "var(--color-accent-teal)",
                      fontWeight: 700,
                    }}
                  >
                    71%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "71%",
                      height: "100%",
                      background: "linear-gradient(90deg, #1A8C7A, #2EE6C5)",
                      boxShadow: "0 0 10px rgba(46, 230, 197, 0.5)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>

              {/* Driver 2 */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--color-text-secondary)", fontWeight: 700, width: "12px" }}>
                      2
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: 600, letterSpacing: "0.04em" }}>
                      DRIVER B
                    </span>
                  </div>
                  <span
                    style={{
                      color: "var(--color-accent-teal)",
                      fontWeight: 700,
                    }}
                  >
                    57%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "57%",
                      height: "100%",
                      background: "linear-gradient(90deg, #1A8C7A, #2EE6C5)",
                      boxShadow: "0 0 8px rgba(46, 230, 197, 0.4)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>

              {/* Driver 3 */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--color-text-secondary)", fontWeight: 700, width: "12px" }}>
                      3
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: 600, letterSpacing: "0.04em" }}>
                      DRIVER C
                    </span>
                  </div>
                  <span
                    style={{
                      color: "var(--color-accent-teal)",
                      fontWeight: 700,
                    }}
                  >
                    44%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "44%",
                      height: "100%",
                      background: "linear-gradient(90deg, #1A8C7A, #2EE6C5)",
                      boxShadow: "0 0 8px rgba(46, 230, 197, 0.35)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sparkline Telemetry Wave */}
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                LAP TIME TREND · SAMPLE
              </div>

              {/* Oscillating Telemetry Chart with Safety Car Zone */}
              <div style={{ position: "relative", width: "100%", height: "46px" }}>
                <svg
                  viewBox="0 0 320 46"
                  style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                  {/* Safety Car Window Highlight */}
                  <rect
                    x="110"
                    y="6"
                    width="48"
                    height="34"
                    fill="rgba(255, 128, 0, 0.14)"
                    stroke="rgba(255, 128, 0, 0.35)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    rx="3"
                  />
                  <text
                    x="134"
                    y="18"
                    textAnchor="middle"
                    fill="#FF8000"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    SC
                  </text>

                  {/* Telemetry Wave Path */}
                  <path
                    d="M 0 28 Q 20 22, 40 25 T 80 24 T 110 20 L 120 36 L 140 37 L 158 24 T 190 28 T 225 24 T 260 26 T 290 24 T 320 25"
                    fill="none"
                    stroke="var(--color-accent-teal)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(46, 230, 197, 0.6))",
                    }}
                  />
                </svg>
              </div>

              <div
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  marginTop: "6px",
                }}
              >
                Model estimate. Not a guarantee.
              </div>
            </div>
          </div>

          {/* Stylized Circuit Track Vector (Below Card) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100px",
              marginTop: "8px",
            }}
          >
            <svg
              viewBox="0 0 380 90"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                {/* Pulsing Finish/Speedtrap Radar */}
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E10600" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#E10600" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Main Circuit Path Outline */}
              <path
                d="M 50 68 C 15 62, 10 32, 50 25 C 80 20, 100 12, 140 10 C 180 8, 220 18, 270 28 C 320 40, 360 55, 350 70"
                fill="none"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* High-Speed Teal Sector Curve */}
              <path
                d="M 350 70 C 340 82, 300 84, 250 84 C 190 84, 120 84, 85 82 C 60 80, 50 75, 50 68"
                fill="none"
                stroke="var(--color-accent-teal)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(46, 230, 197, 0.7))",
                }}
              />

              {/* Sector 1 Amber Checkpoint Dot */}
              <circle cx="102" cy="17" r="4.5" fill="#FFB800" />
              <circle
                cx="102"
                cy="17"
                r="7"
                fill="none"
                stroke="#FFB800"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Sector 2 Teal Checkpoint Dot */}
              <circle cx="75" cy="82" r="4.5" fill="var(--color-accent-teal)" />
              <circle
                cx="75"
                cy="82"
                r="7"
                fill="none"
                stroke="var(--color-accent-teal)"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Speed Trap / Finish Line Red Checkpoint with Glowing Ring */}
              <circle cx="350" cy="70" r="10" fill="url(#radarGlow)" opacity="0.6" />
              <circle cx="350" cy="70" r="4.5" fill="var(--color-accent-red)" />
              <circle
                cx="350"
                cy="70"
                r="7.5"
                fill="none"
                stroke="var(--color-accent-red)"
                strokeWidth="1.5"
              />

              {/* Telemetry Version Label */}
              <text
                x="345"
                y="88"
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                letterSpacing="0.06em"
              >
                v1.0
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Hero Section Bottom Attribution Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "10px var(--space-6)",
          backgroundColor: "rgba(10, 12, 17, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "var(--color-text-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          UNOFFICIAL FAN PROJECT · NOT AFFILIATED WITH FORMULA 1 OR ANY TEAM · DATA: OPENF1
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "var(--color-accent-teal)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          CALIBRATED TELEMETRY PIPELINE
        </div>
      </div>
    </section>
  );
};
