import './NoteCard.css';

interface NoteCardProps {
  note: {
    id: string;
    author: string;
    content: string;
    created_at: string;
  };
  isOwnNote: boolean;
  onDelete?: () => void;
}

export function NoteCard({ note, isOwnNote, onDelete }: NoteCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Generate a consistent rotation based on note ID for visual variety
  const rotation = (note.id.charCodeAt(0) + note.id.charCodeAt(note.id.length - 1)) % 7 - 3; // -3 to +3 degrees

  return (
    <div className="note-card" style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="note-header">
        <span className="note-author">{note.author}</span>
        <span className="note-time">{formatDate(note.created_at)}</span>
        {isOwnNote && onDelete && (
          <button className="delete-note" onClick={onDelete} title="Delete note">
            ×
          </button>
        )}
      </div>
      <p className="note-content">{note.content}</p>
    </div>
  );
}

