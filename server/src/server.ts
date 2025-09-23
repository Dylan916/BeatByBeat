import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import {
  getAccessToken,
  getPlaylistTracks,
} from "./services/spotifyService.ts";

const app = express();

const port = process.env.PORT || 3000;
app.use(cors());

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
  // This is Daniel Caesar, https://open.spotify.com/playlist/37i9dQZF1DZ06evO18rRzG?si=6b336994909140ac
  // https://open.spotify.com/playlist/37i9dQZF1DZ06evO18rRzG?
  const tracks = await getPlaylistTracks(
    "37i9dQZF1DZ06evO18rRzG"
  );
  const trackNames = tracks.map((item: any) => item.track.name);
  console.log("--- Fetched Track Names ---");
  console.log(trackNames);
  console.log("--------------------------");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
