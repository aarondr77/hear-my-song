import { useState, useEffect } from 'react';
import { fetchPlaylist } from '../lib/spotify';
import type { SpotifyPlaylist } from '../types';

export function usePlaylist(accessToken: string | null) {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setPlaylist(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPlaylist(accessToken)
      .then((data) => {
        setPlaylist(data as SpotifyPlaylist);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch playlist');
        console.error('Error fetching playlist:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  return { playlist, isLoading, error };
}

