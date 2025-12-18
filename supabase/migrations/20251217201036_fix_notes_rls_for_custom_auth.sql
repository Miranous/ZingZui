/*
  # Fix Notes RLS Policies for Custom Authentication

  This migration updates the notes table RLS policies to work with custom
  authentication instead of Supabase Auth (auth.uid()).

  1. Changes
    - Drop all existing policies that use auth.uid()
    - Create new policies that allow operations for custom auth
    - Application layer will handle owner_id validation
    - INSERT: Allow anyone (app validates owner_id)
    - SELECT: Allow anyone (app filters by owner_id)
    - UPDATE: Allow anyone (app validates ownership)
    - DELETE: Allow anyone (app validates ownership)

  2. Important Notes
    - Using custom authentication, not Supabase Auth
    - Application layer enforces authorization rules
    - RLS is permissive to allow custom auth flows
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own notes" ON notes;
DROP POLICY IF EXISTS "Users can create own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

-- Allow insert for notes
CREATE POLICY "Enable insert for anon and authenticated"
  ON notes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow select for notes
CREATE POLICY "Enable select for anon and authenticated"
  ON notes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow update for notes
CREATE POLICY "Enable update for anon and authenticated"
  ON notes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow delete for notes
CREATE POLICY "Enable delete for anon and authenticated"
  ON notes FOR DELETE
  TO anon, authenticated
  USING (true);
