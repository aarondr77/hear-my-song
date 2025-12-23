import './NoteCard.css';

interface NoteCardProps {
  note: {
    id: string;
    author: string;
    content: string;
    created_at: string;
  };
  partnerClass: 'partner1' | 'partner2';
}

export function NoteCard({ note, partnerClass }: NoteCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Generate a consistent slight rotation for handwritten feel (-2 to +2 degrees)
  const rotation = (note.id.charCodeAt(0) + note.id.charCodeAt(note.id.length - 1)) % 5 - 2;

  return (
    <div className={`note-card note-card-${partnerClass}`} style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="note-header">
        {partnerClass === 'partner2' ? (
          <>
            <span className="note-time">{formatDate(note.created_at)}</span>
            <span className="note-author">{note.author}</span>
          </>
        ) : (
          <>
            <span className="note-author">{note.author}</span>
            <span className="note-time">{formatDate(note.created_at)}</span>
          </>
        )}
      </div>
      <p className="note-content">{note.content}</p>
    </div>
  );
}

