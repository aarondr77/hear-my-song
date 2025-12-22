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
              <button className="play-pause-btn" onClick={onPlayPause}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  <div className="progress-handle" style={{ left: `${progressPercent}%` }} />
                </div>
                <span className="progress-time">{formatTime(position)}</span>
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

