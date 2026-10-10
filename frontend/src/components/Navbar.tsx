import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Flag, Activity } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Races", path: "/", icon: Flag },
  ];

  return (
    <>
      {/* Desktop / Top Nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(10, 11, 14, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-surface-outline)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          padding: "var(--space-3) var(--space-5)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span className="slash-marker" style={{ height: "20px", width: "4px" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                letterSpacing: "0.06em",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              PACE<span style={{ color: "var(--color-accent-teal)" }}>IQ</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginLeft: "var(--space-4)",
            }}
          >
            {navItems.map((item) => {
              const active =
                item.path === "/"
                  ? location.pathname === "/" || location.pathname.startsWith("/races")
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--type-body-md)",
                    fontWeight: 600,
                    color: active
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: active
                      ? "var(--color-surface-2)"
                      : "transparent",
                    borderBottom: active
                      ? "2px solid var(--color-accent-red)"
                      : "2px solid transparent",
                    transition: "all var(--duration-micro) ease",
                  }}
                >
                  <Icon size={16} color={active ? "var(--color-accent-red)" : "currentColor"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live System Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              backgroundColor: "var(--color-surface-1)",
              border: "1px solid var(--color-surface-outline)",
              borderRadius: "var(--radius-pill)",
              padding: "var(--space-1) var(--space-3)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--type-label)",
              fontFamily: "var(--font-data)",
            }}
          >
            <Activity size={14} color="var(--color-accent-teal)" />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent-teal)",
                  boxShadow: "0 0 6px var(--color-accent-teal)",
                }}
              />
              TELEMETRY LIVE
            </span>
          </div>
        </div>
      </header>
    </>
  );
};
