import React, { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react";

export interface TrackMetadata {
  title: string;
  artist: string;
  featured: string;
  album: string;
  movie: string;
  year: number;
  bpm: number;
  key: string;
  car: string;
  coverUrl: string;
  sources: { src: string; type: string }[];
}

export const F1_TRACK: TrackMetadata = {
  title: "Lose My Mind",
  artist: "Don Toliver",
  featured: "Doja Cat",
  album: "F1® The Movie (Official Soundtrack)",
  movie: "F1® Directed by Joseph Kosinski (2025)",
  year: 2025,
  bpm: 135,
  key: "E Minor",
  car: "APXGP Team • Sonny Hayes #7",
  coverUrl: "/audio/cover.webp",
  sources: [
    { src: "/audio/lose-my-mind-f1.webm", type: "audio/webm; codecs=opus" },
    { src: "/audio/lose-my-mind-f1.opus", type: "audio/ogg; codecs=opus" },
    { src: "/audio/lose-my-mind-f1.m4a", type: "audio/mp4; codecs=mp4a.40.2" },
    { src: "/audio/lose-my-mind-f1.mp3", type: "audio/mpeg" },
  ],
};

interface AudioContextValue {
  track: TrackMetadata;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  formatTime: (sec: number) => string;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(209.14); // 3:29 default duration
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazy instantiate Audio instance on demand: 0kb transferred during initial page load!
  const getAudio = (): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "none"; // CRITICAL: zero network bandwidth on initial load
      audio.volume = volume;

      F1_TRACK.sources.forEach(({ src, type }) => {
        const sourceEl = document.createElement("source");
        sourceEl.src = src;
        sourceEl.type = type;
        audio.appendChild(sourceEl);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("durationchange", () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("play", () => {
        setIsPlaying(true);
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const togglePlay = async () => {
    const audio = getAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Playback error:", err);
      }
    }
  };

  const seek = (seconds: number) => {
    const audio = getAudio();
    const clamped = Math.max(0, Math.min(seconds, duration));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const seekRelative = (deltaSeconds: number) => {
    const audio = getAudio();
    const target = Math.max(0, Math.min(audio.currentTime + deltaSeconds, duration));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      if (clamped > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec < 0) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Sync background visibility changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AudioContext.Provider
      value={{
        track: F1_TRACK,
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
