import { useState } from "react";
import axios from "axios";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";
import type { Track } from "./types";
import "./App.css";

function App() {
  const [view, setView] = useState<"start" | "game">("start");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistId, setPlaylistId] = useState<string>("");
  const [playlistTitle, setPlaylistTitle] = useState<string>("Custom Playlist");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const handleStartGame = async (overrideId?: string, overrideTitle?: string) => {
    const targetId = overrideId || playlistId;
    if (!targetId.trim()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Fetching session for playlist:", targetId);
      const response = await axios.post("http://localhost:3000/api/game-session", {
        playlistId: targetId,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("No tracks returned for this playlist.");
      }

      setTracks(response.data);
      setPlaylistTitle(overrideTitle || "Custom Playlist");
      setView("game");
    } catch (error: any) {
      console.error("Error starting game session:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load playlist. Make sure the server is running and the Spotify link/ID is public."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStats = (isWin: boolean) => {
    if (isWin) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleResetToStart = () => {
    setView("start");
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {view === "start" && (
          <StartScreen
            playlistId={playlistId}
            setPlaylistId={setPlaylistId}
            onStartGame={handleStartGame}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {view === "game" && (
          <GameScreen
            tracks={tracks}
            playlistTitle={playlistTitle}
            onResetToStart={handleResetToStart}
            score={score}
            streak={streak}
            onUpdateStats={handleUpdateStats}
          />
        )}
      </main>

      <footer className="footer">
        <p>BeatByBeat — Powered by Spotify & Deezer APIs</p>
      </footer>
    </div>
  );
}

export default App;
