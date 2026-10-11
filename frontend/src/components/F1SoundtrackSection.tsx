import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAudio } from "../context/AudioContext";

export const F1SoundtrackSection: React.FC = () => {
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

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  };

  return (
    <section
      id="f1-soundtrack"
      style={{
        marginTop: "var(--space-8)",
        marginBottom: "var(--space-8)",
        position: "relative",
      }}
    >
      {/* Section Sub-header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "#1DB954", // Spotify Green
              letterSpacing: "0.08em",
              marginBottom: "var(--space-1)",
            }}
          >
            <Radio size={14} className={isPlaying ? "animate-pulse" : ""} />
            <span>F1® SOUNDTRACK LAB • SPOTIFY SPEED EDITION</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)",
              color: "var(--color-text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>APXGP Pitwall Audio Experience</span>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(29, 185, 84, 0.15)",
                color: "#1DB954",
                border: "1px solid rgba(29, 185, 84, 0.3)",
              }}
            >
              320K MASTER AUDIO
            </span>
          </h2>
        </div>

        <a
          href="https://open.spotify.com/search/Don%20Toliver%20Lose%20My%20Mind"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--color-surface-outline)",
            transition: "all 0.15s ease",
          }}
        >
          <span>Listen on Spotify</span>
          <ExternalLink size={12} color="#1DB954" />
        </a>
      </div>

      {/* Main Glassmorphic Racing Cockpit Player Card */}
      <div
        className="corner-brackets"
        style={{
          backgroundColor: "rgba(12, 14, 18, 0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: isPlaying ? "1px solid rgba(46, 230, 197, 0.35)" : "1px solid var(--color-surface-outline)",
          borderRadius: "var(--radius-lg)",
          padding: "clamp(var(--space-4), 3vw, var(--space-6))",
          boxShadow: isPlaying
            ? "0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(46, 230, 197, 0.1)"
            : "0 10px 30px rgba(0, 0, 0, 0.4)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(var(--space-4), 3vw, var(--space-6))",
          alignItems: "center",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Left Column: APXGP Car / Vinyl Display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-4)",
            position: "relative",
          }}
        >
          {/* Vinyl Disc Container with Neon Edge */}
          <div
            style={{
              position: "relative",
              width: "min(240px, 70vw)",
              aspectRatio: "1/1",
              borderRadius: "50%",
              padding: "8px",
              background: "radial-gradient(circle, #1a1e24 0%, #0a0c0f 80%, #000 100%)",
              boxShadow: isPlaying
                ? "0 0 30px rgba(46, 230, 197, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.1)"
                : "0 10px 25px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isPlaying ? "spin 12s linear infinite" : "none",
            }}
          >
            {/* Vinyl Grooves */}
            <div
              style={{
                position: "absolute",
                inset: "16px",
                borderRadius: "50%",
                border: "1px dashed rgba(255, 255, 255, 0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "32px",
                borderRadius: "50%",
                border: "1px dashed rgba(255, 255, 255, 0.05)",
              }}
            />

            {/* Album Cover Art */}
            <img
              src={track.coverUrl}
              alt="F1 The Movie Official Cover"
              width={160}
              height={160}
              style={{
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.8)",
              }}
            />

            {/* Center Spindle Hole */}
            <div
              style={{
                position: "absolute",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#000",
                border: "2px solid var(--color-accent-teal)",
              }}
            />
          </div>

          {/* Equalizer Visualizer Bars */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              height: "24px",
              padding: "4px 14px",
              borderRadius: "var(--radius-full, 9999px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--color-surface-outline)",
            }}
          >
            {[18, 24, 12, 22, 16, 26, 14, 20, 26, 16, 22, 12, 24, 18].map((h, i) => (
              <span
                key={i}
                style={{
                  width: "3px",
                  height: isPlaying ? `${Math.max(4, (h * (0.6 + (i % 3) * 0.2)))}px` : "4px",
                  backgroundColor: i % 2 === 0 ? "var(--color-accent-teal)" : "#1DB954",
                  borderRadius: "2px",
                  transition: "height 0.15s ease",
                  animation: isPlaying
                    ? `pulse 0.${4 + (i % 4)}s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate`
                    : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Track Details, Telemetry Specs, Spotify Cockpit Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Track Meta Header */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-accent-teal)",
                letterSpacing: "0.06em",
                marginBottom: "4px",
              }}
            >
              <Sparkles size={13} />
              <span>{track.album.toUpperCase()}</span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: "var(--color-text-primary)",
                margin: "0 0 6px 0",
                lineHeight: 1.1,
              }}
            >
              {track.title}
            </h3>

            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <strong style={{ color: "var(--color-text-primary)" }}>{track.artist}</strong> feat.{" "}
              <strong style={{ color: "var(--color-accent-amber)" }}>{track.featured}</strong>
            </div>

            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
                marginTop: "4px",
              }}
            >
              {track.movie}
            </div>
          </div>

          {/* Telemetry Technical Specs Bento */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div>
              <div style={specLabelStyle}>RACING TEAM</div>
              <div style={specValueStyle}>APXGP #7 / #9</div>
            </div>
            <div>
              <div style={specLabelStyle}>BPM TEMPO</div>
              <div style={specValueStyle}>135 BPM • FAST</div>
            </div>
            <div>
              <div style={specLabelStyle}>AUDIO ENCODING</div>
              <div style={{ ...specValueStyle, color: "var(--color-accent-teal)" }}>
                Opus 160k (Transparent)
              </div>
            </div>
            <div>
              <div style={specLabelStyle}>KEY / TONALITY</div>
              <div style={specValueStyle}>E Minor</div>
            </div>
          </div>

          {/* F1 Sector Scrubber / Throttle Bar */}
          <div>
            {/* Sector Markers Line */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--color-text-muted)",
                marginBottom: "4px",
              }}
            >
              <span>SECTOR 1 (INTRO)</span>
              <span>SECTOR 2 (DOJA CAT VERSE)</span>
              <span>SECTOR 3 (OUTRO CHORUS)</span>
            </div>

            {/* Interactive Progress Bar */}
            <div
              onClick={handleProgressBarClick}
              title="Click or drag to seek"
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "5px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Sector Divider Ticks */}
              <div
                style={{
                  position: "absolute",
                  left: "33%",
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "66%",
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  zIndex: 2,
                }}
              />

              {/* Progress Fill with Glowing Edge */}
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #1DB954 0%, var(--color-accent-teal) 100%)",
                  borderRadius: "4px",
                  boxShadow: "0 0 12px var(--color-accent-teal)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>

            {/* Timestamps */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>
                {formatTime(currentTime)}
              </span>
              <span style={{ color: "var(--color-accent-teal)" }}>
                {isPlaying ? "STREAMING PROGRESSIVE OPUS" : "READY TO RACE"}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Cockpit Audio Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              paddingTop: "var(--space-2)",
            }}
          >
            {/* Center Controls: Skip Back, Big Play, Skip Forward */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button
                type="button"
                onClick={() => seekRelative(-10)}
                title="Rewind 10 Seconds"
                style={bigIconBtnStyle}
              >
                <RotateCcw size={18} />
              </button>

              {/* Giant Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? "Pause Track" : "Play F1 Soundtrack"}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#1DB954", // Spotify Green
                  color: "#050B08",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: isPlaying
                    ? "0 0 25px rgba(29, 185, 84, 0.7), 0 0 10px rgba(46, 230, 197, 0.5)"
                    : "0 4px 16px rgba(0, 0, 0, 0.5)",
                  transform: isPlaying ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" style={{ marginLeft: "3px" }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => seekRelative(10)}
                title="Skip Ahead 10 Seconds"
                style={bigIconBtnStyle}
              >
                <RotateCw size={18} />
              </button>
            </div>

            {/* Volume Control */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: "6px 12px",
                borderRadius: "var(--radius-full, 9999px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                style={{
                  border: "none",
                  background: "transparent",
                  color: isMuted ? "var(--color-accent-red)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{
                  width: "80px",
                  accentColor: "#1DB954",
                  cursor: "pointer",
                  height: "4px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const specLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "9px",
  color: "var(--color-text-muted)",
  letterSpacing: "0.06em",
  marginBottom: "2px",
};

const specValueStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--color-text-primary)",
};

const bigIconBtnStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "var(--color-text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
