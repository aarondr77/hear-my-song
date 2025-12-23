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

  return (
    <div className="note-card">
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

