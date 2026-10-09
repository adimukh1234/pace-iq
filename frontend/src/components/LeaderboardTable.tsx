import React from "react";
import { Trophy, Award, Check } from "lucide-react";
import type { LeaderboardEntry } from "../types";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUsername?: string;
  isLoading?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  leaderboard,
  currentUsername,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>
          Loading telemetry standings...
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div
        style={{
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--color-border-subtle)",
        }}
      >
        <Trophy size={32} style={{ opacity: 0.3, marginBottom: "var(--space-2)" }} />
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
          No predictions submitted yet
        </div>
        <p style={{ fontSize: "var(--text-xs)", margin: "4px 0 0 0" }}>
          Be the first to submit a prediction for this session!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "var(--text-sm)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface-subtle)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <th style={{ padding: "12px 16px", width: "70px" }}>Rank</th>
              <th style={{ padding: "12px 16px" }}>Callsign</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Exact (+25)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Podium (+10)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const isMe = currentUsername && entry.username.toLowerCase() === currentUsername.toLowerCase();
              let rankBadgeColor = "var(--color-text-muted)";
              if (entry.rank === 1) rankBadgeColor = "var(--color-accent-amber)";
              else if (entry.rank === 2) rankBadgeColor = "var(--color-text-primary)";
              else if (entry.rank === 3) rankBadgeColor = "#CD7F32";

              return (
                <tr
                  key={`${entry.username}-${entry.rank}`}
                  style={{
                    borderBottom: "1px solid var(--color-border-subtle)",
                    backgroundColor: isMe ? "rgba(225, 6, 0, 0.06)" : "transparent",
                    transition: "background-color 0.1s ease",
                  }}
                >
                  {/* Rank */}
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {entry.rank <= 3 && (
                        <Award size={14} color={rankBadgeColor} />
                      )}
                      <span style={{ color: rankBadgeColor }}>
                        #{entry.rank}
                      </span>
                    </div>
                  </td>

                  {/* Username */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: isMe ? 700 : 500,
                          color: isMe ? "var(--color-accent-red)" : "var(--color-text-primary)",
                        }}
                      >
                        {entry.username}
                      </span>
                      {isMe && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            backgroundColor: "var(--color-accent-red)",
                            color: "#FFFFFF",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: 700,
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Exact picks */}
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      color: entry.exact_picks > 0 ? "var(--color-accent-green)" : "var(--color-text-muted)",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {entry.exact_picks > 0 && <Check size={12} />}
                      <span>{entry.exact_picks}</span>
                    </div>
                  </td>

                  {/* Podium hits */}
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      color: entry.podium_hits > 0 ? "var(--color-accent-amber)" : "var(--color-text-muted)",
                    }}
                  >
                    <span>{entry.podium_hits}</span>
                  </td>

                  {/* Total Points */}
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-base)",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {entry.total_points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
