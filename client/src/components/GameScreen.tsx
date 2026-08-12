import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import type { Track } from "../types";

interface GameScreenProps {
  tracks: Track[];
  playlistTitle?: string;
  onResetToStart: () => void;
  score: number;
  streak: number;
  onUpdateStats: (isWin: boolean) => void;
}

const DURATIONS = [1, 2, 4, 8, 16, 30]; // Snippet unlock thresholds in seconds
const TOTAL_DURATION = 30;

export interface GuessAttempt {
  text: string;
  isSkip: boolean;
  isCorrect?: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
  tracks,
  playlistTitle = "CUSTOM SELECTION",
  onResetToStart,
  score,
  streak,
  onUpdateStats,
}) => {
  // Current track state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState<boolean>(false);

  // Game step & history state
  const [attemptStep, setAttemptStep] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [attempts, setAttempts] = useState<GuessAttempt[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Audio player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Dropdown focus & keyboard nav
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Pick a random track and set up round
  const startNewRound = () => {
    setIsGameOver(false);
    setIsWin(false);
    setAttemptStep(0);
    setAttempts([]);
    setGuess("");
    setStatusMessage("");
    setPreviewUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!tracks || tracks.length === 0) return;

    // Pick a random track
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const selected = tracks[randomIndex];
    setCurrentTrack(selected);
    console.log("🎮 New Round! Target track:", selected.name, "by", selected.artist);
  };

  useEffect(() => {
    startNewRound();
  }, [tracks]);

  // Fetch Deezer preview when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;

    const fetchPreview = async () => {
      setIsFetchingPreview(true);
      setStatusMessage("FETCHING AUDIO SAMPLE...");

      try {
        const response = await axios.post("http://localhost:3000/api/preview", {
          trackName: currentTrack.name,
          artistName: currentTrack.artist,
        });

        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
          setStatusMessage("");
        } else {
          throw new Error("No preview URL returned");
        }
      } catch (err) {
        console.warn("Could not find preview for:", currentTrack.name, err);
        setStatusMessage("ERR: PREVIEW NOT FOUND. SKIPPING TO NEXT TRACK...");
        setTimeout(() => {
          startNewRound();
        }, 2000);
      } finally {
        setIsFetchingPreview(false);
      }
    };

    fetchPreview();
  }, [currentTrack]);

  // Handle precise audio playback & stopping at step limit
  const maxAllowedTime = isGameOver ? TOTAL_DURATION : DURATIONS[attemptStep];

  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setCurrentTime(audio.currentTime);

      if (audio.currentTime >= maxAllowedTime) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      audio.currentTime = 0;
      setCurrentTime(0);
      audio.play().then(() => {
        setIsPlaying(true);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  // Autocomplete filtering
  const filteredSuggestions = tracks.filter((t) => {
    if (!guess.trim()) return false;
    const query = guess.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    );
  }).slice(0, 6);

  const normalizeStr = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\(.*\)/g, "") // remove parenthetical info e.g. (Remastered)
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const handleGuessSubmit = (guessedName: string) => {
    if (!currentTrack || isGameOver || !guessedName.trim()) return;

    const isCorrect =
      normalizeStr(guessedName) === normalizeStr(currentTrack.name) ||
      guessedName.toLowerCase().trim() === currentTrack.name.toLowerCase().trim();

    const newAttempts = [...attempts, { text: guessedName, isSkip: false, isCorrect }];
    setAttempts(newAttempts);
    setGuess("");
    setShowDropdown(false);

    if (isCorrect) {
      // WIN
      setIsGameOver(true);
      setIsWin(true);
      setStatusMessage("SUCCESS: TRACK IDENTIFIED CORRECTLY.");
      onUpdateStats(true);
      // Play full audio
      if (audioRef.current && previewUrl) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // WRONG
      if (attemptStep < DURATIONS.length - 1) {
        setAttemptStep((prev) => prev + 1);
        setStatusMessage("INCORRECT GUESS. EXTENDED TIME UNLOCKED.");
      } else {
        // FAIL (Ran out of attempts)
        setIsGameOver(true);
        setIsWin(false);
        setStatusMessage(`ROUND END: ${currentTrack.name.toUpperCase()} — ${currentTrack.artist.toUpperCase()}`);
        onUpdateStats(false);
      }
    }
  };

  const handleSkip = () => {
    if (!currentTrack || isGameOver) return;

    const newAttempts = [...attempts, { text: "SKIPPED", isSkip: true }];
    setAttempts(newAttempts);
    setGuess("");
    setShowDropdown(false);

    if (attemptStep < DURATIONS.length - 1) {
      setAttemptStep((prev) => prev + 1);
      setStatusMessage("SKIPPED. EXTENDED TIME UNLOCKED.");
    } else {
      // Out of attempts
      setIsGameOver(true);
      setIsWin(false);
      setStatusMessage(`ROUND END: ${currentTrack.name.toUpperCase()} — ${currentTrack.artist.toUpperCase()}`);
      onUpdateStats(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleGuessSubmit(filteredSuggestions[selectedIndex].name);
        } else {
          handleGuessSubmit(guess);
        }
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleGuessSubmit(guess);
    }
  };

  return (
    <div className="game-screen">
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        src={previewUrl || ""}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Header bar with stats */}
      <div className="game-header">
        <button onClick={onResetToStart} className="btn-secondary back-btn font-mono">
          ← LISTS
        </button>
        <div className="playlist-title-badge font-mono">
          SELECTION: {playlistTitle.toUpperCase()}
        </div>
        <div className="stats-badges font-mono">
          <span className="stat-pill">SCORE: <strong>{String(score).padStart(2, '0')}</strong></span>
          <span className="stat-pill streak-pill">STREAK: <strong>{String(streak).padStart(2, '0')}</strong></span>
        </div>
      </div>

      {/* Audio Player Card */}
      <div className="audio-player-card panel-surface">
        <div className="visualizer-container">
          <div className={`visualizer-bars ${isPlaying ? "animating" : ""}`}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <button
            className={`play-btn ${isPlaying ? "playing" : ""}`}
            onClick={handleTogglePlay}
            disabled={!previewUrl || isFetchingPreview}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isFetchingPreview ? (
              <span className="spinner"></span>
            ) : isPlaying ? (
              "❚❚"
            ) : (
              "►"
            )}
          </button>
        </div>

        <div className="duration-info font-mono">
          <span>{isPlaying ? `${currentTime.toFixed(1)}s` : "0.0s"}</span>
          <span className="unlocked-tag">
            UNLOCKED: {isGameOver ? "30.0s [MAX]" : `${DURATIONS[attemptStep]}.0s`}
          </span>
        </div>

        {/* 6 Segment timeline bar */}
        <div className="timeline-bar">
          {DURATIONS.map((dur, index) => {
            const isUnlocked = isGameOver || index <= attemptStep;
            const isCurrent = !isGameOver && index === attemptStep;
            return (
              <div
                key={index}
                className={`timeline-segment ${isUnlocked ? "unlocked" : ""} ${isCurrent ? "current" : ""}`}
                title={`Attempt ${index + 1}: ${dur}s`}
              >
                <span className="segment-label font-mono">{dur}s</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback status message */}
      {statusMessage && (
        <div className={`status-banner font-mono ${isWin ? "win" : isGameOver ? "loss" : ""}`}>
          {statusMessage}
        </div>
      )}

      {/* Attempt History List */}
      <div className="attempts-container">
        {Array.from({ length: 6 }).map((_, index) => {
          const attempt = attempts[index];
          const isCurrentAttempt = index === attemptStep && !isGameOver;
          const formattedNum = String(index + 1).padStart(2, '0');

          return (
            <div
              key={index}
              className={`attempt-box ${
                attempt
                  ? attempt.isCorrect
                    ? "correct"
                    : attempt.isSkip
                    ? "skip"
                    : "wrong"
                  : isCurrentAttempt
                  ? "active"
                  : "empty"
              }`}
            >
              <span className="attempt-number font-mono">{formattedNum}</span>
              <span className="attempt-text font-mono">
                {attempt
                  ? attempt.isCorrect
                    ? `[OK] ${attempt.text}`
                    : attempt.isSkip
                    ? "[SKIP]"
                    : `[X] ${attempt.text}`
                  : isCurrentAttempt
                  ? "[ AWAITING INPUT... ]"
                  : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Guess Input & Controls */}
      {!isGameOver && (
        <div className="guess-controls">
          <div className="search-autocomplete-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="guess-input"
              placeholder="Search track title or artist..."
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                setShowDropdown(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              disabled={isFetchingPreview}
            />

            {showDropdown && filteredSuggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {filteredSuggestions.map((track, idx) => (
                  <li
                    key={track.id + idx}
                    className={`suggestion-item ${idx === selectedIndex ? "selected" : ""}`}
                    onClick={() => handleGuessSubmit(track.name)}
                  >
                    <span className="song-title">{track.name}</span>
                    <span className="artist-name font-mono">— {track.artist}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="action-buttons">
            <button
              className="btn-secondary skip-btn font-mono"
              onClick={handleSkip}
              disabled={isFetchingPreview}
            >
              SKIP (+{DURATIONS[Math.min(attemptStep + 1, 5)] - DURATIONS[attemptStep]}s)
            </button>
            <button
              className="btn-primary submit-btn font-mono"
              onClick={() => handleGuessSubmit(guess)}
              disabled={!guess.trim() || isFetchingPreview}
            >
              SUBMIT GUESS
            </button>
          </div>
        </div>
      )}

      {/* Game Over Reveal Panel */}
      {isGameOver && currentTrack && (
        <div className="reveal-modal panel-surface">
          <div className="reveal-header font-mono">
            <h3>{isWin ? "[ ROUND RESULT: SUCCESS ]" : "[ ROUND RESULT: COMPLETE ]"}</h3>
          </div>
          <div className="reveal-content">
            {currentTrack.albumArt ? (
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.name}
                className="reveal-album-art"
              />
            ) : (
              <div className="reveal-album-placeholder font-mono">[NO ART]</div>
            )}
            <div className="reveal-info">
              <h2 className="reveal-title">{currentTrack.name}</h2>
              <p className="reveal-artist font-mono">ARTIST: {currentTrack.artist}</p>
              
              {currentTrack.spotifyUrl && (
                <a
                  href={currentTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spotify-link-btn font-mono"
                >
                  SPOTIFY TRACK LINK ↗
                </a>
              )}
            </div>
          </div>

          <div className="reveal-actions">
            <button className="btn-primary next-btn font-mono" onClick={startNewRound}>
              NEXT TRACK →
            </button>
            <button className="btn-secondary switch-btn font-mono" onClick={onResetToStart}>
              CHANGE SELECTION
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;