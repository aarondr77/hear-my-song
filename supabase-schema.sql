-- Create notes table (text notes only)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_track_id ON notes(track_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read notes (public read)
CREATE POLICY "Public read" ON notes 
  FOR SELECT 
  USING (true);

-- Allow inserts (author validation happens client-side)
CREATE POLICY "Allow inserts" ON notes 
  FOR INSERT 
  WITH CHECK (true);

-- Allow deletes (author validation happens client-side)
CREATE POLICY "Allow deletes" ON notes 
  FOR DELETE 
  USING (true);
