import { useState } from "react";
import "./App.css";
import StartScreen from "./components/StartScreen";
import axios from "axios";

function App() {
  const [view, setView] = useState("start");
  const [tracks, setTracks] = useState([]);

  // 1. Add new state to hold the value from the input box
  const [playlistId, setPlaylistId] = useState("");

  // 2. Add a function to handle the "Start Game" button click
  const handleStartGame = async () => {
    console.log(
      "Attempting to start game session with playlist ID:",
      playlistId
    );

    if (!playlistId) {
      alert("Please enter a Spotify Playlist ID.");
      return;
    }

    try {
      // This is the API call to our backend!
      const response = await axios.post(
        "http://localhost:3000/api/game-session",
        {
          playlistId: playlistId, // We send the playlistId in the request body
        }
      );

      // The backend will send back the list of processed tracks.
      // We save this list in our 'tracks' state.
      console.log("Received tracks from backend:", response.data);
      setTracks(response.data);

      // After successfully getting the tracks, we switch to the 'game' view.
      setView("game");
    } catch (error) {
      console.error("Error starting game session:", error);
      alert(
        "Failed to start game. Please check the playlist ID and make sure your server is running."
      );
    }
  };

  return (
    <div className="App">
      <h1>BeatByBeat Game</h1>

      {view === "start" && (
        // 3. Pass the state and the function down to StartScreen as "props"
        <StartScreen
          playlistId={playlistId}
          setPlaylistId={setPlaylistId}
          onStartGame={handleStartGame}
        />
      )}

      {view === "game" && (
        <div>
          <h2>Game Started!</h2>
          <p>We have {tracks.length} playable tracks.</p>
        </div>
      )}
    </div>
  );
}

export default App;
