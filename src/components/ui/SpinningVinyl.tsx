import { useEffect, useRef } from 'react';
import './SpinningVinyl.css';

interface SpinningVinylProps {
  albumArtUrl: string;
  isPlaying: boolean;
}

export function SpinningVinyl({ albumArtUrl, isPlaying }: SpinningVinylProps) {
  const vinylRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vinylRef.current) {
      if (isPlaying) {
        vinylRef.current.style.animationPlayState = 'running';
      } else {
        vinylRef.current.style.animationPlayState = 'paused';
      }
    }
  }, [isPlaying]);

  return (
    <div className="spinning-vinyl-container">
      <div ref={vinylRef} className={`spinning-vinyl ${isPlaying ? 'playing' : ''}`}>
        <div className="vinyl-center" />
        {/* Use a unique class name to avoid collisions with global `.album-art` thumbnail styles in App.css */}
        <img src={albumArtUrl} alt="Album" className="spinning-vinyl-album-art" />
      </div>
    </div>
  );
}

