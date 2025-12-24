import { useState, useEffect, useRef } from 'react';

interface SpotifyPlayerState {
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  deviceId: string | null;
  player: Spotify.Player | null;
  position: number; // Current position in ms
  duration: number; // Track duration in ms
}

interface UseSpotifyPlayerOptions {
  onTrackEnd?: () => void;
}

export function useSpotifyPlayer(accessToken: string | null, options?: UseSpotifyPlayerOptions) {
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
  const deviceIdRef = useRef<string | null>(null);
  const positionIntervalRef = useRef<number | null>(null);
  // Track previous state to detect when a track naturally ends
  const prevStateRef = useRef<{ trackUri: string | null; isPlaying: boolean }>({
    trackUri: null,
    isPlaying: false,
  });
  const onTrackEndRef = useRef(options?.onTrackEnd);
  // Guard to prevent multiple rapid onTrackEnd calls
  const lastTrackEndCallRef = useRef<number>(0);
  const trackEndDebounceMs = 2000; // Don't call onTrackEnd more than once per 2 seconds
  // Track if the last play attempt failed to prevent cascading failures
  const lastPlayFailedRef = useRef<boolean>(false);
  // Track if the player's internal streamer is ready (player_state_changed has fired)
  const streamerReadyRef = useRef<boolean>(false);

  // Keep the callback ref up to date
  useEffect(() => {
    onTrackEndRef.current = options?.onTrackEnd;
  }, [options?.onTrackEnd]);

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
        deviceIdRef.current = device_id;
        setState((prev) => ({ ...prev, deviceId: device_id }));
      });

      player.addListener('not_ready', () => {
        console.log('Spotify player not ready');
        deviceIdRef.current = null;
        streamerReadyRef.current = false;
        setState((prev) => ({ ...prev, deviceId: null }));
      });

      player.addListener('player_state_changed', (playerState) => {
        // Mark streamer as ready once we receive the first state change
        streamerReadyRef.current = true;
        
        if (!playerState) {
          setState((prev) => ({ ...prev, isPlaying: false, position: 0, duration: 0 }));
          if (positionIntervalRef.current) {
            clearInterval(positionIntervalRef.current);
            positionIntervalRef.current = null;
          }
          return;
        }

        const currentTrackUri = playerState.track_window?.current_track?.uri || null;
        const wasPlaying = prevStateRef.current.isPlaying;
        const prevTrackUri = prevStateRef.current.trackUri;
        const isNowPaused = playerState.paused;
        const isNowPlaying = !playerState.paused;

        // If we're successfully playing a track, reset the failure flag
        if (isNowPlaying && currentTrackUri) {
          lastPlayFailedRef.current = false;
        }

        // Detect when a track naturally ends:
        // - Was playing, now paused
        // - Track changed (next track in queue) or position reset
        // - Position is at 0 (track ended and reset)
        const trackChanged = prevTrackUri !== null && currentTrackUri !== prevTrackUri;
        const trackEndedNaturally = wasPlaying && isNowPaused && playerState.position === 0 && !trackChanged;
        
        // Only trigger onTrackEnd if:
        // 1. Track ended naturally
        // 2. Last play didn't fail (to prevent cascading failures)
        // 3. Enough time has passed since last call (debounce)
        if (trackEndedNaturally && onTrackEndRef.current && !lastPlayFailedRef.current) {
          const now = Date.now();
          const timeSinceLastCall = now - lastTrackEndCallRef.current;
          
          if (timeSinceLastCall >= trackEndDebounceMs) {
            lastTrackEndCallRef.current = now;
            // Small delay to ensure state is updated before playing next track
            setTimeout(() => {
              onTrackEndRef.current?.();
            }, 100);
          }
        }

        // Update previous state
        prevStateRef.current = {
          trackUri: currentTrackUri,
          isPlaying: !playerState.paused,
        };

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
      // Reset streamer ready flag on cleanup
      streamerReadyRef.current = false;
    };
  }, [accessToken]);

  // Separate effect for position polling
  useEffect(() => {
    const updatePosition = async () => {
      // Only poll if player, streamer, and device are all ready
      if (playerRef.current && state.isPlaying && state.deviceId && streamerReadyRef.current) {
        try {
          // Check if player is ready before calling getCurrentState
          const currentState = await playerRef.current.getCurrentState();
          if (currentState && !currentState.paused) {
            setState((prev) => ({
              ...prev,
              position: currentState.position,
              duration: currentState.duration,
            }));
          }
        } catch (err) {
          // Silently handle errors - player might not be ready yet
          // The streamer error specifically happens when _streamer is undefined
          // This is expected during initialization, so we ignore it
          if (err instanceof Error) {
            const errorMsg = err.message || String(err);
            // Ignore streamer-related errors (they're expected during initialization)
            if (!errorMsg.includes('streamer') && !errorMsg.includes('_streamer')) {
              console.error('Error getting player state:', err);
            }
          }
        }
      }
    };

    // Only start polling if player is ready AND streamer is initialized
    if (state.isPlaying && state.player && state.deviceId && streamerReadyRef.current) {
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
  }, [state.isPlaying, state.player, state.deviceId]);

  const playTrack = async (trackUri: string) => {
    if (!state.deviceId || !state.player || !accessToken) {
      throw new Error('Player not ready');
    }

    // Reset the failure flag when attempting a new play
    lastPlayFailedRef.current = false;

    try {
      // Activate the player element first
      await state.player.activateElement();
      
      // Set the device as active
      const deviceResponse = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [state.deviceId], play: true }),
      });

      // Check for rate limiting on device activation
      if (deviceResponse.status === 429) {
        lastPlayFailedRef.current = true;
        const errorText = await deviceResponse.text();
        throw new Error(`Failed to play track: ${errorText}`);
      }

      // Play the track
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
        // Mark as failed if we get a 429 or other error
        if (response.status === 429) {
          lastPlayFailedRef.current = true;
        }
        const errorText = await response.text();
        throw new Error(`Failed to play track: ${errorText}`);
      }

      // Wait a bit longer for the player to initialize, then check state
      // Only try to get state if streamer is ready
      setTimeout(async () => {
        if (!streamerReadyRef.current) {
          // Streamer not ready yet, skip this check
          return;
        }
        try {
          const currentState = await state.player?.getCurrentState();
          if (currentState?.paused) {
            await state.player?.resume();
          }
        } catch (err) {
          // Ignore errors here - player state will update via listener
          // Streamer errors are expected if not fully initialized
        }
      }, 1000);
    } catch (err) {
      // Mark as failed for any error
      lastPlayFailedRef.current = true;
      setError(err instanceof Error ? err.message : 'Playback error');
      throw err;
    }
  };

  const togglePlay = async () => {
    const currentPlayer = playerRef.current;
    const currentDeviceId = deviceIdRef.current;
    
    if (!currentPlayer || !currentDeviceId) {
      console.warn('Player not ready for toggle', { 
        hasPlayer: !!currentPlayer, 
        hasDeviceId: !!currentDeviceId 
      });
      return;
    }
    
    try {
      await currentPlayer.activateElement();
      await currentPlayer.togglePlay();
    } catch (err) {
      console.error('Error toggling play:', err);
      setError(err instanceof Error ? err.message : 'Toggle play error');
      // Re-throw so calling code knows it failed
      throw err;
    }
  };

  return {
    ...state,
    error,
    playTrack,
    togglePlay,
  };
}

