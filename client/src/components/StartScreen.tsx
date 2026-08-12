import React from 'react';
import { PRESET_PLAYLISTS } from '../data/presetPlaylists';

interface StartScreenProps {
  playlistId: string;
  setPlaylistId: (id: string) => void;
  onStartGame: (overrideId?: string, playlistTitle?: string) => void;
  isLoading: boolean;
  errorMessage: string;
}

const StartScreen: React.FC<StartScreenProps> = ({
  playlistId,
  setPlaylistId,
  onStartGame,
  isLoading,
  errorMessage,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistId.trim()) {
      onStartGame();
    }
  };

  const handlePresetSelect = (spotifyId: string, title: string) => {
    setPlaylistId(spotifyId);
    onStartGame(spotifyId, title);
  };

  return (
    <div className="start-screen">
      <div className="hero-section">
        <div className="badge-pill">🎧 Musical Guessing Game</div>
        <h1 className="hero-title">
          BeatBy<span className="text-gradient">Beat</span>
        </h1>
        <p className="hero-subtitle">
          Test your music knowledge! Listen to short snippets, guess the song in as few tries as possible, and level up your listening ear.
        </p>
      </div>

      <div className="input-card card-minimal">
        <h3>🔗 Use Any Spotify Playlist or Album</h3>
        <p className="input-desc">Paste any public Spotify link or playlist ID below to generate your custom game:</p>
        
        <form onSubmit={handleSubmit} className="playlist-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
              className="spotify-input"
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              disabled={isLoading}
            />
            {playlistId && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => setPlaylistId('')}
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary start-btn"
            disabled={isLoading || !playlistId.trim()}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Loading Tracks...
              </span>
            ) : (
              "🚀 Start Custom Game"
            )}
          </button>
        </form>

        {errorMessage && <div className="error-alert">⚠️ {errorMessage}</div>}
      </div>

      <div className="divider">
        <span>OR PICK A FEATURED PLAYLIST</span>
      </div>

      <div className="presets-section">
        <h3 className="section-title">✨ Featured Presets</h3>
        <p className="section-subtitle">No link handy? Choose one of our curated playlists to start playing instantly:</p>

        <div className="presets-grid">
          {PRESET_PLAYLISTS.map((preset) => (
            <div
              key={preset.id}
              className="preset-card card-minimal"
              onClick={() => !isLoading && handlePresetSelect(preset.spotifyId, preset.title)}
            >
              <div className="preset-cover-container">
                <img src={preset.coverImage} alt={preset.title} className="preset-cover" />
                {preset.badge && <span className="preset-badge">{preset.badge}</span>}
                <div className="preset-play-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="preset-content">
                <span className="preset-category">{preset.category}</span>
                <h4 className="preset-title">{preset.title}</h4>
                <p className="preset-desc">{preset.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;