# BeatByBeat 🎵

**BeatByBeat** is a Heardle/Wordle-inspired music guessing game built with React, Express, Spotify API, and Deezer API. Listen to short progressive music snippets, identify the song title, and complete rounds with as few tries as possible!

---

## ✨ Features

- **Progressive Audio Snippet Player**: Snippet duration unlocks progressively upon each missed guess or skip:
  `1s → 2s → 4s → 8s → 16s → 30s` (6 total attempts).
- **Universal Spotify URL & Link Parser**: Paste any public Spotify playlist URL, album URL, or raw ID (e.g. `https://open.spotify.com/playlist/...` or `https://open.spotify.com/album/...`).
- **Curated Selections**: Featured single-column playlist selection including *Best of Daniel Caesar*, *Best of Malcolm Todd*, *Today's Top Hits*, *All Out 2000s*, and *Hip Hop Anthems*.
- **Dual API Architecture**:
  - **Spotify Web API**: Fetches track metadata, artist names, album artwork, and Spotify links via Client Credentials flow.
  - **Deezer API**: Searches and streams high quality 30-second audio previews.
- **Technical Paper Design System**:
  - Warm, tactile aesthetic inspired by technical documentation and Teenage Engineering UI design.
  - Typography powered by **IBM Plex Sans Condensed** (headings), **IBM Plex Sans** (body), and **IBM Plex Mono** (timestamps, IDs, indices, score stats).
  - Integrated **Dark Mode (`#171512`)** and **Light Mode (`#EAE7DD`)** theme toggle with tape amber (`#D99A4E`) accents and subtle SVG waveform section dividers.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 19** + **TypeScript** + **Vite**
- **Axios** for API requests
- **Vanilla CSS** custom paper design system (Light & Dark theme variables)
- **IBM Plex** font family (Sans, Sans Condensed, Mono)

### Backend (`server/`)
- **Node.js** + **Express** + **TypeScript**
- **Spotify Web API** (Client Credentials Authentication flow)
- **Deezer API** (Audio snippet resolution)
- **Dotenv** & **CORS**

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- Spotify Developer Credentials (`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`)

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=3000
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

Start the backend development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000`.

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

The frontend app will launch on `http://localhost:5173`.

---

## 🎮 How to Play

1. **Select a Playlist**: Choose one of the curated playlist selections or paste a custom Spotify playlist/album link.
2. **Listen to the Snippet**: Click the **Play (►)** button to listen to the current unlocked time interval (starts at 1.0 second).
3. **Make Your Guess**: Search for the track title or artist name in the input box using autocomplete.
4. **Unlock More Seconds**: If your guess is incorrect or if you click **Skip**, the next time duration is unlocked (`2s`, `4s`, `8s`, `16s`, `30s`).
5. **Win & Track Stats**: Identify the song in as few tries as possible to maintain your win streak!

---

## 📁 Repository Structure

```
BeatByBeat/
├── client/                 # React Vite frontend application
│   ├── src/
│   │   ├── components/     # StartScreen & GameScreen components
│   │   ├── data/           # Preset playlists catalog
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── App.tsx         # App entrypoint & state manager
│   │   ├── App.css         # Minimalist paper UI styles
│   │   └── index.css       # Theme variables & typography tokens
├── server/                 # Express Node backend service
│   ├── src/
│   │   ├── services/       # Spotify & Deezer API services
│   │   └── server.ts       # Express API routes
│   └── tsconfig.json       # Backend TypeScript config
└── README.md
```

---

## 📜 License

ISC License
