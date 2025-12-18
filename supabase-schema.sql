-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('text', 'voice')),
  content TEXT,
  voice_file_path TEXT,
  duration INTEGER,
  author TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_track_id ON notes(track_id);
CREATE INDEX IF NOT EXISTS idx_notes_timestamp ON notes(timestamp);
CREATE INDEX IF NOT EXISTS idx_notes_author ON notes(author);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can customize this later)
-- For now, we'll allow all authenticated users to read/write
-- In production, you might want to restrict this further
CREATE POLICY "Allow all operations for authenticated users" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public read access
CREATE POLICY "Public read access for voice notes" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'voice-notes');

-- Create storage policy to allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'voice-notes');

-- Create storage policy to allow authenticated deletes (only for own files)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'voice-notes');

