# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Spotify Developer account and app (see [Spotify Developer Dashboard](https://developer.spotify.com/dashboard))

### Environment Setup

1. Create a `.env` file in the root directory:

```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
VITE_PLAYLIST_ID=your_playlist_id
VITE_TOKEN_EXCHANGE_URL=http://127.0.0.1:3001/api/token
```

2. Configure your Spotify app:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app or select an existing one
   - Add `http://127.0.0.1:5173/callback` to the "Redirect URIs" in your app settings
   - Copy your Client ID and Client Secret to the `.env` file

### Installation

Install the project dependencies:

```bash
npm install
```

### Running the App

You need to run both the frontend and backend servers. You can run them together:

```bash
npm run dev:all
```

Or run them separately in different terminals:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

**Important:** Always access the app using `http://127.0.0.1:5173` (not `localhost`) to match the OAuth redirect URI configuration.

The app will be available at `http://127.0.0.1:5173` and the token exchange server will run on `http://127.0.0.1:3001`.
