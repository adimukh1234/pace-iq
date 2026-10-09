import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-surface-outline)",
        backgroundColor: "var(--color-bg-base)",
        padding: "var(--space-6) var(--space-5)",
        marginTop: "var(--space-8)",
        color: "var(--color-text-muted)",
        fontSize: "var(--type-label)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span className="slash-marker" style={{ height: "14px", width: "3px" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "0.05em",
            }}
          >
            PACE<span style={{ color: "var(--color-accent-teal)" }}>IQ</span>
          </span>
          <span>· Model estimate. Not a guarantee.</span>
        </div>

        <p style={{ maxWidth: "700px", lineHeight: 1.6 }}>
          Data provided by the{" "}
          <a
            href="https://openf1.org"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--color-accent-teal)", textDecoration: "underline" }}
          >
            OpenF1 API
          </a>
          . PaceIQ is an unofficial fan project and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, Formula One Licensing B.V., or any Formula 1 team.
        </p>

        <p style={{ color: "var(--color-surface-outline)" }}>
          © {new Date().getFullYear()} PaceIQ · All predictions precomputed with LightGBM & SHAP
        </p>
      </div>
    </footer>
  );
};
