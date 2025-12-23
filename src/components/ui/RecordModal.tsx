import { useEffect } from 'react';
import { SpinningVinyl } from './SpinningVinyl';
import { NotesPanel } from './NotesPanel';
import './RecordModal.css';
import type { SpotifyTrack, Note } from '../../types';

interface RecordModalProps {
  track: SpotifyTrack | null;
  isOpen: boolean;
  isPlaying: boolean;
  position?: number; // Current position in ms
  duration?: number; // Track duration in ms
  notes: Note[];
  currentUserId: string;
  isLoadingNotes: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onCreateNote: (content: string, author: string) => Promise<void>;
  onDeleteNote: (noteId: string, author: string) => Promise<void>;
}

function formatTime(ms: number): string {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function RecordModal({
  track,
  isOpen,
  isPlaying,
  position = 0,
  duration = 0,
  notes,
  currentUserId,
  isLoadingNotes,
  onClose,
  onPlayPause,
  onCreateNote,
  onDeleteNote,
}: RecordModalProps) {
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  
  // Colors for wave progress - adapted for record sleeve aesthetic
  const darkColor = '#8b6f47'; // Warm brown
  const lightColor = '#d4c4a8'; // Light beige
  const lightColorOpacity = '#d4c4a8';
  
  // Generate unique gradient IDs based on track ID
  const trackId = track?.id ? track.id.replace(/[^a-zA-Z0-9]/g, '') : 'default';
  const gradientId = `wave-gradient-${trackId}`;
  const gradientId2 = `wave-gradient-2-${trackId}`;
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-layout">
          {/* Left Panel - Music Player */}
          <div className="modal-left-panel">
            <div className="album-art-area">
              <SpinningVinyl
                albumArtUrl={track.album.images[0]?.url || ''}
                isPlaying={isPlaying}
              />
            </div>
            
            <div className="track-info">
              <h2 className="track-name">{track.name}</h2>
              <p className="track-artist">{track.artists.map((a) => a.name).join(', ')}</p>
              <p className="track-album">{track.album.name}</p>
            </div>
            
            <div className="playback-controls">
              <div className="voice-player-controls">
                <button 
                  className="voice-play-btn" 
                  onClick={onPlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {isPlaying ? (
                      // Pause icon (hand-drawn)
                      <>
                        <rect x="8" y="6" width="3" height="12" rx="1" stroke="#2c2c2c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="13" y="6" width="3" height="12" rx="1" stroke="#2c2c2c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      // Play icon (hand-drawn triangle)
                      <path 
                        d="M 9 7 L 9 17 L 17 12 Z" 
                        stroke="#2c2c2c" 
                        strokeWidth="2" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </button>

                <div className="voice-time-display">
                  <span className="voice-time-current">{formatTime(position)}</span>
                </div>
              </div>

              <div className="voice-wave-progress">
                <svg 
                  width="100%" 
                  height="50" 
                  viewBox="0 0 400 50" 
                  preserveAspectRatio="none"
                  className="voice-wave-svg"
                  shapeRendering="geometricPrecision"
                >
                  <defs>
                    {/* Gradient: dark (played) transitions smoothly to light greyed out (unplayed) */}
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={darkColor} />
                      <stop offset={`${Math.max(0, progressPercent - 8)}%`} stopColor={darkColor} />
                      <stop offset={`${Math.max(0, progressPercent - 4)}%`} stopColor={darkColor} stopOpacity="0.95" />
                      <stop offset={`${Math.max(0, progressPercent - 2)}%`} stopColor={darkColor} stopOpacity="0.8" />
                      <stop offset={`${progressPercent}%`} stopColor={darkColor} stopOpacity="0.5" />
                      <stop offset={`${Math.min(100, progressPercent + 2)}%`} stopColor={lightColor} stopOpacity="0.5" />
                      <stop offset={`${Math.min(100, progressPercent + 6)}%`} stopColor={lightColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={lightColor} stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id={gradientId2} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={darkColor} stopOpacity="0.8" />
                      <stop offset={`${Math.max(0, progressPercent - 8)}%`} stopColor={darkColor} stopOpacity="0.8" />
                      <stop offset={`${Math.max(0, progressPercent - 4)}%`} stopColor={darkColor} stopOpacity="0.75" />
                      <stop offset={`${Math.max(0, progressPercent - 2)}%`} stopColor={darkColor} stopOpacity="0.65" />
                      <stop offset={`${progressPercent}%`} stopColor={darkColor} stopOpacity="0.4" />
                      <stop offset={`${Math.min(100, progressPercent + 2)}%`} stopColor={lightColorOpacity} stopOpacity="0.4" />
                      <stop offset={`${Math.min(100, progressPercent + 6)}%`} stopColor={lightColorOpacity} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={lightColorOpacity} stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  
                  {/* Progressive color waves - dark for played portion, light greyed out for unplayed */}
                  
                  {/* Progressive color waves - get darker from left to right as audio plays */}
                  <path
                    d="M 0 25 Q 8 15, 16 25 T 32 25 T 48 25 T 64 25 T 80 25 T 96 25 T 112 25 T 128 25 T 144 25 T 160 25 T 176 25 T 192 25 T 208 25 T 224 25 T 240 25 T 256 25 T 272 25 T 288 25 T 304 25 T 320 25 T 336 25 T 352 25 T 368 25 T 384 25 T 400 25"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className="voice-wave-progress-line"
                  />
                  <path
                    d="M 0 20 Q 6 12, 12 20 T 24 20 T 36 20 T 48 20 T 60 20 T 72 20 T 84 20 T 96 20 T 108 20 T 120 20 T 132 20 T 144 20 T 156 20 T 168 20 T 180 20 T 192 20 T 204 20 T 216 20 T 228 20 T 240 20 T 252 20 T 264 20 T 276 20 T 288 20 T 300 20 T 312 20 T 324 20 T 336 20 T 348 20 T 360 20 T 372 20 T 384 20 T 396 20 T 400 20"
                    stroke={`url(#${gradientId2})`}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className="voice-wave-progress-line"
                  />
                  <path
                    d="M 0 30 Q 10 22, 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 120 30 T 140 30 T 160 30 T 180 30 T 200 30 T 220 30 T 240 30 T 260 30 T 280 30 T 300 30 T 320 30 T 340 30 T 360 30 T 380 30 T 400 30"
                    stroke={`url(#${gradientId2})`}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className="voice-wave-progress-line"
                  />
                </svg>
              </div>

              <div className="voice-duration-display">
                <span className="voice-duration-text">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Notes */}
          <div className="modal-right-panel">
            <NotesPanel
              notes={notes}
              currentUserId={currentUserId}
              isLoading={isLoadingNotes}
              onCreateNote={onCreateNote}
              onDeleteNote={onDeleteNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

