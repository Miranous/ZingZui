/*
  # Add type column and tasks table

  1. Changes to notes table
    - Add `type` column (note | tasklist) to match code expectations
    - Set default to 'note'
    - Copy data from note_type if it exists

  2. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique task identifier
      - `note_id` (uuid, not null) - References notes.id
      - `text` (text, not null) - Task description
      - `completed` (boolean) - Task completion status
      - `position` (integer) - Task order
      - `priority` (integer) - Task priority (1-5)
      - `created_at` (timestamptz) - Creation timestamp

  3. Security
    - Enable RLS on `tasks` table
    - Users can only access tasks for notes they own
    - All CRUD operations require note ownership

  4. Important Notes
    - Tasks are isolated by note ownership
    - Deleting a note cascades to delete its tasks
*/

-- Add type column to notes table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'type'
  ) THEN
    ALTER TABLE notes ADD COLUMN type text NOT NULL DEFAULT 'note';
    ALTER TABLE notes ADD CONSTRAINT type_valid CHECK (type IN ('note', 'tasklist'));
    
    -- Copy data from note_type if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notes' AND column_name = 'note_type'
    ) THEN
      UPDATE notes SET type = CASE 
        WHEN note_type = 'text' THEN 'note'
        WHEN note_type = 'tasklist' THEN 'tasklist'
        ELSE 'note'
      END;
    END IF;
  END IF;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  priority integer NOT NULL DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT text_not_empty CHECK (length(trim(text)) > 0),
  CONSTRAINT priority_valid CHECK (priority BETWEEN 1 AND 5)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_note_id ON tasks(note_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(note_id, position);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read tasks for notes they own
CREATE POLICY "Users can read own note tasks"
  ON tasks FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = tasks.note_id 
      AND notes.owner_id::text IN (
        SELECT id::text FROM users WHERE id::text = notes.owner_id::text
      )
    )
  );

-- Policy: Users can insert tasks for notes they own
CREATE POLICY "Users can create tasks for own notes"
  ON tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = tasks.note_id 
      AND notes.owner_id::text IN (
        SELECT id::text FROM users WHERE id::text = notes.owner_id::text
      )
    )
  );

-- Policy: Users can update tasks for notes they own
CREATE POLICY "Users can update own note tasks"
  ON tasks FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = tasks.note_id 
      AND notes.owner_id::text IN (
        SELECT id::text FROM users WHERE id::text = notes.owner_id::text
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = tasks.note_id 
      AND notes.owner_id::text IN (
        SELECT id::text FROM users WHERE id::text = notes.owner_id::text
      )
    )
  );

-- Policy: Users can delete tasks for notes they own
CREATE POLICY "Users can delete own note tasks"
  ON tasks FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = tasks.note_id 
      AND notes.owner_id::text IN (
        SELECT id::text FROM users WHERE id::text = notes.owner_id::text
      )
    )
  );
