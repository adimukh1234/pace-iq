import React, { useEffect, useRef } from "react";

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobileOrSlow, setIsMobileOrSlow] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isMobile = window.innerWidth < 768;
    const navConn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })?.connection;
    const isSlow = Boolean(navConn?.saveData || (navConn?.effectiveType && ["slow-2g", "2g", "3g"].includes(navConn.effectiveType)));
    return isMobile || isSlow;
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const navConn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })?.connection;
      const isSlow = Boolean(navConn?.saveData || (navConn?.effectiveType && ["slow-2g", "2g", "3g"].includes(navConn.effectiveType)));
      setIsMobileOrSlow(isMobile || isSlow);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileOrSlow) return;
    const video = videoRef.current;
    if (!video) return;

    // Strict browser autoplay compliance:
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;

    const playVideo = () => {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.debug("Autoplay waiting for user interaction:", err);
          });
        }
      }
    };

    playVideo();

    const handleCanPlay = () => {
      playVideo();
    };
    video.addEventListener("canplay", handleCanPlay);

    const handleInteraction = () => {
      playVideo();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        playVideo();
      }
    };

    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });
    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("focus", handleInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("focus", handleInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMobileOrSlow]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#08090C",
      }}
    >
      {isMobileOrSlow ? (
        <img
          src="/back_poster.jpg"
          alt=""
          role="presentation"
          loading="eager"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.72) contrast(1.12) saturate(1.22)",
            transform: "scale(1.02)",
          }}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/back_poster.jpg"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.72) contrast(1.12) saturate(1.22)",
            transform: "scale(1.02)",
          }}
        >
          <source src="/back_compressed.mp4" type="video/mp4" />
          <source src="/back.webm" type="video/webm" />
          <source src="/back.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dynamic Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(8, 9, 12, 0.25) 0%, rgba(8, 9, 12, 0.58) 65%, rgba(8, 9, 12, 0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle carbon grid mesh for telemetry aesthetic */}
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
