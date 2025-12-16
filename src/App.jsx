import { useState, useEffect } from 'react'
import './App.css'
import { getAuthUrl, getAccessTokenFromUrl, fetchPlaylist, playTrack } from './spotify'

function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getAccessTokenFromUrl();
        if (token) {
          setAccessToken(token);
          localStorage.setItem('spotify_access_token', token);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          const savedToken = localStorage.getItem('spotify_access_token');
          if (savedToken) {
            setAccessToken(savedToken);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any invalid tokens
        localStorage.removeItem('spotify_access_token');
      }
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    fetchPlaylist(accessToken)
      .then(data => {
        console.log('Playlist data:', data);
        setPlaylist(data);
      })
      .catch(err => {
        console.error('Error fetching playlist:', err);
        if (err.message.includes('401')) {
          localStorage.removeItem('spotify_access_token');
          setAccessToken(null);
        }
      });
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Our Shared Songs Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.connect();
      setPlayer(player);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  const handleLogin = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      alert('Error connecting to Spotify. Please try again.');
    }
  };

  const handlePlayTrack = async (trackUri) => {
    if (!deviceId) {
      alert('Player not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      await playTrack(accessToken, trackUri, deviceId);
    } catch (err) {
      console.error('Error playing track:', err);
      alert('Error playing track. Make sure Spotify is not playing on another device.');
    }
  };

  if (!accessToken) {
    return (
      <div className="app">
        <header>
          <h1>Our Shared Songs 💕</h1>
          <p>A place for us to share and talk about our favorite music</p>
        </header>
        <main>
          <div className="placeholder">
            <button onClick={handleLogin}>Connect to Spotify</button>
          </div>
        </main>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="app">
        <header>
          <h1>Our Shared Songs 💕</h1>
          <p>A place for us to share and talk about our favorite music</p>
        </header>
        <main>
          <div className="placeholder">
            <p>Loading playlist...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Our Shared Songs 💕</h1>
        <p>{playlist.name}</p>
      </header>

      <main>
        <div className="playlist">
          {playlist.tracks.items.map((item, index) => (
            <div key={index} className="track-card">
              <img
                src={item.track.album.images[0]?.url}
                alt={item.track.name}
                className="album-art"
              />
              <div className="track-info">
                <h3>{item.track.name}</h3>
                <p>{item.track.artists.map(a => a.name).join(', ')}</p>
              </div>
              <button
                className="play-btn"
                onClick={() => handlePlayTrack(item.track.uri)}
              >
                ▶
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
