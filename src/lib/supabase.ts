import { createClient } from '@supabase/supabase-js';
import type { Note } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase credentials. Notes functionality will not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Notes operations
export const notesOperations = {
  // Get all notes for a specific track
  async getNotesForTrack(trackId: string): Promise<Note[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data || []) as Note[];
  },

  // Get all notes (for syncing)
  async getAllNotes(afterTimestamp?: string): Promise<Note[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (afterTimestamp) {
      query = query.gt('created_at', afterTimestamp);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Note[];
  },

  // Create a new note
  async createNote(trackId: string, content: string, author: string): Promise<Note> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        track_id: trackId,
        content: content.trim(),
        author,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Note;
  },

  // Delete a note (author validation happens client-side)
  async deleteNote(noteId: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    
    if (error) throw error;
    return true;
  },
};

