import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Disc, ExternalLink } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export const NavbarMusicPill: React.FC = () => {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    formatTime,
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const scrollToSoundtrack = () => {
    setIsOpen(false);
    const el = document.getElementById("f1-soundtrack");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#f1-soundtrack";
    }
  };

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      {/* Navbar Pill Button */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          height: "36px",
          padding: "4px 10px 4px 6px",
          borderRadius: "var(--radius-full, 9999px)",
          backgroundColor: isPlaying ? "rgba(46, 230, 197, 0.12)" : "rgba(255, 255, 255, 0.04)",
          border: isPlaying ? "1px solid var(--color-accent-teal)" : "1px solid var(--color-surface-outline)",
          transition: "all 0.2s ease",
          boxShadow: isPlaying ? "0 0 16px rgba(46, 230, 197, 0.18)" : "none",
        }}
      >
        {/* Cover Thumbnail with Spinning Vinyl Effect when playing */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open Track Telemetry"
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <img
            src={track.coverUrl}
            alt="F1 Movie Cover"
            width={24}
            height={24}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: isPlaying ? "1px solid var(--color-accent-teal)" : "1px solid rgba(255, 255, 255, 0.2)",
              animation: isPlaying ? "spin 6s linear infinite" : "none",
            }}
          />
        </button>

        {/* Track Title & Artist */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "11px",
              fontWeight: 700,
              color: isPlaying ? "var(--color-accent-teal)" : "var(--color-text-primary)",
              letterSpacing: "0.02em",
              maxWidth: "110px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--color-text-muted)",
              maxWidth: "110px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.artist}
          </div>
        </button>

        {/* Equalizer Bars */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: "2px",
            height: "12px",
            cursor: "pointer",
            padding: "0 2px",
          }}
        >
          <span
            style={{
              width: "2px",
              height: isPlaying ? "10px" : "3px",
              backgroundColor: isPlaying ? "var(--color-accent-teal)" : "rgba(255,255,255,0.2)",
              borderRadius: "1px",
              animation: isPlaying ? "pulse 0.6s ease-in-out infinite alternate" : "none",
            }}
          />
          <span
            style={{
              width: "2px",
              height: isPlaying ? "12px" : "5px",
              backgroundColor: isPlaying ? "var(--color-accent-teal)" : "rgba(255,255,255,0.2)",
              borderRadius: "1px",
              animation: isPlaying ? "pulse 0.8s ease-in-out 0.2s infinite alternate" : "none",
            }}
          />
          <span
            style={{
              width: "2px",
              height: isPlaying ? "8px" : "2px",
              backgroundColor: isPlaying ? "var(--color-accent-teal)" : "rgba(255,255,255,0.2)",
              borderRadius: "1px",
              animation: isPlaying ? "pulse 0.5s ease-in-out 0.4s infinite alternate" : "none",
            }}
          />
        </div>

        {/* Instant Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? "Pause F1 Track" : "Play F1 Track"}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: isPlaying ? "var(--color-accent-teal)" : "rgba(255, 255, 255, 0.12)",
            color: isPlaying ? "#061212" : "var(--color-text-primary)",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.15s ease",
          }}
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={11} fill="currentColor" style={{ marginLeft: "1px" }} />}
        </button>
      </div>

      {/* Floating Spotify / F1 Telemetry Popup Dock */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "320px",
            backgroundColor: "rgba(12, 14, 18, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--color-surface-outline)",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(46, 230, 197, 0.08)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Header Track Info */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <img
              src={track.coverUrl}
              alt="APXGP Cover"
              width={52}
              height={52}
              style={{
                borderRadius: "var(--radius-md)",
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {track.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {track.artist} (feat. {track.featured})
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--color-accent-teal)",
                  marginTop: "2px",
                  letterSpacing: "0.04em",
                }}
              >
                {track.car}
              </div>
            </div>
          </div>

          {/* Scrubber / Throttle Bar */}
          <div>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(pos * duration);
              }}
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "var(--color-accent-teal)",
                  borderRadius: "3px",
                  boxShadow: "0 0 8px var(--color-accent-teal)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-muted)",
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span style={{ color: "var(--color-accent-teal)", opacity: 0.8 }}>OPUS 160K</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "2px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => seekRelative(-10)}
                title="Rewind 10s"
                style={iconBtnStyle}
              >
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#1DB954", // Spotify Brand Green
                  color: "#000",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(29, 185, 84, 0.4)",
                  transition: "transform 0.1s ease",
                }}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: "2px" }} />}
              </button>

              <button
                type="button"
                onClick={() => seekRelative(10)}
                title="Forward 10s"
                style={iconBtnStyle}
              >
                <RotateCw size={14} />
              </button>
            </div>

            {/* Volume Slider & Mute */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                style={iconBtnStyle}
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{
                  width: "56px",
                  accentColor: "var(--color-accent-teal)",
                  cursor: "pointer",
                  height: "4px",
                }}
              />
            </div>
          </div>

          {/* Jump to Sound Lab Button */}
          <button
            type="button"
            onClick={scrollToSoundtrack}
            style={{
              width: "100%",
              padding: "7px 10px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--color-surface-outline)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Disc size={13} color="var(--color-accent-teal)" />
            <span>OPEN FULL F1 RACING MUSIC LAB</span>
            <ExternalLink size={11} style={{ opacity: 0.6 }} />
          </button>
        </div>
      )}
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
