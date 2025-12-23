import './NowPlayingBar.css';
import type { SpotifyTrack } from '../../types';

interface NowPlayingBarProps {
  track: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function NowPlayingBar({ track, isPlaying, onPlayPause }: NowPlayingBarProps) {
  if (!track) return null;

  return (
    <div className="now-playing-bar">
      <div className="now-playing-info">
        {track.album.images[0] && (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="now-playing-art"
          />
        )}
        <div className="now-playing-details">
          <div className="now-playing-name">{track.name}</div>
          <div className="now-playing-artist">
            {track.artists.map((a) => a.name).join(', ')}
          </div>
        </div>
      </div>
      
      <button className="now-playing-control" onClick={onPlayPause}>
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}

