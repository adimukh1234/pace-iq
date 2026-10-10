import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Flag, Activity, ArrowUp } from "lucide-react";

export const MobileNavBar: React.FC = () => {
  const location = useLocation();

  // Extract sessionKey if currently viewing a race page
  const match = location.pathname.match(/\/races\/(\d+)/);
  const currentSessionKey = match ? match[1] : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isRacesActive = location.pathname === "/" || location.pathname === "/races";
  const isReplayActive = location.pathname.includes("/replay");

  return (
    <nav
      className="mobile-thumb-bar"
      aria-label="Mobile Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "rgba(10, 11, 14, 0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid var(--color-surface-outline)",
        paddingBottom: "var(--sab)",
        display: "none", // Default hidden, shown via media query in index.css
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "var(--bottom-bar-height)",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "0 var(--space-2)",
        }}
      >
        {/* Calendar / Races Button */}
        <Link
          to="/"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            minWidth: "64px",
            minHeight: "48px",
            padding: "4px 8px",
            color: isRacesActive ? "var(--color-accent-red)" : "var(--color-text-secondary)",
            textDecoration: "none",
            borderRadius: "var(--radius-sm)",
            backgroundColor: isRacesActive ? "rgba(225, 6, 0, 0.12)" : "transparent",
            transition: "all 0.15s ease",
          }}
        >
          <Flag size={18} color={isRacesActive ? "var(--color-accent-red)" : "currentColor"} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            RACES
          </span>
        </Link>

        {/* Current / Replay Shortcut */}
        {currentSessionKey ? (
          <Link
            to={isReplayActive ? `/races/${currentSessionKey}` : `/races/${currentSessionKey}/replay`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              minWidth: "64px",
              minHeight: "48px",
              padding: "4px 8px",
              color: isReplayActive ? "var(--color-accent-teal)" : "var(--color-text-secondary)",
              textDecoration: "none",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isReplayActive ? "rgba(46, 230, 197, 0.12)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >
            <Activity size={18} color={isReplayActive ? "var(--color-accent-teal)" : "currentColor"} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {isReplayActive ? "PREDICTION" : "REPLAY"}
            </span>
          </Link>
        ) : null}

        {/* Quick Scroll To Top */}
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            minWidth: "64px",
            minHeight: "48px",
            padding: "4px 8px",
            color: "var(--color-text-muted)",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)",
            transition: "all 0.15s ease",
          }}
        >
          <ArrowUp size={18} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            TOP
          </span>
        </button>
      </div>
    </nav>
  );
};
