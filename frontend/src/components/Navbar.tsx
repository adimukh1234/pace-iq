import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flag, Trophy, User, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [username, setUsername] = useState<string>("Fan_1");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("paceiq.username");
    if (saved) {
      setUsername(saved);
      setInputVal(saved);
    } else {
      const defaultName = `Driver_${Math.floor(100 + Math.random() * 900)}`;
      localStorage.setItem("paceiq.username", defaultName);
      setUsername(defaultName);
      setInputVal(defaultName);
    }
  }, []);

  const saveUsername = () => {
    const cleaned = inputVal.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (cleaned.length >= 3 && cleaned.length <= 24) {
      setUsername(cleaned);
      localStorage.setItem("paceiq.username", cleaned);
    }
    setIsEditingUser(false);
  };

  const navItems = [
    { label: "Races", path: "/", icon: Flag },
    { label: "Game", path: "/game", icon: Sparkles },
    { label: "Leaderboard", path: "/game/leaderboard", icon: Trophy },
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
                  ? location.pathname === "/"
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

        {/* User Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {isEditingUser ? (
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                maxLength={24}
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-surface-outline)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-1) var(--space-2)",
                  fontSize: "var(--type-body-md)",
                  fontFamily: "var(--font-data)",
                  outline: "none",
                }}
              />
              <button
                onClick={saveUsername}
                style={{
                  backgroundColor: "var(--color-accent-teal)",
                  color: "var(--color-bg-base)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-1) var(--space-3)",
                  fontSize: "var(--type-label)",
                  fontWeight: 700,
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingUser(true)}
              title="Click to change your username"
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
              <User size={14} color="var(--color-accent-teal)" />
              <span>{username}</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
};
