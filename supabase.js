import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  WARNING: Missing Supabase credentials!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? '✓ Found' : '✗ Missing');
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database operations
export const dbOperations = {
  // Get all notes for a track
  async getNotesByTrackId(trackId) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('track_id', trackId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get all notes (for syncing)
  async getAllNotes() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get notes updated after a certain timestamp
  async getNotesAfterTimestamp(timestamp) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .gt('timestamp', timestamp)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Add a text note
  async addTextNote(note) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        id: note.id,
        track_id: note.trackId,
        type: 'text',
        content: note.content,
        author: note.author,
        timestamp: note.timestamp
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add a voice note
  async addVoiceNote(note) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        id: note.id,
        track_id: note.trackId,
        type: 'voice',
        voice_file_path: note.voiceFilePath,
        duration: note.duration,
        author: note.author,
        timestamp: note.timestamp
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get a note by ID
  async getNoteById(id) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a note
  async deleteNote(id, author) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // First check if note exists and author matches
    const note = await this.getNoteById(id);
    if (!note) {
      return false;
    }
    if (note.author !== author) {
      throw new Error('Unauthorized: You can only delete your own notes');
    }
    
    // Delete the note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // If it's a voice note, delete the file from storage
    if (note.type === 'voice' && note.voice_file_path) {
      const { error: storageError } = await supabase.storage
        .from('voice-notes')
        .remove([note.voice_file_path]);
      
      if (storageError) {
        console.error('Error deleting voice file from storage:', storageError);
        // Don't throw - note is already deleted
      }
    }
    
    return true;
  }
};

// Storage operations for voice notes
export const storageOperations = {
  // Upload a voice note file
  async uploadVoiceNote(file, filename) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.storage
      .from('voice-notes')
      .upload(filename, file, {
        contentType: file.mimetype || 'audio/webm',
        upsert: false
      });
    
    if (error) throw error;
    return data.path;
  },

  // Get public URL for a voice note
  getPublicUrl(filePath) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data } = supabase.storage
      .from('voice-notes')
      .getPublicUrl(filePath);
    
    return data?.publicUrl || filePath;
  }
};

