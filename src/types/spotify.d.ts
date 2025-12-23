// Spotify Web Playback SDK types
declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
  }

  namespace Spotify {
    class Player {
      constructor(options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      });

      connect(): Promise<boolean>;
      disconnect(): void;
      activateElement(): Promise<void>;
      togglePlay(): Promise<void>;
      resume(): Promise<void>;
      pause(): Promise<void>;
      getCurrentState(): Promise<PlayerState | null>;

      addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
      addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
      addListener(event: 'player_state_changed', callback: (state: PlayerState) => void): void;
      addListener(event: 'authentication_error', callback: (error: { message: string }) => void): void;
      addListener(event: 'account_error', callback: (error: { message: string }) => void): void;
    }

    interface PlayerState {
      paused: boolean;
      position: number;
      duration: number;
      track_window: {
        current_track: Track;
        next_tracks: Track[];
        previous_tracks: Track[];
      };
    }

    interface Track {
      id: string;
      uri: string;
      name: string;
      album: {
        images: Array<{ url: string }>;
      };
      artists: Array<{ name: string }>;
    }
  }
}

export {};

