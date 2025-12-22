import { useState, useEffect, useRef } from 'react';

interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  deviceId: string | null;
  player: Spotify.Player | null;
}

export function useSpotifyPlayer(accessToken: string | null) {
  const [state, setState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    deviceId: null,
    player: null,
  });
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const initPlayer = () => {
      if (!window.Spotify) {
        setError('Spotify Web Playback SDK not loaded');
        return;
      }

      const player = new window.Spotify.Player({
        name: 'Record Room',
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Spotify player ready, device ID:', device_id);
        setState((prev) => ({ ...prev, deviceId: device_id }));
      });

      player.addListener('not_ready', () => {
        console.log('Spotify player not ready');
        setState((prev) => ({ ...prev, deviceId: null }));
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          setState((prev) => ({ ...prev, isPlaying: false }));
          return;
        }
        setState((prev) => ({
          ...prev,
          isPlaying: !state.paused,
          currentTrack: state.track_window?.current_track || null,
        }));
      });

      player.addListener('authentication_error', () => {
        setError('Spotify authentication failed');
      });

      player.addListener('account_error', () => {
        setError('Spotify Premium required for playback');
      });

      player.connect();
      playerRef.current = player;
      setState((prev) => ({ ...prev, player }));
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [accessToken]);

  const playTrack = async (trackUri: string) => {
    if (!state.deviceId || !state.player || !accessToken) return;

    try {
      await state.player.activateElement();
      
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [state.deviceId], play: true }),
      });

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [trackUri], position_ms: 0 }),
        }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to play track');
      }

      setTimeout(async () => {
        const currentState = await state.player?.getCurrentState();
        if (currentState?.paused) {
          await state.player?.resume();
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback error');
      throw err;
    }
  };

  const togglePlay = async () => {
    if (!state.player) return;
    await state.player.togglePlay();
  };

  return {
    ...state,
    error,
    playTrack,
    togglePlay,
  };
}

