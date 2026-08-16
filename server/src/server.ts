import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import {
  getAccessToken,
  getPlaylistTracks,
  getAlbumTracks,
  extractSpotifyId,
} from "./services/spotifyService.js";

import { getDeezerPreview } from "./services/deezerService.js";

const app = express();

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

app.get("/api/test-token", async (req, res) => {
  try {
    console.log("Attempting to get Spotify access token...");
    const token = await getAccessToken();
    console.log("Successfully received token!");

    res.json({ accessToken: token });
  } catch (error) {
    console.error("Error in test-token route:", error);
    res.status(500).json({ message: "Failed to get access token" });
  }
});

app.get("/api/test-playlist", async (req, res) => {
  try {
    const tracks = await getPlaylistTracks("2KV26AnHNozOTq1o1DXfxS");
    const trackNames = tracks.map((item: any) => item.track?.name);
    res.json({ tracks: trackNames });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch playlist" });
  }
});

app.post("/api/game-session", async (req, res) => {
  try {
    const { playlistId } = req.body;
    if (!playlistId) {
      return res.status(400).json({ message: "Playlist link or ID is required" });
    }

    const { id, type } = extractSpotifyId(playlistId);
    console.log(`Creating game session for extracted ${type} ID: ${id}`);

    let spotifyTracks: any[] = [];
    try {
      if (type === 'album') {
        spotifyTracks = await getAlbumTracks(id);
      } else {
        spotifyTracks = await getPlaylistTracks(id);
      }
    } catch (firstErr) {
      // Fallback: try the alternative resource type if user passed raw ID or link
      console.warn(`Primary fetch for ${type} ${id} failed. Attempting fallback...`);
      try {
        if (type === 'album') {
          spotifyTracks = await getPlaylistTracks(id);
        } else {
          spotifyTracks = await getAlbumTracks(id);
        }
      } catch (secondErr) {
        throw firstErr;
      }
    }

    const validSpotifyTracks = spotifyTracks.filter(
      (item: any) => item.track && item.track.name && item.track.artists
    );

    const trackInfoList = validSpotifyTracks.map((item: any) => {
      const track = item.track;
      const images = track.album?.images || [];
      const albumArt = images.length > 0 ? images[0].url : "";

      return {
        id: track.id || Math.random().toString(36).substring(7),
        name: track.name,
        artist: track.artists.map((artist: any) => artist.name).join(", "),
        albumArt: albumArt,
        spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/search/${encodeURIComponent(track.name)}`,
      };
    });

    if (trackInfoList.length === 0) {
      return res.status(404).json({ message: "No playable tracks found in this playlist." });
    }

    res.json(trackInfoList);
  } catch (error: any) {
    console.error("Error creating game session:", error);
    res.status(500).json({ message: error.message || "Failed to create game session." });
  }
});

app.post("/api/preview", async (req, res) => {
  try {
    const { trackName, artistName } = req.body;
    if (!trackName || !artistName) {
      return res
        .status(400)
        .json({ message: "Track name and artist name are required" });
    }

    const previewUrl = await getDeezerPreview(trackName, artistName);

    if (previewUrl) {
      res.json({ previewUrl: previewUrl });
    } else {
      res.status(404).json({ message: "Preview not found for this track." });
    }
  } catch (error) {
    console.error('Error fetching preview:', error);
    res.status(500).json({ message: 'Failed to fetch preview.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

