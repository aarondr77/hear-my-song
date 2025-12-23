import { useState } from 'react';
import './NoteInput.css';

interface NoteInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function NoteInput({ onSubmit, placeholder = 'Write a note...', disabled = false }: NoteInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form className="note-input-form" onSubmit={handleSubmit}>
      <textarea
        className="note-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
      />
      <button type="submit" className="note-submit-btn" disabled={!content.trim() || disabled}>
        Send
      </button>
    </form>
  );
}

