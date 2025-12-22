import { useEffect } from 'react';
import { SpinningVinyl } from './SpinningVinyl';
import { NotesPanel } from './NotesPanel';
import './RecordModal.css';
import type { SpotifyTrack, Note } from '../../types';

interface RecordModalProps {
  track: SpotifyTrack | null;
  isOpen: boolean;
  isPlaying: boolean;
  notes: Note[];
  currentUserId: string;
  isLoadingNotes: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onCreateNote: (content: string, author: string) => Promise<void>;
  onDeleteNote: (noteId: string, author: string) => Promise<void>;
}

export function RecordModal({
  track,
  isOpen,
  isPlaying,
  notes,
  currentUserId,
  isLoadingNotes,
  onClose,
  onPlayPause,
  onCreateNote,
  onDeleteNote,
}: RecordModalProps) {
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
        
        <div className="modal-header">
          <SpinningVinyl
            albumArtUrl={track.album.images[0]?.url || ''}
            isPlaying={isPlaying}
          />
          
          <div className="track-info">
            <h2 className="track-name">{track.name}</h2>
            <p className="track-artist">{track.artists.map((a) => a.name).join(', ')}</p>
            <p className="track-album">{track.album.name}</p>
            
            <button className="play-pause-btn" onClick={onPlayPause}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        <NotesPanel
          notes={notes}
          currentUserId={currentUserId}
          isLoading={isLoadingNotes}
          onCreateNote={onCreateNote}
          onDeleteNote={onDeleteNote}
        />
      </div>
    </div>
  );
}

