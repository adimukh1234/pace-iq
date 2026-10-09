import React, { useState } from "react";
import { Share2, Copy, Check, Trophy, Cpu } from "lucide-react";
import type { ShareCardResponse } from "../types";

interface ShareCardProps {
  card: ShareCardResponse;
}

export const ShareCard: React.FC<ShareCardProps> = ({ card }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    const text = `🏎️ PaceIQ Prediction for ${card.race_name}
User: ${card.username}
Picks: 1. ${card.user_picks[0]?.acronym || "P1"} | 2. ${card.user_picks[1]?.acronym || "P2"} | 3. ${card.user_picks[2]?.acronym || "P3"}
Score: ${card.score} pts
Check it out on PaceIQ: ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-5)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Visual Telemetry Card (Can be screenshotted or shared) */}
      <div
        id="paceiq-share-card"
        style={{
          width: "100%",
          backgroundColor: "#0A0B0E",
          border: "2px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Decorative corner tick */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "32px",
            height: "4px",
            backgroundColor: "var(--color-accent-red)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "32px",
            backgroundColor: "var(--color-accent-red)",
          }}
        />

        {/* Card Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid var(--color-border-subtle)",
            paddingBottom: "var(--space-4)",
            marginBottom: "var(--space-5)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-xs)",
                letterSpacing: "0.15em",
                color: "var(--color-accent-red)",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              <span>PACEIQ</span>
              <span style={{ color: "var(--color-text-muted)" }}>//</span>
              <span style={{ color: "var(--color-text-secondary)" }}>TELEMETRY LAB</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-xl)",
                color: "var(--color-text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              {card.race_name}
            </h2>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              {card.circuit_name} • {card.date ? new Date(card.date).getFullYear() : "2026"}
            </div>
          </div>

          <div
            style={{
              textAlign: "right",
              backgroundColor: "var(--color-surface-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
            }}
          >
            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              TOTAL SCORE
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: card.score > 0 ? "var(--color-accent-green)" : "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {card.score}
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginLeft: "2px" }}>pts</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            PREDICTOR CALLSIGN:{" "}
          </span>
          <strong style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
            {card.username}
          </strong>
        </div>

        {/* Comparison Grid: User Picks vs Model Picks */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-4)",
            marginBottom: "var(--space-5)",
          }}
        >
          {/* User Picks Column */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)",
                borderBottom: "1px solid var(--color-border-subtle)",
                paddingBottom: "4px",
              }}
            >
              <Trophy size={12} color="var(--color-accent-amber)" />
              <span>YOUR PICKS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {card.user_picks.map((pick, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>P{i + 1}</span>
                  <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {pick.acronym || `#${pick.driver_number}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Picks Column */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                color: "var(--color-accent-cyan)",
                marginBottom: "var(--space-3)",
                borderBottom: "1px solid var(--color-border-subtle)",
                paddingBottom: "4px",
              }}
            >
              <Cpu size={12} />
              <span>AI PREDICTOR</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {card.model_picks.map((pick, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>P{i + 1}</span>
                  <span style={{ fontWeight: 700, color: "var(--color-accent-cyan)" }}>
                    {pick.acronym || `#${pick.driver_number}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actual Podium If Available */}
        {card.actual_podium && card.actual_podium.length > 0 && (
          <div
            style={{
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
                marginBottom: "4px",
              }}
            >
              OFFICIAL RACE PODIUM:
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
              }}
            >
              {card.actual_podium.map((p, idx) => (
                <span key={idx} style={{ color: "var(--color-accent-amber)" }}>
                  P{idx + 1}: {p.acronym || `#${p.driver_number}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
            paddingTop: "var(--space-3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "10px",
            color: "var(--color-text-muted)",
          }}
        >
          <span>PaceIQ Telemetry Engine v1.0</span>
          <span>Model estimate. Not a guarantee.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", justifyContent: "center" }}>
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            cursor: "pointer",
          }}
        >
          {copied ? <Check size={14} color="var(--color-accent-green)" /> : <Share2 size={14} />}
          <span>{copied ? "Link Copied!" : "Share Link"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyText}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            cursor: "pointer",
          }}
        >
          <Copy size={14} />
          <span>Copy Summary Text</span>
        </button>
      </div>
    </div>
  );
};
