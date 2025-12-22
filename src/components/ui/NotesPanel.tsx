import { NoteCard } from './NoteCard';
import { NoteInput } from './NoteInput';
import './NotesPanel.css';
import type { Note } from '../../types';

interface NotesPanelProps {
  notes: Note[];
  currentUserId: string;
  isLoading: boolean;
  onCreateNote: (content: string, author: string) => Promise<void>;
  onDeleteNote: (noteId: string, author: string) => Promise<void>;
}

export function NotesPanel({
  notes,
  currentUserId,
  isLoading,
  onCreateNote,
  onDeleteNote,
}: NotesPanelProps) {
  const handleCreateNote = async (content: string) => {
    await onCreateNote(content, currentUserId);
  };

  const handleDeleteNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      await onDeleteNote(noteId, note.author);
    }
  };

  return (
    <div className="notes-panel">
      <h3 className="notes-title">Notes</h3>
      
      <div className="notes-list">
        {isLoading && notes.length === 0 ? (
          <p className="no-notes">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="no-notes">No notes yet! Be the first to share your thoughts 💭</p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwnNote={note.author === currentUserId}
              onDelete={note.author === currentUserId ? () => handleDeleteNote(note.id) : undefined}
            />
          ))
        )}
      </div>

      <NoteInput
        onSubmit={handleCreateNote}
        placeholder="What do you think?"
        disabled={isLoading}
      />
    </div>
  );
}

