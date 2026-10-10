import React from "react";

export const SkeletonCard: React.FC = () => (
  <div
    style={{
      backgroundColor: "var(--color-surface-1)",
      border: "1px solid var(--color-surface-outline)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-5)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
    }}
  >
    <div className="skeleton" style={{ height: "20px", width: "40%" }} />
    <div className="skeleton" style={{ height: "32px", width: "75%" }} />
    <div className="skeleton" style={{ height: "16px", width: "50%" }} />
    <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
      <div className="skeleton" style={{ height: "28px", width: "60px", borderRadius: "var(--radius-pill)" }} />
      <div className="skeleton" style={{ height: "28px", width: "60px", borderRadius: "var(--radius-pill)" }} />
      <div className="skeleton" style={{ height: "28px", width: "60px", borderRadius: "var(--radius-pill)" }} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <div
    style={{
      backgroundColor: "var(--color-surface-1)",
      border: "1px solid var(--color-surface-outline)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
    }}
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ height: "48px", width: "100%", borderRadius: "var(--radius-sm)" }}
      />
    ))}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div
    style={{
      padding: "var(--space-7) var(--space-5)",
      textAlign: "center",
      maxWidth: "500px",
      margin: "var(--space-6) auto",
    }}
  >
    <div
      style={{
        display: "inline-block",
        width: "36px",
        height: "36px",
        border: "3px solid var(--color-surface-outline)",
        borderTopColor: "var(--color-accent-red)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: "var(--space-4)",
      }}
    />
    <p
      style={{
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        margin: 0,
      }}
    >
      {message}
    </p>
  </div>
);

export const EmptyState: React.FC<{
  title?: string;
  message: string;
  actionLabel?: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title = "No Data Available",
  message,
  actionLabel,
  actionText,
  onAction,
}) => {
  const label = actionLabel || actionText;
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface-1)",
        border: "1px solid var(--color-surface-outline)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-7) var(--space-5)",
        textAlign: "center",
        maxWidth: "500px",
        margin: "var(--space-6) auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
        <span className="slash-marker" style={{ height: "24px", width: "4px" }} />
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", color: "var(--color-text-primary)" }}>
          {title}
        </h3>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--type-body-md)", marginBottom: label ? "var(--space-5)" : 0 }}>
        {message}
      </p>
      {label && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            backgroundColor: "var(--color-surface-2)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-sm)",
            minHeight: "44px",
            padding: "8px 20px",
            fontSize: "var(--type-body-md)",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div
    style={{
      backgroundColor: "var(--color-surface-1)",
      border: "1px solid var(--color-status-danger)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-6)",
      maxWidth: "500px",
      margin: "var(--space-6) auto",
      textAlign: "center",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
      <span className="slash-marker" style={{ backgroundColor: "var(--color-status-danger)" }} />
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--type-heading-md)", color: "var(--color-status-danger)" }}>
        Unable to Load Data
      </h3>
    </div>
    <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--type-body-md)", marginBottom: onRetry ? "var(--space-5)" : 0 }}>
      {message}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        style={{
          backgroundColor: "var(--color-accent-red)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-sm)",
          minHeight: "44px",
          padding: "8px 24px",
          fontSize: "var(--type-body-md)",
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Retry
      </button>
    )}
  </div>
);
