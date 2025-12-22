import './SpotifyButton.css';

interface SpotifyButtonProps {
  onClick: () => void;
}

export function SpotifyButton({ onClick }: SpotifyButtonProps) {
  return (
    <button className="spotify-button" onClick={onClick}>
      🎵 Sign in with Spotify
    </button>
  );
}

