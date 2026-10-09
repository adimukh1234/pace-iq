import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { gameApi } from "../api/client";
import type { ShareCardResponse } from "../types";
import { ShareCard } from "../components/ShareCard";
import { LoadingState, ErrorState } from "../components/States";

export const CardPage: React.FC = () => {
  const { predictionId } = useParams<{ predictionId: string }>();
  const [card, setCard] = useState<ShareCardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pId = Number(predictionId);

  const loadCard = async () => {
    if (!pId || isNaN(pId)) {
      setError("Invalid prediction ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await gameApi.getShareCard(pId);
      setCard(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load prediction card";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, [predictionId]);

  if (loading) {
    return <LoadingState message="Rendering telemetry share card..." />;
  }

  if (error || !card) {
    return <ErrorState message={error || "Card not found"} onRetry={loadCard} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back Link */}
      <div>
        <Link
          to="/game"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>BACK TO PODIUM CHALLENGE</span>
        </Link>
      </div>

      <ShareCard card={card} />
    </div>
  );
};
