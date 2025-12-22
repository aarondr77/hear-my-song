import { useState, useEffect, useRef } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RoomPage } from './pages/RoomPage';
import { getAuthUrl, getAccessTokenFromUrl, fetchUserProfile, fetchPlaylist } from './lib/spotify';
import { usePlaylist } from './hooks/usePlaylist';
import type { SpotifyUser, SpotifyPlaylist } from './types';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SpotifyUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isExchangingToken = useRef(false);

  // Auth initialization
  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (urlParams.get('error')) {
        setError('Spotify authentication failed');
        window.history.replaceState({}, '', '/');
        return;
      }

      if (code) {
        if (isExchangingToken.current) return;
        isExchangingToken.current = true;
        window.history.replaceState({}, '', '/');

        try {
          const token = await getAccessTokenFromUrl(code);
          if (token) {
            setAccessToken(token);
            localStorage.setItem('spotify_access_token', token);

            // Fetch user profile
            try {
              const profile = await fetchUserProfile(token);
              setCurrentUser(profile);
              localStorage.setItem('current_user', JSON.stringify(profile));
            } catch (err) {
              console.error('Failed to fetch user profile:', err);
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
          localStorage.removeItem('spotify_access_token');
        } finally {
          isExchangingToken.current = false;
        }
      } else {
        const savedToken = localStorage.getItem('spotify_access_token');
        if (savedToken) {
          setAccessToken(savedToken);

          // Try to load saved user profile
          const savedUser = localStorage.getItem('current_user');
          if (savedUser) {
            try {
              const profile = JSON.parse(savedUser) as SpotifyUser;
              setCurrentUser(profile);
            } catch (e) {
              console.error('Failed to parse saved user:', e);
            }
          } else {
            // Fetch user profile if not saved
            fetchUserProfile(savedToken)
              .then((profile) => {
                setCurrentUser(profile);
                localStorage.setItem('current_user', JSON.stringify(profile));
              })
              .catch((err) => console.error('Failed to fetch user profile:', err));
          }
        }
      }
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
    }
  };

  const { playlist, isLoading: isLoadingPlaylist, error: playlistError } = usePlaylist(accessToken);

  // Loading screen
  if (!accessToken) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!currentUser || isLoadingPlaylist) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-heart">💕</div>
          <p>Loading your playlist...</p>
          {error && <p style={{ color: '#ff4444', marginTop: '20px' }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (playlistError || !playlist) {
    return (
      <div className="app">
        <div className="error">
          <p style={{ color: '#ff4444' }}>
            {playlistError || 'Failed to load playlist'}
          </p>
          <button
            onClick={() => {
              setError(null);
              setAccessToken(null);
              localStorage.removeItem('spotify_access_token');
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract tracks from playlist
  const tracks = playlist.tracks.items
    .map((item) => item.track)
    .filter((track): track is NonNullable<typeof track> => track !== null);

  if (tracks.length === 0) {
    return (
      <div className="app">
        <div className="error">
          <p>No tracks found in playlist</p>
        </div>
      </div>
    );
  }

  return (
    <RoomPage
      tracks={tracks}
      currentUser={currentUser}
      accessToken={accessToken}
    />
  );
}

export default App;

