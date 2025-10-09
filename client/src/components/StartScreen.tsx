// We define the "shape" of the props our component expects using a TypeScript interface.
    interface StartScreenProps {
        playlistId: string;
        setPlaylistId: (id: string) => void;
        onStartGame: () => void;
    }
  
  const StartScreen = ({ playlistId, setPlaylistId, onStartGame }: StartScreenProps) => {
    return (
      <div>
        <h2>Enter a Spotify Playlist ID to Begin</h2>
        <input 
          type="text" 
          placeholder="e.g., 37i9dQZF1DXcBWIGoYBM5M"
          className="start-screen-input"
          value={playlistId} // The input's value is now controlled by the state from App.tsx
          onChange={(e) => setPlaylistId(e.target.value)} // When the user types, we call the function from App.tsx to update the state
        />
        <button 
          className="start-screen-button"
          onClick={onStartGame} // When the button is clicked, we call the function from App.tsx
        >
          Start Game
        </button>
      </div>
    );
  };
  
  export default StartScreen;