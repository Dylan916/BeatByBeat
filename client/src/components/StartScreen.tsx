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
      {/* Hero Header */}
      <div className="hero-section">
        <div className="meta-tag font-mono">[ GAME INDEX / SYSTEM 01 ]</div>
        <h1 className="hero-title">BEATBYBEAT</h1>
        <p className="hero-subtitle">
          Auditory song recognition game. Listen to progressive time snippets, identify the track, and complete rounds with minimal attempts.
        </p>
      </div>

      {/* Custom Playlist Panel */}
      <div className="input-panel panel-surface">
        <div className="panel-header">
          <span className="panel-num font-mono">00</span>
          <h3>CUSTOM PLAYLIST OR ALBUM</h3>
        </div>
        <p className="input-desc">Enter any public Spotify playlist URL or ID:</p>
        
        <form onSubmit={handleSubmit} className="playlist-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="e.g. https://open.spotify.com/playlist/2KV26AnHNozOTq1o1DXfxS"
              className="spotify-input font-mono"
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              disabled={isLoading}
            />
            {playlistId && (
              <button 
                type="button" 
                className="clear-btn font-mono"
                onClick={() => setPlaylistId('')}
                title="Clear"
              >
                [CLEAR]
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary start-btn"
            disabled={isLoading || !playlistId.trim()}
          >
            {isLoading ? (
              <span className="btn-loading font-mono">
                <span className="spinner"></span> LOADING...
              </span>
            ) : (
              "START GAME →"
            )}
          </button>
        </form>

        {errorMessage && <div className="error-alert font-mono">ERR: {errorMessage}</div>}
      </div>

      {/* Horizontal Waveform SVG Divider */}
      <div className="waveform-divider">
        <svg viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 12 H100 L110 5 L120 19 L130 2 L140 22 L150 8 L160 16 L170 12 H300 L310 4 L320 20 L330 7 L340 17 L350 12 H500 L510 2 L520 22 L530 6 L540 18 L550 12 H700 L710 8 L720 16 L730 4 L740 20 L750 12 H900 L910 6 L920 18 L930 2 L940 22 L950 12 H1200" stroke="#D3CEC0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Single-Column Preset Tracklist */}
      <div className="presets-section">
        <div className="section-header">
          <h3>CURATED SELECTIONS</h3>
          <span className="section-count font-mono">[{PRESET_PLAYLISTS.length}]</span>
        </div>

        <div className="playlist-tracklist">
          {PRESET_PLAYLISTS.map((preset, index) => {
            const formattedNum = String(index + 1).padStart(2, '0');
            return (
              <div
                key={preset.id}
                className="tracklist-row"
                onClick={() => !isLoading && handlePresetSelect(preset.spotifyId, preset.title)}
              >
                <span className="row-index font-mono">{formattedNum}</span>
                <div className="row-info">
                  <h4 className="row-title">{preset.title}</h4>
                  <p className="row-desc">{preset.description}</p>
                </div>
                <span className="row-category">{preset.category}</span>
                <span className="row-arrow font-mono">→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;