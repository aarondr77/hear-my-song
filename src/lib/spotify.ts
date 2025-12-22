import type { SpotifyPlaylist, SpotifyUser } from '../types';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const PLAYLIST_ID = import.meta.env.VITE_PLAYLIST_ID;
const TOKEN_EXCHANGE_URL = import.meta.env.VITE_TOKEN_EXCHANGE_URL || (import.meta.env.PROD ? '/api/token' : 'http://127.0.0.1:3001/api/token');

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private'
].join(' ');

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const getAuthUrl = async (): Promise<string> => {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  
  sessionStorage.setItem('code_verifier', verifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getAccessTokenFromUrl = async (authCode: string | null = null): Promise<string | null> => {
  const code = authCode || new URLSearchParams(window.location.search).get('code');
  
  if (!code) return null;
  
  const verifier = sessionStorage.getItem('code_verifier');
  if (!verifier) {
    throw new Error('Code verifier not found');
  }
  
  try {
    const response = await fetch(TOKEN_EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange code for token: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.access_token) {
      throw new Error('Token exchange response missing access_token');
    }
    
    sessionStorage.removeItem('code_verifier');
    return data.access_token;
  } catch (error) {
    sessionStorage.removeItem('code_verifier');
    throw error;
  }
};

export const fetchUserProfile = async (accessToken: string): Promise<SpotifyUser> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }
  
  const userData = await response.json();
  return {
    id: userData.id,
    display_name: userData.display_name || userData.id,
    email: userData.email
  };
};

export const fetchPlaylist = async (accessToken: string, playlistId: string | null = null): Promise<SpotifyPlaylist> => {
  const targetPlaylistId = playlistId || PLAYLIST_ID;
  
  if (!targetPlaylistId) {
    throw new Error('Playlist ID is not configured. Please set VITE_PLAYLIST_ID in your .env file.');
  }

  const response = await fetch(`https://api.spotify.com/v1/playlists/${targetPlaylistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to fetch playlist';
    
    if (response.status === 404) {
      errorMessage = `Playlist not found (404). The playlist ID "${targetPlaylistId}" may be incorrect.`;
    } else if (response.status === 401) {
      errorMessage = `Unauthorized (401). Your access token may have expired.`;
    }
    
    throw new Error(errorMessage);
  }

  const playlist = await response.json();
  
  // Fetch all tracks (handle pagination)
  let allTracks = [...playlist.tracks.items];
  let nextUrl = playlist.tracks.next;
  
  while (nextUrl) {
    const tracksResponse = await fetch(nextUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!tracksResponse.ok) {
      console.warn('Failed to fetch additional tracks, returning what we have');
      break;
    }
    
    const tracksData = await tracksResponse.json();
    allTracks = [...allTracks, ...tracksData.items];
    nextUrl = tracksData.next;
  }
  
  playlist.tracks.items = allTracks;
  playlist.tracks.total = allTracks.length;
  
  return playlist as SpotifyPlaylist;
};

