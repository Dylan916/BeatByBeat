import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { getAccessToken } from "./services/spotifyService.ts";

const app = express();

const port = process.env.PORT || 3000;
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running!" });
});


app.get('/api/test', async (req, res) => {
  try {
    console.log('Attempting to get Spotify access token...');
    const token = await getAccessToken();
    console.log('Successfully received token!');

    res.json({ accessToken: token });

  } catch (error) {
    console.error('Error in test-token route:', error);
    res.status(500).json({ message: 'Failed to get access token' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
