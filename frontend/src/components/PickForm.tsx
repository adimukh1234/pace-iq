import React, { useState, useEffect } from "react";
import { Trophy, AlertCircle, CheckCircle, Send, User } from "lucide-react";
import { gameApi } from "../api/client";
import type { PredictionSubmitResponse } from "../types";

interface PickFormProps {
  sessionKey: number;
  raceName: string;
  drivers: {
    driver_number: number;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
  }[];
  isCompleted?: boolean;
  onSuccess?: (submission: PredictionSubmitResponse) => void;
}

export const PickForm: React.FC<PickFormProps> = ({
  sessionKey,
  raceName,
  drivers,
  isCompleted = false,
  onSuccess,
}) => {
  const [username, setUsername] = useState<string>("");
  const [p1, setP1] = useState<number | "">("");
  const [p2, setP2] = useState<number | "">("");
  const [p3, setP3] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<PredictionSubmitResponse | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("paceiq_username");
    if (saved) {
      setUsername(saved);
    } else {
      const generated = `Paddock${Math.floor(1000 + Math.random() * 9000)}`;
      setUsername(generated);
      localStorage.setItem("paceiq_username", generated);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    localStorage.setItem("paceiq_username", val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Please choose a callsign or username.");
      return;
    }

    if (p1 === "" || p2 === "" || p3 === "") {
      setError("Please select all three podium positions (P1, P2, and P3).");
      return;
    }

    if (p1 === p2 || p1 === p3 || p2 === p3) {
      setError("Podium positions must be 3 different drivers. Duplicate drivers are not allowed.");
      return;
    }

    setLoading(true);
    try {
      const resp = await gameApi.submitPrediction({
        username: username.trim(),
        session_key: sessionKey,
        p1: Number(p1),
        p2: Number(p2),
        p3: Number(p3),
      });
      setSubmitted(resp);
      if (onSuccess) {
        onSuccess(resp);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit prediction";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sortedDrivers = [...drivers].sort((a, b) =>
    a.name_acronym.localeCompare(b.name_acronym)
  );

  const getDriverDisplay = (num: number) => {
    const d = drivers.find((x) => x.driver_number === num);
    return d ? `${d.name_acronym} (${d.driver_number})` : `#${num}`;
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        position: "relative",
      }}
    >
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
          <Trophy size={18} color="var(--color-accent-amber)" />
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-lg)",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Predict the Podium
          </h3>
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>
          {raceName} • Locks at official race start. +25 pts for exact finish, +10 pts for podium presence.
        </p>
      </div>

      {isCompleted && (
        <div
          style={{
            backgroundColor: "rgba(225, 6, 0, 0.1)",
            border: "1px solid var(--color-accent-red)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-accent-red)",
            fontSize: "var(--text-xs)",
          }}
        >
          <AlertCircle size={14} />
          <span>This session has concluded. Picks can no longer be submitted for this race.</span>
        </div>
      )}

      {submitted ? (
        <div
          style={{
            backgroundColor: "rgba(57, 181, 74, 0.1)",
            border: "1px solid var(--color-accent-green)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              padding: "var(--space-2)",
              borderRadius: "50%",
              backgroundColor: "rgba(57, 181, 74, 0.2)",
              color: "var(--color-accent-green)",
              marginBottom: "var(--space-2)",
            }}
          >
            <CheckCircle size={28} />
          </div>
          <h4
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-2) 0",
            }}
          >
            Prediction Registered!
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
            Callsign: <strong style={{ color: "var(--color-text-primary)" }}>{submitted.username}</strong>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-4)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
            }}
          >
            <div style={{ color: "var(--color-accent-amber)" }}>
              P1: {getDriverDisplay(submitted.p1)}
            </div>
            <div style={{ color: "var(--color-text-primary)" }}>
              P2: {getDriverDisplay(submitted.p2)}
            </div>
            <div style={{ color: "var(--color-accent-amber)" }}>
              P3: {getDriverDisplay(submitted.p3)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(null)}
            style={{
              padding: "6px 14px",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            Change Prediction
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {error && (
            <div
              style={{
                backgroundColor: "rgba(225, 6, 0, 0.1)",
                border: "1px solid var(--color-accent-red)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-2) var(--space-3)",
                color: "var(--color-accent-red)",
                fontSize: "var(--text-xs)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="pick-username"
              style={{
                display: "block",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
                marginBottom: "4px",
              }}
            >
              YOUR CALLSIGN
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="pick-username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                disabled={isCompleted}
                maxLength={20}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "var(--color-surface-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <User
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                }}
              />
            </div>
          </div>

          {/* Podium Positions Selectors Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            {/* P1 */}
            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--color-accent-amber)",
                  }}
                >
                  P1 WINNER (+25)
                </span>
              </div>
              <select
                value={p1}
                onChange={(e) => setP1(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isCompleted}
                aria-label="P1 Winner prediction"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              >
                <option value="">Select Driver...</option>
                {sortedDrivers.map((d) => (
                  <option key={d.driver_number} value={d.driver_number}>
                    {d.name_acronym} — {d.full_name} ({d.team_name})
                  </option>
                ))}
              </select>
            </div>

            {/* P2 */}
            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                  }}
                >
                  P2 SECOND (+25)
                </span>
              </div>
              <select
                value={p2}
                onChange={(e) => setP2(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isCompleted}
                aria-label="P2 Second prediction"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              >
                <option value="">Select Driver...</option>
                {sortedDrivers.map((d) => (
                  <option key={d.driver_number} value={d.driver_number}>
                    {d.name_acronym} — {d.full_name} ({d.team_name})
                  </option>
                ))}
              </select>
            </div>

            {/* P3 */}
            <div
              style={{
                backgroundColor: "var(--color-surface-subtle)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--color-accent-amber)",
                  }}
                >
                  P3 THIRD (+25)
                </span>
              </div>
              <select
                value={p3}
                onChange={(e) => setP3(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isCompleted}
                aria-label="P3 Third prediction"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              >
                <option value="">Select Driver...</option>
                {sortedDrivers.map((d) => (
                  <option key={d.driver_number} value={d.driver_number}>
                    {d.name_acronym} — {d.full_name} ({d.team_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCompleted || loading}
            style={{
              padding: "10px 16px",
              backgroundColor: isCompleted ? "var(--color-surface-raised)" : "var(--color-accent-red)",
              color: isCompleted ? "var(--color-text-muted)" : "#FFFFFF",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: isCompleted ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              transition: "background-color 0.15s ease",
            }}
          >
            <Send size={14} />
            {loading ? "Submitting..." : "Lock in Prediction"}
          </button>
        </form>
      )}
    </div>
  );
};
