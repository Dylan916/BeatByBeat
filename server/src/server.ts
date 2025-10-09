import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import {
  getAccessToken,
  getPlaylistTracks,
  getAlbumTracks,
} from "./services/spotifyService.ts";

import { getDeezerPreview } from "./services/deezerService.ts";

const app = express();

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});

// Add this new route for testing the token function
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
  console.log("Attempting to get Spotify Playlist...");
  // Daniel Caesar, https://open.spotify.com/playlist/2KV26AnHNozOTq1o1DXfxS?si=c377120199014e98
  const tracks = await getPlaylistTracks("2KV26AnHNozOTq1o1DXfxS");
  const trackNames = tracks.map((item: any) => item.track.name);
  console.log("--- Fetched Track Names ---");
  console.log(trackNames);
  console.log("--------------------------");
});

app.get("/api/test-album", async (req, res) => {
  console.log("Attempting to get Spotify Album Tracks...");

  // https://open.spotify.com/album/4E1XUBMTpLO7GpBzUo65Jp?si=J8J2W7XgSImyBDAgUor7Pg
  const tracks = await getAlbumTracks("4E1XUBMTpLO7GpBzUo65Jp");
  const trackNames = tracks.map((item: any) => item.name);
  console.log("--- Fetched Track Names ---");
  console.log(trackNames);
  console.log("--------------------------");
});

// Replace your old test route with this new analytical version
app.get("/api/test-playlist-urls", async (req, res) => {
  const playlistId = "2KV26AnHNozOTq1o1DXfxS"; // Best of Daniel Caesar Public Playlist

  try {
    console.log(`Fetching tracks for playlist: ${playlistId}...`);
    const tracks = await getPlaylistTracks(playlistId);

    if (!tracks || tracks.length === 0) {
      return res.json({ message: "Could not fetch any tracks." });
    }

    // --- Analysis Logic ---
    let totalTracks = tracks.length;
    let tracksWithPreview = 0;

    tracks.forEach((item: any) => {
      if (item.track && item.track.preview_url) {
        tracksWithPreview++;
      }
    });
    // --------------------

    console.log(`--- Preview URL Test Results ---`);
    console.log(`Total tracks received: ${totalTracks}`);
    console.log(`Tracks with a valid preview_url: ${tracksWithPreview}`);
    console.log(
      `Percentage of playable tracks: ${(
        (tracksWithPreview / totalTracks) *
        100
      ).toFixed(2)}%`
    );
    console.log(`------------------------------`);

    res.json({
      message: "Test complete! Check your server console for the results.",
      totalTracks: totalTracks,
      tracksWithPreview: tracksWithPreview,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch playlist from Spotify." });
  }
});

app.get("/api/test-deezer", async (req, res) => {
  try {
    const trackName = "Espresso";
    const artistName = "Sabrina Carpenter";

    console.log(`Searching Deezer for "${trackName}" by ${artistName}...`);
    const previewUrl = await getDeezerPreview(trackName, artistName);

    if (previewUrl) {
      console.log("Found preview URL:", previewUrl);
      res.json({ success: true, previewUrl: previewUrl });
    } else {
      console.log("No preview URL found.");
      res.json({
        success: false,
        message: "No preview URL found for this track.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

app.post("/api/game-session", async (req, res) => {
  try {
    const { playlistId } = req.body;
    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const spotifyTracks = await getPlaylistTracks(playlistId);

    const validSpotifyTracks = spotifyTracks.filter(
      (item: any) => item.track && item.track.name && item.track.artists
    );

    const trackInfoList = validSpotifyTracks.map((item: any) => ({
      name: item.track.name,
      artist: item.track.artists.map((artists: any) => artists.name).join(", "),
    }));

    res.json(trackInfoList);
  } catch (error) {
    console.error("Error creating game session:", error);
    res.status(500).json({ message: "Failed to create game session." });
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
