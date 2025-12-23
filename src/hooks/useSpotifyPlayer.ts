import { useState, useEffect, useRef, useCallback } from 'react';

interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  deviceId: string | null;
  player: Spotify.Player | null;
  position: number; // Current position in ms
  duration: number; // Track duration in ms
}

export function useSpotifyPlayer(accessToken: string | null) {
  const [state, setState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    deviceId: null,
    player: null,
    position: 0,
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const positionIntervalRef = useRef<number | null>(null);

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

      player.addListener('player_state_changed', (playerState) => {
        if (!playerState) {
          setState((prev) => ({ ...prev, isPlaying: false, position: 0, duration: 0 }));
          if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
            positionIntervalRef.current = null;
          }
          return;
        }
        setState((prev) => ({
          ...prev,
          isPlaying: !playerState.paused,
          currentTrack: playerState.track_window?.current_track || null,
          position: playerState.position,
          duration: playerState.duration,
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
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [accessToken]);

  // Separate effect for position polling
  useEffect(() => {
    const updatePosition = async () => {
      if (playerRef.current && state.isPlaying) {
        try {
          const currentState = await playerRef.current.getCurrentState();
          if (currentState) {
            setState((prev) => ({
              ...prev,
              position: currentState.position,
              duration: currentState.duration,
            }));
          }
        } catch (err) {
          console.error('Error getting player state:', err);
        }
      }
    };

    if (state.isPlaying && state.player) {
      positionIntervalRef.current = window.setInterval(updatePosition, 1000);
    } else {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    }

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [state.isPlaying, state.player]);

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

