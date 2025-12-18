/*
  # Create Notes Table

  1. New Tables
    - `notes`
      - `id` (uuid, primary key) - Unique note identifier
      - `owner_id` (uuid, not null) - References users.id
      - `title` (text, not null) - Note title
      - `body` (text, not null) - Note content
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `notes` table
    - Users can only read their own notes
    - Users can only create notes for themselves
    - Users can only update their own notes
    - Users can only delete their own notes

  3. Indexes
    - Index on owner_id for fast filtering
    - Index on updated_at for sorting

  4. Important Notes
    - All notes are isolated by owner_id
    - Timestamps auto-managed with triggers
    - Full-text search can be added later
*/

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_owner_updated ON notes(owner_id, updated_at DESC);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read only their own notes
CREATE POLICY "Users can read own notes"
  ON notes FOR SELECT
  TO anon, authenticated
  USING (owner_id::text IN (
    SELECT id::text FROM users WHERE id::text = owner_id::text
  ));

-- Policy: Users can insert notes for themselves
CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  TO anon, authenticated
  WITH CHECK (owner_id::text IN (
    SELECT id::text FROM users WHERE id::text = owner_id::text
  ));

-- Policy: Users can update only their own notes
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO anon, authenticated
  USING (owner_id::text IN (
    SELECT id::text FROM users WHERE id::text = owner_id::text
  ))
  WITH CHECK (owner_id::text IN (
    SELECT id::text FROM users WHERE id::text = owner_id::text
  ));

-- Policy: Users can delete only their own notes
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO anon, authenticated
  USING (owner_id::text IN (
    SELECT id::text FROM users WHERE id::text = owner_id::text
  ));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();
