import React from "react";

export const VideoBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#08090C",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/back_poster.jpg"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          filter: "brightness(0.38) contrast(1.2) saturate(1.15)",
          transform: "scale(1.02)",
        }}
      >
        <source src="/back.webm" type="video/webm" />
        <source src="/back_compressed.mp4" type="video/mp4" />
        <source src="/back.mp4" type="video/mp4" />
      </video>

      {/* Cyber Vignette & Contrast Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(8, 9, 12, 0.5) 0%, rgba(8, 9, 12, 0.82) 65%, rgba(8, 9, 12, 0.96) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle carbon mesh pattern for high-tech aesthetic */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
