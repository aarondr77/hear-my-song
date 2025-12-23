import { useState, useEffect, useCallback } from 'react';
import { notesOperations } from '../lib/supabase';
import type { Note } from '../types';

export function useNotes(trackId: string | null, enabled: boolean = true) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes for a track
  const fetchNotes = useCallback(async () => {
    if (!trackId || !enabled) {
      if (!enabled) {
        setNotes([]);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await notesOperations.getNotesForTrack(trackId);
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [trackId, enabled]);

  // Only fetch when enabled and trackId changes
  useEffect(() => {
    if (enabled && trackId) {
      fetchNotes();
    } else if (!enabled) {
      // Clear notes when disabled
      setNotes([]);
    }
  }, [enabled, trackId, fetchNotes]);

  // Create a new note
  const createNote = useCallback(async (content: string, author: string) => {
    if (!trackId) throw new Error('No track selected');

    try {
      const newNote = await notesOperations.createNote(trackId, content, author);
      setNotes((prev) => [...prev, newNote].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));
      return newNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      setError(errorMessage);
      throw err;
    }
  }, [trackId]);

  // Delete a note
  const deleteNote = useCallback(async (noteId: string, author: string) => {
    // Validate author client-side
    const note = notes.find((n) => n.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    if (note.author !== author) {
      throw new Error('Unauthorized: You can only delete your own notes');
    }

    try {
      await notesOperations.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      throw err;
    }
  }, [notes]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    deleteNote,
    refetch: fetchNotes,
  };
}

